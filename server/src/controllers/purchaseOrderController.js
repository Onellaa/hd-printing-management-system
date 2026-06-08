import { prisma } from "../config/prisma.js";
import { calculateInvoiceTotals } from "../services/invoiceService.js";

const serializePoItem = (item) => ({
  itemId: item.itemId,
  description: item.description,
  quantity: Number(item.quantity),
  unitPrice: Number(item.unitPrice),
  amount: Number(item.amount),
});

export const getPurchaseOrders = async (req, res) => {
  const orders = await prisma.purchaseOrder.findMany({
    include: {
      customer: true,
      items: { include: { item: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(orders);
};

export const createPurchaseOrder = async (req, res) => {
  const { items = [], ...poData } = req.body;

  const order = await prisma.purchaseOrder.create({
    data: {
      ...poData,
      items: {
        create: items.map((item) => ({
          ...item,
          amount: Number(item.quantity) * Number(item.unitPrice),
        })),
      },
    },
    include: { items: true },
  });

  res.status(201).json(order);
};

export const getPurchaseOrderById = async (req, res) => {
  const order = await prisma.purchaseOrder.findUnique({
    where: { id: req.params.id },
    include: {
      customer: true,
      items: { include: { item: true } },
    },
  });

  if (!order) {
    return res.status(404).json({ message: "Purchase order not found." });
  }

  res.json(order);
};

export const updatePurchaseOrder = async (req, res) => {
  const { items = [], ...poData } = req.body;

  const existingOrder = await prisma.purchaseOrder.findUnique({
    where: { id: req.params.id },
  });

  if (!existingOrder) {
    return res.status(404).json({ message: "Purchase order not found." });
  }

  const order = await prisma.purchaseOrder.update({
    where: { id: req.params.id },
    data: {
      ...poData,
      items: {
        deleteMany: {},
        create: items.map((item) => ({
          ...item,
          amount: Number(item.quantity) * Number(item.unitPrice),
        })),
      },
    },
    include: { items: true },
  });

  res.json(order);
};

export const deletePurchaseOrder = async (req, res) => {
  const order = await prisma.purchaseOrder.findUnique({
    where: { id: req.params.id },
    include: {
      invoices: { select: { id: true } },
    },
  });

  if (!order) {
    return res.status(404).json({ message: "Purchase order not found." });
  }

  if (order.invoices.length > 0) {
    return res.status(400).json({
      message:
        "This purchase order is already linked to invoices and cannot be deleted.",
    });
  }

  await prisma.purchaseOrder.delete({
    where: { id: req.params.id },
  });

  res.json({
    message: "Purchase order deleted successfully.",
  });
};

export const convertPurchaseOrderToInvoice = async (req, res) => {
  const order = await prisma.purchaseOrder.findUnique({
    where: { id: req.params.id },
    include: { customer: true, items: true },
  });

  if (!order) {
    return res.status(404).json({ message: "Purchase order not found." });
  }

  const totals = calculateInvoiceTotals(order.items.map(serializePoItem));
  const invoiceCount = await prisma.invoice.count();
  const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId: order.customerId,
      purchaseOrderId: order.id,
      invoiceDate: new Date(),
      creditPeriodDays: order.customer.creditPeriodDays,
      subtotalWithoutVat: totals.subtotalWithoutVat,
      vatRate: totals.vatRate,
      vatAmount: totals.vatAmount,
      totalWithVat: totals.totalWithVat,
      status: "DRAFT",
      items: {
        create: totals.items.map((item) => ({
          itemId: item.itemId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
      },
    },
    include: { items: true },
  });

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: { pdfUrl: `/api/invoices/${invoice.id}/pdf` },
    include: { items: true },
  });

  res.status(201).json(updatedInvoice);
};
