import { useState, useMemo } from "react";
import { Receipt, Users, Search, Bell, Check, Wallet, ArrowUpRight, ArrowDownLeft, UserPlus, Phone, History } from "lucide-react";
import { INK, SUB, LINE, GREEN, RED, fx, rel, UK_DIAL } from "../lib/theme.js";
import { callPhone, whatsapp, digits } from "../lib/deviceActions.js";
import { Avatar, Segmented, SearchBar, Card, SectionHead, Btn, inputStyle, Field, Screen, LargeHeader, RoundBtn, SmallHeader, Sheet, EmptyState } from "../components/ui.jsx";

export function AccountsScreen({ S }) {
  const [seg, setSeg] = useState("Customers");
  const [q, setQ] = useState("");
  const toCollect = S.customers.filter((c) => c.bal > 0).reduce((s, c) => s + c.bal, 0);
  const toPay = S.customers.filter((c) => c.bal < 0).reduce((s, c) => s - c.bal, 0);
  const list = S.customers.filter((c) =>
    c.type === (seg === "Customers" ? "customer" : "supplier") && !c.walk &&
    (!q || c.name.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <Screen>
      <LargeHeader eyebrow="Parties & ledgers" title="Accounts"
        right={<RoundBtn icon={UserPlus} dark onClick={() => S.setSheet({ addCustomer: true })} />} />
      <div style={{ display: "flex", gap: 11 }}>
        {[
          { l: "To collect", v: toCollect, tone: GREEN, Icon: ArrowDownLeft, bg: "#E4F6E9" },
          { l: "To pay", v: toPay, tone: RED, Icon: ArrowUpRight, bg: "#FFE9E7" },
        ].map((s) => (
          <Card key={s.l} style={{ flex: 1, padding: "15px 15px 13px" }}>
            <div style={{ width: 34, height: 34, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 9 }}>
              <s.Icon size={17} color={s.tone} strokeWidth={2.6} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 850, letterSpacing: -0.6, color: s.tone }}>{fx(s.v)}</div>
            <div style={{ fontSize: 11.5, fontWeight: 750, color: SUB, textTransform: "uppercase", letterSpacing: .8, marginTop: 2 }}>{s.l}</div>
          </Card>
        ))}
      </div>
      <Segmented options={["Customers", "Suppliers"]} value={seg} onChange={setSeg} style={{ marginTop: 14 }} />
      <div style={{ marginTop: 12 }}><SearchBar value={q} onChange={setQ} placeholder={`Search ${seg.toLowerCase()}`} /></div>
      <Card style={{ marginTop: 14, padding: "5px 16px" }}>
        {list.map((c, i) => (
          <button key={c.id} className="press" onClick={() => S.push({ name: "accountDetail", id: c.id })} style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
            padding: "12px 0", borderBottom: i === list.length - 1 ? "none" : `1px solid ${LINE}`
          }}>
            <Avatar name={c.name} hue={c.hue} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 750, fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
              <div style={{ fontSize: 12, color: SUB, fontWeight: 600, marginTop: 1.5 }}>{c.phone}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: c.bal > 0 ? GREEN : c.bal < 0 ? RED : "#9C9CA4" }}>
                {fx(Math.abs(c.bal))}
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 750, color: SUB, textTransform: "uppercase", letterSpacing: .5, marginTop: 1.5 }}>
                {c.bal > 0 ? "You'll get" : c.bal < 0 ? "You'll give" : "Settled"}
              </div>
            </div>
          </button>
        ))}
        {list.length === 0 && <EmptyState icon={Users} title={`No ${seg.toLowerCase()} yet`} sub="Add a party to start a ledger" />}
      </Card>
    </Screen>
  );
}

export function AccountDetailScreen({ S, id }) {
  const c = S.customers.find((x) => x.id === id);
  const entries = useMemo(() => {
    const e = [];
    S.orders.filter((o) => o.cid === id).forEach((o) => {
      e.push({ id: o.id + "s", date: o.date, label: o.no, sub: `${o.items.length} items · ${o.mode}`, amt: o.total, kind: "sale", oid: o.id });
      if (o.paid > 0) e.push({ id: o.id + "p", date: o.date, label: "Payment received", sub: o.mode, amt: o.paid, kind: "pay" });
    });
    (S.extraPay[id] || []).forEach((p) => e.push({ id: p.id, date: p.date, label: p.label, sub: p.mode, amt: p.amt, kind: "pay" }));
    return e.sort((a, b) => b.date - a.date);
  }, [S.orders, S.extraPay, id]);
  if (!c) return null;
  const isCust = c.type === "customer";
  const balTone = c.bal > 0 ? GREEN : c.bal < 0 ? RED : SUB;
  const store = S.settings?.storeName || "underdawg";

  const call = () => { if (callPhone(c.phone)) S.toast(`Calling ${c.name}…`); else S.toast("No phone number on file", "warn"); };
  const remind = () => {
    const amt = fx(Math.abs(c.bal));
    const first = c.name.split(" ")[0];
    const msg = c.bal >= 0
      ? `Hi ${first}, a gentle reminder from ${store}: your pending balance is ${amt}. Kindly clear it at your convenience. Thank you!`
      : `Hi ${first}, from ${store}: we have ${amt} payable to you and will settle it shortly. Thank you!`;
    whatsapp(c.phone, msg);
    S.toast(digits(c.phone) ? "Opening WhatsApp…" : "Opening WhatsApp");
  };

  return (
    <Screen>
      <SmallHeader title={c.name} sub={isCust ? "Customer" : "Supplier"} onBack={S.pop}
        right={<RoundBtn icon={Phone} onClick={call} />} />
      <Card className="rise" style={{ textAlign: "center", padding: "22px 18px 18px", marginTop: 6 }}>
        <Avatar name={c.name} hue={c.hue} size={62} />
        <div style={{ fontWeight: 850, fontSize: 19, marginTop: 10, letterSpacing: -0.4 }}>{c.name}</div>
        <div style={{ fontSize: 13, color: SUB, fontWeight: 650, marginTop: 2 }}>{c.phone}</div>
        <div style={{ fontSize: 32, fontWeight: 850, letterSpacing: -1, color: balTone, marginTop: 14 }}>{fx(Math.abs(c.bal))}</div>
        <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 1.2, color: SUB, textTransform: "uppercase", marginTop: 2 }}>
          {c.bal > 0 ? "You will get" : c.bal < 0 ? "You will give" : "All settled"}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <Btn tone={isCust ? "green" : "danger"} icon={Wallet} style={{ flex: 1.3, padding: "13px" }}
            onClick={() => S.setSheet({ payment: { kind: "account", id: c.id } })}>
            {isCust ? "Collect" : "Pay"}
          </Btn>
          <Btn tone="soft" icon={Bell} style={{ flex: 1, padding: "13px" }}
            onClick={remind}>Remind</Btn>
        </div>
      </Card>
      <SectionHead title="Ledger" />
      <Card style={{ padding: "5px 16px" }}>
        {entries.map((e, i) => (
          <button key={e.id} className="press" onClick={() => e.oid && S.push({ name: "orderDetail", id: e.oid })} style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
            padding: "12px 0", borderBottom: i === entries.length - 1 ? "none" : `1px solid ${LINE}`
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 14, flexShrink: 0,
              background: e.kind === "pay" ? "#E4F6E9" : "#F1F1F5",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {e.kind === "pay" ? <Wallet size={18} color={GREEN} strokeWidth={2.2} /> : <Receipt size={18} color={INK} strokeWidth={2.1} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 750, fontSize: 14 }}>{e.label}</div>
              <div style={{ fontSize: 11.5, color: SUB, fontWeight: 600, marginTop: 1.5 }}>{rel(e.date)} · {e.sub}</div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 14.5, color: e.kind === "pay" ? GREEN : INK }}>
              {e.kind === "pay" ? "− " : "+ "}{fx(e.amt)}
            </div>
          </button>
        ))}
        {entries.length === 0 && <EmptyState icon={History} title="No entries yet" sub="Sales and payments will appear here" />}
      </Card>
    </Screen>
  );
}

export function PaymentSheet({ S }) {
  const t = S.sheet.payment;
  const order = t.kind === "order" ? S.orders.find((o) => o.id === t.id) : null;
  const acc = t.kind === "order" ? S.customers.find((c) => c.id === (order ? order.cid : "")) : S.customers.find((c) => c.id === t.id);
  const dueFull = t.kind === "order" ? (order ? order.total - order.paid : 0) : Math.abs(acc ? acc.bal : 0);
  const [amt, setAmt] = useState(String(dueFull || ""));
  const [mode, setMode] = useState("UPI");
  const isPay = acc && acc.bal < 0 && t.kind === "account";
  return (
    <Sheet open onClose={() => S.setSheet({})}>
      <div style={{ fontSize: 19, fontWeight: 850, marginBottom: 2 }}>{isPay ? "Record payment" : "Collect payment"}</div>
      <div style={{ fontSize: 13, color: SUB, fontWeight: 650, marginBottom: 16 }}>
        {order ? `${order.no} · due ${fx(dueFull)}` : acc ? `${acc.name} · balance ${fx(dueFull)}` : ""}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#fff", borderRadius: 20, padding: "20px 16px", boxShadow: "0 8px 24px rgba(0,0,0,.06)" }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: SUB }}>£</span>
        <input autoFocus inputMode="numeric" value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="0" style={{ fontSize: 38, fontWeight: 850, width: 150, letterSpacing: -1 }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {[["Full", dueFull], ["£50", 500], ["£100", 1000]].map(([l, v]) => (
          <button key={l} className="press" onClick={() => setAmt(String(v))} style={{
            flex: 1, padding: "9px", borderRadius: 12, background: "#ECECF0", fontWeight: 750, fontSize: 13
          }}>{l}</button>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <Segmented options={["Cash", "UPI", "Card"]} value={mode} onChange={setMode} />
      </div>
      <div style={{ marginTop: 18 }}>
        <Btn icon={Check} disabled={!Number(amt)} onClick={() => S.recordPayment(t, Number(amt), mode)}>
          {isPay ? "Record" : "Collect"} {Number(amt) ? fx(amt) : ""}
        </Btn>
      </div>
    </Sheet>
  );
}

export function AddCustomerSheet({ S }) {
  const [name, setName] = useState("");
  // Pre-fill the UK dialling code so staff just type the local number.
  const [phone, setPhone] = useState(UK_DIAL + " ");
  const [type, setType] = useState("Customer");
  const [open, setOpen] = useState("");
  return (
    <Sheet open onClose={() => S.setSheet({})}>
      <div style={{ fontSize: 19, fontWeight: 850, marginBottom: 16 }}>New party</div>
      <Field label="Full name"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. James Smith" /></Field>
      <Field label="Phone"><input style={inputStyle} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44 7911 123456" /></Field>
      <Field label="Type"><Segmented options={["Customer", "Supplier"]} value={type} onChange={setType} /></Field>
      <Field label="Opening balance (optional)">
        <input style={inputStyle} inputMode="numeric" value={open} onChange={(e) => setOpen(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="£0" />
      </Field>
      <Btn icon={Check} disabled={!name.trim()} onClick={() => {
        // Drop a bare dialling code (no actual number typed).
        const digitsOnly = phone.replace(/\D/g, "");
        const cleanPhone = digitsOnly === "" || digitsOnly === "44" ? "" : phone.trim();
        S.addCustomer({ name: name.trim(), phone: cleanPhone || "—", type: type.toLowerCase(), open: Number(open) || 0 });
      }}>
        Save party
      </Btn>
    </Sheet>
  );
}

/* ================================================================== */
/*  REPORTS                                                            */
/* ================================================================== */
