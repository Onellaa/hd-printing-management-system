import bcrypt from "bcryptjs";
import { ChequeStatus, InvoiceStatus, PaymentMethod, PrismaClient, PurchaseOrderStatus, RecordStatus } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@hdprinting.com";
const ADMIN_PASSWORD = "Admin@123";
const VAT_RATE = 18;

const runtimeEnvironment = (
  process.env.APP_ENV ||
  process.env.SEED_ENV ||
  process.env.VERCEL_ENV ||
  process.env.NODE_ENV ||
  "development"
).toLowerCase();

const addDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const roundMoney = (value) => Number(Number(value || 0).toFixed(2));

const buildLineItems = (items) =>
  items.map((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    return {
      ...item,
      quantity,
      unitPrice,
      amount: roundMoney(quantity * unitPrice),
    };
  });

const buildInvoiceTotals = (items) => {
  const normalizedItems = buildLineItems(items);
  const subtotalWithoutVat = roundMoney(
    normalizedItems.reduce((sum, item) => sum + item.amount, 0)
  );
  const vatAmount = roundMoney(subtotalWithoutVat * (VAT_RATE / 100));
  const totalWithVat = roundMoney(subtotalWithoutVat + vatAmount);

  return {
    items: normalizedItems,
    subtotalWithoutVat,
    vatRate: VAT_RATE,
    vatAmount,
    totalWithVat,
  };
};

async function main() {
  if (runtimeEnvironment === "production") {
    throw new Error(
      "Refusing to run prisma seed in production. Use APP_ENV=staging or APP_ENV=development for non-production seed runs."
    );
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const now = new Date();

  const customerSeeds = [
    {
      key: "abc",
      companyName: "ABC Trading Pvt Ltd",
      contactPerson: "Nadeesha Perera",
      phone: "0771112233",
      email: "purchasing@abctrading.lk",
      address: "No. 15, Union Place, Colombo 02",
      creditPeriodDays: 30,
      creditLimit: 250000,
    },
    {
      key: "lanka-foods",
      companyName: "Lanka Foods Distributors",
      contactPerson: "Sahan Fernando",
      phone: "0772223344",
      email: "accounts@lankafoods.lk",
      address: "No. 88, Negombo Road, Wattala",
      creditPeriodDays: 45,
      creditLimit: 325000,
    },
    {
      key: "sunrise",
      companyName: "Sunrise Packaging",
      contactPerson: "Madhavi Silva",
      phone: "0773334455",
      email: "orders@sunrisepackaging.lk",
      address: "No. 44, Kandy Road, Kadawatha",
      creditPeriodDays: 60,
      creditLimit: 400000,
    },
    {
      key: "royal",
      companyName: "Royal Super Center",
      contactPerson: "Ravindu Jayasekara",
      phone: "0774445566",
      email: "finance@royalsuper.lk",
      address: "No. 21, Galle Road, Kalutara",
      creditPeriodDays: 30,
      creditLimit: 200000,
    },
    {
      key: "green-mart",
      companyName: "Green Mart Holdings",
      contactPerson: "Tharushi Dissanayake",
      phone: "0775556677",
      email: "admin@greenmart.lk",
      address: "No. 60, High Level Road, Nugegoda",
      creditPeriodDays: 14,
      creditLimit: 175000,
    },
  ];

  const itemSeeds = [
    {
      key: "printed-box",
      itemCode: "ITEM-001",
      name: "Printed Box",
      description: "Custom printed corrugated box",
      unit: "pcs",
      defaultUnitPrice: 120,
    },
    {
      key: "sticker-label",
      itemCode: "ITEM-002",
      name: "Sticker Label",
      description: "Gloss-finish product label",
      unit: "pcs",
      defaultUnitPrice: 18,
    },
    {
      key: "paper-bag",
      itemCode: "ITEM-003",
      name: "Paper Bag",
      description: "Branded kraft paper bag",
      unit: "pcs",
      defaultUnitPrice: 55,
    },
    {
      key: "product-tag",
      itemCode: "ITEM-004",
      name: "Product Tag",
      description: "Die-cut hanging tag",
      unit: "pcs",
      defaultUnitPrice: 22,
    },
    {
      key: "brochure",
      itemCode: "ITEM-005",
      name: "Brochure",
      description: "Tri-fold marketing brochure",
      unit: "pcs",
      defaultUnitPrice: 35,
    },
    {
      key: "packaging-sleeve",
      itemCode: "ITEM-006",
      name: "Packaging Sleeve",
      description: "Printed sleeve for retail packaging",
      unit: "pcs",
      defaultUnitPrice: 48,
    },
  ];

  await prisma.$transaction(async (tx) => {
    await tx.invoiceItem.deleteMany();
    await tx.purchaseOrderItem.deleteMany();
    await tx.payment.deleteMany();
    await tx.cheque.deleteMany();
    await tx.invoice.deleteMany();
    await tx.purchaseOrder.deleteMany();
    await tx.item.deleteMany();
    await tx.customer.deleteMany();
    await tx.companyProfile.deleteMany();
    await tx.user.deleteMany({
      where: {
        email: {
          not: ADMIN_EMAIL,
        },
      },
    });

    await tx.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        name: "HD Admin",
        passwordHash,
        role: "admin",
      },
      create: {
        name: "HD Admin",
        email: ADMIN_EMAIL,
        passwordHash,
        role: "admin",
      },
    });

    await tx.companyProfile.create({
      data: {
        companyName: "HD Printing & Packaging (Pvt) Ltd.",
        email: "accounts@hdprinting.lk",
        phone: "0771234567",
        address: "Colombo, Sri Lanka",
        invoicePrefix: "INV",
        companyTagline: "Commercial printing and packaging solutions",
        bankName: "Commercial Bank of Ceylon",
        bankAccountName: "HD Printing & Packaging (Pvt) Ltd.",
        bankAccountNumber: "001234567890",
        paymentInstructions: "Please settle invoices within the agreed credit period.",
        authorizedByName: "HD Printing & Packaging (Pvt) Ltd.",
        authorizedByTitle: "Accounts Department",
        signatureText: "Authorized Signature",
        footerNote: "Thank you for doing business with HD Printing & Packaging (Pvt) Ltd.",
      },
    });

    const customers = {};
    for (const customerSeed of customerSeeds) {
      const customer = await tx.customer.create({
        data: {
          companyName: customerSeed.companyName,
          contactPerson: customerSeed.contactPerson,
          phone: customerSeed.phone,
          email: customerSeed.email,
          address: customerSeed.address,
          creditPeriodDays: customerSeed.creditPeriodDays,
          creditLimit: customerSeed.creditLimit,
          status: RecordStatus.ACTIVE,
        },
      });
      customers[customerSeed.key] = customer;
    }

    const items = {};
    for (const itemSeed of itemSeeds) {
      const item = await tx.item.create({
        data: {
          itemCode: itemSeed.itemCode,
          name: itemSeed.name,
          description: itemSeed.description,
          unit: itemSeed.unit,
          defaultUnitPrice: itemSeed.defaultUnitPrice,
          status: RecordStatus.ACTIVE,
        },
      });
      items[itemSeed.key] = item;
    }

    const purchaseOrderSeeds = [
      {
        poNumber: "PO-0001",
        customer: customers.abc,
        poDate: addDays(now, -28),
        deliveryDate: addDays(now, -20),
        status: PurchaseOrderStatus.CONFIRMED,
        notes: "Urgent supermarket launch packaging order.",
        items: [
          { item: items["printed-box"], description: "Printed Box", quantity: 500, unitPrice: 120 },
          { item: items["sticker-label"], description: "Sticker Label", quantity: 1200, unitPrice: 18 },
        ],
      },
      {
        poNumber: "PO-0002",
        customer: customers["lanka-foods"],
        poDate: addDays(now, -18),
        deliveryDate: addDays(now, -8),
        status: PurchaseOrderStatus.COMPLETED,
        notes: "Monthly label and sleeve replenishment.",
        items: [
          { item: items["packaging-sleeve"], description: "Packaging Sleeve", quantity: 700, unitPrice: 48 },
          { item: items.brochure, description: "Brochure", quantity: 300, unitPrice: 35 },
        ],
      },
      {
        poNumber: "PO-0003",
        customer: customers.sunrise,
        poDate: addDays(now, -6),
        deliveryDate: addDays(now, 5),
        status: PurchaseOrderStatus.DRAFT,
        notes: "Awaiting artwork confirmation.",
        items: [
          { item: items["paper-bag"], description: "Paper Bag", quantity: 450, unitPrice: 55 },
          { item: items["product-tag"], description: "Product Tag", quantity: 950, unitPrice: 22 },
        ],
      },
    ];

    const purchaseOrders = {};
    for (const seed of purchaseOrderSeeds) {
      const order = await tx.purchaseOrder.create({
        data: {
          poNumber: seed.poNumber,
          customerId: seed.customer.id,
          poDate: seed.poDate,
          deliveryDate: seed.deliveryDate,
          status: seed.status,
          notes: seed.notes,
          items: {
            create: buildLineItems(
              seed.items.map((item) => ({
                itemId: item.item.id,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              }))
            ).map((item) => ({
              itemId: item.itemId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount,
            })),
          },
        },
      });
      purchaseOrders[seed.poNumber] = order;
    }

    const invoiceSeeds = [
      {
        invoiceNumber: "INV-0001",
        customer: customers.abc,
        purchaseOrderId: purchaseOrders["PO-0001"].id,
        invoiceDate: addDays(now, -2),
        dueDate: addDays(now, 28),
        creditPeriodDays: 30,
        status: InvoiceStatus.DRAFT,
        notes: "Draft invoice pending final approval.",
        items: [
          { item: items["printed-box"], description: "Printed Box", quantity: 150, unitPrice: 120 },
          { item: items["sticker-label"], description: "Sticker Label", quantity: 300, unitPrice: 18 },
        ],
      },
      {
        invoiceNumber: "INV-0002",
        customer: customers["lanka-foods"],
        purchaseOrderId: purchaseOrders["PO-0002"].id,
        invoiceDate: addDays(now, -10),
        dueDate: addDays(now, 35),
        creditPeriodDays: 45,
        status: InvoiceStatus.ISSUED,
        notes: "Issued and awaiting payment within credit terms.",
        items: [
          { item: items["packaging-sleeve"], description: "Packaging Sleeve", quantity: 250, unitPrice: 48 },
          { item: items.brochure, description: "Brochure", quantity: 200, unitPrice: 35 },
        ],
      },
      {
        invoiceNumber: "INV-0003",
        customer: customers.royal,
        purchaseOrderId: null,
        invoiceDate: addDays(now, -25),
        dueDate: addDays(now, 5),
        creditPeriodDays: 30,
        status: InvoiceStatus.PAID,
        notes: "Paid invoice for promotional packaging materials.",
        items: [
          { item: items["paper-bag"], description: "Paper Bag", quantity: 220, unitPrice: 55 },
          { item: items["product-tag"], description: "Product Tag", quantity: 400, unitPrice: 22 },
        ],
      },
      {
        invoiceNumber: "INV-0004",
        customer: customers["green-mart"],
        purchaseOrderId: null,
        invoiceDate: addDays(now, -30),
        dueDate: addDays(now, -16),
        creditPeriodDays: 14,
        status: InvoiceStatus.OVERDUE,
        notes: "Overdue invoice requiring follow-up.",
        items: [
          { item: items["printed-box"], description: "Printed Box", quantity: 120, unitPrice: 120 },
          { item: items["sticker-label"], description: "Sticker Label", quantity: 500, unitPrice: 18 },
        ],
      },
    ];

    const invoices = {};
    for (const seed of invoiceSeeds) {
      const totals = buildInvoiceTotals(seed.items);
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber: seed.invoiceNumber,
          customerId: seed.customer.id,
          purchaseOrderId: seed.purchaseOrderId,
          invoiceDate: seed.invoiceDate,
          dueDate: seed.dueDate,
          creditPeriodDays: seed.creditPeriodDays,
          subtotalWithoutVat: totals.subtotalWithoutVat,
          vatRate: totals.vatRate,
          vatAmount: totals.vatAmount,
          totalWithVat: totals.totalWithVat,
          status: seed.status,
          notes: seed.notes,
          pdfUrl: `/api/invoices/${seed.invoiceNumber}/pdf`,
          items: {
            create: totals.items.map((item) => ({
              itemId: item.item.id,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount,
            })),
          },
        },
      });
      invoices[seed.invoiceNumber] = invoice;
    }

    await tx.invoice.update({
      where: { id: invoices["INV-0001"].id },
      data: {
        pdfUrl: `/api/invoices/${invoices["INV-0001"].id}/pdf`,
      },
    });
    await tx.invoice.update({
      where: { id: invoices["INV-0002"].id },
      data: {
        pdfUrl: `/api/invoices/${invoices["INV-0002"].id}/pdf`,
      },
    });
    await tx.invoice.update({
      where: { id: invoices["INV-0003"].id },
      data: {
        pdfUrl: `/api/invoices/${invoices["INV-0003"].id}/pdf`,
      },
    });
    await tx.invoice.update({
      where: { id: invoices["INV-0004"].id },
      data: {
        pdfUrl: `/api/invoices/${invoices["INV-0004"].id}/pdf`,
      },
    });

    await tx.payment.createMany({
      data: [
        {
          invoiceId: invoices["INV-0003"].id,
          customerId: customers.royal.id,
          paymentDate: addDays(now, -12),
          amount: 12000,
          method: PaymentMethod.BANK_TRANSFER,
          referenceNo: "PAY-0001",
          notes: "Advance settlement via bank transfer.",
        },
        {
          invoiceId: invoices["INV-0003"].id,
          customerId: customers.royal.id,
          paymentDate: addDays(now, -6),
          amount: 12662,
          method: PaymentMethod.CASH,
          referenceNo: "PAY-0002",
          notes: "Final balance payment collected at dispatch.",
        },
      ],
    });

    await tx.cheque.createMany({
      data: [
        {
          customerId: customers["lanka-foods"].id,
          invoiceId: invoices["INV-0002"].id,
          chequeNo: "CHQ-1001",
          bankName: "Commercial Bank",
          chequeDate: addDays(now, 7),
          depositDate: null,
          amount: 22420,
          status: ChequeStatus.PENDING,
          notes: "Post-dated cheque received for issued invoice.",
        },
        {
          customerId: customers["green-mart"].id,
          invoiceId: invoices["INV-0004"].id,
          chequeNo: "CHQ-1002",
          bankName: "Sampath Bank",
          chequeDate: addDays(now, -20),
          depositDate: addDays(now, -18),
          amount: 10000,
          status: ChequeStatus.DEPOSITED,
          notes: "Cheque deposited against overdue invoice.",
        },
        {
          customerId: customers.sunrise.id,
          invoiceId: null,
          chequeNo: "CHQ-1003",
          bankName: "HNB",
          chequeDate: addDays(now, -3),
          depositDate: addDays(now, -1),
          amount: 15750,
          status: ChequeStatus.RETURNED,
          notes: "Returned cheque from a prior order discussion.",
        },
      ],
    });
  });

  console.log("Seed data created successfully");
  console.log(`Login email: ${ADMIN_EMAIL}`);
  console.log(`Login password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
