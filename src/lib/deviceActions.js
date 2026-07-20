/* ==================================================================
 *  Device actions — printing, file export, sharing, calling.
 *  Everything here touches the browser (document/navigator/window) and
 *  is only ever called from event handlers, so it's SSR-safe to import.
 * ================================================================== */
import { fx } from "./theme.js";
import { ean13SVG, isValidEan13 } from "./ean13.js";

const esc = (x) =>
  String(x ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export const digits = (p) => String(p || "").replace(/[^0-9]/g, "");

/* ---------- barcode ----------
   Real EAN-13 (same encoder as <BarcodeView>) so a PRINTED label scans back
   in correctly. Falls back to the plain digits for non-EAN values. */
export function barcodeSVG(value, { height = 46, width = 240 } = {}) {
  if (value && isValidEan13(value)) {
    return ean13SVG(value, { width, height, showText: true, bg: "transparent" });
  }
  return `<div style="font-family:monospace;font-size:13px;letter-spacing:2px">${esc(value ?? "")}</div>`;
}

/* ---------- print via hidden iframe (no popup blocker) ---------- */
const PRINT_CSS = `
  *{box-sizing:border-box;margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
  body{padding:22px;color:#0B0B0F;font-variant-numeric:tabular-nums}
  .rc{max-width:360px;margin:0 auto}
  .rc-h{text-align:center;padding-bottom:12px;border-bottom:1.5px dashed #bbb}
  .rc-store{font-size:19px;font-weight:800}.rc-sub{font-size:11px;color:#666;margin-top:2px}
  .rc-meta{display:flex;justify-content:space-between;font-size:12px;color:#444;padding:6px 0;border-bottom:1px dashed #ddd}
  table{width:100%;border-collapse:collapse;margin:8px 0}
  table td{padding:5px 0;font-size:13px;vertical-align:top}
  td.q{color:#666;text-align:center;white-space:nowrap}td.r{text-align:right;font-weight:700;white-space:nowrap}
  .rc-tot{border-top:1.5px dashed #bbb;padding-top:8px}
  .rc-tot>div{display:flex;justify-content:space-between;font-size:13px;padding:3px 0;color:#333}
  .rc-tot .b{font-size:17px;font-weight:800;color:#000}.rc-tot .due{color:#c0392b;font-weight:700}
  .rc-bc{text-align:center;margin-top:16px;padding-top:14px;border-top:1.5px dashed #bbb}
  .rc-bcv{letter-spacing:3px;font-size:11px;color:#666;margin-top:4px}
  .rc-ty{text-align:center;font-size:11px;color:#999;margin-top:10px}
  .label{width:280px;margin:0 auto;text-align:center;border:1px dashed #bbb;border-radius:12px;padding:16px}
  .lb-name{font-size:15px;font-weight:800}.lb-price{font-size:22px;font-weight:850;margin:4px 0 10px}
  .lb-code{letter-spacing:3px;font-size:11px;color:#666;margin-top:4px}
  .rep{max-width:640px;margin:0 auto}
  .rep h1{font-size:22px;font-weight:850}.rep-sub{font-size:12px;color:#777;margin:2px 0 14px}
  .rep-t{width:100%;border-collapse:collapse}
  .rep-t td{padding:9px 4px;font-size:13px;border-bottom:1px solid #eee}
  .rep-t td.s{color:#888;font-size:12px}.rep-t td.r{text-align:right;font-weight:700}
  .rep-t tr.b td{font-weight:850}.rep-t tr.tot td{border-top:2px solid #222;border-bottom:none;font-size:15px}
  .rep h2{font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#888;margin:20px 0 6px}
  .rep-ft{margin-top:22px;font-size:11px;color:#aaa;text-align:center}
  @media print{body{padding:0}@page{margin:14mm}}
`;

export function printHTML(title, bodyHTML) {
  if (typeof document === "undefined") return;
  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0" });
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${PRINT_CSS}</style></head><body>${bodyHTML}</body></html>`);
  doc.close();
  const run = () => {
    try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch (e) {}
    setTimeout(() => iframe.remove(), 1000);
  };
  setTimeout(run, 350);
}

/* ---------- file download + CSV ---------- */
export function downloadFile(filename, content, mime = "text/plain;charset=utf-8") {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 200);
}
export const toCSV = (rows) =>
  "﻿" + rows.map((r) => r.map((c) => {
    const s = String(c ?? "");
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(",")).join("\n");

/* ---------- share / phone ---------- */
export async function shareText(title, text) {
  try { if (navigator.share) { await navigator.share({ title, text }); return "shared"; } }
  catch (e) { if (e && e.name === "AbortError") return "cancel"; }
  try { await navigator.clipboard.writeText(text); return "copied"; } catch (e) {}
  return "none";
}
export function callPhone(phone) {
  const d = digits(phone);
  if (!d) return false;
  window.location.href = "tel:" + d;
  return true;
}
export function whatsapp(phone, text) {
  const d = digits(phone);
  window.open((d ? `https://wa.me/${d}` : "https://wa.me/") + `?text=${encodeURIComponent(text)}`, "_blank", "noopener");
}

/* ---------- HTML builders ---------- */
export function receiptHTML(o, c, s = {}) {
  const rows = o.items.map((it) =>
    `<tr><td>${esc(it.name)}</td><td class="q">${it.qty} × ${fx(it.price)}</td><td class="r">${fx(it.qty * it.price)}</td></tr>`
  ).join("");
  const due = o.total - o.paid;
  return `<div class="rc">
    <div class="rc-h"><div class="rc-store">${esc(s.storeName || "NexBill Store")}</div>
      <div class="rc-sub">${esc(s.address || "")}</div><div class="rc-sub">GSTIN ${esc(s.gstin || "—")}</div></div>
    <div class="rc-meta"><span>${esc(o.no)}</span><span>${new Date(o.date).toLocaleString("en-IN")}</span></div>
    <div class="rc-meta"><span>Billed to</span><span>${esc(c ? c.name : "Customer")}</span></div>
    <table>${rows}</table>
    <div class="rc-tot">
      <div><span>Subtotal</span><span>${fx(o.sub)}</span></div>
      ${o.disc > 0 ? `<div><span>Discount</span><span>−${fx(o.disc)}</span></div>` : ""}
      <div><span>GST</span><span>${fx(o.tax)}</span></div>
      <div class="b"><span>Total</span><span>${fx(o.total)}</span></div>
      <div><span>Paid (${esc(o.mode)})</span><span>${fx(o.paid)}</span></div>
      ${due > 0 ? `<div class="due"><span>Balance due</span><span>${fx(due)}</span></div>` : ""}
    </div>
    <div class="rc-bc">${barcodeSVG(o.no, { width: 220, height: 44 })}<div class="rc-bcv">${esc(o.no)}</div></div>
    <div class="rc-ty">Thank you for shopping with us</div>
  </div>`;
}

export function labelHTML(p) {
  return `<div class="label"><div class="lb-name">${esc(p.name)}</div>
    <div class="lb-price">${fx(p.price)}</div>${barcodeSVG(p.code, { width: 200, height: 52 })}
    <div class="lb-code">${esc(p.code)}</div></div>`;
}

export function statementHTML(title, subtitle, data, total) {
  const rows = data.map((r) =>
    `<tr class="${r.bold ? "b" : ""}"><td>${esc(r.a)}</td><td class="s">${esc(r.b || "")}</td><td class="r">${esc(r.c)}</td></tr>`
  ).join("");
  return `<div class="rep"><h1>${esc(title)}</h1><div class="rep-sub">${esc(subtitle || "")}</div>
    <table class="rep-t">${rows}${total ? `<tr class="b tot"><td>Total</td><td></td><td class="r">${esc(total)}</td></tr>` : ""}</table>
    <div class="rep-ft">Generated by NexBill</div></div>`;
}

export function overviewHTML(ov, s = {}, periodLabel = "") {
  const section = (heading, rows) =>
    `<h2>${esc(heading)}</h2><table class="rep-t">${rows.map((r) => `<tr><td>${esc(r[0])}</td><td class="s">${esc(r[1] || "")}</td><td class="r">${esc(r[2])}</td></tr>`).join("")}</table>`;
  const kpis = [
    ["Revenue", periodLabel, fx(ov.revenue)],
    ["Orders", "", String(ov.orderCount)],
    ["Average order", "", fx(ov.aov)],
    ["Estimated profit", "~22% margin", fx(ov.profit)],
    ["GST collected", "", fx(ov.gst)],
  ];
  const top = (ov.topItems || []).map((t) => [t.name, `${t.qty} sold`, fx(t.rev)]);
  const modes = (ov.modes || []).map((m) => [m.k, `${m.pct}%`, fx(m.v)]);
  const cats = (ov.categories || []).map((c) => [c.name, "", fx(c.value)]);
  return `<div class="rep"><h1>${esc(s.storeName || "NexBill Store")} — Report</h1>
    <div class="rep-sub">${esc(periodLabel)} · generated ${new Date().toLocaleDateString("en-IN")}</div>
    ${section("Summary", kpis)}
    ${top.length ? section("Top items", top) : ""}
    ${modes.length ? section("Payment modes", modes) : ""}
    ${cats.length ? section("Sales by category", cats) : ""}
    <div class="rep-ft">Generated by NexBill</div></div>`;
}
