import { useState } from "react";
import { Receipt, Plus, Search, ChevronRight, Printer, Check, Package, Download, Barcode, Store, Percent, PackagePlus, ScanLine, RefreshCw } from "lucide-react";
import { INK, SUB, LINE, GREEN, BLUE, fx, TAX, UK_DIAL } from "../lib/theme.js";
import { CATEGORIES } from "../lib/data.js";
import { printHTML, labelHTML, downloadFile } from "../lib/deviceActions.js";
import { BarcodeView, Pill, SearchBar, Stepper, Card, Btn, inputStyle, Field, Screen, RoundBtn, SmallHeader, Sheet, EmptyState } from "../components/ui.jsx";
import { Thumb } from "./Bill.jsx";

export function ProductsScreen({ S }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const list = S.products.filter((p) =>
    (cat === "All" || p.cat === cat) &&
    (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.code.includes(q))
  );
  return (
    <Screen>
      <SmallHeader title="Items" sub={`${S.products.length} products · ${S.products.filter((p) => p.stock === 0).length} out of stock`} onBack={S.pop}
        right={<>
          <RoundBtn icon={ScanLine} onClick={() => S.openScanner("lookup")} />
          <RoundBtn icon={PackagePlus} dark onClick={() => S.setSheet({ addProduct: {} })} />
        </>} />
      <SearchBar value={q} onChange={setQ} placeholder="Search name or barcode" />
      <div style={{ display: "flex", gap: 8, overflowX: "auto", margin: "12px -18px 0", padding: "0 18px" }}>
        {["All", ...CATEGORIES].map((c) => (
          <button key={c} className="press" onClick={() => setCat(c)} style={{
            padding: "8px 15px", borderRadius: 99, fontSize: 13, fontWeight: 750, whiteSpace: "nowrap",
            background: cat === c ? INK : "#fff", color: cat === c ? "#fff" : "#5B5B63",
            boxShadow: cat === c ? "0 8px 18px rgba(11,11,15,.25)" : "0 1px 3px rgba(0,0,0,.06)"
          }}>{c}</button>
        ))}
      </div>
      <Card style={{ marginTop: 14, padding: "5px 16px" }}>
        {list.map((p, i) => (
          <button key={p.id} className="press" onClick={() => S.setSheet({ product: p.id })} style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
            padding: "11px 0", borderBottom: i === list.length - 1 ? "none" : `1px solid ${LINE}`
          }}>
            <Thumb src={p.img} name={p.name} size={46} radius={16} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 750, fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
              <div style={{ fontSize: 11.5, color: SUB, fontWeight: 650, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                <Barcode size={11} /> {p.code}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{fx(p.price)}</div>
              <div style={{ marginTop: 3 }}>
                {p.stock === 0 ? <Pill tone="red">Out of stock</Pill> : <span style={{ fontSize: 11.5, fontWeight: 700, color: SUB }}>{p.stock} in stock</span>}
              </div>
            </div>
          </button>
        ))}
        {list.length === 0 && <EmptyState icon={Package} title="No items found" sub="Try another search or add a new item" />}
      </Card>
    </Screen>
  );
}

export function ProductSheet({ S }) {
  const p = S.products.find((x) => x.id === S.sheet.product);
  if (!p) return null;
  return (
    <Sheet open onClose={() => S.setSheet({})}>
      <div style={{ textAlign: "center", paddingTop: 4 }}>
        <div style={{ margin: "0 auto", width: 72, height: 72, borderRadius: 26, overflow: "hidden", boxShadow: "0 12px 30px rgba(0,0,0,.09)" }}><Thumb src={p.img} name={p.name} size={72} radius={26} /></div>
        <div style={{ fontSize: 19.5, fontWeight: 850, marginTop: 12, letterSpacing: -0.4 }}>{p.name}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 7 }}>
          <Pill tone="gray">{p.cat}</Pill>
          {p.stock === 0 && <Pill tone="red">Out of stock</Pill>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 11, marginTop: 18 }}>
        <Card style={{ flex: 1, textAlign: "center", padding: "13px 8px" }}>
          <div style={{ fontSize: 18, fontWeight: 850 }}>{fx(p.price)}</div>
          <div style={{ fontSize: 10.5, fontWeight: 750, color: SUB, letterSpacing: .8, textTransform: "uppercase", marginTop: 2 }}>Sell price</div>
        </Card>
        <Card style={{ flex: 1, textAlign: "center", padding: "13px 8px" }}>
          <div style={{ fontSize: 18, fontWeight: 850 }}>{fx(p.cost)}</div>
          <div style={{ fontSize: 10.5, fontWeight: 750, color: SUB, letterSpacing: .8, textTransform: "uppercase", marginTop: 2 }}>Cost</div>
        </Card>
        <Card style={{ flex: 1, textAlign: "center", padding: "13px 8px" }}>
          <div style={{ fontSize: 18, fontWeight: 850, color: GREEN }}>{Math.round(((p.price - p.cost) / p.price) * 100)}%</div>
          <div style={{ fontSize: 10.5, fontWeight: 750, color: SUB, letterSpacing: .8, textTransform: "uppercase", marginTop: 2 }}>Margin</div>
        </Card>
      </div>
      <Card style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Stock on hand</div>
          <div style={{ fontSize: 12, color: SUB, fontWeight: 650, marginTop: 1 }}>Adjust after purchase or audit</div>
        </div>
        <Stepper value={p.stock} onMinus={() => S.setStock(p.id, -1)} onPlus={() => S.setStock(p.id, 1)} />
      </Card>
      <Card style={{ marginTop: 12, padding: "18px 16px 14px" }}>
        <BarcodeView value={p.code} height={52} />
      </Card>
      <div style={{ display: "flex", gap: 10, marginTop: 14, paddingBottom: 6 }}>
        <Btn tone="soft" icon={Printer} style={{ flex: 1 }} onClick={() => { printHTML(`Label — ${p.name}`, labelHTML(p)); S.toast("Preparing label…", "check"); }}>Print label</Btn>
        <Btn tone="black" icon={Plus} style={{ flex: 1 }} onClick={() => { S.addToCart(p.id, true); S.setSheet({}); if (!S.stack.some((v) => v.name === "bill")) S.push({ name: "bill" }); S.toast(`Added ${p.name}`, "check"); }}>Add to bill</Btn>
      </div>
    </Sheet>
  );
}

export function AddProductSheet({ S }) {
  const pre = S.sheet.addProduct || {};
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");
  const [cat, setCat] = useState(CATEGORIES[0]);
  // Blank unless the code came from a scan — the server mints a valid, unique
  // EAN-13 on save, so we never invent an unscannable code on the client.
  const [code, setCode] = useState(pre.code || "");
  return (
    <Sheet open onClose={() => S.setSheet({})}>
      <div style={{ fontSize: 19, fontWeight: 850, marginBottom: 16 }}>New item</div>
      <Field label="Item name"><input style={inputStyle} autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Parle-G 250g" /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Sell price"><input style={inputStyle} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))} placeholder="£" /></Field></div>
        <div style={{ flex: 1 }}><Field label="Cost"><input style={inputStyle} inputMode="numeric" value={cost} onChange={(e) => setCost(e.target.value.replace(/[^0-9]/g, ""))} placeholder="£" /></Field></div>
        <div style={{ flex: 1 }}><Field label="Stock"><input style={inputStyle} inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" /></Field></div>
      </div>
      <Field label="Category">
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => (
            <button key={c} className="press" onClick={() => setCat(c)} style={{
              padding: "8px 13px", borderRadius: 99, fontSize: 12.5, fontWeight: 750,
              background: cat === c ? INK : "#ECECF0", color: cat === c ? "#fff" : "#5B5B63"
            }}>{c}</button>
          ))}
        </div>
      </Field>
      <Field label="Barcode">
        <Card style={{ padding: "14px 14px 10px", boxShadow: "none", border: `1.5px dashed rgba(0,0,0,.14)` }}>
          {code ? (
            <>
              <BarcodeView value={code} height={40} />
              <div style={{ fontSize: 11.5, color: SUB, fontWeight: 650, textAlign: "center", marginTop: 8 }}>
                Scanned code — saved with this item
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12.5, color: SUB, fontWeight: 650, textAlign: "center", padding: "10px 4px", lineHeight: 1.5 }}>
              A unique barcode is generated automatically when you save.
            </div>
          )}
        </Card>
      </Field>
      <Btn icon={Check} disabled={!name.trim() || !Number(price)}
        onClick={() => S.addProduct({ name: name.trim(), price: Number(price), cost: Number(cost) || undefined, stock: Number(stock) || 0, cat, code: code || undefined })}>
        Save item
      </Btn>
    </Sheet>
  );
}

export function SettingsSheet({ S }) {
  const st = S.settings || {};
  const [edit, setEdit] = useState(false);
  const [storeName, setStoreName] = useState(st.storeName || "");
  const [owner, setOwner] = useState(st.owner || "");
  const [address, setAddress] = useState(st.address || "");
  const [gstin, setGstin] = useState(st.gstin || "");
  const [phone, setPhone] = useState(st.phone || UK_DIAL + " ");

  const doBackup = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const data = { exportedAt: new Date().toISOString(), store: st, products: S.products, parties: S.customers, orders: S.orders, expenses: S.expenses };
    downloadFile(`underdawg-bill-backup-${stamp}.json`, JSON.stringify(data, null, 2), "application/json");
    S.toast("Backup downloaded", "check");
  };
  const rows = [
    { l: "Taxes", s: TAX > 0 ? `VAT ${TAX}% applied on bills` : "No VAT applied by default", Icon: Percent, do: () => S.toast(TAX > 0 ? `VAT is set to ${TAX}%` : "VAT is off by default") },
    { l: "Printer & devices", s: "Receipt printer, scanner", Icon: Printer, do: () => S.toast("Use your browser's print dialog to connect a printer") },
    { l: "Backup & sync", s: "Download all your data as JSON", Icon: Download, do: doBackup },
    // Manual fallback: force the app to reload and check for a new version. The
    // "Update available" banner handles this automatically, this is the "just
    // refresh it" button.
    { l: "Refresh app", s: "Reload and check for updates", Icon: RefreshCw, do: async () => {
        S.toast("Refreshing…", "check");
        try {
          const regs = await navigator.serviceWorker?.getRegistrations?.();
          await Promise.all((regs || []).map((r) => r.update()));
        } catch { /* ignore */ }
        setTimeout(() => window.location.reload(), 350);
      } },
  ];

  const save = async () => {
    const ok = await S.saveSettings({ storeName: storeName.trim(), owner: owner.trim(), address: address.trim(), gstin: gstin.trim(), phone: phone.trim() });
    if (ok) setEdit(false);
  };

  return (
    <Sheet open onClose={() => S.setSheet({})}>
      <Card style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
        <div style={{ width: 50, height: 50, borderRadius: 18, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Store size={23} color="#fff" strokeWidth={2.1} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 850, fontSize: 16.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{st.storeName || "underdawg"}</div>
          <div style={{ fontSize: 12.5, color: SUB, fontWeight: 650, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{st.owner || "—"} · {st.address || ""}</div>
        </div>
        <button className="press" onClick={() => setEdit((v) => !v)} style={{ fontSize: 13.5, fontWeight: 750, color: BLUE }}>{edit ? "Cancel" : "Edit"}</button>
      </Card>

      {edit ? (
        <Card style={{ padding: "16px 16px 6px" }}>
          <Field label="Store name"><input style={inputStyle} value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Store name" /></Field>
          <Field label="Owner"><input style={inputStyle} value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Owner name" /></Field>
          <Field label="Address"><input style={inputStyle} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Shop address" /></Field>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1.4 }}><Field label="VAT number"><input style={inputStyle} value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="VAT number (optional)" /></Field></div>
            <div style={{ flex: 1 }}><Field label="Phone"><input style={inputStyle} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91" /></Field></div>
          </div>
          <Btn icon={Check} disabled={!storeName.trim()} onClick={save}>Save details</Btn>
        </Card>
      ) : (
        <Card style={{ padding: "5px 16px" }}>
          {rows.map((r, i) => (
            <button key={r.l} className="press" onClick={r.do} style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
              padding: "12.5px 0", borderBottom: i === rows.length - 1 ? "none" : `1px solid ${LINE}`
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 13, background: "#F1F1F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <r.Icon size={17} strokeWidth={2.2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 750, fontSize: 14.5 }}>{r.l}</div>
                <div style={{ fontSize: 12, color: SUB, fontWeight: 600 }}>{r.s}</div>
              </div>
              <ChevronRight size={17} color="#B0B0B8" />
            </button>
          ))}
        </Card>
      )}
      <div style={{ textAlign: "center", fontSize: 11.5, color: "#A8A8B0", fontWeight: 700, padding: "16px 0 6px", letterSpacing: .6 }}>
        NEXBILL · PWA v1.0 · CONNECTED
      </div>
    </Sheet>
  );
}

/* ================================================================== */
/*  APP SHELL                                                          */
/* ================================================================== */
