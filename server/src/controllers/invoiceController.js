import { InvoiceStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import {
  calculateInvoiceTotals,
  getInvoiceDueDate,
  resolveInvoiceStatus,
} from "../services/invoiceService.js";
import { buildInvoicePdf } from "../services/pdfService.js";

const invoiceInclude = {
  customer: true,
  purchaseOrder: true,
  items: { include: { item: true } },
  payments: true,
};

const toInvoiceItemCreate = (item) => ({
  itemId: item.itemId || null,
  description: item.description,
  quantity: item.quantity,
  unitPrice: item.unitPrice,
  amount: item.amount,
});

const syncOverdueStatus = async (invoice) => {
  const resolvedStatus = resolveInvoiceStatus(invoice);

  if (resolvedStatus !== invoice.status) {
    return prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: resolvedStatus },
      include: invoiceInclude,
    });
  }

  return invoice;
};

export const getInvoices = async (req, res) => {
  const invoices = await prisma.invoice.findMany({
    include: invoiceInclude,
    orderBy: { createdAt: "desc" },
  });

  const normalized = await Promise.all(invoices.map(syncOverdueStatus));
  res.json(normalized);
};

export const createInvoice = async (req, res) => {
  const { items = [], customerId, invoiceDate, notes, purchaseOrderId, status } = req.body;

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return res.status(404).json({ message: "Customer not found." });
  }

  const totals = calculateInvoiceTotals(items);
  const invoiceCount = await prisma.invoice.count();
  const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId,
      purchaseOrderId: purchaseOrderId || null,
      invoiceDate: new Date(invoiceDate),
      dueDate: status === InvoiceStatus.ISSUED ? getInvoiceDueDate(invoiceDate, customer.creditPeriodDays) : null,
      creditPeriodDays: customer.creditPeriodDays,
      subtotalWithoutVat: totals.subtotalWithoutVat,
      vatRate: totals.vatRate,
      vatAmount: totals.vatAmount,
      totalWithVat: totals.totalWithVat,
      status: status || InvoiceStatus.DRAFT,
      notes: notes || null,
      items: {
        create: totals.items.map(toInvoiceItemCreate),
      },
    },
    include: invoiceInclude,
  });

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: { pdfUrl: `/api/invoices/${invoice.id}/pdf` },
    include: invoiceInclude,
  });

  res.status(201).json(updatedInvoice);
};

export const getInvoiceById = async (req, res) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: invoiceInclude,
  });

  if (!invoice) {
    return res.status(404).json({ message: "Invoice not found." });
  }

  const normalized = await syncOverdueStatus(invoice);
  res.json(normalized);
};

export const updateInvoice = async (req, res) => {
  const existingInvoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
  });

  if (!existingInvoice) {
    return res.status(404).json({ message: "Invoice not found." });
  }

  if (existingInvoice.status !== InvoiceStatus.DRAFT) {
    return res.status(400).json({
      message: "Only draft invoices can be edited.",
    });
  }

  const { items = [], customerId, invoiceDate, notes, purchaseOrderId, status } = req.body;
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });

  if (!customer) {
    return res.status(404).json({ message: "Customer not found." });
  }

  const totals = calculateInvoiceTotals(items);
  const dueDate =
    status === InvoiceStatus.ISSUED
      ? getInvoiceDueDate(invoiceDate, customer.creditPeriodDays)
      : null;

  const invoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data: {
      customerId,
      purchaseOrderId: purchaseOrderId || null,
      invoiceDate: new Date(invoiceDate),
      dueDate,
      creditPeriodDays: customer.creditPeriodDays,
      subtotalWithoutVat: totals.subtotalWithoutVat,
      vatRate: totals.vatRate,
      vatAmount: totals.vatAmount,
      totalWithVat: totals.totalWithVat,
      status: status || InvoiceStatus.DRAFT,
      notes: notes || null,
      items: {
        deleteMany: {},
        create: totals.items.map(toInvoiceItemCreate),
      },
    },
    include: invoiceInclude,
  });

  res.json(invoice);
};

export const deleteInvoice = async (req, res) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: { payments: true, cheques: true },
  });

  if (!invoice) {
    return res.status(404).json({ message: "Invoice not found." });
  }

  if (invoice.status === InvoiceStatus.PAID) {
    return res.status(400).json({
      message:
        "Paid invoices cannot be deleted or voided until related payments are removed.",
    });
  }

  if (invoice.status === InvoiceStatus.DRAFT) {
    await prisma.invoice.delete({
      where: { id: req.params.id },
    });

    return res.json({
      message: "Draft invoice deleted successfully.",
      mode: "deleted",
    });
  }

  const cancelledInvoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data: { status: InvoiceStatus.CANCELLED },
    include: invoiceInclude,
  });

  res.json({
    message: "Invoice was voided and kept in the system as CANCELLED.",
    invoice: cancelledInvoice,
    mode: "cancelled",
  });
};

export const issueInvoice = async (req, res) => {
  const existingInvoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: { customer: true },
  });

  if (!existingInvoice) {
    return res.status(404).json({ message: "Invoice not found." });
  }

  const invoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data: {
      status: InvoiceStatus.ISSUED,
      dueDate: getInvoiceDueDate(existingInvoice.invoiceDate, existingInvoice.customer.creditPeriodDays),
      creditPeriodDays: existingInvoice.customer.creditPeriodDays,
    },
    include: invoiceInclude,
  });

  res.json(invoice);
};

export const markInvoicePaid = async (req, res) => {
  const invoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data: { status: InvoiceStatus.PAID },
    include: invoiceInclude,
  });

  res.json(invoice);
};

export const getInvoicePdf = async (req, res) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: invoiceInclude,
  });

  if (!invoice) {
    return res.status(404).json({ message: "Invoice not found." });
  }

  const companyProfile =
    (await prisma.companyProfile.findFirst()) || {
      companyName: "HD Printing & Packaging",
      address: "",
      phone: "",
      email: "",
    };

  const pdfBuffer = await buildInvoicePdf({ companyProfile, invoice });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${invoice.invoiceNumber}.pdf"`
  );
  res.send(pdfBuffer);
};
