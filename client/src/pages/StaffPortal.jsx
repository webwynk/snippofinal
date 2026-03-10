import { useState, useEffect } from "react";
import Toasts, { useToast } from "../components/Shared/Toasts";
import { apiRequest } from "../utils/api";
import { DAYS, initials } from "../utils/helpers";

export default function StaffPortal({ staffUser, allStaff, setAllStaff, bookings, services, onSignOut, token, initialTab = 'schedule', onTabChange }) {
  const me = allStaff.find(s => s.email === staffUser?.email) || staffUser?.staffData || staffUser?.staffRef;
  const isPending = me?.status === "pending" || staffUser?.staffData?.status === "pending";
  const [tab, setTab] = useState(initialTab);

  useEffect(() => { setTab(initialTab); }, [initialTab]);

  const changeTab = t => { setTab(t); onTabChange?.(t); };
  const [prof, setProf] = useState({ name: me?.name || staffUser?.name || "", role: me?.role || "", email: me?.email || staffUser?.email || "" });
  const [saved, setSaved] = useState({ ...prof });
  const [avail, setAvail] = useState(me?.avail || [true, true, true, true, true, false, false]);
  const [myServices, setMyServices] = useState(me?.services || []);
  const { toasts, toast } = useToast();
  const myBookings = bookings.filter(b => b.stf === me?.name || b.stf === staffUser?.name);
  const bmap = { upcoming: "bu", completed: "bc", cancelled: "bx", active: "ba" };

  const nav = [
    {
      id: "schedule",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
      l: "Schedule",
    },
    {
      id: "services",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      ),
      l: "My Services",
    },
    {
      id: "availability",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
      l: "Availability",
    },
    {
      id: "profile",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      l: "Profile",
    },
  ];

  const toggleSvc = id => setMyServices(p => (p.includes(id) ? p.filter(s => s !== id) : [...p, id]));

  const saveAvail = async () => {
    try {
      const updated = await apiRequest("/staff/me/availability", { method: "PUT", token, body: { avail } });
      if (me?.id) setAllStaff(p => p.map(s => (s.id === me.id ? { ...s, ...updated } : s)));
      toast("Availability saved!", "success");
    } catch (e) {
      toast(e.message || "Failed to save availability", "error");
    }
  };

  const saveSvcs = async () => {
    try {
      const updated = await apiRequest("/staff/me/services", { method: "PUT", token, body: { services: myServices } });
      if (me?.id) setAllStaff(p => p.map(s => (s.id === me.id ? { ...s, ...updated } : s)));
      toast("Services updated!", "success");
    } catch (e) {
      toast(e.message || "Failed to save services", "error");
    }
  };

  if (isPending) {
    return (
      <div className="pending-wrap">
        <div className="pending-icon">⏳</div>
        <h2 style={{ fontSize: "clamp(20px,4vw,26px)", fontWeight: 900, marginBottom: 10, letterSpacing: "-.03em" }}>Admin Approval Required</h2>
        <p style={{ color: "var(--muted)", maxWidth: 380, lineHeight: 1.7, marginBottom: 20, fontSize: 14 }}>
          Your staff account is currently <strong style={{ color: "var(--text)" }}>inactive</strong> and awaiting admin review. You'll receive access once an administrator approves your application.
        </p>
        <div className="glass" style={{ padding: "clamp(14px,4vw,28px)", maxWidth: 380, textAlign: "left", marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: ".07em", marginBottom: 12 }}>APPLICATION STATUS</div>
          {[
            ["Name", staffUser?.name || me?.name],
            ["Email", staffUser?.email || me?.email],
            ["Role", me?.role || "Specialist"],
            ["Status", <span key="status" className="badge bc">Account: Inactive</span>],
            ["Approval", <span key="approval" className="badge bw">⏳ Pending</span>],
          ].map(([l, v]) => (
            <div key={l} className="srow">
              <span className="slbl">{l}</span>
              <span className="sval">{v}</span>
            </div>
          ))}
        </div>
        <p style={{ color: "var(--muted2)", fontSize: 12, marginBottom: 16 }}>The admin has been notified of your registration.</p>
        <button className="btn btn-danger btn-sm" onClick={onSignOut}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="dash">
      <div className="sidebar">
        <div style={{ padding: "9px 10px 13px", borderBottom: "1px solid var(--border)", marginBottom: 7 }}>
          <div className="avt" style={{ background: `linear-gradient(135deg,${me?.c || "#7c3aed"},rgba(0,0,0,.3))`, width: 36, height: 36, fontSize: 13, marginBottom: 7 }}>
            {me?.i || initials(saved.name)}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{saved.name}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{saved.role}</div>
        </div>
        {nav.map(n => (
          <div key={n.id} className={`sitem ${tab === n.id ? "act" : ""}`} onClick={() => changeTab(n.id)}>
            <span>{n.icon}</span>
            {n.l}
          </div>
        ))}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <div className="sitem" style={{ color: "var(--red)" }} onClick={onSignOut}>
            <span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </span>
            Sign Out
          </div>
        </div>
      </div>
      <div className="ca">
        {tab === "schedule" && (
          <>
            <h1 className="sh">My Schedule</h1>
            <p className="ss">Your upcoming appointments</p>
            {myBookings.length === 0 ? (
              <div className="glass" style={{ padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Schedule is clear</div>
                <p style={{ color: "var(--muted)", fontSize: 13 }}>No upcoming bookings</p>
              </div>
            ) : (
              <div className="glass tw">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Client</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myBookings.map(b => (
                      <tr key={b.id}>
                        <td style={{ fontFamily: "monospace", color: "var(--muted)", fontSize: 11 }}>{b.id}</td>
                        <td style={{ fontWeight: 600 }}>{b.u}</td>
                        <td>{b.svc}</td>
                        <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{b.dt}</td>
                        <td>{b.t}</td>
                        <td>
                          <span className={`badge ${bmap[b.s]}`}>{b.s[0].toUpperCase() + b.s.slice(1)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        {tab === "services" && (
          <>
            <h1 className="sh">My Services</h1>
            <p className="ss">Select the services you're qualified to perform</p>
            <div className="glass" style={{ padding: "clamp(14px,3vw,22px)", maxWidth: 600 }}>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 18 }}>
                {services
                  .filter(s => s.active)
                  .map(s => (
                    <div key={s.id} className={`svc-pill ${myServices.includes(s.id) ? "on" : ""}`} onClick={() => toggleSvc(s.id)}>
                      <div className="svc-thumb">{s.img && <img src={s.img} alt={s.name} />}</div>
                      {myServices.includes(s.id) ? "✓ " : ""}
                      {s.name}
                    </div>
                  ))}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>
                Selected: <strong style={{ color: "var(--text)" }}>{myServices.length}</strong> service{myServices.length !== 1 ? "s" : ""}
              </div>
              <button className="btn btn-p btn-sm" onClick={saveSvcs}>
                Save My Services
              </button>
            </div>
          </>
        )}
        {tab === "availability" && (
          <>
            <h1 className="sh">Availability</h1>
            <p className="ss">Set your working days</p>
            <div className="glass" style={{ padding: "clamp(14px,3vw,22px)", maxWidth: 480 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                {DAYS.map((d, i) => (
                  <div
                    key={d}
                    onClick={() => {
                      const a = [...avail];
                      a[i] = !a[i];
                      setAvail(a);
                    }}
                    style={{
                      padding: "9px 16px",
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      background: avail[i] ? "var(--red-dim)" : "var(--glass)",
                      border: `1px solid ${avail[i] ? "var(--border-red)" : "var(--border)"}`,
                      color: avail[i] ? "var(--red)" : "var(--muted)",
                      transition: "all .15s",
                    }}
                  >
                    {d.slice(0, 3)}
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 14 }}>
                {DAYS.map((d, i) => (
                  <div key={d} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                    <span style={{ color: avail[i] ? "var(--text)" : "var(--muted)" }}>{d}</span>
                    <span style={{ color: avail[i] ? "var(--success)" : "var(--muted2)", fontWeight: 600 }}>{avail[i] ? "9:00 AM – 6:00 PM" : "Day off"}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-p btn-sm" onClick={saveAvail}>
                Save Availability
              </button>
            </div>
          </>
        )}
        {tab === "profile" && (
          <>
            <h1 className="sh">My Profile</h1>
            <p className="ss">Update your public profile</p>
            <div className="glass" style={{ padding: "clamp(13px,3vw,22px)", maxWidth: 420 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
                <div className="avt" style={{ background: `linear-gradient(135deg,${me?.c || "#7c3aed"},rgba(0,0,0,.3))`, width: 48, height: 48, fontSize: 17, flexShrink: 0 }}>
                  {me?.i || initials(saved.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{saved.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{saved.role}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {[
                  { l: "FULL NAME", k: "name", t: "text" },
                  { l: "DESIGNATION", k: "role", t: "text" },
                  { l: "EMAIL", k: "email", t: "email" },
                ].map(fi => (
                  <div key={fi.k}>
                    <label className="lbl">{fi.l}</label>
                    <input className="inp" type={fi.t} value={prof[fi.k] || ""} onChange={e => setProf({ ...prof, [fi.k]: e.target.value })} />
                  </div>
                ))}
                <button
                  className="btn btn-p btn-sm"
                  style={{ marginTop: 4, alignSelf: "flex-start" }}
                  onClick={async () => {
                    try {
                      const updated = await apiRequest("/staff/me/profile", { method: "PUT", token, body: prof });
                      setSaved({ ...updated });
                      setProf({ ...updated });
                      if (me?.id) setAllStaff(p => p.map(s => (s.id === me.id ? { ...s, ...updated } : s)));
                      toast("Profile saved!", "success");
                    } catch (e) {
                      toast(e.message || "Failed to save profile", "error");
                    }
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="bnav">
        {nav.map(n => (
          <div key={n.id} className={`bni ${tab === n.id ? "act" : ""}`} onClick={() => changeTab(n.id)}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            <span>{n.l}</span>
          </div>
        ))}
      </div>
      <Toasts toasts={toasts} />
    </div>
  );
}
