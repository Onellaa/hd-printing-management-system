import PDFDocument from "pdfkit";

const mmToPt = (mm) => mm * 2.83465;

const money = (value) =>
  `Rs. ${new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))}`;

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "-";

const drawRoundedBox = (doc, x, y, width, height, fill = "#ffffff", stroke = "#dfe5dc") => {
  doc.save();
  doc.roundedRect(x, y, width, height, 7).fillAndStroke(fill, stroke);
  doc.restore();
};

const drawLabelValueRows = (doc, rows, x, y, labelWidth, valueWidth, rowGap = 20) => {
  rows.forEach(([label, value], index) => {
    const rowY = y + index * rowGap;
    doc.fillColor("#3b3b3b").font("Helvetica").fontSize(9.5).text(label, x, rowY, {
      width: labelWidth,
    });
    doc.text(":", x + labelWidth, rowY, { width: 8, align: "center", lineBreak: false });
    doc.text(value || "-", x + labelWidth + 12, rowY, {
      width: valueWidth,
      lineBreak: false,
    });
  });
};

const toWordsUnder1000 = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num < 20) return ones[num];
  if (num < 100) return `${tens[Math.floor(num / 10)]} ${ones[num % 10]}`.trim();
  return `${ones[Math.floor(num / 100)]} Hundred ${toWordsUnder1000(num % 100)}`.trim();
};

const numberToWords = (value) => {
  const amount = Number(value || 0);
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  if (integerPart === 0) {
    return "Zero Rupees Only";
  }

  const units = [
    { value: 10000000, label: "Crore" },
    { value: 100000, label: "Lakh" },
    { value: 1000, label: "Thousand" },
  ];

  let remaining = integerPart;
  const words = [];

  units.forEach((unit) => {
    if (remaining >= unit.value) {
      const count = Math.floor(remaining / unit.value);
      words.push(`${toWordsUnder1000(count)} ${unit.label}`);
      remaining %= unit.value;
    }
  });

  if (remaining > 0) {
    words.push(toWordsUnder1000(remaining));
  }

  return `${words.join(" ")} Rupees${decimalPart ? ` And ${toWordsUnder1000(decimalPart)} Cents` : ""} Only`;
};

export const buildInvoicePdf = ({ companyProfile, invoice }) =>
  new Promise((resolve, reject) => {
    const margin = mmToPt(10.5);
    const doc = new PDFDocument({
      size: "A4",
      margin,
    });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const printableWidth = pageWidth - margin * 2;
    const printableHeight = pageHeight - margin * 2;
    const startX = margin;
    let cursorY = margin;

    // Outer sheet
    drawRoundedBox(doc, startX, cursorY, printableWidth, printableHeight, "#ffffff", "#ece7e1");

    const innerX = startX + 10;
    const innerWidth = printableWidth - 20;
    cursorY += 10;

    // Header
    doc.save();
    doc.roundedRect(innerX, cursorY + 2, 42, 42, 10).fill("#eef8ef");
    doc
      .fillColor("#219346")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("H", innerX + 8, cursorY + 9, { width: 14, lineBreak: false });
    doc
      .fillColor("#222222")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("D", innerX + 24, cursorY + 9, { width: 14, lineBreak: false });
    doc.restore();

    const companyX = innerX + 52;
    const headerRightX = innerX + innerWidth - 154;

    doc
      .fillColor("#1c1c1c")
      .font("Helvetica-Bold")
      .fontSize(16)
      .text(companyProfile.companyName || "HD PRINTING & PACKAGING (PVT) LTD.", companyX, cursorY + 4, {
        width: headerRightX - companyX - 10,
      });
    doc
      .fillColor("#2e9a4e")
      .font("Helvetica")
      .fontSize(9)
      .text(companyProfile.companyTagline || "Excellence in Printing & Packaging", companyX, cursorY + 24, {
        width: headerRightX - companyX - 10,
      });

    doc
      .fillColor("#111111")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("INVOICE", headerRightX, cursorY, { width: 150, align: "right" });

    doc
      .roundedRect(headerRightX + 30, cursorY + 32, 120, 24, 7)
      .fillAndStroke("#edf9ef", "#cbe3cf");
    doc
      .fillColor("#278b45")
      .font("Helvetica-Bold")
      .fontSize(12.5)
      .text(invoice.invoiceNumber, headerRightX + 38, cursorY + 39, {
        width: 104,
        align: "center",
        lineBreak: false,
      });

    cursorY += 60;

    const leftInfoWidth = 286;
    doc.strokeColor("#e7e1da").moveTo(innerX, cursorY).lineTo(innerX + leftInfoWidth, cursorY).stroke();

    const contactLines = [companyProfile.address, companyProfile.email, companyProfile.phone].filter(Boolean);
    contactLines.forEach((line, index) => {
      doc
        .fillColor("#202020")
        .font("Helvetica")
        .fontSize(9.3)
        .text(line, innerX + 6, cursorY + 12 + index * 18, { width: leftInfoWidth - 10 });
    });

    drawLabelValueRows(
      doc,
      [
        ["Invoice Date", formatDate(invoice.invoiceDate)],
        ["Due Date", formatDate(invoice.dueDate)],
        ["Credit Period", `${invoice.creditPeriodDays || 0} Days`],
        ["Payment Terms", invoice.creditPeriodDays ? "Credit" : "Immediate"],
      ],
      headerRightX,
      cursorY + 4,
      78,
      80,
      16
    );

    cursorY += 72;

    // Invoice To + PO
    const panelGap = 10;
    const panelWidth = (innerWidth - panelGap) / 2;
    const panelHeight = 98;
    drawRoundedBox(doc, innerX, cursorY, panelWidth, panelHeight);
    drawRoundedBox(doc, innerX + panelWidth + panelGap, cursorY, panelWidth, panelHeight);

    doc.fillColor("#147d35").font("Helvetica-Bold").fontSize(11.5).text("Invoice To", innerX + 10, cursorY + 10);
    doc.fillColor("#ef8a24").font("Helvetica-Bold").fontSize(11.5).text("PO Details", innerX + panelWidth + panelGap + 10, cursorY + 10);

    doc
      .fillColor("#222222")
      .font("Helvetica-Bold")
      .fontSize(11.4)
      .text(invoice.customer.companyName, innerX + 10, cursorY + 28, { width: panelWidth - 20 });
    doc
      .font("Helvetica")
      .fontSize(9.2)
      .text(invoice.customer.address || "-", innerX + 10, cursorY + 46, { width: panelWidth - 20 });
    doc.text(`Tel: ${invoice.customer.phone || "-"}`, innerX + 10, cursorY + 68, { width: panelWidth - 20 });
    doc.text(`Email: ${invoice.customer.email || "-"}`, innerX + 10, cursorY + 82, { width: panelWidth - 20 });

    drawLabelValueRows(
      doc,
      [
        ["PO Number", invoice.purchaseOrder?.poNumber || "-"],
        ["PO Date", formatDate(invoice.purchaseOrder?.poDate)],
        ["Your Ref No", invoice.notes || "-"],
      ],
      innerX + panelWidth + panelGap + 12,
      cursorY + 28,
      74,
      panelWidth - 108,
      18
    );

    cursorY += panelHeight + 10;

    // Table
    const tableX = innerX;
    const tableWidth = innerWidth;
    const columns = [18, 48, 138, 62, 40, 74, 78];
    const headers = ["#", "Item Code", "Description", "Quantity", "Unit", "Unit Price", "Amount"];
    const headerHeight = 24;

    const measureRowHeight = (item) => {
      doc.font("Helvetica").fontSize(8.8);
      const descriptionHeight = doc.heightOfString(item.description || "-", {
        width: columns[2] - 8,
        align: "left",
      });
      return Math.max(20, descriptionHeight + 8);
    };

    const rowHeights = invoice.items.map(measureRowHeight);
    const tableHeight = headerHeight + rowHeights.reduce((sum, value) => sum + value, 0);

    drawRoundedBox(doc, tableX, cursorY, tableWidth, tableHeight + 2);
    doc.rect(tableX, cursorY, tableWidth, headerHeight).fill("#eff9f0");

    let colX = tableX + 6;
    headers.forEach((header, index) => {
      doc
        .fillColor("#1c7c35")
        .font("Helvetica-Bold")
        .fontSize(8.9)
        .text(header, colX, cursorY + 7, {
          width: columns[index] - 8,
          align: index >= 3 ? "right" : "left",
          lineBreak: false,
        });
      colX += columns[index];
    });

    let rowY = cursorY + headerHeight;
    invoice.items.forEach((item, index) => {
      const currentHeight = rowHeights[index];
      doc.strokeColor("#ece7e1").moveTo(tableX, rowY).lineTo(tableX + tableWidth, rowY).stroke();

      const cells = [
        String(index + 1),
        item.item?.itemCode || "-",
        item.description || "-",
        Number(item.quantity || 0).toFixed(2),
        item.item?.unit || "NO'S",
        money(item.unitPrice),
        money(item.amount),
      ];

      let cellX = tableX + 6;
      cells.forEach((cell, cellIndex) => {
        doc
          .fillColor("#202020")
          .font("Helvetica")
          .fontSize(8.8)
          .text(cell, cellX, rowY + 6, {
            width: columns[cellIndex] - 8,
            align: cellIndex >= 3 ? "right" : "left",
            lineBreak: cellIndex === 2,
          });
        cellX += columns[cellIndex];
      });

      rowY += currentHeight;
    });

    cursorY += tableHeight + 10;

    // Payment + totals
    const bottomPanelHeight = 90;
    drawRoundedBox(doc, innerX, cursorY, panelWidth - 8, bottomPanelHeight);
    drawRoundedBox(doc, innerX + panelWidth + 4, cursorY, panelWidth + 4, bottomPanelHeight);

    doc.fillColor("#147d35").font("Helvetica-Bold").fontSize(11.2).text("Payment Information", innerX + 10, cursorY + 10);
    drawLabelValueRows(
      doc,
      [
        ["Bank Name", companyProfile.bankName || "-"],
        ["Account Name", companyProfile.bankAccountName || "-"],
        ["Account No", companyProfile.bankAccountNumber || "-"],
      ],
      innerX + 10,
      cursorY + 30,
      74,
      panelWidth - 98,
      15
    );
    doc
      .fillColor("#2c8c45")
      .font("Helvetica")
      .fontSize(9)
      .text(companyProfile.paymentInstructions || "Please make payments within the due date.", innerX + 10, cursorY + 70, {
        width: panelWidth - 24,
      });

    const totalsX = innerX + panelWidth + 16;
    const valueWidth = panelWidth - 24;
    [
      ["Total (Without VAT)", money(invoice.subtotalWithoutVat), "#222222", 11.5],
      ["VAT 18%", money(invoice.vatAmount), "#23934c", 11.5],
      ["Total (With VAT 18%)", money(invoice.totalWithVat), "#17753d", 13.2],
    ].forEach(([label, value, color, size], index) => {
      const y = cursorY + 16 + index * 22;
      doc.fillColor("#202020").font(index === 2 ? "Helvetica-Bold" : "Helvetica").fontSize(10.2).text(label, totalsX, y, {
        width: 132,
      });
      doc.fillColor(color).font(index === 2 ? "Helvetica-Bold" : "Helvetica").fontSize(size).text(value, totalsX + 124, y, {
        width: valueWidth - 124,
        align: "right",
        lineBreak: false,
      });
    });

    cursorY += bottomPanelHeight + 10;

    drawRoundedBox(doc, innerX, cursorY, innerWidth, 42);
    doc.fillColor("#147d35").font("Helvetica-Bold").fontSize(11).text("Amount in Words", innerX + 10, cursorY + 9);
    doc.fillColor("#202020").font("Helvetica").fontSize(9.3).text(numberToWords(invoice.totalWithVat), innerX + 10, cursorY + 23, {
      width: innerWidth - 24,
    });

    cursorY += 48;

    // Footer
    const footerGap = 8;
    const footerWidth = (innerWidth - footerGap * 2) / 3;
    const footerHeight = 76;
    drawRoundedBox(doc, innerX, cursorY, footerWidth, footerHeight);
    drawRoundedBox(doc, innerX + footerWidth + footerGap, cursorY, footerWidth, footerHeight);
    drawRoundedBox(doc, innerX + (footerWidth + footerGap) * 2, cursorY, footerWidth, footerHeight);

    doc.fillColor("#202020").font("Helvetica-Bold").fontSize(10.5).text(companyProfile.authorizedByTitle || "Authorized By", innerX + 10, cursorY + 9);
    doc.fillColor("#444444").font("Helvetica-Oblique").fontSize(13).text(companyProfile.signatureText || "Authorized Signature", innerX + 18, cursorY + 28, {
      width: footerWidth - 40,
      align: "center",
    });
    doc.strokeColor("#222222").moveTo(innerX + 14, cursorY + 56).lineTo(innerX + footerWidth - 14, cursorY + 56).stroke();
    doc.fillColor("#202020").font("Helvetica-Bold").fontSize(8.8).text(companyProfile.authorizedByName || companyProfile.companyName || "HD Printing & Packaging (Pvt) Ltd.", innerX + 10, cursorY + 61, {
      width: footerWidth - 24,
      align: "center",
    });

    const middleX = innerX + footerWidth + footerGap;
    doc.fillColor("#202020").font("Helvetica-Bold").fontSize(10.5).text("Thank you for your business!", middleX + 10, cursorY + 14, {
      width: footerWidth - 24,
      align: "center",
    });
    doc.fillColor("#666666").font("Helvetica").fontSize(8.8).text("Print   |   Save as PDF   |   Share", middleX + 10, cursorY + 42, {
      width: footerWidth - 24,
      align: "center",
    });

    const notesX = innerX + (footerWidth + footerGap) * 2;
    doc.fillColor("#147d35").font("Helvetica-Bold").fontSize(10.5).text("Notes", notesX + 10, cursorY + 9);
    const noteLines = [
      "1. Please quote the invoice number when making payment.",
      "2. Goods once sold will not be taken back.",
    ];
    noteLines.forEach((line, index) => {
      doc.fillColor("#333333").font("Helvetica").fontSize(8.7).text(line, notesX + 10, cursorY + 26 + index * 16, {
        width: footerWidth - 24,
      });
    });

    cursorY += footerHeight + 8;

    drawRoundedBox(doc, innerX, cursorY, innerWidth, 20, "#f1faf2");
    doc.fillColor("#4f8f5f").font("Helvetica").fontSize(8.5).text(
      companyProfile.footerNote || "This is a computer generated invoice. No signature is required.",
      innerX + 8,
      cursorY + 6,
      { width: innerWidth - 20, align: "center" }
    );

    doc.end();
  });
