import { useState } from "react";
import { Plus, Check, Trash2, Wallet, Receipt, TrendingDown } from "lucide-react";
import { INK, SUB, LINE, GREEN, RED, fx, rel } from "../lib/theme.js";
import { Card, SectionHead, Btn, inputStyle, Field, Segmented, Screen, RoundBtn, SmallHeader, Sheet, EmptyState } from "../components/ui.jsx";

export const EXPENSE_CATEGORIES = ["Rent", "Salaries", "Utilities", "Supplies", "Transport", "Marketing", "Maintenance", "Misc"];

const CAT_META = {
  Rent: { emoji: "🏠", tone: "#0A6CFF" },
  Salaries: { emoji: "👥", tone: "#8E4DFF" },
  Utilities: { emoji: "💡", tone: "#F59300" },
  Supplies: { emoji: "📦", tone: "#2BA84A" },
  Transport: { emoji: "🚚", tone: "#5AC8FA" },
  Marketing: { emoji: "📣", tone: "#FF3B30" },
  Maintenance: { emoji: "🔧", tone: "#7A7A83" },
  Misc: { emoji: "🧾", tone: "#0B0B0F" },
};
const meta = (c) => CAT_META[c] || CAT_META.Misc;
const sameMonth = (d, ref) => { const a = new Date(d); return a.getMonth() === ref.getMonth() && a.getFullYear() === ref.getFullYear(); };

export function ExpensesScreen({ S }) {
  const now = new Date();
  const list = [...S.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  const monthList = list.filter((e) => sameMonth(e.date, now));
  const monthTotal = monthList.reduce((s, e) => s + e.amount, 0);

  // Category totals (this month) for the breakdown strip.
  const byCat = {};
  monthList.forEach((e) => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });
  const cats = Object.entries(byCat).map(([k, v]) => ({ k, v })).sort((a, b) => b.v - a.v);
  const catMax = cats[0] ? cats[0].v : 1;

  // Group all entries by day.
  const groups = [];
  list.forEach((e) => {
    const k = rel(e.date);
    const g = groups.find((x) => x.k === k);
    if (g) g.items.push(e); else groups.push({ k, items: [e] });
  });

  return (
    <Screen>
      <SmallHeader title="Expenses" sub={`${list.length} entries · ${fx(monthTotal)} this month`} onBack={S.pop}
        right={<RoundBtn icon={Plus} dark onClick={() => S.setSheet({ expense: {} })} />} />

      <Card className="rise" style={{ background: INK, color: "#fff", padding: "20px 20px 18px", marginTop: 6, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 150, height: 150, borderRadius: 999, background: "#FF3B30", opacity: .28, filter: "blur(52px)", top: -60, right: -40 }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingDown size={15} color="#FF8A80" strokeWidth={2.6} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.6, opacity: .7, textTransform: "uppercase" }}>Spent this month</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 850, letterSpacing: -1.2, marginTop: 6 }}>{fx(monthTotal)}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {[[monthList.length, "entries"], [cats.length, "categories"], [cats[0] ? cats[0].k : "—", "top spend"]].map(([n, l]) => (
              <div key={l} style={{ flex: 1, background: "rgba(255,255,255,.09)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 15, padding: "9px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 15.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n}</div>
                <div style={{ fontSize: 10, opacity: .6, fontWeight: 700, letterSpacing: .4, textTransform: "uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {cats.length > 0 && (
        <>
          <SectionHead title="By category" />
          <Card style={{ padding: "8px 16px" }}>
            {cats.map((c, i) => (
              <div key={c.k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i === cats.length - 1 ? "none" : `1px solid ${LINE}` }}>
                <div style={{ width: 34, height: 34, borderRadius: 12, background: meta(c.k).tone + "1A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{meta(c.k).emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 750 }}>
                    <span>{c.k}</span><span>{fx(c.v)}</span>
                  </div>
                  <div style={{ height: 5.5, background: "#EFEFF3", borderRadius: 99, marginTop: 6, overflow: "hidden" }}>
                    <div style={{ width: `${Math.max((c.v / catMax) * 100, 4)}%`, height: "100%", background: meta(c.k).tone, borderRadius: 99 }} />
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </>
      )}

      <SectionHead title="All expenses" />
      {list.length === 0 && <Card><EmptyState icon={Wallet} title="No expenses yet" sub="Track rent, salaries, utilities and more" /></Card>}
      {groups.map((g) => (
        <div key={g.k}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, color: SUB, textTransform: "uppercase", margin: "16px 6px 8px" }}>{g.k}</div>
          <Card style={{ padding: "5px 16px" }}>
            {g.items.map((e, i) => (
              <button key={e.id} className="press" onClick={() => S.setSheet({ expense: e })} style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                padding: "12px 0", borderBottom: i === g.items.length - 1 ? "none" : `1px solid ${LINE}`
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: meta(e.category).tone + "1A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{meta(e.category).emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 750, fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.title}</div>
                  <div style={{ fontSize: 11.5, color: SUB, fontWeight: 600, marginTop: 1.5 }}>{e.category} · {e.mode}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color: RED }}>− {fx(e.amount)}</div>
              </button>
            ))}
          </Card>
        </div>
      ))}
    </Screen>
  );
}

export function ExpenseSheet({ S }) {
  const editing = S.sheet.expense && S.sheet.expense.id ? S.sheet.expense : null;
  const [title, setTitle] = useState(editing ? editing.title : "");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [cat, setCat] = useState(editing ? editing.category : "Rent");
  const [mode, setMode] = useState(editing ? editing.mode : "Cash");
  const [note, setNote] = useState(editing ? editing.note || "" : "");

  const submit = () => {
    const obj = { title: title.trim(), amount: Number(amount), category: cat, mode, note: note.trim() };
    if (editing) S.editExpense(editing.id, obj);
    else S.addExpense(obj);
  };

  return (
    <Sheet open onClose={() => S.setSheet({})}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 19, fontWeight: 850 }}>{editing ? "Edit expense" : "New expense"}</div>
        {editing && (
          <button className="press" onClick={() => S.deleteExpense(editing.id)} style={{ display: "flex", alignItems: "center", gap: 5, color: "#D92D20", fontWeight: 750, fontSize: 13.5 }}>
            <Trash2 size={16} /> Delete
          </button>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#fff", borderRadius: 20, padding: "18px 16px", boxShadow: "0 8px 24px rgba(0,0,0,.06)", marginBottom: 16 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: SUB }}>£</span>
        <input autoFocus={!editing} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="0" style={{ fontSize: 38, fontWeight: 850, width: 150, letterSpacing: -1, textAlign: "center" }} />
      </div>

      <Field label="What was it for?"><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Shop rent — July" /></Field>

      <Field label="Category">
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {EXPENSE_CATEGORIES.map((c) => (
            <button key={c} className="press" onClick={() => setCat(c)} style={{
              padding: "8px 13px", borderRadius: 99, fontSize: 12.5, fontWeight: 750,
              background: cat === c ? INK : "#ECECF0", color: cat === c ? "#fff" : "#5B5B63"
            }}>{meta(c).emoji} {c}</button>
          ))}
        </div>
      </Field>

      <Field label="Paid via"><Segmented options={["Cash", "UPI", "Card"]} value={mode} onChange={setMode} /></Field>
      <Field label="Note (optional)"><input style={inputStyle} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note" /></Field>

      <Btn icon={Check} disabled={!title.trim() || !Number(amount)} onClick={submit}>
        {editing ? "Save changes" : "Save expense"}
      </Btn>
    </Sheet>
  );
}
