import { useState } from "react";
import { LogIn, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { INK, SUB, SAFE_T, SAFE_B } from "../lib/theme.js";
import { api } from "../lib/api.js";
import { Btn, Field, inputStyle } from "./ui.jsx";

/**
 * Sign-in gate for the billing app.
 * Staff accounts are created by an admin in the underdawg website admin panel
 * (Admin → Billing Users); there is deliberately no self-signup here.
 */
export default function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e?.preventDefault?.();
    if (busy || !email.trim() || !password) return;
    setBusy(true);
    setErr("");
    try {
      const user = await api.login(email.trim(), password);
      onSuccess(user);
    } catch (e2) {
      setErr(e2.message || "Could not sign in");
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "#F2F2F7",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: `calc(${SAFE_T} + 20px) 20px calc(${SAFE_B} + 20px)`,
        overflowY: "auto",
      }}
    >
      <form
        onSubmit={submit}
        className="rise"
        style={{ width: "100%", maxWidth: 380, background: "#fff", borderRadius: 26, padding: 26, boxShadow: "0 18px 50px rgba(0,0,0,.10)" }}
      >
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <img src="/logo.png" alt="underdawg" style={{ height: 46, width: "auto", maxWidth: 200, objectFit: "contain", margin: "0 auto 14px", display: "block" }} />
          <h1 style={{ fontSize: 21, fontWeight: 850, letterSpacing: -0.5 }}>Billing</h1>
          <p style={{ fontSize: 13, color: SUB, fontWeight: 600, marginTop: 5 }}>
            Sign in to start billing
          </p>
        </div>

        {err && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8, background: "#FFE9E7", color: "#D92D20",
              padding: "10px 12px", borderRadius: 12, fontSize: 13, fontWeight: 650, marginBottom: 14,
            }}
          >
            <AlertCircle size={16} /> {err}
          </div>
        )}

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@underdawg.com"
            autoComplete="username"
            autoCapitalize="none"
            style={inputStyle}
          />
        </Field>

        <Field label="Password">
          <div style={{ position: "relative" }}>
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                color: SUB, display: "flex", alignItems: "center", padding: 4,
              }}
            >
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>

        <Btn
          icon={busy ? Loader2 : LogIn}
          disabled={busy || !email.trim() || !password}
          style={{ width: "100%", marginTop: 8 }}
          onClick={submit}
        >
          {busy ? "Signing in…" : "Sign in"}
        </Btn>

        <p style={{ fontSize: 11.5, color: SUB, fontWeight: 600, textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
          Accounts are created by an admin in the
          <br />
          underdawg admin panel → Billing Users.
        </p>
      </form>
    </div>
  );
}
