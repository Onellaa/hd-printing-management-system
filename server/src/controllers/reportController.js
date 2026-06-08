import { prisma } from "../config/prisma.js";
import { resolveInvoiceStatus } from "../services/invoiceService.js";

export const getDashboardSummary = async (req, res) => {
  const [invoices, payments, cheques] = await Promise.all([
    prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      include: { customer: true, invoice: true },
      orderBy: { paymentDate: "desc" },
      take: 5,
    }),
    prisma.cheque.findMany({
      include: { customer: true, invoice: true },
      where: { status: "PENDING" },
      orderBy: { chequeDate: "asc" },
      take: 5,
    }),
  ]);

  const normalizedInvoices = invoices.map((invoice) => ({
    ...invoice,
    status: resolveInvoiceStatus(invoice),
  }));

  const totalInvoices = normalizedInvoices.length;
  const outstandingAmount = normalizedInvoices
    .filter((invoice) => invoice.status !== "PAID")
    .reduce((sum, invoice) => sum + Number(invoice.totalWithVat), 0);
  const paidInvoices = normalizedInvoices.filter((invoice) => invoice.status === "PAID").length;
  const upcomingCheques = cheques.length;
  const overdueInvoices = normalizedInvoices.filter((invoice) => invoice.status === "OVERDUE").length;

  res.json({
    cards: {
      totalInvoices,
      outstandingAmount,
      paidInvoices,
      upcomingCheques,
      overdueInvoices,
    },
    recentInvoices: normalizedInvoices.slice(0, 5),
    chequeReminders: cheques,
    recentPayments: payments,
  });
};

export const getOutstandingInvoices = async (req, res) => {
  const invoices = await prisma.invoice.findMany({
    include: { customer: true, payments: true },
    orderBy: { dueDate: "asc" },
  });

  const outstanding = invoices
    .map((invoice) => ({ ...invoice, status: resolveInvoiceStatus(invoice) }))
    .filter((invoice) => invoice.status !== "PAID");

  res.json(outstanding);
};

export const getChequeReminders = async (req, res) => {
  const days = Number(req.query.days || 7);
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + days);

  const cheques = await prisma.cheque.findMany({
    where: {
      status: "PENDING",
      chequeDate: {
        gte: today,
        lte: future,
      },
    },
    include: {
      customer: true,
      invoice: true,
    },
    orderBy: { chequeDate: "asc" },
  });

  res.json(cheques);
};

