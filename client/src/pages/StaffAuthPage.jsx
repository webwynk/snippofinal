import { useState } from "react";
import BrandLogo from "../components/Shared/BrandLogo";
import { apiRequest } from "../utils/api";

export default function StaffAuthPage({ onLogin, onBack }) {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [f, setF] = useState({ name: "", email: "", pass: "", designation: "", phone: "" });

  const submit = async () => {
    setErr("");
    if (!f.email.includes("@")) {
      setErr("Enter a valid email");
      return;
    }
    if (f.pass.length < 6) {
      setErr("Password min 6 characters");
      return;
    }
    if (tab === "register" && !f.name.trim()) {
      setErr("Enter your full name");
      return;
    }
    if (tab === "register" && !f.designation.trim()) {
      setErr("Enter your designation");
      return;
    }
    setLoading(true);
    try {
      const payload = tab === "login"
        ? await apiRequest("/auth/login-staff", { method: "POST", body: { email: f.email, password: f.pass } })
        : await apiRequest("/auth/register-staff", { method: "POST", body: { name: f.name, email: f.email, password: f.pass, designation: f.designation, phone: f.phone } });
      onLogin(payload);
    } catch (e) {
      setErr(e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 440 }}>
        <div className="auth-brand">
          <div className="auth-logo"><BrandLogo size={34} /></div>
          <div className="auth-badge">💼 Staff Portal</div>
        </div>
        <div className="tabs">
          <div className={`tab ${tab === "login" ? "act" : ""}`} onClick={() => { setTab("login"); setErr(""); }}>
            Staff Login
          </div>
          <div className={`tab ${tab === "register" ? "act" : ""}`} onClick={() => { setTab("register"); setErr(""); }}>
            Register
          </div>
        </div>
        {tab === "register" && (
          <div style={{ padding: "10px 12px", background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.25)", borderRadius: 10, fontSize: 12, color: "var(--warn)", marginBottom: 13, lineHeight: 1.6 }}>
            ⚠️ Staff accounts require <strong>Admin approval</strong> before accessing the portal. You'll see a pending screen after registering.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tab === "register" && <input className="inp" placeholder="Full Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />}
          {tab === "register" && <input className="inp" placeholder="Designation (e.g. Massage Therapist)" value={f.designation} onChange={e => setF({ ...f, designation: e.target.value })} />}
          <input className="inp" type="email" placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
          <input className="inp" type="password" placeholder="Password" value={f.pass} onChange={e => setF({ ...f, pass: e.target.value })} onKeyDown={e => e.key === "Enter" && submit()} />
          {tab === "register" && <input className="inp" type="tel" placeholder="Phone (optional)" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />}
        </div>
        {err && (
          <div style={{ color: "var(--red)", fontSize: 12, marginTop: 9, padding: "9px 11px", background: "rgba(230,57,70,.08)", borderRadius: 8, whiteSpace: "pre-line" }}>
            ⚠ {err}
          </div>
        )}
        <button className="btn btn-p" style={{ width: "100%", marginTop: 14, padding: 13 }} onClick={submit} disabled={loading}>
          {loading ? <span className="ld"><span>●</span><span>●</span><span>●</span></span> : (tab === "login" ? "Sign In to Staff Portal →" : "Register & Submit for Approval →")}
        </button>
        <button className="btn btn-g" style={{ width: "100%", marginTop: 8 }} onClick={onBack}>
          ← Back to Homepage
        </button>
      </div>
    </div>
  );
}
