import { useState, useRef, useEffect } from "react";
import { Home as HomeIcon, Receipt, Users, BarChart3, Plus, Store, RefreshCw, Boxes, Wallet, Settings as SettingsIcon } from "lucide-react";
import { CSS, INK, SUB, SAFE_B } from "./lib/theme.js";
import { api, auth, AuthError } from "./lib/api.js";
import { Avatar, Toast } from "./components/ui.jsx";
import Login from "./components/Login.jsx";
import InstallPrompt from "./components/InstallPrompt.jsx";
import UpdatePrompt from "./components/UpdatePrompt.jsx";
import { HomeScreen } from "./screens/Home.jsx";
import { OrdersScreen, OrderDetailScreen, VoidOrderSheet } from "./screens/Orders.jsx";
import { BillScreen, ScannerModal, SuccessSheet, CustomerPickerSheet, CustomItemSheet, SizePickerSheet } from "./screens/Bill.jsx";
import { AccountsScreen, AccountDetailScreen, PaymentSheet, AddCustomerSheet } from "./screens/Accounts.jsx";
import { ReportsScreen, ReportSheet } from "./screens/Reports.jsx";
import { ProductsScreen, ProductSheet, AddProductSheet, SettingsSheet } from "./screens/Products.jsx";
import { ExpensesScreen, ExpenseSheet } from "./screens/Expenses.jsx";
import { NotificationsSheet } from "./screens/Home.jsx";

function TabBar({ tab, setTab, onNew }) {
  const tabs = [
    { id: "home", label: "Home", Icon: HomeIcon },
    { id: "orders", label: "Orders", Icon: Receipt },
    { id: "__new" },
    { id: "accounts", label: "Accounts", Icon: Users },
    { id: "reports", label: "Reports", Icon: BarChart3 },
  ];
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 40,
      background: "rgba(255,255,255,.84)", backdropFilter: "blur(20px) saturate(1.7)",
      WebkitBackdropFilter: "blur(20px) saturate(1.7)",
      borderTop: "1px solid rgba(0,0,0,.06)",
      paddingBottom: SAFE_B, display: "flex", alignItems: "stretch"
    }}>
      {tabs.map((t) =>
        t.id === "__new" ? (
          <div key="new" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <button className="pressS" onClick={onNew} style={{
              width: 58, height: 58, borderRadius: 999, background: INK, marginTop: -20,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 12px 28px rgba(11,11,15,.4), inset 0 1px 0 rgba(255,255,255,.15)"
            }}><Plus size={26} color="#fff" strokeWidth={2.6} /></button>
          </div>
        ) : (
          <button key={t.id} className="press" onClick={() => setTab(t.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3.5, padding: "9px 0 5px"
          }}>
            <t.Icon size={23} strokeWidth={tab === t.id ? 2.5 : 2}
              color={tab === t.id ? INK : "#9A9AA2"} />
            <span style={{ fontSize: 10, fontWeight: 750, color: tab === t.id ? INK : "#9A9AA2", letterSpacing: .2 }}>{t.label}</span>
          </button>
        )
      )}
    </div>
  );
}

function Sidebar({ S }) {
  const top = S.stack[S.stack.length - 1];
  const nav = [
    { id: "home", label: "Home", Icon: HomeIcon },
    { id: "orders", label: "Orders", Icon: Receipt },
    { id: "accounts", label: "Accounts", Icon: Users },
    { id: "reports", label: "Reports", Icon: BarChart3 },
  ];
  const links = [
    { name: "products", label: "Items", Icon: Boxes },
    { name: "expenses", label: "Expenses", Icon: Wallet },
  ];
  return (
    <div className="nb-side">
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "2px 8px 6px" }}>
        <img src="/logo.png" alt="underdawg" style={{ height: 34, width: "auto", maxWidth: 150, objectFit: "contain" }} />
      </div>

      <button className="press" onClick={() => S.openStack({ name: "bill" })} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "18px 0 6px",
        background: INK, color: "#fff", fontWeight: 800, fontSize: 14.5, padding: "12px", borderRadius: 14,
        boxShadow: "0 10px 22px rgba(11,11,15,.28)"
      }}><Plus size={19} strokeWidth={2.8} /> New bill</button>

      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 12 }}>
        {nav.map((n) => (
          <button key={n.id} className={`nb-navbtn${!top && S.tab === n.id ? " on" : ""}`} onClick={() => S.goTab(n.id)}>
            <n.Icon size={19} strokeWidth={2.2} /> {n.label}
          </button>
        ))}
        <div style={{ height: 1, background: "rgba(0,0,0,.06)", margin: "10px 8px" }} />
        {links.map((l) => (
          <button key={l.name} className={`nb-navbtn${top && top.name === l.name ? " on" : ""}`} onClick={() => S.openStack({ name: l.name })}>
            <l.Icon size={19} strokeWidth={2.2} /> {l.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <button className="nb-navbtn" onClick={() => S.setSheet({ settings: true })} style={{ gap: 11 }}>
        <Avatar name={S.user?.name || S.settings?.owner || "Staff"} hue="#0B0B0F" size={34} />
        <div style={{ minWidth: 0, textAlign: "left" }}>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{S.user?.name || S.settings?.owner || "Staff"}</div>
          <div style={{ fontSize: 11, color: SUB, fontWeight: 650, textTransform: "capitalize" }}>{S.user?.role || "Settings"}</div>
        </div>
        <SettingsIcon size={16} color="#B0B0B8" style={{ marginLeft: "auto" }} />
      </button>
    </div>
  );
}

function Splash({ error, onRetry }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32, textAlign: "center" }}>
      <div className={error ? "" : "pulse"} style={{ width: 66, height: 66, borderRadius: 22, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Store size={30} color="#fff" strokeWidth={2.1} />
      </div>
      {error ? (
        <>
          <div>
            <div style={{ fontSize: 17, fontWeight: 850 }}>Can't reach the server</div>
            <div style={{ fontSize: 13, color: SUB, fontWeight: 600, marginTop: 5, maxWidth: 260 }}>{error}</div>
          </div>
          <button className="press" onClick={onRetry} style={{ display: "flex", alignItems: "center", gap: 8, background: INK, color: "#fff", fontWeight: 750, fontSize: 14.5, padding: "12px 20px", borderRadius: 14 }}>
            <RefreshCw size={17} strokeWidth={2.5} /> Retry
          </button>
        </>
      ) : (
        <div style={{ fontSize: 14, fontWeight: 750, color: SUB, letterSpacing: .3 }}>Loading your store…</div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [stack, setStack] = useState([]);
  const [products, setProducts] = useState([]);
  // Real catalogue categories, sent by the API so they always match the website.
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [extraPay, setExtraPay] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState({ storeName: "underdawg", owner: "", address: "", gstin: "" });
  const [walkId, setWalkId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(null);
  const [user, setUser] = useState(() => auth.user);

  const isWide = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(min-width:900px)").matches;
  const [desktop, setDesktop] = useState(isWide);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(min-width:900px)");
    const h = (e) => setDesktop(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const [cart, setCart] = useState({});
  const [billCustomer, setBillCustomer] = useState(null);
  const [billDisc, setBillDisc] = useState("");
  const [billTax, setBillTax] = useState(true);
  const [billMode, setBillMode] = useState("Cash");
  const [billRecv, setBillRecv] = useState("");

  const [scan, setScan] = useState({ open: false, ctx: "lookup" });
  const [sheet, setSheet] = useState({});
  const [toastMsg, setToastMsg] = useState(null);
  const toastRef = useRef(null);
  const submitting = useRef(false);

  const toast = (msg, icon) => {
    setToastMsg({ msg, icon });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToastMsg(null), 2300);
  };

  const load = async () => {
    setLoading(true); setLoadErr(null);
    try {
      const b = await api.bootstrap();
      setProducts(b.products);
      setCategories(b.categories || []);
      setCustomers(b.customers);
      setOrders(b.orders);
      setExtraPay(b.extraPay);
      setExpenses(b.expenses);
      if (b.settings && b.settings.storeName) setSettings(b.settings);
      if (b.user) setUser(b.user);
      const walk = b.customers.find((c) => c.walk) || b.customers.find((c) => c.type === "customer");
      setWalkId(walk ? walk.id : null);
      setBillCustomer((cur) => cur || (walk ? walk.id : null));
    } catch (e) {
      // An expired/invalid session drops us back to the sign-in screen rather
      // than showing a dead "network error" splash.
      if (e instanceof AuthError) { setUser(null); setLoading(false); return; }
      setLoadErr(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  // Only fetch data once we actually have a session.
  useEffect(() => {
    if (user) load();
    else setLoading(false);
  }, [user?.id ?? user?._id ?? null]);

  const logout = () => {
    api.logout();
    setUser(null);
    setProducts([]); setCustomers([]); setOrders([]); setExpenses([]); setExtraPay({});
    setCart({}); setStack([]); setTab("home"); setSheet({});
  };

  const push = (v) => setStack((s) => [...s, v]);
  const pop = () => setStack((s) => s.slice(0, -1));
  const goTab = (t) => { setStack([]); setTab(t); };
  const openStack = (v) => setStack([v]);

  /* The cart holds full LINE objects rather than a pid→qty map, so a bill can
     carry the same product in two sizes, and ad-hoc "custom" lines that are
     never written to the catalogue. Key: "<pid>::<size>" or "custom:<uid>". */
  const lineKey = (pid, size) => `${pid}::${size || ""}`;

  /** Accepts a product object or an id; `opts` may be `true` (legacy silent) or {size, silent}. */
  const addToCart = (productOrId, opts) => {
    const silent = opts === true || (opts && opts.silent);
    const wantSize = opts && typeof opts === "object" ? opts.size : undefined;
    const p = productOrId && typeof productOrId === "object"
      ? productOrId
      : products.find((x) => x.id === productOrId);
    if (!p) return;

    // Default to the first size that actually has stock.
    const size =
      wantSize ??
      (p.variants?.find((v) => (v.stock || 0) > 0)?.size ?? p.variants?.[0]?.size ?? "");
    const key = lineKey(p.id, size);

    setCart((c) => ({
      ...c,
      [key]: c[key]
        ? { ...c[key], qty: c[key].qty + 1 }
        : { key, pid: p.id, name: p.name, price: p.price, qty: 1, size, img: p.img, code: p.code, custom: false },
    }));
    if (!silent) toast("Added to bill", "check");
  };

  /** Add a one-off item typed at the counter. Never saved to the catalogue. */
  const addCustomLine = ({ name, price, qty = 1 }) => {
    const key = `custom:${Math.random().toString(36).slice(2, 9)}`;
    setCart((c) => ({
      ...c,
      [key]: {
        key, pid: null, name: String(name).trim(), price: Number(price) || 0,
        qty: Number(qty) || 1, size: "", img: "", code: "", custom: true,
      },
    }));
    toast("Custom item added", "check");
  };

  const removeFromCart = (key) => setCart((c) => {
    const n = { ...c };
    if (n[key] && n[key].qty > 1) n[key] = { ...n[key], qty: n[key].qty - 1 };
    else delete n[key];
    return n;
  });

  const setLineQty = (key, qty) => setCart((c) => {
    const n = { ...c };
    if (qty <= 0) delete n[key];
    else if (n[key]) n[key] = { ...n[key], qty };
    return n;
  });

  const resetBill = () => { setCart({}); setBillDisc(""); setBillRecv(""); setBillMode("Cash"); setBillCustomer(walkId); };

  const createOrder = async () => {
    const items = Object.values(cart).map((l) =>
      l.custom
        ? { custom: true, name: l.name, price: l.price, qty: l.qty }
        : { pid: l.pid, qty: l.qty, size: l.size }
    );
    if (!items.length || submitting.current) return;
    submitting.current = true;
    try {
      const { order, products: updated, party } = await api.createOrder({
        cid: billCustomer, items, disc: billDisc, tax: billTax, mode: billMode, recv: billRecv,
      });
      setOrders((o) => [order, ...o]);
      const map = new Map(updated.map((p) => [p.id, p]));
      setProducts((ps) => ps.map((p) => map.get(p.id) || p));
      if (party) setCustomers((cs) => cs.map((c) => (c.id === party.id ? party : c)));
      resetBill();
      setSheet({ success: order.id });
    } catch (e) {
      toast(e.message, "warn");
    } finally {
      submitting.current = false;
    }
  };

  const recordPayment = async (target, amt, mode) => {
    try {
      const { order, party, payment } = await api.recordPayment(target, amt, mode);
      if (target.kind === "order" && order) {
        setOrders((os) => os.map((o) => (o.id === order.id ? order : o)));
      }
      if (party) setCustomers((cs) => cs.map((c) => (c.id === party.id ? party : c)));
      if (target.kind === "account" && payment) {
        setExtraPay((e) => ({ ...e, [target.id]: [...(e[target.id] || []), payment] }));
      }
      setSheet({});
      toast(`${fx(amt)} recorded via ${mode}`, "check");
    } catch (e) {
      toast(e.message, "warn");
    }
  };

  /**
   * Move a bill to the trash. `type` is "deleted" (billed in error) or
   * "returned" (goods came back) — the server restores stock, unwinds the
   * customer's balance and drops it from sales either way. Nothing is
   * destroyed, so it can be restored from the Trash tab.
   */
  const voidOrder = async (id, type, reason) => {
    try {
      const { order, products: updated, party } = await api.voidOrder(id, type, reason);
      setOrders((os) => os.map((o) => (o.id === order.id ? order : o)));
      if (updated.length) {
        const map = new Map(updated.map((p) => [p.id, p]));
        setProducts((ps) => ps.map((p) => map.get(p.id) || p));
      }
      if (party) setCustomers((cs) => cs.map((c) => (c.id === party.id ? party : c)));
      setSheet({});
      pop();
      const refund = order.refundDue > 0 ? ` · refund ${fx(order.refundDue)}` : "";
      toast(`${order.no} ${type === "returned" ? "returned" : "deleted"}${refund}`, "check");
    } catch (e) {
      toast(e.message, "warn");
    }
  };

  /** Pull a bill back out of the trash, re-applying stock and balance. */
  const restoreOrder = async (id) => {
    try {
      const { order, products: updated, party } = await api.restoreOrder(id);
      setOrders((os) => os.map((o) => (o.id === order.id ? order : o)));
      if (updated.length) {
        const map = new Map(updated.map((p) => [p.id, p]));
        setProducts((ps) => ps.map((p) => map.get(p.id) || p));
      }
      if (party) setCustomers((cs) => cs.map((c) => (c.id === party.id ? party : c)));
      setSheet({});
      toast(`${order.no} restored`, "check");
    } catch (e) {
      toast(e.message, "warn");
    }
  };

  const setStock = async (pid, delta) => {
    setProducts((ps) => ps.map((p) => (p.id === pid ? { ...p, stock: Math.max(p.stock + delta, 0) } : p)));
    try {
      const updated = await api.setStock(pid, delta);
      setProducts((ps) => ps.map((p) => (p.id === pid ? updated : p)));
    } catch (e) {
      toast(e.message, "warn");
    }
  };

  const addProduct = async (obj) => {
    try {
      const p = await api.addProduct(obj);
      setProducts((ps) => [p, ...ps]);
      setSheet({});
      if (stack.some((v) => v.name === "bill")) {
        setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }));
        toast(`${p.name} added to bill`, "check");
      } else {
        toast(`${p.name} added`, "check");
      }
    } catch (e) {
      toast(e.message, "warn");
    }
  };

  const addCustomer = async (obj) => {
    try {
      const c = await api.addCustomer(obj);
      setCustomers((cs) => [...cs, c]);
      setSheet({});
      toast(`${c.name} added`, "check");
      if (c.type === "customer" && stack.some((v) => v.name === "bill")) setBillCustomer(c.id);
    } catch (e) {
      toast(e.message, "warn");
    }
  };

  const addExpense = async (obj) => {
    try {
      const e = await api.addExpense(obj);
      setExpenses((xs) => [e, ...xs]);
      setSheet({});
      toast(`Expense of ${fx(e.amount)} added`, "check");
    } catch (err) {
      toast(err.message, "warn");
    }
  };
  const editExpense = async (id, obj) => {
    try {
      const e = await api.editExpense(id, obj);
      setExpenses((xs) => xs.map((x) => (x.id === id ? e : x)));
      setSheet({});
      toast("Expense updated", "check");
    } catch (err) {
      toast(err.message, "warn");
    }
  };
  const deleteExpense = async (id) => {
    try {
      await api.deleteExpense(id);
      setExpenses((xs) => xs.filter((x) => x.id !== id));
      setSheet({});
      toast("Expense deleted");
    } catch (err) {
      toast(err.message, "warn");
    }
  };

  const saveSettings = async (obj) => {
    try {
      const s = await api.saveSettings(obj);
      setSettings(s);
      toast("Business details saved", "check");
      return true;
    } catch (e) {
      toast(e.message, "warn");
      return false;
    }
  };

  const S = {
    tab, setTab, stack, push, pop, goTab, openStack, toast, desktop,
    products, customers, orders, extraPay, expenses, settings, walkId,
    cart, setCart, addToCart, removeFromCart, addCustomLine, setLineQty,
    user, logout,
    billCustomer, setBillCustomer, billDisc, setBillDisc, billTax, setBillTax,
    billMode, setBillMode, billRecv, setBillRecv,
    categories,
    createOrder, recordPayment, voidOrder, restoreOrder, setStock, addProduct, addCustomer,
    addExpense, editExpense, deleteExpense, saveSettings,
    scan, openScanner: (ctx) => setScan({ open: true, ctx }),
    closeScanner: () => setScan({ open: false, ctx: "lookup" }),
    sheet, setSheet,
  };

  const top = stack[stack.length - 1];

  const screens = (
    <>
      {!top && tab === "home" && <HomeScreen S={S} />}
      {!top && tab === "orders" && <OrdersScreen S={S} />}
      {!top && tab === "accounts" && <AccountsScreen S={S} />}
      {!top && tab === "reports" && <ReportsScreen S={S} />}
      {top && top.name === "bill" && <BillScreen S={S} />}
      {top && top.name === "orderDetail" && <OrderDetailScreen S={S} id={top.id} />}
      {top && top.name === "accountDetail" && <AccountDetailScreen S={S} id={top.id} />}
      {top && top.name === "products" && <ProductsScreen S={S} />}
      {top && top.name === "expenses" && <ExpensesScreen S={S} />}
    </>
  );

  const overlays = (
    <>
      {scan.open && <ScannerModal S={S} />}
      {sheet.success && <SuccessSheet S={S} />}
      {sheet.picker && <CustomerPickerSheet S={S} />}
      {sheet.customItem && <CustomItemSheet S={S} />}
      {sheet.pickSize && <SizePickerSheet S={S} />}
      {sheet.payment && <PaymentSheet S={S} />}
      {sheet.voidOrder && <VoidOrderSheet S={S} />}
      {sheet.addCustomer && <AddCustomerSheet S={S} />}
      {sheet.addProduct && <AddProductSheet S={S} />}
      {sheet.product && <ProductSheet S={S} />}
      {sheet.report && <ReportSheet S={S} />}
      {sheet.expense && <ExpenseSheet S={S} />}
      {sheet.notifications && <NotificationsSheet S={S} />}
      {sheet.settings && <SettingsSheet S={S} />}
      <Toast toast={toastMsg} />
    </>
  );

  // Not signed in → the sign-in gate is the whole app.
  if (!user) {
    return (
      <div className="nb-root">
        <style>{CSS}</style>
        <Login onSuccess={(u) => { setUser(u); }} />
        <InstallPrompt />
        <UpdatePrompt />
      </div>
    );
  }

  if (loading || loadErr) {
    return (
      <div className="nb-root" style={{ position: "fixed", inset: 0, background: "#F2F2F7" }}>
        <style>{CSS}</style>
        <Splash error={loadErr} onRetry={load} />
      </div>
    );
  }

  if (desktop) {
    return (
      <div className="nb-desktop nb-root">
        <style>{CSS}</style>
        <Sidebar S={S} />
        <div className="nb-main">
          <div className="nb-mainwrap">
            {screens}
            {overlays}
          </div>
        </div>
        <InstallPrompt />
        <UpdatePrompt />
      </div>
    );
  }

  return (
    <div className="nb-outer nb-root" style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{CSS}</style>
      <div className="phone">
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>{screens}</div>
        {!top && <TabBar tab={tab} setTab={setTab} onNew={() => push({ name: "bill" })} />}
        {overlays}
      </div>
      <InstallPrompt />
      <UpdatePrompt />
    </div>
  );
}
