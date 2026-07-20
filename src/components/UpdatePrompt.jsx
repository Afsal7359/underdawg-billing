import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, X } from "lucide-react";
import { INK, SAFE_T } from "../lib/theme.js";

/**
 * "Update available" banner for the installed PWA.
 *
 * How it works: vite-plugin-pwa is in "prompt" mode, so when a new version is
 * deployed the browser downloads the new service worker in the background and
 * keeps it WAITING. `useRegisterSW` then flips `needRefresh` to true. We show a
 * banner; tapping Update calls `updateServiceWorker(true)`, which activates the
 * new worker and reloads the page with the fresh code.
 *
 * We also poll for a new deploy hourly and whenever the app regains focus, so an
 * installed app (which is rarely fully closed) still notices updates.
 */
const CHECK_EVERY_MS = 60 * 60 * 1000; // hourly

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      if (!r) return;

      const check = () => {
        if (navigator.onLine) r.update().catch(() => {});
      };

      // Periodic check.
      setInterval(check, CHECK_EVERY_MS);

      // Check when the app is brought back to the foreground.
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") check();
      });
      window.addEventListener("online", check);
    },
    onRegisterError(err) {
      console.error("[pwa] SW registration failed:", err);
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: `calc(${SAFE_T} + 8px)`,
        left: 12,
        right: 12,
        zIndex: 950,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        className="rise"
        style={{
          pointerEvents: "auto",
          width: "100%",
          maxWidth: 440,
          background: INK,
          color: "#fff",
          borderRadius: 16,
          padding: "11px 12px 11px 15px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 14px 34px rgba(0,0,0,.30)",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Update available</div>
          <div style={{ fontSize: 12, opacity: 0.72, fontWeight: 600 }}>A new version is ready to install.</div>
        </div>
        <button
          className="press"
          onClick={() => updateServiceWorker(true)}
          style={{
            background: "#fff",
            color: INK,
            fontWeight: 800,
            fontSize: 13,
            padding: "9px 14px",
            borderRadius: 11,
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <RefreshCw size={15} strokeWidth={2.7} /> Update
        </button>
        <button
          className="press"
          onClick={() => setNeedRefresh(false)}
          aria-label="Dismiss"
          style={{ color: "rgba(255,255,255,.7)", padding: 5, flexShrink: 0 }}
        >
          <X size={17} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
