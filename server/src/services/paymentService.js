import pkg from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { resolveInvoiceStatus } from "./invoiceService.js";

const { InvoiceStatus } = pkg;

export const recalculateInvoicePaymentStatus = async (invoiceId) => {
  if (!invoiceId) return null;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });

  if (!invoice) {
    return null;
  }

  // Cancelled invoices keep their final state even if payments change.
  if (invoice.status === InvoiceStatus.CANCELLED) {
    return invoice;
  }

  const totalPaid = invoice.payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  let nextStatus = InvoiceStatus.DRAFT;

  if (totalPaid >= Number(invoice.totalWithVat || 0) && totalPaid > 0) {
    nextStatus = InvoiceStatus.PAID;
  } else if (invoice.status !== InvoiceStatus.DRAFT) {
    nextStatus = resolveInvoiceStatus({
      ...invoice,
      status: InvoiceStatus.ISSUED,
    });
  }

  if (nextStatus !== invoice.status) {
    return prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: nextStatus },
    });
  }

  return invoice;
};
