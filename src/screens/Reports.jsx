import { useState, useEffect } from "react";
import { Receipt, Users, ChevronRight, Printer, Package, TrendingUp, Download, FileText, Tag, Percent, Boxes, Wallet } from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell } from "recharts";
import { INK, SUB, LINE, GREEN, RED, ORANGE, BLUE, PURPLE, PIE_COLORS, fx, fD, rel } from "../lib/theme.js";
import { api } from "../lib/api.js";
import { printHTML, downloadFile, toCSV, statementHTML, overviewHTML } from "../lib/deviceActions.js";
import { MODE_ICON, Pill, Segmented, Card, SectionHead, Btn, Screen, LargeHeader, RoundBtn, Sheet, ChartTip } from "../components/ui.jsx";

const sameMonth = (d, ref) => { const a = new Date(d); return a.getMonth() === ref.getMonth() && a.getFullYear() === ref.getFullYear(); };

export function ReportsScreen({ S }) {
  const [period, setPeriod] = useState("30D");
  const [ov, setOv] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    api.reportOverview(period)
      .then((r) => { if (live) { setOv(r); setLoading(false); } })
      .catch(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [period]);

  const data = ov?.series || [];
  const revenue = ov?.revenue || 0;
  const orderCount = ov?.orderCount || 0;
  const aov = ov?.aov || 0;
  const profit = ov?.profit || 0;
  const gstCollected = ov?.gst || 0;

  const catData = ov?.categories || [];
  const catTotal = catData.reduce((s, c) => s + c.value, 0) || 1;
  const topItems = ov?.topItems || [];
  const topMax = topItems[0] ? topItems[0].rev : 1;
  const modes = ov?.modes || [];

  const now = new Date();
  const monthExpenses = S.expenses.filter((e) => sameMonth(e.date, now)).reduce((s, e) => s + e.amount, 0);
  const periodLabel = period === "7D" ? "Last 7 days" : period === "30D" ? "Last 30 days" : "Last 12 months";
  const exportOverview = () => {
    if (!ov) return S.toast("Report still loading…");
    printHTML("NexBill Report", overviewHTML(ov, S.settings, periodLabel));
    S.toast("Preparing report…", "check");
  };

  const REPORT_ROWS = [
    { id: "sales",  label: "Sales statement",   sub: "Every invoice, line by line", Icon: FileText },
    { id: "items",  label: "Item-wise report",  sub: "Quantity & revenue per item", Icon: Boxes },
    { id: "party",  label: "Party statement",   sub: "Balances across accounts",    Icon: Users },
    { id: "gst",    label: "GST summary",       sub: "Taxable value, CGST & SGST",  Icon: Percent },
    { id: "stock",  label: "Stock report",      sub: "On-hand units & value",       Icon: Package },
    { id: "pnl",    label: "Profit & loss",     sub: "Revenue to net profit",       Icon: TrendingUp },
  ];

  return (
    <Screen>
      <LargeHeader eyebrow="Insights" title="Reports"
        right={<RoundBtn icon={Download} onClick={exportOverview} />} />
      <Segmented options={["7D", "30D", "12M"]} value={period} onChange={setPeriod} />

      <Card style={{ marginTop: 14, padding: "16px 8px 6px" }}>
        <div style={{ padding: "0 10px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: SUB, textTransform: "uppercase" }}>Revenue</div>
            <div style={{ fontSize: 27, fontWeight: 850, letterSpacing: -0.8, marginTop: 3 }}>{fx(revenue)}</div>
          </div>
          <Pill tone="green" style={{ marginBottom: 4 }}><TrendingUp size={11} style={{ marginRight: 4, verticalAlign: -1.5 }} />+12.4%</Pill>
        </div>
        <div style={{ height: 158, marginTop: 8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={INK} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={INK} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tickLine={false} axisLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#9C9CA4" }}
                interval={Math.max(Math.floor(data.length / 5) - 1, 0)} />
              <Tooltip content={<ChartTip />} cursor={{ stroke: "#C9C9D0", strokeDasharray: "3 4" }} />
              <Area type="monotone" dataKey="v" stroke={INK} strokeWidth={2.6} fill="url(#gRev)"
                dot={false} activeDot={{ r: 4.5, fill: BLUE, stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginTop: 12 }}>
        {[
          { l: "Orders", v: orderCount, Icon: Receipt, c: BLUE },
          { l: "Avg. order", v: fx(aov), Icon: Tag, c: PURPLE },
          { l: "Est. profit", v: fx(profit), Icon: TrendingUp, c: GREEN },
          { l: "GST collected", v: fx(gstCollected), Icon: Percent, c: ORANGE },
        ].map((k) => (
          <Card key={k.l} style={{ padding: "14px 15px", display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 36, height: 36, borderRadius: 13, background: k.c + "1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <k.Icon size={17} color={k.c} strokeWidth={2.4} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16.5, fontWeight: 850, letterSpacing: -0.4 }}>{k.v}</div>
              <div style={{ fontSize: 10.5, fontWeight: 750, color: SUB, textTransform: "uppercase", letterSpacing: .6 }}>{k.l}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="press" onClick={() => S.push({ name: "expenses" })} style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ width: 42, height: 42, borderRadius: 15, background: "#FFE9E7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Wallet size={20} color={RED} strokeWidth={2.3} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14.5 }}>Expenses</div>
          <div style={{ fontSize: 12.5, color: SUB, fontWeight: 600, marginTop: 1 }}>Rent, salaries, utilities & more</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 850, fontSize: 15.5, color: RED }}>{fx(monthExpenses)}</div>
          <div style={{ fontSize: 10.5, fontWeight: 750, color: SUB, textTransform: "uppercase", letterSpacing: .5, marginTop: 1 }}>This month</div>
        </div>
        <ChevronRight size={17} color="#B0B0B8" />
      </Card>

      <SectionHead title="Sales by category" />
      <Card style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 138, height: 138, position: "relative", flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RPieChart>
              <Pie data={catData} dataKey="value" innerRadius={42} outerRadius={62} paddingAngle={3} cornerRadius={7} stroke="none">
                {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
            </RPieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ fontSize: 15, fontWeight: 850 }}>{fx(catTotal)}</div>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: SUB, letterSpacing: .8 }}>TOTAL</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {catData.slice(0, 5).map((c, i) => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 0" }}>
              <span style={{ width: 9, height: 9, borderRadius: 4, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: SUB }}>{Math.round((c.value / catTotal) * 100)}%</span>
            </div>
          ))}
        </div>
      </Card>

      <SectionHead title="Top items" />
      <Card style={{ padding: "12px 16px" }}>
        {topItems.map((t, i) => (
          <div key={t.name} style={{ padding: "8px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 750, marginBottom: 6 }}>
              <span>{t.emoji}  {t.name}</span><span>{fx(t.rev)}</span>
            </div>
            <div style={{ height: 7, background: "#EFEFF3", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${Math.max((t.rev / topMax) * 100, 6)}%`, height: "100%", borderRadius: 99, background: i === 0 ? `linear-gradient(90deg, ${INK}, ${BLUE})` : INK }} />
            </div>
          </div>
        ))}
      </Card>

      <SectionHead title="Payment modes" />
      <Card style={{ padding: "8px 16px" }}>
        {modes.map((m, i) => {
          const MI = MODE_ICON[m.k];
          return (
            <div key={m.k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i === modes.length - 1 ? "none" : `1px solid ${LINE}` }}>
              <div style={{ width: 36, height: 36, borderRadius: 13, background: "#F1F1F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MI size={17} strokeWidth={2.3} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 750 }}>
                  <span>{m.k}</span><span>{fx(m.v)}</span>
                </div>
                <div style={{ height: 5.5, background: "#EFEFF3", borderRadius: 99, marginTop: 6, overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(m.pct, 3)}%`, height: "100%", background: PIE_COLORS[i + 1], borderRadius: 99 }} />
                </div>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: SUB, width: 34, textAlign: "right" }}>{m.pct}%</span>
            </div>
          );
        })}
      </Card>

      <SectionHead title="Detailed statements" />
      <Card style={{ padding: "5px 16px" }}>
        {REPORT_ROWS.map((r, i) => (
          <button key={r.id} className="press" onClick={() => S.setSheet({ report: r.id })} style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
            padding: "12.5px 0", borderBottom: i === REPORT_ROWS.length - 1 ? "none" : `1px solid ${LINE}`
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: "#F1F1F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <r.Icon size={18} strokeWidth={2.2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 750, fontSize: 14.5 }}>{r.label}</div>
              <div style={{ fontSize: 12, color: SUB, fontWeight: 600, marginTop: 1 }}>{r.sub}</div>
            </div>
            <ChevronRight size={17} color="#B0B0B8" />
          </button>
        ))}
      </Card>
    </Screen>
  );
}

export function ReportSheet({ S }) {
  const type = S.sheet.report;
  const T = { sales: "Sales statement", items: "Item-wise report", party: "Party statement", gst: "GST summary", stock: "Stock report", pnl: "Profit & loss" }[type];
  let data = [], footer = null;
  const Row = ({ a, b, c, bold, tone }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 2px", borderBottom: `1px solid ${LINE}`, fontSize: 13, fontWeight: bold ? 850 : 650 }}>
      <span style={{ flex: 1.6, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a}</span>
      <span style={{ flex: 1, color: SUB, fontSize: 12 }}>{b}</span>
      <span style={{ textAlign: "right", fontWeight: 800, color: tone || INK, minWidth: 68 }}>{c}</span>
    </div>
  );

  if (type === "sales") {
    data = S.orders.map((o) => {
      const c = S.customers.find((x) => x.id === o.cid);
      return { a: o.no, b: `${rel(o.date)} · ${c ? c.name.split(" ")[0] : ""}`, c: fx(o.total), tone: o.status === "paid" ? INK : ORANGE };
    });
    footer = fx(S.orders.reduce((s, o) => s + o.total, 0));
  } else if (type === "items") {
    const m = {};
    S.orders.forEach((o) => o.items.forEach((it) => { m[it.pid] = m[it.pid] || { n: it.name, q: 0, r: 0 }; m[it.pid].q += it.qty; m[it.pid].r += it.qty * it.price; }));
    const list = Object.values(m).sort((a, b) => b.r - a.r);
    data = list.map((x) => ({ a: x.n, b: `${x.q} sold`, c: fx(x.r) }));
    footer = fx(list.reduce((s, x) => s + x.r, 0));
  } else if (type === "party") {
    data = S.customers.filter((c) => !c.walk).map((c) => (
      { a: c.name, b: c.type, c: fx(Math.abs(c.bal)), tone: c.bal > 0 ? GREEN : c.bal < 0 ? RED : SUB }
    ));
  } else if (type === "gst") {
    const taxable = S.orders.reduce((s, o) => s + o.sub - o.disc, 0);
    const gst = S.orders.reduce((s, o) => s + o.tax, 0);
    data = [
      { a: "Taxable value", b: "All invoices", c: fx(taxable) },
      { a: "CGST 2.5%", b: "Central", c: fx(gst / 2) },
      { a: "SGST 2.5%", b: "State", c: fx(gst / 2) },
      { a: "Total GST payable", b: "", c: fx(gst), bold: true },
    ];
  } else if (type === "stock") {
    data = S.products.map((p) => (
      { a: p.name, b: p.stock === 0 ? "Out of stock" : `${p.stock} units`, c: fx(p.stock * (p.cost || 0)), tone: p.stock === 0 ? RED : INK }
    ));
    footer = fx(S.products.reduce((s, p) => s + p.stock * p.cost, 0));
  } else if (type === "pnl") {
    const rev = S.orders.reduce((s, o) => s + o.total, 0);
    const cogs = S.orders.reduce((s, o) => s + o.items.reduce((a, it) => {
      const p = S.products.find((x) => x.id === it.pid);
      return a + (p ? p.cost : it.price * 0.8) * it.qty;
    }, 0), 0);
    const expenses = S.expenses.reduce((s, e) => s + e.amount, 0);
    const catCount = new Set(S.expenses.map((e) => e.category)).size;
    data = [
      { a: "Revenue", b: "Recent invoices", c: fx(rev) },
      { a: "Cost of goods", b: "", c: "− " + fx(cogs), tone: RED },
      { a: "Gross profit", b: "", c: fx(rev - cogs), bold: true },
      { a: "Expenses", b: `${S.expenses.length} entries · ${catCount} categories`, c: "− " + fx(expenses), tone: RED },
      { a: "Net profit", b: "", c: fx(rev - cogs - expenses), bold: true, tone: GREEN },
    ];
  }

  const rows = data.map((r, i) => <Row key={i} {...r} />);
  const subtitle = `Generated ${fD(new Date())} · ${S.settings?.storeName || "NexBill"}`;
  const exportPDF = () => { printHTML(T, statementHTML(T, subtitle, data, footer)); S.toast("Preparing PDF…", "check"); };
  const exportCSV = () => {
    const csv = [["Item", "Detail", "Amount"], ...data.map((r) => [r.a, r.b || "", r.c])];
    if (footer) csv.push(["Total", "", footer]);
    downloadFile(`${T.replace(/\s+/g, "-").toLowerCase()}.csv`, toCSV(csv), "text/csv;charset=utf-8");
    S.toast("Exported as CSV", "check");
  };

  return (
    <Sheet open onClose={() => S.setSheet({})}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 850 }}>{T}</div>
          <div style={{ fontSize: 12.5, color: SUB, fontWeight: 650 }}>{subtitle}</div>
        </div>
        <RoundBtn icon={Printer} onClick={exportPDF} />
      </div>
      <Card style={{ padding: "4px 16px", marginTop: 8 }}>
        {rows}
        {footer && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 2px", fontSize: 14.5, fontWeight: 850 }}>
            <span>Total</span><span>{footer}</span>
          </div>
        )}
      </Card>
      <div style={{ display: "flex", gap: 10, marginTop: 14, paddingBottom: 6 }}>
        <Btn tone="soft" icon={FileText} style={{ flex: 1 }} onClick={exportPDF}>PDF</Btn>
        <Btn tone="black" icon={Download} style={{ flex: 1 }} onClick={exportCSV}>Excel</Btn>
      </div>
    </Sheet>
  );
}

/* ================================================================== */
/*  PRODUCTS                                                           */
/* ================================================================== */
