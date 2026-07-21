import { useState } from "react";
import { Plus, Share2, Printer, Wallet, Store, ClipboardList, Trash2, Undo2, RotateCcw } from "lucide-react";
import { INK, SUB, GREEN, RED, fx, fT, rel, TAX } from "../lib/theme.js";
import { printHTML, receiptHTML, shareText } from "../lib/deviceActions.js";

/* jsPDF is heavy (~370 kB), so it's code-split and only fetched the first time
   someone actually shares or downloads an invoice — the app shell stays light. */
const pdfLib = () => import("../lib/pdf.js");
import { MODE_ICON, BarcodeView, Pill, StatusPill, Avatar, Segmented, SearchBar, Card, Btn, Screen, LargeHeader, RoundBtn, SmallHeader, EmptyState, OrderRow, Sheet, Field, inputStyle } from "../components/ui.jsx";

/**
 * Share the invoice as a properly designed, branded PDF (logo, line items,
 * totals, scannable code). Uses the native share sheet where available —
 * WhatsApp/Mail/AirDrop receive a real .pdf file — and falls back to a
 * download, then to plain text if PDF generation itself fails.
 */
export async function shareInvoice(S, o, c) {
  S.toast("Preparing PDF…", "check");
  try {
    const { shareInvoicePDF } = await pdfLib();
    const r = await shareInvoicePDF(o, c, S.settings);
    if (r === "cancel") return;
    S.toast(r === "shared" ? "Invoice shared" : "Invoice PDF downloaded", "check");
  } catch (e) {
    const due = o.total - o.paid;
    const text = `${S.settings?.storeName || "underdawg"} — Invoice ${o.no}\n${o.items.length} item${o.items.length === 1 ? "" : "s"} · Total ${fx(o.total)}${due > 0 ? ` · Due ${fx(due)}` : " · Paid"}`;
    const r = await shareText(`Invoice ${o.no}`, text);
    S.toast(r === "shared" || r === "copied" ? "Invoice shared as text" : "Couldn't share invoice", r === "none" ? "warn" : "check");
  }
}

/** Save the invoice PDF straight to the device. */
export async function downloadInvoice(S, o, c) {
  S.toast("Preparing PDF…", "check");
  try {
    const { downloadInvoicePDF } = await pdfLib();
    await downloadInvoicePDF(o, c, S.settings);
    S.toast("Invoice PDF downloaded", "check");
  } catch {
    S.toast("Couldn't create the PDF", "warn");
  }
}

export function OrdersScreen({ S }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  // Voided bills live only in Trash — they're not sales any more, so they must
  // never appear in the normal list or the totals below it.
  const scoped = S.orders.filter((o) => (filter === "Trash" ? o.voided : !o.voided));
  const list = scoped.filter((o) => {
    const c = S.customers.find((x) => x.id === o.cid);
    const matchQ = !q || o.no.toLowerCase().includes(q.toLowerCase()) || (c && c.name.toLowerCase().includes(q.toLowerCase()));
    const matchF = filter === "All" || filter === "Trash" ||
      (filter === "Paid" && o.status === "paid") ||
      (filter === "Due" && (o.status === "pending" || o.status === "partial")) ||
      (filter === "Overdue" && o.status === "overdue");
    return matchQ && matchF;
  });
  const groups = [];
  list.forEach((o) => {
    const k = rel(o.date);
    const g = groups.find((x) => x.k === k);
    if (g) g.items.push(o); else groups.push({ k, items: [o] });
  });
  const sum = list.reduce((s, o) => s + o.total, 0);

  return (
    <Screen>
      <LargeHeader eyebrow="Sales" title="Orders" right={<RoundBtn icon={Plus} dark onClick={() => S.push({ name: "bill" })} />} />
      <SearchBar value={q} onChange={setQ} placeholder="Invoice no. or customer" />
      <Segmented options={["All", "Paid", "Due", "Overdue", "Trash"]} value={filter} onChange={setFilter} style={{ marginTop: 12 }} />
      <div style={{ display: "flex", justifyContent: "space-between", padding: "13px 6px 2px", fontSize: 12.5, fontWeight: 700, color: SUB }}>
        <span>
          {list.length} {filter === "Trash" ? "voided bill" : "invoice"}{list.length === 1 ? "" : "s"}
        </span>
        <span>{filter === "Trash" ? `${fx(sum)} reversed` : fx(sum)}</span>
      </div>
      {groups.map((g) => (
        <div key={g.k}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, color: SUB, textTransform: "uppercase", margin: "16px 6px 8px" }}>{g.k}</div>
          <Card style={{ padding: "5px 16px" }}>
            {g.items.map((o, i) => <OrderRow key={o.id} o={o} S={S} last={i === g.items.length - 1} />)}
          </Card>
        </div>
      ))}
      {list.length === 0 && <EmptyState icon={ClipboardList} title="No invoices found" sub="Try a different search or create a new bill" />}
    </Screen>
  );
}

export function OrderDetailScreen({ S, id }) {
  const o = S.orders.find((x) => x.id === id);
  if (!o) return null;
  const c = S.customers.find((x) => x.id === o.cid);
  const due = o.total - o.paid;
  const ModeIcon = MODE_ICON[o.mode] || Wallet;
  const Line = ({ l, r, bold, tone }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5.5px 0", fontSize: bold ? 17 : 13.5, fontWeight: bold ? 850 : 600, color: tone || (bold ? INK : "#55555D") }}>
      <span>{l}</span><span>{r}</span>
    </div>
  );
  return (
    <Screen>
      <SmallHeader title={o.no} sub={`${rel(o.date)}, ${fT(o.date)}`} onBack={S.pop}
        right={<RoundBtn icon={Share2} onClick={() => shareInvoice(S, o, c)} />} />
      <Card className="rise" style={{ padding: "24px 20px 20px", marginTop: 6 }}>
        <div style={{ textAlign: "center", paddingBottom: 16, borderBottom: `1.5px dashed rgba(0,0,0,.12)` }}>
          <div style={{ width: 48, height: 48, borderRadius: 17, background: INK, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Store size={22} color="#fff" strokeWidth={2.2} />
          </div>
          <div style={{ fontWeight: 850, fontSize: 17, letterSpacing: -0.3 }}>{S.settings?.storeName || "underdawg"}</div>
          <div style={{ fontSize: 12, color: SUB, fontWeight: 600, marginTop: 2 }}>{S.settings?.address || ""}{S.settings?.gstin ? ` • VAT ${S.settings.gstin}` : ""}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10 }}>
            <StatusPill status={o.status} />
            <Pill tone="gray"><ModeIcon size={11} style={{ marginRight: 4, verticalAlign: -1.5 }} />{o.mode}</Pill>
          </div>
        </div>
        <div style={{ padding: "14px 0", borderBottom: `1.5px dashed rgba(0,0,0,.12)` }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: SUB, textTransform: "uppercase", marginBottom: 6 }}>Billed to</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name={c ? c.name : "?"} hue={c ? c.hue : "#999"} size={36} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{c ? c.name : "Customer"}</div>
              <div style={{ fontSize: 12.5, color: SUB, fontWeight: 600 }}>{c ? c.phone : ""}</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "12px 0 6px" }}>
          {o.items.map((it) => (
            <div key={it.pid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}>
              <span style={{ fontSize: 19 }}>{it.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</div>
                <div style={{ fontSize: 12, color: SUB, fontWeight: 600 }}>{it.qty} × {fx(it.price)}</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{fx(it.qty * it.price)}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1.5px dashed rgba(0,0,0,.12)`, paddingTop: 10 }}>
          <Line l="Subtotal" r={fx(o.sub)} />
          {o.disc > 0 && <Line l="Discount" r={"−" + fx(o.disc)} tone={GREEN} />}
          {o.tax > 0 && <Line l={`VAT (${o.taxRate || TAX}%)`} r={fx(o.tax)} />}
          <Line l="Total" r={fx(o.total)} bold />
          <Line l="Paid" r={fx(o.paid)} />
          {due > 0 && <Line l="Balance due" r={fx(due)} tone={RED} />}
        </div>
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1.5px dashed rgba(0,0,0,.12)` }}>
          <BarcodeView value={o.no} height={44} />
          <div style={{ textAlign: "center", fontSize: 11, color: "#A8A8B0", fontWeight: 600, marginTop: 8 }}>Thank you for shopping with us</div>
        </div>
      </Card>
      {o.voided ? (
        /* ---- in the trash: explain what happened, offer a restore ---- */
        <>
          <Card style={{ marginTop: 14, background: o.voidType === "returned" ? "#FFF6EA" : "#FFF0EF", boxShadow: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Pill tone={o.voidType === "returned" ? "orange" : "red"}>
                {o.voidType === "returned" ? "Returned" : "Deleted"}
              </Pill>
              <div style={{ fontSize: 12, color: SUB, fontWeight: 650 }}>
                {o.voidedAt ? `${rel(new Date(o.voidedAt))}, ${fT(new Date(o.voidedAt))}` : ""}
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: "#55555D", fontWeight: 600, marginTop: 9, lineHeight: 1.55 }}>
              Stock has been put back and this bill no longer counts towards sales.
              {o.refundDue > 0 && (
                <> <b style={{ color: RED }}>Refund {fx(o.refundDue)} to the customer.</b></>
              )}
            </div>
            {o.voidReason && (
              <div style={{ fontSize: 12.5, color: SUB, fontWeight: 600, marginTop: 7, fontStyle: "italic" }}>
                “{o.voidReason}”
              </div>
            )}
          </Card>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Btn tone="white" icon={Printer} style={{ flex: 1 }} onClick={() => { printHTML(`Invoice ${o.no}`, receiptHTML(o, c, S.settings)); S.toast("Preparing receipt…", "check"); }}>Print</Btn>
            <Btn tone="black" icon={RotateCcw} style={{ flex: 1.2 }} onClick={() => S.setSheet({ voidOrder: { id: o.id, mode: "restore" } })}>Restore bill</Btn>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn tone="white" icon={Printer} style={{ flex: 1 }} onClick={() => { printHTML(`Invoice ${o.no}`, receiptHTML(o, c, S.settings)); S.toast("Preparing receipt…", "check"); }}>Print</Btn>
            {due > 0
              ? <Btn tone="black" icon={Wallet} style={{ flex: 1.4 }} onClick={() => S.setSheet({ payment: { kind: "order", id: o.id } })}>Collect {fx(due)}</Btn>
              : <Btn tone="black" icon={Share2} style={{ flex: 1.4 }} onClick={() => shareInvoice(S, o, c)}>Share invoice</Btn>}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10, paddingBottom: 8 }}>
            <Btn tone="soft" icon={Undo2} style={{ flex: 1 }} onClick={() => S.setSheet({ voidOrder: { id: o.id, mode: "returned" } })}>Return</Btn>
            <Btn tone="danger" icon={Trash2} style={{ flex: 1 }} onClick={() => S.setSheet({ voidOrder: { id: o.id, mode: "deleted" } })}>Delete</Btn>
          </div>
        </>
      )}
    </Screen>
  );
}

/**
 * Confirm a delete / return / restore. Voiding is reversible (the bill goes to
 * the trash, never away) but it moves stock and money, so it always asks first
 * and spells out exactly what will happen.
 */
export function VoidOrderSheet({ S }) {
  const cfg = S.sheet.voidOrder || {};
  const o = S.orders.find((x) => x.id === cfg.id);
  const [reason, setReason] = useState("");
  if (!o) return null;

  const mode = cfg.mode;                       // "deleted" | "returned" | "restore"
  const restoring = mode === "restore";
  const returning = mode === "returned";

  const title = restoring ? "Restore this bill?" : returning ? "Return this bill?" : "Delete this bill?";
  const cta = restoring ? "Restore bill" : returning ? "Confirm return" : "Delete bill";

  const bullets = restoring
    ? [
        "It goes back into your invoice list and counts as a sale again.",
        "The stock it sold is taken out of inventory again.",
        o.total - o.paid > 0 ? `${fx(o.total - o.paid)} goes back onto the customer's balance.` : null,
      ]
    : [
        "Stock from every item goes back into inventory.",
        "The bill stops counting towards sales, profit and reports.",
        o.total - o.paid > 0 ? `${fx(o.total - o.paid)} comes off the customer's balance.` : null,
        o.paid > 0 ? `You'll need to refund ${fx(o.paid)} already taken.` : null,
        "It moves to Trash — you can restore it any time.",
      ];

  return (
    <Sheet open onClose={() => S.setSheet({})}>
      <div style={{ fontSize: 19, fontWeight: 850 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: SUB, fontWeight: 650, marginTop: 3 }}>
        {o.no} · {fx(o.total)} · {o.items.length} item{o.items.length === 1 ? "" : "s"}
      </div>

      <Card style={{ marginTop: 14, boxShadow: "none", background: "#F7F7FA" }}>
        {bullets.filter(Boolean).map((b, i) => (
          <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginTop: i ? 9 : 0 }}>
            <div style={{ width: 5, height: 5, borderRadius: 99, background: SUB, marginTop: 7, flexShrink: 0 }} />
            <div style={{ fontSize: 13, fontWeight: 620, lineHeight: 1.5, color: "#44444C" }}>{b}</div>
          </div>
        ))}
      </Card>

      {!restoring && (
        <div style={{ marginTop: 14 }}>
          <Field label="Reason (optional)">
            <input
              style={inputStyle}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={returning ? "e.g. wrong size" : "e.g. billed by mistake"}
            />
          </Field>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <Btn tone="soft" style={{ flex: 1 }} onClick={() => S.setSheet({})}>Cancel</Btn>
        <Btn
          tone={restoring ? "black" : returning ? "black" : "danger"}
          style={{ flex: 1.3 }}
          onClick={() => (restoring ? S.restoreOrder(o.id) : S.voidOrder(o.id, mode, reason.trim()))}
        >
          {cta}
        </Btn>
      </div>
    </Sheet>
  );
}

/* ================================================================== */
/*  NEW BILL                                                           */
/* ================================================================== */
