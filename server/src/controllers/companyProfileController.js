import { prisma } from "../config/prisma.js";

const getCompanyProfilePayload = (body) => ({
  companyName: body.companyName,
  address: body.address || null,
  phone: body.phone || null,
  email: body.email || null,
  taxNumber: body.taxNumber || null,
  website: body.website || null,
  invoicePrefix: body.invoicePrefix || "INV",
  companyTagline: body.companyTagline || null,
  bankName: body.bankName || null,
  bankAccountName: body.bankAccountName || null,
  bankAccountNumber: body.bankAccountNumber || null,
  paymentInstructions: body.paymentInstructions || null,
  authorizedByName: body.authorizedByName || null,
  authorizedByTitle: body.authorizedByTitle || null,
  signatureText: body.signatureText || null,
  footerNote: body.footerNote || null,
});

export const getCompanyProfile = async (req, res) => {
  const profile = await prisma.companyProfile.findFirst();
  res.json(profile);
};

export const upsertCompanyProfile = async (req, res) => {
  const existingProfile = await prisma.companyProfile.findFirst();

  if (!existingProfile) {
    const created = await prisma.companyProfile.create({
      data: getCompanyProfilePayload(req.body),
    });
    return res.status(201).json(created);
  }

  const updated = await prisma.companyProfile.update({
    where: { id: existingProfile.id },
    data: getCompanyProfilePayload(req.body),
  });
  res.json(updated);
};
