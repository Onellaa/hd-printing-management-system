import { prisma } from "../config/prisma.js";
import { recalculateInvoicePaymentStatus } from "../services/paymentService.js";

const getPaymentPayload = (body) => ({
  invoiceId: body.invoiceId,
  customerId: body.customerId,
  paymentDate: new Date(body.paymentDate),
  amount: Number(body.amount || 0),
  method: body.method,
  referenceNo: body.referenceNo || null,
  notes: body.notes || null,
});

export const getPayments = async (req, res) => {
  const payments = await prisma.payment.findMany({
    include: {
      customer: true,
      invoice: true,
    },
    orderBy: { paymentDate: "desc" },
  });
  res.json(payments);
};

export const getPaymentById = async (req, res) => {
  const payment = await prisma.payment.findUnique({
    where: { id: req.params.id },
    include: {
      customer: true,
      invoice: true,
    },
  });

  if (!payment) {
    return res.status(404).json({ message: "Payment not found." });
  }

  res.json(payment);
};

export const createPayment = async (req, res) => {
  const payment = await prisma.payment.create({
    data: getPaymentPayload(req.body),
    include: {
      customer: true,
      invoice: true,
    },
  });

  await recalculateInvoicePaymentStatus(req.body.invoiceId);

  res.status(201).json(payment);
};

export const updatePayment = async (req, res) => {
  const existingPayment = await prisma.payment.findUnique({
    where: { id: req.params.id },
  });

  if (!existingPayment) {
    return res.status(404).json({ message: "Payment not found." });
  }

  const payment = await prisma.payment.update({
    where: { id: req.params.id },
    data: getPaymentPayload(req.body),
    include: {
      customer: true,
      invoice: true,
    },
  });

  await recalculateInvoicePaymentStatus(existingPayment.invoiceId);

  if (existingPayment.invoiceId !== payment.invoiceId) {
    await recalculateInvoicePaymentStatus(payment.invoiceId);
  }

  res.json(payment);
};

export const deletePayment = async (req, res) => {
  const payment = await prisma.payment.findUnique({
    where: { id: req.params.id },
  });

  if (!payment) {
    return res.status(404).json({ message: "Payment not found." });
  }

  await prisma.payment.delete({
    where: { id: req.params.id },
  });

  await recalculateInvoicePaymentStatus(payment.invoiceId);

  res.json({
    message: "Payment deleted successfully.",
  });
};
