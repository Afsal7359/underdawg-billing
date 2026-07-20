import { useMemo } from "react";
import { Receipt, Plus, Minus, X, Search, ArrowLeft, CheckCircle2, CreditCard, Banknote, Smartphone, Clock, AlertCircle } from "lucide-react";
import { INK, SUB, LINE, GREEN, BLUE, TONES, STATUS, fx, fT, rel, SAFE_T, SAFE_B } from "../lib/theme.js";
import { ean13SVG, isValidEan13 } from "../lib/ean13.js";

export const MODE_ICON = { Cash: Banknote, UPI: Smartphone, Card: CreditCard, Credit: Clock };
/**
 * Renders a REAL, scannable EAN-13 barcode (correct L/G/R symbol tables,
 * parity by first digit, proper guard bars and quiet zones) — a scanner can
 * read a label printed from this and it will match the product's code.
 * Non-EAN values fall back to a plain monospace code so nothing looks broken.
 */
export function BarcodeView({ value, height = 54, showText = true, invert = false }) {
  const svg = useMemo(() => {
    if (!value || !isValidEan13(value)) return null;
    return ean13SVG(value, {
      width: 250,
      height,
      showText,
      color: invert ? "#fff" : "#0B0B0F",
      bg: "transparent",
    });
  }, [value, height, showText, invert]);

  if (!svg) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ fontSize: 13, letterSpacing: 2.5, fontWeight: 700, color: invert ? "#fff" : INK, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
          {value || "—"}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export const Pill = ({ tone = "gray", children, style }) => (
  <span style={{
    background: TONES[tone].bg, color: TONES[tone].fg, fontSize: 11.5, fontWeight: 700,
    padding: "4px 9px", borderRadius: 999, letterSpacing: .2, whiteSpace: "nowrap", ...style
  }}>{children}</span>
);
export const StatusPill = ({ status }) => <Pill tone={STATUS[status].tone}>{STATUS[status].label}</Pill>;

export const Avatar = ({ name, hue = "#0A6CFF", size = 42, fs }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.36, flexShrink: 0,
    background: `linear-gradient(140deg, ${hue}22, ${hue}3d)`, color: hue,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 800, fontSize: fs || size * 0.38, letterSpacing: .5
  }}>
    {name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
  </div>
);

export const Segmented = ({ options, value, onChange, style }) => (
  <div style={{ display: "flex", background: "#E6E6EB", borderRadius: 12, padding: 3, ...style }}>
    {options.map((o) => (
      <button key={o} onClick={() => onChange(o)} className="press" style={{
        flex: 1, padding: "7px 4px", borderRadius: 9.5, fontSize: 13, fontWeight: 650,
        background: value === o ? "#fff" : "transparent",
        color: value === o ? INK : "#66666E",
        boxShadow: value === o ? "0 2px 8px rgba(0,0,0,.10)" : "none",
        transition: "all .18s ease"
      }}>{o}</button>
    ))}
  </div>
);

export const SearchBar = ({ value, onChange, placeholder = "Search", autoFocus, style }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 8, background: "#E6E6EB",
    borderRadius: 13, padding: "10px 12px", flex: 1, ...style
  }}>
    <Search size={17} color="#8A8A92" strokeWidth={2.4} />
    <input value={value} autoFocus={autoFocus} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ flex: 1, fontSize: 15.5, fontWeight: 500, minWidth: 0 }} />
    {value && <button className="pressS" onClick={() => onChange("")}
      style={{ background: "#C9C9D0", borderRadius: 99, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <X size={11} color="#fff" strokeWidth={3} /></button>}
  </div>
);

export const Stepper = ({ value, onMinus, onPlus, small }) => {
  const s = small ? 27 : 32;
  const B = ({ Icon, onClick, dark }) => (
    <button className="pressS" onClick={onClick} style={{
      width: s, height: s, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
      background: dark ? INK : "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.10)"
    }}><Icon size={small ? 13 : 15} color={dark ? "#fff" : INK} strokeWidth={2.8} /></button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, background: "#EDEDF1", borderRadius: 11, padding: 3 }}>
      <B Icon={Minus} onClick={onMinus} />
      <div style={{ minWidth: small ? 26 : 32, textAlign: "center", fontWeight: 800, fontSize: small ? 13.5 : 15 }}>{value}</div>
      <B Icon={Plus} onClick={onPlus} dark />
    </div>
  );
};

export const Card = ({ children, style, className, onClick }) => (
  <div className={className} onClick={onClick} style={{
    background: "#fff", borderRadius: 22, padding: 16,
    boxShadow: "0 1px 2px rgba(15,15,25,.04), 0 10px 28px rgba(15,15,25,.055)", ...style
  }}>{children}</div>
);

export const SectionHead = ({ title, action, onAction, style }) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "22px 4px 10px", ...style }}>
    <div style={{ fontSize: 17.5, fontWeight: 800, letterSpacing: -0.3 }}>{title}</div>
    {action && <button className="press" onClick={onAction} style={{ fontSize: 13.5, fontWeight: 700, color: BLUE }}>{action}</button>}
  </div>
);

export const Btn = ({ children, onClick, tone = "black", style, icon: Icon, disabled }) => {
  const looks = {
    black: { background: INK, color: "#fff", boxShadow: "0 10px 24px rgba(11,11,15,.28)" },
    soft:  { background: "#EDEDF1", color: INK },
    green: { background: GREEN, color: "#fff", boxShadow: "0 10px 24px rgba(43,168,74,.3)" },
    white: { background: "#fff", color: INK, boxShadow: "0 1px 2px rgba(0,0,0,.06), 0 8px 20px rgba(0,0,0,.07)" },
    danger:{ background: "#FFE9E7", color: "#D92D20" },
  };
  return (
    <button className="press" disabled={disabled} onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      padding: "15px 18px", borderRadius: 17, fontSize: 16, fontWeight: 750,
      opacity: disabled ? 0.4 : 1, width: "100%", letterSpacing: -0.2,
      ...looks[tone], ...style
    }}>{Icon && <Icon size={19} strokeWidth={2.5} />}{children}</button>
  );
};

export const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 1.1, color: SUB, textTransform: "uppercase", margin: "0 4px 7px" }}>{label}</div>
    {children}
  </div>
);
export const inputStyle = {
  background: "#F1F1F5", borderRadius: 14, padding: "13px 15px", fontSize: 16,
  fontWeight: 600, width: "100%"
};

export const Toggle = ({ on, onChange }) => (
  <button onClick={() => onChange(!on)} style={{
    width: 46, height: 28, borderRadius: 99, padding: 2.5, transition: "background .2s ease",
    background: on ? INK : "#D9D9DF", display: "flex", justifyContent: on ? "flex-end" : "flex-start"
  }}>
    <div style={{ width: 23, height: 23, borderRadius: 99, background: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,.2)", transition: "all .2s" }} />
  </button>
);


export const Screen = ({ children, pad = true, bottom = 116, style }) => (
  <div className="screen" style={{
    position: "absolute", inset: 0, overflowY: "auto", background: "#F2F2F7",
    padding: pad ? "0 18px" : 0, paddingBottom: bottom, ...style
  }}>{children}</div>
);

export const LargeHeader = ({ eyebrow, title, right }) => (
  <div style={{ paddingTop: `calc(${SAFE_T} + 16px)`, paddingBottom: 12, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
    <div>
      {eyebrow && <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 1.6, color: SUB, textTransform: "uppercase", marginBottom: 3 }}>{eyebrow}</div>}
      <div style={{ fontSize: 31, fontWeight: 850, letterSpacing: -0.9 }}>{title}</div>
    </div>
    <div style={{ display: "flex", gap: 9, paddingBottom: 3 }}>{right}</div>
  </div>
);

export const RoundBtn = ({ icon: Icon, onClick, dark, size = 40 }) => (
  <button className="pressS" onClick={onClick} style={{
    width: size, height: size, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center",
    background: dark ? INK : "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.07), 0 6px 16px rgba(0,0,0,.07)"
  }}><Icon size={size * 0.45} color={dark ? "#fff" : INK} strokeWidth={2.3} /></button>
);

export const SmallHeader = ({ title, sub, onBack, right }) => (
  <div style={{
    position: "sticky", top: 0, zIndex: 12, margin: "0 -18px 6px", padding: `calc(${SAFE_T} + 8px) 18px 10px`,
    background: "rgba(242,242,247,.86)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
    display: "flex", alignItems: "center", gap: 12
  }}>
    <RoundBtn icon={ArrowLeft} onClick={onBack} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
      {sub && <div style={{ fontSize: 12.5, color: SUB, fontWeight: 600 }}>{sub}</div>}
    </div>
    <div style={{ display: "flex", gap: 8 }}>{right}</div>
  </div>
);

export function Sheet({ open, onClose, children, pad = true }) {
  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 70 }}>
      <div className="dim-anim" onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(10,10,18,.45)", backdropFilter: "blur(2px)" }} />
      <div className="sheet-anim nb-root" style={{
        position: "absolute", left: 0, right: 0, bottom: 0, background: "#F7F7FA",
        borderRadius: "30px 30px 0 0", maxHeight: "92%", display: "flex", flexDirection: "column",
        paddingBottom: SAFE_B, boxShadow: "0 -20px 60px rgba(0,0,0,.2)", overflow: "hidden"
      }}>
        <div style={{ width: 40, height: 5, background: "#D9D9DF", borderRadius: 99, margin: "10px auto 2px", flexShrink: 0 }} />
        <div style={{ overflowY: "auto", flex: 1, minHeight: 0, padding: pad ? "12px 20px 10px" : 0 }}>{children}</div>
      </div>
    </div>
  );
}

export const Toast = ({ toast }) => toast ? (
  <div className="pop" style={{
    position: "absolute", left: 0, right: 0, bottom: 108, display: "flex", justifyContent: "center", zIndex: 95, pointerEvents: "none"
  }}>
    <div style={{
      background: "rgba(11,11,15,.94)", color: "#fff", padding: "11px 18px", borderRadius: 99,
      fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 8,
      boxShadow: "0 14px 34px rgba(0,0,0,.35)", maxWidth: "86%"
    }}>
      {toast.icon === "check" && <CheckCircle2 size={16} color="#4ADE80" />}
      {toast.icon === "warn" && <AlertCircle size={16} color="#FDBA4D" />}
      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{toast.msg}</span>
    </div>
  </div>
) : null;

export const ChartTip = ({ active, payload, label }) =>
  active && payload && payload.length ? (
    <div style={{ background: INK, color: "#fff", padding: "7px 11px", borderRadius: 11, fontSize: 12, fontWeight: 700, boxShadow: "0 8px 20px rgba(0,0,0,.25)" }}>
      <span style={{ opacity: .65, marginRight: 7 }}>{label}</span>{fx(payload[0].value)}
    </div>
  ) : null;

export const EmptyState = ({ icon: Icon, title, sub }) => (
  <div style={{ textAlign: "center", padding: "46px 24px", color: SUB }}>
    <div style={{
      width: 66, height: 66, borderRadius: 24, background: "#fff", margin: "0 auto 14px",
      display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 22px rgba(0,0,0,.06)"
    }}><Icon size={28} color="#B4B4BC" strokeWidth={1.8} /></div>
    <div style={{ fontWeight: 800, fontSize: 15.5, color: INK }}>{title}</div>
    <div style={{ fontSize: 13, marginTop: 4, fontWeight: 500 }}>{sub}</div>
  </div>
);

/* ================================================================== */
/*  HOME                                                               */
/* ================================================================== */


export function OrderRow({ o, S, last }) {
  const c = S.customers.find((x) => x.id === o.cid);
  return (
    <button className="press" onClick={() => S.push({ name: "orderDetail", id: o.id })} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
      padding: "13px 0", borderBottom: last ? "none" : `1px solid ${LINE}`
    }}>
      <div style={{ width: 42, height: 42, borderRadius: 15, background: "#F1F1F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Receipt size={19} color={INK} strokeWidth={2.1} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 750, fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c ? c.name : "Customer"}</div>
        <div style={{ fontSize: 12, color: SUB, fontWeight: 600, marginTop: 1.5 }}>
          {o.no} • {rel(o.date)}, {fT(o.date)}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{fx(o.total)}</div>
        <div style={{ marginTop: 3 }}><StatusPill status={o.status} /></div>
      </div>
    </button>
  );
}

/* ================================================================== */
/*  ORDERS                                                             */
/* ================================================================== */
