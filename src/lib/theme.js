export const CSS = `
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0}
input,button,textarea{font-family:inherit;border:none;background:none;outline:none;padding:0;color:inherit}
button{cursor:pointer}
::-webkit-scrollbar{display:none}
.nb-root{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased;color:#0B0B0F;font-variant-numeric:tabular-nums}
.press{transition:transform .13s ease,opacity .13s ease}
.press:active{transform:scale(.96);opacity:.85}
.pressS:active{transform:scale(.92)}
@keyframes nbFade{from{opacity:0}to{opacity:1}}
@keyframes nbUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes nbRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes nbPop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
@keyframes nbLaser{0%{top:6%}50%{top:90%}100%{top:6%}}
@keyframes nbPulse{0%,100%{opacity:.35}50%{opacity:1}}
@keyframes nbGlow{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(14px,-10px) scale(1.15)}}
.screen{animation:nbFade .22s ease}
.rise{animation:nbRise .3s cubic-bezier(.3,.7,.3,1)}
.sheet-anim{animation:nbUp .34s cubic-bezier(.32,.72,.22,1)}
.dim-anim{animation:nbFade .25s ease}
.pop{animation:nbPop .45s cubic-bezier(.3,1.4,.5,1)}
.laser{animation:nbLaser 2.3s ease-in-out infinite}
.pulse{animation:nbPulse 1.6s ease-in-out infinite}
.glow{animation:nbGlow 7s ease-in-out infinite}
.nb-outer{background:linear-gradient(160deg,#E7E7EE,#DDDDE6)}
.phone{width:100%;height:100%;max-width:430px;background:#F2F2F7;position:relative;overflow:hidden;display:flex;flex-direction:column}
@media(min-width:480px) and (max-width:899px){.phone{height:min(94vh,940px);border-radius:42px;box-shadow:0 30px 70px rgba(20,20,35,.22),0 0 0 1px rgba(0,0,0,.05)}}

/* ---------- desktop / large-screen shell ---------- */
.nb-desktop{display:flex;width:100vw;height:100vh;background:#F2F2F7;overflow:hidden}
.nb-side{width:256px;flex-shrink:0;background:#fff;border-right:1px solid rgba(0,0,0,.06);display:flex;flex-direction:column;padding:22px 16px 18px}
.nb-main{position:relative;flex:1;min-width:0;overflow:hidden;display:flex;justify-content:center}
.nb-mainwrap{position:relative;width:100%;max-width:900px;overflow:hidden;background:#F2F2F7}
.nb-navbtn{display:flex;align-items:center;gap:13px;padding:11px 13px;border-radius:13px;font-weight:750;font-size:14.5px;color:#5B5B63;width:100%;text-align:left;transition:background .15s ease}
.nb-navbtn:hover{background:#F4F4F7}
.nb-navbtn.on{background:#0B0B0F;color:#fff}
.nb-navbtn.on:hover{background:#0B0B0F}
`;

/* ---------- theme ---------- */
export const INK = "#0B0B0F", SUB = "#7A7A83", LINE = "rgba(0,0,0,0.055)";
export const GREEN = "#2BA84A", RED = "#FF3B30", ORANGE = "#F59300", BLUE = "#0A6CFF", PURPLE = "#8E4DFF";
export const PIE_COLORS = ["#0B0B0F", "#0A6CFF", "#8E4DFF", "#2BA84A", "#F59300", "#5AC8FA"];
export const TONES = {
  green:  { bg: "#E4F6E9", fg: "#188A3D" },
  red:    { bg: "#FFE9E7", fg: "#D92D20" },
  orange: { bg: "#FFF1DC", fg: "#C46A00" },
  blue:   { bg: "#E6F0FF", fg: "#0A5BD6" },
  gray:   { bg: "#EEEEF2", fg: "#5B5B63" },
  dark:   { bg: "#0B0B0F", fg: "#FFFFFF" },
};
export const STATUS = {
  paid:    { label: "Paid",    tone: "green"  },
  partial: { label: "Partial", tone: "blue"   },
  pending: { label: "Pending", tone: "orange" },
  overdue: { label: "Overdue", tone: "red"    },
};

/* ---------- helpers ---------- */
/* Money is GBP: underdawg prices carry pence (e.g. £28.99), so unlike the
   original rupee build we must NOT round to whole units. Whole amounts are
   shown without trailing ".00" to keep the UI tidy. */
export const CURRENCY = "£";
export const fx = (n) => {
  const v = Number(n) || 0;
  const whole = Math.abs(v % 1) < 0.005;
  return (
    (v < 0 ? "-" : "") +
    CURRENCY +
    Math.abs(v).toLocaleString("en-GB", {
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
};
export const dAgo = (n) => { const d = new Date(); d.setHours(10, 30, 0, 0); d.setDate(d.getDate() - n); return d; };
export const fD = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
export const fT = (d) => d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
export const rel = (d) => {
  const a = new Date(); a.setHours(0, 0, 0, 0);
  const b = new Date(d); b.setHours(0, 0, 0, 0);
  const diff = Math.round((a - b) / 86400000);
  return diff === 0 ? "Today" : diff === 1 ? "Yesterday" : fD(d);
};
export const uid = () => Math.random().toString(36).slice(2, 9);
/* Default tax rate (%). 0 = no tax by default for underdawg; the per-bill
   toggle still works, and the rate is overridable from billing Settings. */
export const TAX = 0;

/* Bucket order totals into a per-day revenue series for the last `days` days. */
export const dailySeries = (orders, days) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const out = [], idx = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    idx[d.toDateString()] = out.length;
    out.push({ label: fD(d), v: 0 });
  }
  for (const o of orders) {
    const d = new Date(o.date); d.setHours(0, 0, 0, 0);
    const i = idx[d.toDateString()];
    if (i != null) out[i].v += o.total;
  }
  return out;
};

export const SAFE_T = "max(env(safe-area-inset-top), 14px)";
export const SAFE_B = "max(env(safe-area-inset-bottom), 10px)";
