import { prisma } from "../config/prisma.js";

const getChequePayload = (body) => ({
  customerId: body.customerId,
  invoiceId: body.invoiceId || null,
  chequeNo: body.chequeNo,
  bankName: body.bankName,
  chequeDate: new Date(body.chequeDate),
  depositDate: body.depositDate ? new Date(body.depositDate) : null,
  amount: Number(body.amount || 0),
  status: body.status || "PENDING",
  notes: body.notes || null,
});

export const getCheques = async (req, res) => {
  const cheques = await prisma.cheque.findMany({
    include: {
      customer: true,
      invoice: true,
    },
    orderBy: { chequeDate: "asc" },
  });
  res.json(cheques);
};

export const getChequeById = async (req, res) => {
  const cheque = await prisma.cheque.findUnique({
    where: { id: req.params.id },
    include: {
      customer: true,
      invoice: true,
    },
  });

  if (!cheque) {
    return res.status(404).json({ message: "Cheque not found." });
  }

  res.json(cheque);
};

export const createCheque = async (req, res) => {
  const cheque = await prisma.cheque.create({
    data: getChequePayload(req.body),
  });
  res.status(201).json(cheque);
};

export const updateCheque = async (req, res) => {
  const existingCheque = await prisma.cheque.findUnique({
    where: { id: req.params.id },
  });

  if (!existingCheque) {
    return res.status(404).json({ message: "Cheque not found." });
  }

  const cheque = await prisma.cheque.update({
    where: { id: req.params.id },
    data: getChequePayload(req.body),
  });
  res.json(cheque);
};

export const deleteCheque = async (req, res) => {
  const cheque = await prisma.cheque.findUnique({
    where: { id: req.params.id },
  });

  if (!cheque) {
    return res.status(404).json({ message: "Cheque not found." });
  }

  await prisma.cheque.delete({
    where: { id: req.params.id },
  });

  res.json({
    message: "Cheque deleted successfully.",
  });
};

export const markChequeDeposited = async (req, res) => {
  const cheque = await prisma.cheque.update({
    where: { id: req.params.id },
    data: {
      status: "DEPOSITED",
      depositDate: req.body.depositDate ? new Date(req.body.depositDate) : new Date(),
    },
  });
  res.json(cheque);
};
