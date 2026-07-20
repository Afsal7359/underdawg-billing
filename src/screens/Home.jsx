import { Receipt, BarChart3, Bell, ChevronRight, TrendingUp, AlertTriangle, Boxes, ScanLine, Package } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { INK, SUB, LINE, ORANGE, RED, BLUE, fx, rel, SAFE_T, dailySeries, greeting } from "../lib/theme.js";
import { Avatar, Card, SectionHead, Screen, RoundBtn, ChartTip, OrderRow, Sheet, EmptyState, StatusPill } from "../components/ui.jsx";

export function Sparkline({ data, w = 96, h = 40 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / (max - min || 1)) * (h - 6) - 3} r="3.5" fill="#4ADE80" />
    </svg>
  );
}

export function HomeScreen({ S }) {
  const today = S.orders.filter((o) => rel(o.date) === "Today");
  const tRev = today.reduce((s, o) => s + o.total, 0);
  const yRev = S.orders.filter((o) => rel(o.date) === "Yesterday").reduce((s, o) => s + o.total, 0) || 1;
  const delta = Math.round(((tRev - yRev) / yRev) * 100);
  const itemsSold = today.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);
  const low = S.products.filter((p) => p.stock === 0);
  // Greeting follows UK time; the name comes from the signed-in user.
  const greet = greeting();
  const displayName = S.user?.name || S.settings?.owner || "";
  const firstName = displayName.split(" ")[0];
  const week = dailySeries(S.orders, 7);

  const QA = [
    { label: "New bill", icon: Receipt, fn: () => S.push({ name: "bill" }) },
    { label: "Scan", icon: ScanLine, fn: () => S.openScanner("lookup") },
    { label: "Items", icon: Boxes, fn: () => S.push({ name: "products" }) },
    { label: "Reports", icon: BarChart3, fn: () => S.setTab("reports") },
  ];

  return (
    <Screen>
      <div style={{ paddingTop: `calc(${SAFE_T} + 14px)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 1.6, color: SUB, textTransform: "uppercase" }}>
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}
          </div>
          <div style={{ fontSize: 25, fontWeight: 850, letterSpacing: -0.6, marginTop: 2 }}>{greet}{firstName ? `, ${firstName}` : ""}</div>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <div style={{ position: "relative" }}>
            <RoundBtn icon={Bell} onClick={() => S.setSheet({ notifications: true })} />
            {(low.length + S.orders.filter((o) => o.status !== "paid").length) > 0 && (
              <span style={{ position: "absolute", top: -2, right: -2, minWidth: 17, height: 17, padding: "0 4px", borderRadius: 99, background: "#FF3B30", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #F2F2F7" }}>
                {low.length + S.orders.filter((o) => o.status !== "paid").length}
              </span>
            )}
          </div>
          <button className="pressS" onClick={() => S.setSheet({ settings: true })}>
            <Avatar name={displayName || "Staff"} hue="#0B0B0F" size={40} />
          </button>
        </div>
      </div>

      {/* hero */}
      <div className="rise" style={{
        marginTop: 16, background: INK, borderRadius: 28, padding: "22px 20px 18px",
        position: "relative", overflow: "hidden", color: "#fff",
        boxShadow: "0 22px 44px rgba(11,11,15,.35)"
      }}>
        <div className="glow" style={{ position: "absolute", width: 190, height: 190, borderRadius: 999, background: "#0A6CFF", opacity: .38, filter: "blur(58px)", top: -70, right: -50 }} />
        <div style={{ position: "absolute", width: 160, height: 160, borderRadius: 999, background: "#8E4DFF", opacity: .3, filter: "blur(60px)", bottom: -80, left: -40 }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, opacity: .65, textTransform: "uppercase" }}>Today's sales</div>
              <div style={{ fontSize: 38, fontWeight: 850, letterSpacing: -1.4, marginTop: 6 }}>{fx(tRev)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                <span style={{
                  background: delta >= 0 ? "rgba(74,222,128,.18)" : "rgba(255,99,99,.2)",
                  color: delta >= 0 ? "#4ADE80" : "#FF8A80",
                  fontSize: 12, fontWeight: 800, padding: "3.5px 9px", borderRadius: 99,
                  display: "flex", alignItems: "center", gap: 4
                }}><TrendingUp size={12} strokeWidth={3} style={{ transform: delta >= 0 ? "none" : "scaleY(-1)" }} />{Math.abs(delta)}%</span>
                <span style={{ fontSize: 12, opacity: .55, fontWeight: 600 }}>vs yesterday</span>
              </div>
            </div>
            <Sparkline data={week.map((d) => d.v)} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            {[[today.length, "orders"], [itemsSold, "items sold"], [today.filter(o => o.status !== "paid").length, "unpaid"]].map(([n, l]) => (
              <div key={l} style={{ flex: 1, background: "rgba(255,255,255,.09)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 15, padding: "9px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 17, fontWeight: 800 }}>{n}</div>
                <div style={{ fontSize: 10.5, opacity: .6, fontWeight: 700, letterSpacing: .4, textTransform: "uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* quick actions */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, padding: "0 4px" }}>
        {QA.map((q) => (
          <button key={q.label} className="press" onClick={q.fn} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, width: 72 }}>
            <div style={{
              width: 58, height: 58, borderRadius: 21, background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 1px 2px rgba(0,0,0,.05), 0 10px 24px rgba(0,0,0,.07)"
            }}><q.icon size={24} strokeWidth={2.1} color={INK} /></div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#4A4A52" }}>{q.label}</div>
          </button>
        ))}
      </div>

      {low.length > 0 && (
        <Card className="press" onClick={() => S.push({ name: "products" })} style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 13, background: "#FFF6E8" }}>
          <div style={{ width: 42, height: 42, borderRadius: 15, background: "#FFE7C2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertTriangle size={20} color="#C46A00" strokeWidth={2.3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14.5 }}>{low.length} item{low.length === 1 ? "" : "s"} out of stock</div>
            <div style={{ fontSize: 12.5, color: "#A87018", fontWeight: 600 }}>{low.slice(0, 2).map((p) => p.name).join(", ")}{low.length > 2 ? "…" : ""}</div>
          </div>
          <ChevronRight size={18} color="#C46A00" />
        </Card>
      )}

      <SectionHead title="This week" action="Reports" onAction={() => S.setTab("reports")} />
      <Card style={{ padding: "14px 8px 4px" }}>
        <div style={{ height: 118 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={week} barCategoryGap="32%">
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#9C9CA4" }} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,0,0,.045)", radius: 8 }} />
              <Bar dataKey="v" radius={[7, 7, 7, 7]}>
                {week.map((_, i) => <Cell key={i} fill={i === week.length - 1 ? BLUE : INK} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <SectionHead title="Recent activity" action="See all" onAction={() => S.setTab("orders")} />
      <Card style={{ padding: "6px 16px" }}>
        {S.orders.slice(0, 4).map((o, i) => <OrderRow key={o.id} o={o} S={S} last={i === 3} />)}
      </Card>
    </Screen>
  );
}

export function NotificationsSheet({ S }) {
  const low = S.products.filter((p) => p.stock === 0);
  const dues = S.orders.filter((o) => o.status !== "paid").slice(0, 15);
  const empty = low.length === 0 && dues.length === 0;
  const go = (v) => { S.setSheet({}); S.push(v); };
  return (
    <Sheet open onClose={() => S.setSheet({})}>
      <div style={{ fontSize: 19, fontWeight: 850 }}>Notifications</div>
      <div style={{ fontSize: 12.5, color: SUB, fontWeight: 650, marginBottom: 6 }}>Stock alerts and pending dues</div>

      {empty && <EmptyState icon={Bell} title="All caught up" sub="No alerts right now" />}

      {low.length > 0 && (
        <>
          <SectionHead title={`Out of stock (${low.length})`} />
          <Card style={{ padding: "5px 16px" }}>
            {low.map((p, i) => (
              <button key={p.id} className="press" onClick={() => go({ name: "products" })} style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                padding: "11px 0", borderBottom: i === low.length - 1 ? "none" : `1px solid ${LINE}`
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 13, background: "#FFF1DC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AlertTriangle size={18} color={ORANGE} strokeWidth={2.3} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 750, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: SUB, fontWeight: 600, marginTop: 1 }}>Restock needed</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: RED }}>0 left</div>
              </button>
            ))}
          </Card>
        </>
      )}

      {dues.length > 0 && (
        <>
          <SectionHead title={`Pending payments (${dues.length})`} />
          <Card style={{ padding: "5px 16px" }}>
            {dues.map((o, i) => {
              const c = S.customers.find((x) => x.id === o.cid);
              return (
                <button key={o.id} className="press" onClick={() => go({ name: "orderDetail", id: o.id })} style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                  padding: "11px 0", borderBottom: i === dues.length - 1 ? "none" : `1px solid ${LINE}`
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 13, background: "#F1F1F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Receipt size={18} color={INK} strokeWidth={2.1} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 750, fontSize: 14 }}>{c ? c.name : "Customer"}</div>
                    <div style={{ fontSize: 11.5, color: SUB, fontWeight: 600, marginTop: 1 }}>{o.no} · due {fx(o.total - o.paid)}</div>
                  </div>
                  <StatusPill status={o.status} />
                </button>
              );
            })}
          </Card>
        </>
      )}
    </Sheet>
  );
}
