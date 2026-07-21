import { useState, useEffect, useRef } from "react";
import { Plus, X, Search, ChevronRight, Share2, CheckCircle2, Check, Trash2, Barcode, Keyboard, Flashlight, UserPlus, Clock, Camera, ScanLine, Download } from "lucide-react";
import { INK, SUB, LINE, GREEN, ORANGE, BLUE, fx, TAX, SAFE_T, SAFE_B } from "../lib/theme.js";
import { shareInvoice, downloadInvoice } from "./Orders.jsx";
import { MODE_ICON, BarcodeView, Pill, StatusPill, Avatar, SearchBar, Stepper, Card, Btn, Toggle, Screen, RoundBtn, SmallHeader, Sheet, EmptyState, Field, inputStyle } from "../components/ui.jsx";

export function BillScreen({ S }) {
  const [q, setQ] = useState("");
  const cart = S.cart;
  const entries = Object.entries(cart);
  const cust = S.customers.find((c) => c.id === S.billCustomer) || S.customers.find((c) => c.walk);

  const results = q
    ? S.products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.code.includes(q)).slice(0, 5)
    : [];

  // Cart lines carry their own name/price now (so custom items and per-size
  // lines work without looking anything up in the catalogue).
  const sub = entries.reduce((s, [, l]) => s + l.price * l.qty, 0);
  const disc = Math.min(Number(S.billDisc) || 0, sub);
  const taxRate = Number(S.settings?.taxRate ?? TAX) || 0;
  const tax = S.billTax ? Math.round((sub - disc) * taxRate) / 100 : 0;
  const total = Math.round((sub - disc + tax) * 100) / 100;
  const received = S.billMode === "Credit" ? 0 : (S.billRecv === "" ? total : Math.min(Number(S.billRecv) || 0, total));
  const balance = total - received;

  return (
    <Screen bottom={0} style={{ display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 14px" }}>
        <SmallHeader title="New bill" sub={`${entries.length} item${entries.length === 1 ? "" : "s"} in cart`} onBack={S.pop}
          right={entries.length > 0 && <RoundBtn icon={Trash2} onClick={() => { S.setCart({}); S.toast("Cart cleared"); }} />} />

        <button className="press" onClick={() => S.setSheet({ picker: true })} style={{
          width: "100%", background: "#fff", borderRadius: 19, padding: "13px 15px",
          display: "flex", alignItems: "center", gap: 12, textAlign: "left",
          boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 8px 20px rgba(0,0,0,.05)"
        }}>
          <Avatar name={cust.name} hue={cust.hue} size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: SUB, textTransform: "uppercase" }}>Customer</div>
            <div style={{ fontWeight: 800, fontSize: 15.5, marginTop: 1 }}>{cust.name}</div>
          </div>
          <ChevronRight size={18} color="#B0B0B8" />
        </button>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <SearchBar value={q} onChange={setQ} placeholder="Search item or code" style={{ background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 8px 20px rgba(0,0,0,.05)" }} />
          <button className="press" onClick={() => S.openScanner("bill")} style={{
            width: 48, borderRadius: 15, background: INK, display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0, boxShadow: "0 10px 22px rgba(11,11,15,.3)"
          }}><ScanLine size={21} color="#fff" strokeWidth={2.3} /></button>
        </div>

        {results.length > 0 && (
          <Card style={{ marginTop: 10, padding: "4px 14px" }}>
            {results.map((p, i) => (
              <button
                key={p.id}
                className="press"
                onClick={() => {
                  // More than one size in stock → ask which, otherwise add straight away.
                  const inStock = (p.variants || []).filter((v) => (v.stock || 0) > 0);
                  if (inStock.length > 1) S.setSheet({ pickSize: p.id });
                  else S.addToCart(p);
                  setQ("");
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left",
                  padding: "11px 0", borderBottom: i === results.length - 1 ? "none" : `1px solid ${LINE}`
                }}
              >
                <Thumb src={p.img} name={p.name} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 750, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: SUB, fontWeight: 600 }}>{fx(p.price)} • {p.stock} in stock</div>
                </div>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: "#EDEDF1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plus size={16} strokeWidth={2.8} />
                </div>
              </button>
            ))}
          </Card>
        )}

        <button
          className="press"
          onClick={() => S.setSheet({ customItem: true })}
          style={{
            width: "100%", marginTop: 10, padding: "11px 14px", borderRadius: 15,
            background: "#EDEDF1", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, fontWeight: 750, fontSize: 13.5, color: INK,
          }}
        >
          <Keyboard size={16} strokeWidth={2.4} /> Add item not in catalogue
        </button>

        {entries.length === 0 && !q ? (
          <EmptyState icon={Barcode} title="Cart is empty" sub="Scan a barcode or search to add items" />
        ) : (
          <Card style={{ marginTop: 14, padding: "5px 15px" }}>
            {entries.map(([key, l], i) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 0", borderBottom: i === entries.length - 1 ? "none" : `1px solid ${LINE}` }}>
                <Thumb src={l.img} name={l.name} size={38} custom={l.custom} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 750, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {l.name}
                    {l.size ? <span style={{ color: SUB, fontWeight: 700 }}> · {l.size}</span> : null}
                  </div>
                  <div style={{ fontSize: 12, color: SUB, fontWeight: 650, marginTop: 1 }}>
                    {l.custom && <span style={{ color: BLUE, fontWeight: 800 }}>Custom · </span>}
                    {fx(l.price)} · <b style={{ color: INK }}>{fx(l.price * l.qty)}</b>
                  </div>
                </div>
                <Stepper small value={l.qty} onMinus={() => S.removeFromCart(key)} onPlus={() => S.setLineQty(key, l.qty + 1)} />
              </div>
            ))}
          </Card>
        )}

        {entries.length > 0 && (
          <>
            <Card style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0 9px", fontSize: 14, fontWeight: 650, color: "#55555D" }}>
                <span>Subtotal</span><span style={{ color: INK, fontWeight: 800 }}>{fx(sub)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderTop: `1px solid ${LINE}` }}>
                <span style={{ fontSize: 14, fontWeight: 650, color: "#55555D" }}>Discount</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#F1F1F5", borderRadius: 10, padding: "5px 10px" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: SUB }}>£</span>
                  <input inputMode="numeric" value={S.billDisc} onChange={(e) => S.setBillDisc(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="0" style={{ width: 52, textAlign: "right", fontSize: 14.5, fontWeight: 750 }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderTop: `1px solid ${LINE}` }}>
                <span style={{ fontSize: 14, fontWeight: 650, color: "#55555D" }}>GST {TAX}% {S.billTax && <b style={{ color: INK }}>· {fx(tax)}</b>}</span>
                <Toggle on={S.billTax} onChange={S.setBillTax} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 11, borderTop: `1px solid ${LINE}` }}>
                <span style={{ fontSize: 15.5, fontWeight: 850 }}>Total</span>
                <span style={{ fontSize: 21, fontWeight: 850, letterSpacing: -0.5 }}>{fx(total)}</span>
              </div>
            </Card>

            <Card style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 1.2, color: SUB, textTransform: "uppercase", marginBottom: 9 }}>Payment</div>
              <div style={{ display: "flex", gap: 7 }}>
                {["Cash", "UPI", "Card", "Credit"].map((m) => {
                  const MI = MODE_ICON[m]; const on = S.billMode === m;
                  return (
                    <button key={m} className="press" onClick={() => S.setBillMode(m)} style={{
                      flex: 1, padding: "11px 2px", borderRadius: 14, display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 5, background: on ? INK : "#F1F1F5",
                      color: on ? "#fff" : "#5B5B63", transition: "all .18s ease"
                    }}>
                      <MI size={18} strokeWidth={2.3} />
                      <span style={{ fontSize: 11, fontWeight: 800 }}>{m}</span>
                    </button>
                  );
                })}
              </div>
              {S.billMode !== "Credit" ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 13 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>Received</div>
                    {balance > 0 && <div style={{ fontSize: 11.5, fontWeight: 700, color: ORANGE, marginTop: 2 }}>{fx(balance)} on credit</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#F1F1F5", borderRadius: 11, padding: "8px 12px" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: SUB }}>£</span>
                    <input inputMode="numeric" value={S.billRecv === "" ? total : S.billRecv}
                      onChange={(e) => S.setBillRecv(e.target.value.replace(/[^0-9]/g, ""))}
                      style={{ width: 70, textAlign: "right", fontSize: 16, fontWeight: 800 }} />
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 12, fontSize: 12.5, fontWeight: 700, color: ORANGE, display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={14} /> Full amount added to {cust.name}'s balance
                </div>
              )}
            </Card>
          </>
        )}
      </div>

      <div style={{ padding: `10px 18px calc(${SAFE_B} + 8px)`, background: "linear-gradient(rgba(242,242,247,0), #F2F2F7 34%)" }}>
        <Btn disabled={entries.length === 0} icon={Check}
          onClick={() => S.createOrder({ total })}>
          {S.billMode === "Credit" ? `Save bill · ${fx(total)}` : `Charge ${fx(total)}`}
        </Btn>
      </div>
    </Screen>
  );
}

/* ================================================================== */
/*  SCANNER                                                            */
/* ================================================================== */

export function ScannerModal({ S }) {
  const videoRef = useRef(null);
  const lastRef = useRef({ code: "", t: 0 });
  const trackRef = useRef(null);      // the live camera track (for torch + cleanup)
  const handleRef = useRef(null);     // always-fresh handleCode for the detect loop
  // cam states: "try" | "on" | "off" | "denied" | "insecure"
  const [cam, setCam] = useState("try");
  const [manual, setManual] = useState("");
  const [flash, setFlash] = useState(false);
  const [torch, setTorch] = useState(false);
  const [canTorch, setCanTorch] = useState(false);
  const [scanReady, setScanReady] = useState(false); // detector running?
  const [seen, setSeen] = useState("");              // last code read (feedback)
  const ctx = S.scan.ctx;
  const cartCount = Object.values(S.cart).reduce((a, l) => a + (l?.qty || 0), 0);

  const handleCode = (raw) => {
    const code = String(raw).replace(/\s+/g, "").trim();
    if (!code) return;
    const now = Date.now();
    // Ignore the same code re-read within 1.6s (the camera reads ~4×/second).
    if (lastRef.current.code === code && now - lastRef.current.t < 1600) return;
    lastRef.current = { code, t: now };

    setFlash(true); setTimeout(() => setFlash(false), 300);
    setSeen(code); setTimeout(() => setSeen((s) => (s === code ? "" : s)), 1800);

    const p = S.products.find((x) => x.code === code);

    if (!p) {
      // Unknown barcode. In the bill flow keep the scanner open (rapid scanning);
      // in lookup, offer to save it as a new item.
      if (ctx === "bill") {
        S.toast(`Not in catalogue: ${code}`, "warn");
      } else {
        S.closeScanner();
        S.toast("Code not found — save it as a new item", "warn");
        S.setSheet({ addProduct: { code } });
      }
      return;
    }

    if (ctx === "bill") {
      // One barcode covers all sizes, so add the first size that's in stock and
      // show which — the cashier can adjust in the cart. Keeps scanning fast.
      const size = p.variants?.find((v) => (v.stock || 0) > 0)?.size ?? p.variants?.[0]?.size ?? "";
      S.addToCart(p, { size, silent: true });
      S.toast(`Added ${p.name}${size ? " · " + size : ""}`, "check");
    } else {
      S.closeScanner();
      S.setSheet({ product: p.id });
    }
  };

  // Keep the detect loop calling the LATEST handleCode (so cart/product changes
  // aren't captured stale by the one-time effect below).
  handleRef.current = handleCode;

  useEffect(() => {
    let stream, iv, dead = false;

    const stop = () => {
      if (iv) clearInterval(iv);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      trackRef.current = null;
    };

    const start = async () => {
      // Camera needs a secure context (HTTPS or localhost). Over plain HTTP or a
      // bare LAN IP the browser silently blocks it — tell the user why.
      if (!window.isSecureContext) { setCam("insecure"); return; }
      if (!navigator.mediaDevices?.getUserMedia) { setCam("off"); return; }

      try {
        // Request a HIGH resolution. The default (~640×480) is too coarse to
        // resolve a dense EAN-13 — the camera opens but nothing ever decodes.
        // 1080p makes real-world barcode reading reliable.
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (e) {
        // Some devices reject the resolution hints — retry with a bare request.
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        } catch (e2) {
          if (!dead) setCam(e2 && (e2.name === "NotAllowedError" || e2.name === "SecurityError") ? "denied" : "off");
          return;
        }
      }
      if (dead) { stop(); return; }

      const v = videoRef.current;      // the <video> is ALWAYS mounted now, so this is non-null
      if (!v) { stop(); return; }
      v.srcObject = stream;
      try { await v.play(); } catch { /* autoplay quirks — video still shows */ }
      if (dead) { stop(); return; }
      setCam("on");

      // Torch capability + keep the barcode in focus.
      const track = stream.getVideoTracks()[0];
      trackRef.current = track;
      try {
        const caps = track.getCapabilities?.();
        if (caps && caps.torch) setCanTorch(true);
        if (caps && caps.focusMode && caps.focusMode.includes("continuous")) {
          await track.applyConstraints({ advanced: [{ focusMode: "continuous" }] });
        }
      } catch { /* ignore */ }

      // Detector: use the native BarcodeDetector when present (Android/Chrome),
      // otherwise load the WASM ponyfill so scanning also works on iOS/Safari
      // and Firefox. Loaded lazily so it only downloads when the scanner opens.
      try {
        let DetectorClass = window.BarcodeDetector;
        if (!DetectorClass) {
          const mod = await import("barcode-detector/ponyfill");
          // Load the ZXing WASM from our OWN origin (public/zxing_reader.wasm)
          // instead of the default jsDelivr CDN — so scanning works offline and
          // has no third-party dependency.
          mod.setZXingModuleOverrides?.({
            locateFile: (path, prefix) =>
              path.endsWith(".wasm") ? "/zxing_reader.wasm" : prefix + path,
          });
          DetectorClass = mod.BarcodeDetector;
        }
        if (dead) { stop(); return; }
        const det = new DetectorClass({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code", "itf", "codabar"],
        });
        setScanReady(true);

        // `busy` prevents overlapping detect() calls from piling up (the WASM
        // decoder can take longer than one tick).
        let busy = false;
        iv = setInterval(async () => {
          if (busy || dead || !videoRef.current || videoRef.current.readyState < 2) return;
          busy = true;
          try {
            const codes = await det.detect(videoRef.current);
            if (codes && codes.length && codes[0].rawValue) handleRef.current(codes[0].rawValue);
          } catch { /* frame not ready */ }
          busy = false;
        }, 250);
      } catch {
        // Detection unavailable on this device — camera preview + manual entry
        // still work, so make that obvious.
        setScanReady(false);
      }
    };

    start();
    return () => { dead = true; stop(); };
  }, []);

  // Toggle the camera torch (where the hardware supports it).
  const toggleTorch = async () => {
    const track = trackRef.current;
    if (!track) return S.toast("Torch needs the camera running");
    if (!canTorch) return S.toast("This device's camera has no torch");
    try {
      const next = !torch;
      await track.applyConstraints({ advanced: [{ torch: next }] });
      setTorch(next);
    } catch { S.toast("Couldn't toggle the torch"); }
  };

  return (
    <div className="dim-anim nb-root" style={{ position: "absolute", inset: 0, zIndex: 80, background: "#08080C", color: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: `calc(${SAFE_T} + 10px) 20px 10px`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button className="pressS" onClick={S.closeScanner} style={{ width: 38, height: 38, borderRadius: 99, background: "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={19} color="#fff" strokeWidth={2.5} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Scan barcode</div>
          <div style={{ fontSize: 11.5, opacity: .55, fontWeight: 600 }}>{ctx === "bill" ? "Items add straight to the bill" : "Look up any item"}</div>
        </div>
        <button className="pressS" onClick={toggleTorch} style={{ width: 38, height: 38, borderRadius: 99, background: torch ? "#fff" : "rgba(255,255,255,.12)", opacity: canTorch ? 1 : 0.45, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Flashlight size={18} color={torch ? INK : "#fff"} strokeWidth={2.3} />
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{
          width: 268, height: 268, borderRadius: 30, position: "relative", overflow: "hidden",
          background: "#101018", boxShadow: flash ? `0 0 0 4px ${GREEN}, 0 0 60px rgba(74,222,128,.5)` : "0 0 0 1px rgba(255,255,255,.1)",
          transition: "box-shadow .2s ease"
        }}>
          {/* The video is ALWAYS mounted (just hidden until ready) so the ref
              exists the moment getUserMedia resolves — mounting it only when
              cam==="on" was the reason the camera never opened. */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: cam === "on" ? 1 : 0, transition: "opacity .25s ease" }}
          />
          {cam !== "on" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "radial-gradient(circle at 50% 30%, #1B1B28, #0B0B12)" }}>
              <Barcode size={58} color="rgba(255,255,255,.85)" className={cam === "try" ? "pulse" : ""} strokeWidth={1.4} />
              <div style={{ fontSize: 12, fontWeight: 700, opacity: .62, textAlign: "center", padding: "0 26px", lineHeight: 1.5 }}>
                {cam === "try" && "Starting camera…"}
                {cam === "denied" && "Camera blocked. Allow camera access for this site in your browser settings, then reopen."}
                {cam === "insecure" && "Camera needs a secure (https://) connection. Type the code below instead."}
                {cam === "off" && "No camera available here — type the code below."}
              </div>
            </div>
          )}
          <div className="laser" style={{ position: "absolute", left: 18, right: 18, height: 2.5, borderRadius: 99, background: "linear-gradient(90deg, transparent, #4ADE80, transparent)", boxShadow: "0 0 14px #4ADE80" }} />
        </div>
        {[["12%", "12%", "top", "left"], ["12%", "12%", "top", "right"], ["12%", "12%", "bottom", "left"], ["12%", "12%", "bottom", "right"]].map((c, i) => (
          <div key={i} style={{
            position: "absolute", width: 30, height: 30,
            [c[2]]: `calc(50% - 152px)`, [c[3]]: `calc(50% - 152px)`,
            border: "3.5px solid #fff", borderRadius: 8, opacity: .9,
            borderTop: c[2] === "bottom" ? "none" : undefined, borderBottom: c[2] === "top" ? "none" : undefined,
            borderLeft: c[3] === "right" ? "none" : undefined, borderRight: c[3] === "left" ? "none" : undefined
          }} />
        ))}
      </div>

      {/* Live status so the cashier knows scanning is actually working. */}
      <div style={{ textAlign: "center", minHeight: 20, padding: "0 20px", marginBottom: 4 }}>
        {seen ? (
          <span style={{ fontSize: 13, fontWeight: 800, color: "#4ADE80", letterSpacing: 1 }}>Scanned {seen}</span>
        ) : cam === "on" && scanReady ? (
          <span style={{ fontSize: 12.5, fontWeight: 650, opacity: .6 }}>Point the camera at a barcode</span>
        ) : cam === "on" && !scanReady ? (
          <span style={{ fontSize: 12.5, fontWeight: 650, color: "#FFB27A" }}>Auto-scan unavailable — type the code below</span>
        ) : null}
      </div>

      <div style={{ padding: `4px 20px calc(${SAFE_B} + 12px)`, display: "flex", flexDirection: "column", gap: 11 }}>
        <div style={{ display: "flex", gap: 9, background: "rgba(255,255,255,.1)", borderRadius: 16, padding: "6px 6px 6px 15px", alignItems: "center" }}>
          <Keyboard size={17} color="rgba(255,255,255,.55)" />
          <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Type or enter code"
            inputMode="numeric" style={{ flex: 1, color: "#fff", fontSize: 15, fontWeight: 600, minWidth: 0 }}
            onKeyDown={(e) => { if (e.key === "Enter" && manual) { handleCode(manual); setManual(""); } }} />
          <button className="press" onClick={() => { if (manual) { handleCode(manual); setManual(""); } }}
            style={{ background: "#fff", color: INK, fontWeight: 800, fontSize: 13.5, padding: "9px 15px", borderRadius: 11 }}>Add</button>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {ctx === "bill" && (
            <Btn tone="green" icon={Check} style={{ flex: 1, padding: "14px" }} onClick={S.closeScanner}>
              Done{cartCount > 0 ? ` (${cartCount})` : ""}
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SUCCESS + CUSTOMER PICKER                                          */
/* ================================================================== */

export function SuccessSheet({ S }) {
  const o = S.orders.find((x) => x.id === S.sheet.success);
  if (!o) return null;
  const c = S.customers.find((x) => x.id === o.cid);
  return (
    <Sheet open onClose={() => S.setSheet({})}>
      <div style={{ textAlign: "center", padding: "14px 4px 6px" }}>
        <div className="pop" style={{
          width: 76, height: 76, borderRadius: 999, background: "#E4F6E9", margin: "0 auto 14px",
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 14px 34px rgba(43,168,74,.3)"
        }}><CheckCircle2 size={40} color={GREEN} strokeWidth={2.2} /></div>
        <div style={{ fontSize: 21, fontWeight: 850, letterSpacing: -0.5 }}>Bill saved</div>
        <div style={{ fontSize: 13.5, color: SUB, fontWeight: 650, marginTop: 3 }}>{o.no} • {c ? c.name : ""}</div>
        <div style={{ fontSize: 36, fontWeight: 850, letterSpacing: -1.2, margin: "14px 0 4px" }}>{fx(o.total)}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          <StatusPill status={o.status} /><Pill tone="gray">{o.mode}</Pill>
        </div>
        <Card style={{ padding: "16px 14px 12px", marginBottom: 16 }}>
          <BarcodeView value={o.no} height={46} />
        </Card>
        {/* Nothing downloads automatically — the cashier chooses. */}
        <div style={{ display: "flex", gap: 10 }}>
          <Btn tone="soft" icon={Download} style={{ flex: 1 }} onClick={() => downloadInvoice(S, o, c)}>Download</Btn>
          <Btn tone="soft" icon={Share2} style={{ flex: 1 }} onClick={() => shareInvoice(S, o, c)}>Share</Btn>
        </div>
        <Btn
          tone="black"
          style={{ width: "100%", marginTop: 10 }}
          onClick={() => { S.setSheet({}); S.pop(); S.goTab("home"); }}
        >
          Done
        </Btn>
        <button className="press" onClick={() => S.setSheet({})} style={{ marginTop: 14, fontSize: 14, fontWeight: 750, color: BLUE }}>
          Start another bill
        </button>
      </div>
    </Sheet>
  );
}

export function CustomerPickerSheet({ S }) {
  const [q, setQ] = useState("");
  const list = S.customers.filter((c) => c.type === "customer" && (!q || c.name.toLowerCase().includes(q.toLowerCase())));
  return (
    <Sheet open onClose={() => S.setSheet({})}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 19, fontWeight: 850 }}>Select customer</div>
        <button className="press" onClick={() => S.setSheet({ addCustomer: true })} style={{ display: "flex", alignItems: "center", gap: 5, color: BLUE, fontWeight: 750, fontSize: 14 }}>
          <UserPlus size={16} /> New
        </button>
      </div>
      <SearchBar value={q} onChange={setQ} placeholder="Search customers" style={{ background: "#ECECF0" }} />
      <div style={{ marginTop: 12, paddingBottom: 8 }}>
        {list.map((c) => (
          <button key={c.id} className="press" onClick={() => { S.setBillCustomer(c.id); S.setSheet({}); }} style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "11px 4px",
            borderBottom: `1px solid ${LINE}`
          }}>
            <Avatar name={c.name} hue={c.hue} size={42} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 750, fontSize: 15 }}>{c.name}</div>
              <div style={{ fontSize: 12.5, color: SUB, fontWeight: 600 }}>{c.walk ? "Default • no account" : c.phone}</div>
            </div>
            {S.billCustomer === c.id && <Check size={18} color={BLUE} strokeWidth={3} />}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/* ================================================================== */
/*  ACCOUNTS                                                           */
/* ================================================================== */

/* ------------------------------------------------------------------------ */
/*  Product thumbnail — shows the product's real image (from the website's
 *  Cloudinary catalogue) with a graceful initial-letter fallback.           */
/* ------------------------------------------------------------------------ */
export function Thumb({ src, name, size = 40, custom = false, radius }) {
  const [failed, setFailed] = useState(false);
  const r = radius ?? Math.round(size * 0.32);
  const base = {
    width: size, height: size, borderRadius: r, flexShrink: 0,
    background: "#F1F1F5", display: "flex", alignItems: "center",
    justifyContent: "center", overflow: "hidden",
  };
  if (src && !failed) {
    return (
      <div style={base}>
        <img
          src={src}
          alt={name || ""}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }
  return (
    <div style={{ ...base, background: custom ? "#E6F0FF" : "#F1F1F5" }}>
      {custom ? (
        <Keyboard size={Math.round(size * 0.45)} strokeWidth={2.3} color={BLUE} />
      ) : (
        <span style={{ fontWeight: 800, fontSize: Math.round(size * 0.4), color: SUB }}>
          {String(name || "?").trim().charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/*  Custom line item — a one-off product typed at the counter.
 *  Deliberately NOT written to the catalogue: it exists only on this bill.  */
/* ------------------------------------------------------------------------ */
export function CustomItemSheet({ S }) {
  const open = !!S.sheet.customItem;
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("1");

  useEffect(() => {
    if (open) { setName(""); setPrice(""); setQty("1"); }
  }, [open]);

  const valid = name.trim() && Number(price) > 0 && Number(qty) > 0;

  return (
    <Sheet open={open} onClose={() => S.setSheet({})}>
      <h3 style={{ fontSize: 20, fontWeight: 850, letterSpacing: -0.4, marginBottom: 4 }}>Custom item</h3>
      <p style={{ fontSize: 12.5, color: SUB, fontWeight: 620, marginBottom: 16, lineHeight: 1.5 }}>
        A one-off line for this bill only — it won't be added to your products or stock.
      </p>

      <Field label="Item name">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gift wrap, Alteration" autoFocus style={inputStyle} />
      </Field>

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Field label="Price">
            <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00" inputMode="decimal" style={inputStyle} />
          </Field>
        </div>
        <div style={{ width: 100 }}>
          <Field label="Qty">
            <input value={qty} onChange={(e) => setQty(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" style={inputStyle} />
          </Field>
        </div>
      </div>

      {valid && (
        <div style={{ background: "#F1F1F5", borderRadius: 14, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: SUB }}>Line total</span>
          <span style={{ fontSize: 17, fontWeight: 850 }}>{fx(Number(price) * Number(qty))}</span>
        </div>
      )}

      <Btn
        icon={Check}
        disabled={!valid}
        style={{ width: "100%" }}
        onClick={() => {
          S.addCustomLine({ name: name.trim(), price: Number(price), qty: Number(qty) });
          S.setSheet({});
          if (!S.stack.some((v) => v.name === "bill")) S.push({ name: "bill" });
        }}
      >
        Add to bill
      </Btn>
    </Sheet>
  );
}

/* ------------------------------------------------------------------------ */
/*  Size picker — shown when a product has more than one size in stock.      */
/* ------------------------------------------------------------------------ */
export function SizePickerSheet({ S }) {
  const pid = S.sheet.pickSize;
  const p = S.products.find((x) => x.id === pid);

  return (
    <Sheet open={!!pid} onClose={() => S.setSheet({})}>
      {p && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Thumb src={p.img} name={p.name} size={52} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 850, fontSize: 17, letterSpacing: -0.3 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: SUB, fontWeight: 700 }}>{fx(p.price)}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: SUB, textTransform: "uppercase", marginBottom: 9 }}>
            Choose size
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {(p.variants || []).map((v) => {
              const out = (v.stock || 0) <= 0;
              return (
                <button
                  key={v.size}
                  className="press"
                  disabled={out}
                  onClick={() => { S.addToCart(p, { size: v.size, silent: true }); S.setSheet({}); S.toast(`Added ${p.name} · ${v.size}`, "check"); }}
                  style={{
                    minWidth: 74, padding: "12px 14px", borderRadius: 15,
                    background: out ? "#F7F7FA" : "#EDEDF1", opacity: out ? 0.5 : 1,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  }}
                >
                  <span style={{ fontWeight: 850, fontSize: 15 }}>{v.size}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: out ? "#D92D20" : SUB }}>
                    {out ? "Out of stock" : `${v.stock} left`}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </Sheet>
  );
}
