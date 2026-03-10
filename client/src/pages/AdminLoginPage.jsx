import { useState } from "react";
import BrandLogo from "../components/Shared/BrandLogo";
import { apiRequest } from "../utils/api";

export default function AdminLoginPage({ onLogin, onBack }) {
  const [f, setF] = useState({ email: "", pass: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");
    if (!f.email || !f.pass) {
      setErr("Enter email and password");
      return;
    }
    setLoading(true);
    try {
      const payload = await apiRequest("/auth/login-admin", { method: "POST", body: { email: f.email, password: f.pass } });
      onLogin(payload);
    } catch (e) {
      setErr(e.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo"><BrandLogo size={34} /></div>
          <div className="auth-badge">🛡 Admin Portal</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <div>
            <label className="lbl">ADMIN EMAIL</label>
            <input
              className="inp"
              type="email"
              placeholder="admin@snippoentertainment.com"
              value={f.email}
              onChange={e => setF({ ...f, email: e.target.value })}
            />
          </div>
          <div>
            <label className="lbl">PASSWORD</label>
            <input
              className="inp"
              type="password"
              placeholder="••••••••"
              value={f.pass}
              onChange={e => setF({ ...f, pass: e.target.value })}
              onKeyDown={e => e.key === "Enter" && submit()}
            />
          </div>
        </div>
        {err && (
          <div style={{ color: "var(--red)", fontSize: 12, marginTop: 9, padding: "9px 11px", background: "rgba(230,57,70,.08)", borderRadius: 8, whiteSpace: "pre-line" }}>
            ⚠ {err}
          </div>
        )}
        <button
          className="btn btn-p"
          style={{ width: "100%", marginTop: 14, padding: 13 }}
          onClick={submit}
          disabled={loading}
        >
          {loading ? <span className="ld"><span>●</span><span>●</span><span>●</span></span> : "Access Admin Dashboard →"}
        </button>
        <button className="btn btn-g" style={{ width: "100%", marginTop: 8 }} onClick={onBack}>
          ← Back to Homepage
        </button>
      </div>
    </div>
  );
}
