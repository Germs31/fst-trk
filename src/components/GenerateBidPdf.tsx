"use client";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@mui/material";

type BidItem = {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  type: "MATERIAL" | "LABOR";
};

type Bid = {
  title: string;
  description?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  items: BidItem[];
  amount: number;
  status: string;
};

export default function GenerateBidPdf({ bid }: { bid: Bid }) {
  const handleGeneratePdf = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    let y = height - 50;

    // Title
    page.drawText(`Bid: ${bid.title}`, { x: 50, y, size: 18, font });
    y -= 30;

    // Customer Info
    page.drawText(`Customer: ${bid.customerName}`, { x: 50, y, size: fontSize, font });
    y -= 20;
    if (bid.customerEmail) {
      page.drawText(`Email: ${bid.customerEmail}`, { x: 50, y, size: fontSize, font });
      y -= 20;
    }
    if (bid.customerPhone) {
      page.drawText(`Phone: ${bid.customerPhone}`, { x: 50, y, size: fontSize, font });
      y -= 20;
    }
    if (bid.address) {
      page.drawText(`Address: ${bid.address}`, { x: 50, y, size: fontSize, font });
      y -= 30;
    }

    // Description
    if (bid.description) {
      page.drawText(`Description: ${bid.description}`, { x: 50, y, size: fontSize, font });
      y -= 30;
    }

    // Table header
    page.drawText(`Items:`, { x: 50, y, size: 14, font });
    y -= 20;
    page.drawText(`Name | Qty | Unit Price | Type | Total`, { x: 50, y, size: fontSize, font });
    y -= 15;

    // Items
    bid.items.forEach((item) => {
      const total = item.quantity * item.unitPrice;
      const line = `${item.name} | ${item.quantity} | $${item.unitPrice.toFixed(
        2
      )} | ${item.type} | $${total.toFixed(2)}`;
      page.drawText(line, { x: 50, y, size: fontSize, font });
      y -= 20;
    });

    // Total Amount
    page.drawText(`Total: $${bid.amount.toFixed(2)}`, { x: 50, y: y - 20, size: 14, font, color: rgb(0, 0, 0) });

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    // Download
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Bid_${bid.title}.pdf`;
    link.click();
  };

  return (
    <Button variant="contained" onClick={handleGeneratePdf}>
      Export to PDF
    </Button>
  );
}
