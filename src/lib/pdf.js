/* ==================================================================
 *  Invoice PDF — a properly designed, branded A4 receipt.
 *  Built with jsPDF at print quality, carrying the underdawg logo, the
 *  line items, totals and a real scannable EAN-13 of the invoice number.
 *  Shares as a real PDF file where the OS supports it, otherwise falls
 *  back to a download.
 * ================================================================== */

import { jsPDF } from "jspdf";
import { fx, fD, fT } from "./theme.js";
import { encodeEan13, isValidEan13 } from "./ean13.js";

const INK = [11, 11, 15];
const MUTE = [122, 122, 131];
const LINE = [226, 226, 232];

/* ------------------------------------------------------------------ logo -- */
let logoCache; // data URL | null (null = tried and unavailable)

/** Fetch the shop logo once and keep it as a data URL for embedding. */
async function loadLogo(url) {
  if (logoCache !== undefined) return logoCache;
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("no logo");
    const blob = await res.blob();
    logoCache = await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  } catch {
    logoCache = null; // fall back to the wordmark
  }
  return logoCache;
}

/* --------------------------------------------------------------- barcode -- */
/** Draw a real EAN-13 as vector bars directly into the PDF. */
function drawBarcode(doc, code, x, y, w, h) {
  if (!code || !isValidEan13(code)) return 0;
  const modules = encodeEan13(code);
  if (!modules) return 0;
  const mw = w / modules.length;
  doc.setFillColor(...INK);
  for (let i = 0; i < modules.length; i++) {
    if (modules[i] === "1") doc.rect(x + i * mw, y, mw, h, "F");
  }
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTE);
  doc.text(String(code).split("").join(" "), x + w / 2, y + h + 3.4, { align: "center" });
  return h + 6;
}

/* ------------------------------------------------------------------ main -- */
/**
 * Build the invoice PDF.
 * @returns {{ blob: Blob, filename: string, doc: jsPDF }}
 */
export async function buildInvoicePDF(order, customer, settings = {}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 16; // page margin
  let y = 16;

  const store = settings.storeName || "underdawg";
  const logoUrl = settings.logoUrl || "/logo.png";

  /* ---- header: logo + store details ---- */
  const logo = await loadLogo(logoUrl);
  if (logo) {
    try {
      const props = doc.getImageProperties(logo);
      const lw = 30;
      const lh = (props.height / props.width) * lw;
      doc.addImage(logo, "PNG", M, y - 2, lw, Math.min(lh, 16));
    } catch {
      /* unreadable image — fall through to the wordmark */
      doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(...INK);
      doc.text(store, M, y + 7);
    }
  } else {
    doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(...INK);
    doc.text(store, M, y + 7);
  }

  doc.setFont("helvetica", "bold").setFontSize(26).setTextColor(...INK);
  doc.text("INVOICE", W - M, y + 6, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...MUTE);
  doc.text(order.no || "", W - M, y + 12, { align: "right" });

  y += 22;

  // store contact block
  doc.setFontSize(8.6).setTextColor(...MUTE);
  const contact = [settings.address, settings.phone, settings.email, settings.gstin ? `VAT ${settings.gstin}` : ""]
    .filter(Boolean);
  contact.forEach((l, i) => doc.text(String(l), M, y + i * 4));

  // date block (right)
  const d = order.date instanceof Date ? order.date : new Date(order.date);
  doc.text(`${fD(d)} · ${fT(d)}`, W - M, y, { align: "right" });
  doc.text(String(order.mode || ""), W - M, y + 4, { align: "right" });

  y += Math.max(contact.length * 4, 8) + 8;

  doc.setDrawColor(...LINE).setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 8;

  /* ---- billed to ---- */
  if (customer) {
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...MUTE);
    doc.text("BILLED TO", M, y);
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(...INK);
    doc.text(String(customer.name || "Walk-in Customer"), M, y + 6);
    if (customer.phone) {
      doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...MUTE);
      doc.text(String(customer.phone), M, y + 11);
      y += 4;
    }
    y += 16;
  }

  /* ---- items table ---- */
  const colQty = W - M - 62;
  const colPrice = W - M - 34;
  const colAmt = W - M;

  doc.setFillColor(245, 245, 248);
  doc.rect(M, y - 5, W - M * 2, 9, "F");
  doc.setFont("helvetica", "bold").setFontSize(8.6).setTextColor(...MUTE);
  doc.text("ITEM", M + 3, y + 1);
  doc.text("QTY", colQty, y + 1, { align: "right" });
  doc.text("PRICE", colPrice, y + 1, { align: "right" });
  doc.text("AMOUNT", colAmt - 3, y + 1, { align: "right" });
  y += 11;

  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...INK);
  for (const it of order.items || []) {
    if (y > 250) { doc.addPage(); y = 22; }

    const label = it.size ? `${it.name}  (${it.size})` : it.name;
    const lines = doc.splitTextToSize(String(label), colQty - M - 8);
    doc.text(lines[0], M + 3, y);
    if (lines.length > 1) {
      doc.setFontSize(8.4).setTextColor(...MUTE);
      doc.text(lines.slice(1).join(" "), M + 3, y + 4);
      doc.setFontSize(10).setTextColor(...INK);
    }

    doc.text(String(it.qty), colQty, y, { align: "right" });
    doc.text(fx(it.price), colPrice, y, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(fx(it.price * it.qty), colAmt - 3, y, { align: "right" });
    doc.setFont("helvetica", "normal");

    y += lines.length > 1 ? 11 : 7.5;
    doc.setDrawColor(...LINE).setLineWidth(0.15);
    doc.line(M, y - 3, W - M, y - 3);
  }

  /* ---- totals ---- */
  y += 4;
  const tx = W - M - 55;
  const row = (label, value, opts = {}) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.big ? 13 : 10);
    doc.setTextColor(...(opts.bold ? INK : MUTE));
    doc.text(label, tx, y);
    doc.setTextColor(...INK);
    doc.text(value, colAmt - 3, y, { align: "right" });
    y += opts.big ? 9 : 6.4;
  };

  row("Subtotal", fx(order.sub));
  if (order.disc > 0) row("Discount", `- ${fx(order.disc)}`);
  if (order.tax > 0) row(`${settings.taxLabel || "VAT"} (${order.taxRate || 0}%)`, fx(order.tax));

  doc.setDrawColor(...INK).setLineWidth(0.4);
  doc.line(tx, y - 2, W - M, y - 2);
  y += 4;
  row("TOTAL", fx(order.total), { bold: true, big: true });

  const due = (order.total || 0) - (order.paid || 0);
  row("Paid", fx(order.paid));
  if (due > 0.005) {
    doc.setTextColor(212, 45, 32);
    doc.setFont("helvetica", "bold").setFontSize(11);
    doc.text("Balance due", tx, y);
    doc.text(fx(due), colAmt - 3, y, { align: "right" });
    y += 8;
  }

  /* ---- footer: barcode + thanks ---- */
  y = Math.max(y + 10, 240);
  const codeDigits = String(order.no || "").replace(/\D/g, "");
  if (codeDigits) {
    // Encode the invoice number as a scannable EAN-13 for quick re-lookup.
    const base = ("200" + codeDigits).slice(0, 12).padEnd(12, "0");
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += Number(base[i]) * (i % 2 === 0 ? 1 : 3);
    const full = base + String((10 - (sum % 10)) % 10);
    drawBarcode(doc, full, W / 2 - 27, y, 54, 12);
  }

  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...MUTE);
  doc.text(settings.footerNote || `Thank you for shopping with ${store}.`, W / 2, 274, { align: "center" });

  const filename = `${(order.no || "invoice").replace(/[^\w-]/g, "")}.pdf`;
  return { blob: doc.output("blob"), filename, doc };
}

/* ------------------------------------------------------------- share/dl -- */
/**
 * Share the invoice as a real PDF file (iOS/Android share sheet, WhatsApp,
 * Mail…). Falls back to downloading it when file-sharing isn't supported.
 * @returns "shared" | "downloaded" | "cancel"
 */
export async function shareInvoicePDF(order, customer, settings) {
  const { blob, filename } = await buildInvoicePDF(order, customer, settings);
  const file = new File([blob], filename, { type: "application/pdf" });

  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({
        files: [file],
        title: `Invoice ${order.no}`,
        text: `${settings?.storeName || "underdawg"} — Invoice ${order.no}`,
      });
      return "shared";
    } catch (e) {
      if (e?.name === "AbortError") return "cancel";
      // fall through to download
    }
  }
  downloadBlob(blob, filename);
  return "downloaded";
}

/** Download the invoice PDF straight to the device. */
export async function downloadInvoicePDF(order, customer, settings) {
  const { blob, filename } = await buildInvoicePDF(order, customer, settings);
  downloadBlob(blob, filename);
  return "downloaded";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
