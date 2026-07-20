import { useEffect, useState } from "react";
import { Download, X, Share, PlusSquare, MoreVertical } from "lucide-react";
import { INK, SUB, SAFE_B } from "../lib/theme.js";
import { Btn } from "./ui.jsx";

/* ------------------------------------------------------------------ utils -- */

/** True when the app is already running installed (so we must never nag). */
export function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches === true ||
    window.matchMedia?.("(display-mode: fullscreen)")?.matches === true ||
    window.matchMedia?.("(display-mode: minimal-ui)")?.matches === true ||
    // iOS Safari's own flag — the only reliable signal on iPhone/iPad.
    window.navigator.standalone === true ||
    document.referrer.startsWith("android-app://")
  );
}

/** iOS detection incl. iPadOS 13+, which reports itself as a Mac with touch. */
export function isIOS() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  const iPadOS13Up = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS13Up;
}

/** On iOS only Safari can add to the Home Screen. */
function isIOSSafari() {
  const ua = navigator.userAgent || "";
  // Exclude the in-app browsers and other iOS engines that can't install.
  return isIOS() && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|FBAN|FBAV|Instagram|Line/.test(ua);
}

const SNOOZE_KEY = "nexbill_install_snoozed_until";
const SNOOZE_DAYS = 7;

function snoozed() {
  try {
    const t = Number(localStorage.getItem(SNOOZE_KEY) || 0);
    return t > Date.now();
  } catch { return false; }
}
function snooze() {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 86400000));
  } catch {}
}

/* -------------------------------------------------------------- component -- */
/**
 * Shows a "get the app" sheet while running in a BROWSER tab, and never once
 * the app has been installed (standalone). Android/Chrome gets the real native
 * install prompt; iOS gets the Share → Add to Home Screen instructions because
 * Safari exposes no programmatic install API.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null); // captured beforeinstallprompt
  const [open, setOpen] = useState(false);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    if (installed) return;

    const onBIP = (e) => {
      e.preventDefault();            // stop Chrome's mini-infobar; we show our own
      setDeferred(e);
      if (!snoozed()) setOpen(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setOpen(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    // iOS never fires beforeinstallprompt — decide on our own after a beat so
    // the sheet doesn't fight the first paint.
    let t;
    if (isIOSSafari() && !snoozed()) {
      t = setTimeout(() => setOpen(true), 1200);
    }

    // If the app gets installed in another tab, react to the display-mode flip.
    const mq = window.matchMedia?.("(display-mode: standalone)");
    const onMode = (e) => e.matches && onInstalled();
    mq?.addEventListener?.("change", onMode);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      mq?.removeEventListener?.("change", onMode);
      if (t) clearTimeout(t);
    };
  }, [installed]);

  if (installed || !open) return null;

  const ios = isIOS();

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try {
      const { outcome } = await deferred.userChoice;
      if (outcome !== "accepted") snooze();
    } catch { /* ignore */ }
    setDeferred(null);
    setOpen(false);
  };

  const dismiss = () => { snooze(); setOpen(false); };

  return (
    <>
      <div
        className="dim-anim"
        onClick={dismiss}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.42)", zIndex: 900, backdropFilter: "blur(2px)" }}
      />
      <div
        className="sheet-anim"
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 901,
          background: "#F7F7FA", borderRadius: "30px 30px 0 0",
          padding: `24px 22px calc(${SAFE_B} + 22px)`,
          maxWidth: 480, margin: "0 auto",
          boxShadow: "0 -10px 40px rgba(0,0,0,.16)",
        }}
      >
        <button
          onClick={dismiss}
          aria-label="Close"
          style={{
            position: "absolute", top: 16, right: 16, width: 30, height: 30, borderRadius: 15,
            background: "#E6E6EB", display: "flex", alignItems: "center", justifyContent: "center", color: SUB,
          }}
        >
          <X size={16} strokeWidth={2.6} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
          <div
            style={{
              width: 54, height: 54, borderRadius: 17, background: INK, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 19, flexShrink: 0,
            }}
          >
            ud
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 850, fontSize: 17.5, letterSpacing: -0.3 }}>Install underdawg billing</div>
            <div style={{ fontSize: 12.5, color: SUB, fontWeight: 620, marginTop: 2 }}>
              Full screen, works offline, opens instantly.
            </div>
          </div>
        </div>

        {ios ? (
          <>
            <div style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 14 }}>
              <Step n={1} icon={Share} text={<>Tap the <b>Share</b> button in Safari's toolbar</>} />
              <Step n={2} icon={PlusSquare} text={<>Choose <b>Add to Home Screen</b></>} />
              <Step n={3} icon={null} text={<>Tap <b>Add</b> — then open it from your Home Screen</>} last />
            </div>
            {!isIOSSafari() && (
              <p style={{ fontSize: 12, color: "#C46A00", fontWeight: 650, marginBottom: 12, lineHeight: 1.5 }}>
                On iPhone/iPad only <b>Safari</b> can install apps. Open this page in Safari to add it.
              </p>
            )}
            <Btn tone="soft" style={{ width: "100%" }} onClick={dismiss}>Got it</Btn>
          </>
        ) : deferred ? (
          <Btn icon={Download} style={{ width: "100%" }} onClick={install}>Install app</Btn>
        ) : (
          <>
            <div style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 14 }}>
              <Step n={1} icon={MoreVertical} text={<>Open your browser's <b>menu</b></>} />
              <Step n={2} icon={PlusSquare} text={<>Choose <b>Install app</b> or <b>Add to Home screen</b></>} last />
            </div>
            <Btn tone="soft" style={{ width: "100%" }} onClick={dismiss}>Got it</Btn>
          </>
        )}
      </div>
    </>
  );
}

function Step({ n, icon: Icon, text, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: last ? 0 : 13, marginBottom: last ? 0 : 13, borderBottom: last ? "none" : "1px solid rgba(0,0,0,.055)" }}>
      <div style={{ width: 25, height: 25, borderRadius: 9, background: "#EDEDF1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: SUB, flexShrink: 0 }}>
        {n}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 650, lineHeight: 1.45, flex: 1 }}>{text}</div>
      {Icon && <Icon size={19} style={{ color: "#0A6CFF", flexShrink: 0 }} />}
    </div>
  );
}
