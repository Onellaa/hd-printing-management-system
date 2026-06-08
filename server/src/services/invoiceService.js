import { InvoiceStatus } from "@prisma/client";
import { addDays, isPastDate } from "../utils/date.js";

const VAT_RATE = 18;

const roundMoney = (value) => Number(Number(value || 0).toFixed(2));

export const calculateInvoiceTotals = (items = []) => {
  const normalizedItems = items.map((item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const amount = roundMoney(quantity * unitPrice);

    return {
      ...item,
      quantity,
      unitPrice,
      amount,
    };
  });

  const subtotalWithoutVat = roundMoney(
    normalizedItems.reduce((sum, item) => sum + item.amount, 0)
  );
  const vatAmount = roundMoney(subtotalWithoutVat * 0.18);
  const totalWithVat = roundMoney(subtotalWithoutVat + vatAmount);

  return {
    items: normalizedItems,
    subtotalWithoutVat,
    vatRate: VAT_RATE,
    vatAmount,
    totalWithVat,
  };
};

export const getInvoiceDueDate = (invoiceDate, creditPeriodDays) =>
  addDays(invoiceDate, creditPeriodDays);

export const resolveInvoiceStatus = (invoice) => {
  if (
    invoice.status === InvoiceStatus.PAID ||
    invoice.status === InvoiceStatus.DRAFT ||
    invoice.status === InvoiceStatus.CANCELLED
  ) {
    return invoice.status;
  }

  if (invoice.dueDate && isPastDate(invoice.dueDate)) {
    return InvoiceStatus.OVERDUE;
  }

  return InvoiceStatus.ISSUED;
};
