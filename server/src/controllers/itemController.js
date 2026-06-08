import { prisma } from "../config/prisma.js";

const getItemPayload = (body) => ({
  itemCode: body.itemCode,
  name: body.name,
  description: body.description || null,
  unit: body.unit,
  defaultUnitPrice: Number(body.defaultUnitPrice || 0),
  status: body.status || "ACTIVE",
});

export const getItems = async (req, res) => {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(items);
};

export const getItemById = async (req, res) => {
  const item = await prisma.item.findUnique({
    where: { id: req.params.id },
  });

  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }

  res.json(item);
};

export const createItem = async (req, res) => {
  const item = await prisma.item.create({
    data: getItemPayload(req.body),
  });
  res.status(201).json(item);
};

export const updateItem = async (req, res) => {
  const existingItem = await prisma.item.findUnique({
    where: { id: req.params.id },
  });

  if (!existingItem) {
    return res.status(404).json({ message: "Item not found." });
  }

  const item = await prisma.item.update({
    where: { id: req.params.id },
    data: getItemPayload(req.body),
  });
  res.json(item);
};

export const deleteItem = async (req, res) => {
  const item = await prisma.item.findUnique({
    where: { id: req.params.id },
    include: {
      purchaseOrderItems: { select: { id: true } },
      invoiceItems: { select: { id: true } },
    },
  });

  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }

  if (item.purchaseOrderItems.length > 0 || item.invoiceItems.length > 0) {
    const updatedItem = await prisma.item.update({
      where: { id: req.params.id },
      data: { status: "INACTIVE" },
    });

    return res.json({
      message:
        "Item is already used in transactions, so it was marked inactive instead of being deleted.",
      item: updatedItem,
      mode: "inactivated",
    });
  }

  await prisma.item.delete({
    where: { id: req.params.id },
  });

  res.json({
    message: "Item deleted successfully.",
    mode: "deleted",
  });
};
