import { prisma } from "../config/prisma.js";

const getCustomerPayload = (body) => ({
  companyName: body.companyName,
  contactPerson: body.contactPerson || null,
  phone: body.phone || null,
  email: body.email || null,
  address: body.address || null,
  creditPeriodDays: Number(body.creditPeriodDays || 0),
  creditLimit: Number(body.creditLimit || 0),
  status: body.status || "ACTIVE",
});

export const getCustomers = async (req, res) => {
  const where = req.query.status ? { status: req.query.status } : undefined;
  const customers = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  res.json(customers);
};

export const createCustomer = async (req, res) => {
  const customer = await prisma.customer.create({
    data: getCustomerPayload(req.body),
  });
  res.status(201).json(customer);
};

export const getCustomerById = async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
  });

  if (!customer) {
    return res.status(404).json({ message: "Customer not found." });
  }

  res.json(customer);
};

export const updateCustomer = async (req, res) => {
  const existingCustomer = await prisma.customer.findUnique({
    where: { id: req.params.id },
  });

  if (!existingCustomer) {
    return res.status(404).json({ message: "Customer not found." });
  }

  if (existingCustomer.status === "INACTIVE") {
    return res.status(400).json({
      message:
        "This customer is inactive. Please reactivate the customer before editing.",
    });
  }

  const customer = await prisma.customer.update({
    where: { id: req.params.id },
    data: {
      ...getCustomerPayload(req.body),
      status: "ACTIVE",
    },
  });
  res.json(customer);
};

export const deactivateCustomer = async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: {
      invoices: { select: { id: true } },
      payments: { select: { id: true } },
      cheques: { select: { id: true } },
      purchaseOrders: { select: { id: true } },
    },
  });

  if (!customer) {
    return res.status(404).json({ message: "Customer not found." });
  }

  if (customer.status === "INACTIVE") {
    return res.status(400).json({
      message: "Customer is already inactive.",
    });
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id: req.params.id },
    data: { status: "INACTIVE" },
  });

  res.json({
    message:
      "Customer deactivated successfully. Past records were kept and the customer will no longer be available for new invoices.",
    customer: updatedCustomer,
    mode: "inactivated",
  });
};

export const reactivateCustomer = async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
  });

  if (!customer) {
    return res.status(404).json({ message: "Customer not found." });
  }

  if (customer.status === "ACTIVE") {
    return res.status(400).json({
      message: "Customer is already active.",
    });
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id: req.params.id },
    data: { status: "ACTIVE" },
  });

  res.json({
    message: "Customer reactivated successfully.",
    customer: updatedCustomer,
    mode: "reactivated",
  });
};

export const deleteCustomer = async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: {
      invoices: { select: { id: true } },
      payments: { select: { id: true } },
      cheques: { select: { id: true } },
      purchaseOrders: { select: { id: true } },
    },
  });

  if (!customer) {
    return res.status(404).json({ message: "Customer not found." });
  }

  const hasLinkedRecords =
    customer.invoices.length > 0 ||
    customer.payments.length > 0 ||
    customer.cheques.length > 0 ||
    customer.purchaseOrders.length > 0;

  if (hasLinkedRecords) {
    return res.status(400).json({
      message:
        "This customer has linked records and cannot be permanently deleted. Deactivate the customer instead.",
    });
  }

  await prisma.customer.delete({
    where: { id: req.params.id },
  });

  res.json({
    message: "Customer deleted permanently.",
    mode: "deleted",
  });
};
