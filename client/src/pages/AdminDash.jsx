import { useState, useEffect } from "react";
import Toasts, { useToast } from "../components/Shared/Toasts";
import Confirm from "../components/Shared/Confirm";
import { apiRequest } from "../utils/api";
import { DAYS, COLORS, initials, fmtDur } from "../utils/helpers";

function ServiceModal({ svc, onSave, onClose, services: _ }) {
  const [f, setF] = useState(svc || { name: "", desc: "", price: "", dur: "60", img: "", active: true });
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="mov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 11, right: 11, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 19, width: 32, height: 32, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          X
        </button>
        <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 18, letterSpacing: "-.02em" }}>{svc ? "Edit Service" : "Add New Service"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <div>
            <label className="lbl">SERVICE NAME</label>
            <input className="inp" placeholder="e.g. Hot Stone Massage" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
          </div>
          <div>
            <label className="lbl">DESCRIPTION</label>
            <textarea className="inp" placeholder="Brief description..." value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} />
          </div>
          <div>
            <label className="lbl">SERVICE IMAGE URL</label>
            <input className="inp" placeholder="https://images.unsplash.com/..." value={f.img} onChange={e => { setF({ ...f, img: e.target.value }); setImgErr(false); }} />
            {f.img && (
              <div style={{ marginTop: 9, borderRadius: 11, overflow: "hidden", height: 120, background: "#0d0d1a", border: "1px solid var(--border)" }}>
                {!imgErr ? (
                  <img src={f.img} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgErr(true)} />
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)", fontSize: 13 }}>Invalid image URL</div>
                )}
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
            <div>
              <label className="lbl">PRICE ($)</label>
              <input className="inp" type="number" placeholder="120" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} />
            </div>
            <div>
              <label className="lbl">DURATION</label>
              <select className="inp" value={f.dur} onChange={e => setF({ ...f, dur: e.target.value })}>
                {[["30", "30 min"], ["45", "45 min"], ["60", "1 hour"], ["90", "1h 30m"], ["120", "2 hours"], ["150", "2h 30m"], ["180", "3 hours"]].map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div className={`tog ${f.active ? "on" : ""}`} onClick={() => setF({ ...f, active: !f.active })} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Service is {f.active ? "Active" : "Inactive"}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 9, marginTop: 20 }}>
          <button className="btn btn-g" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-p" style={{ flex: 1 }} onClick={() => { if (!f.name || !f.price) return; onSave(f); }}>
            {svc ? "Save Changes" : "Add Service"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StaffModal({ member, services, onSave, onClose }) {
  const [f, setF] = useState(member || { name: "", role: "", email: "", i: "", c: COLORS[0], services: [], avail: [true, true, true, true, true, false, false] });
  const tSvc = id => setF(p => ({ ...p, services: p.services.includes(id) ? p.services.filter(s => s !== id) : [...p.services, id] }));
  const tDay = i => setF(p => { const a = [...p.avail]; a[i] = !a[i]; return { ...p, avail: a }; });
  return (
    <div className="mov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 11, right: 11, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 19, width: 32, height: 32, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          X
        </button>
        <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 18, letterSpacing: "-.02em" }}>{member ? "Edit Staff Member" : "Add Staff Member"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
            <div>
              <label className="lbl">FULL NAME</label>
              <input className="inp" placeholder="e.g. Aria Chen" value={f.name} onChange={e => setF({ ...f, name: e.target.value, i: initials(e.target.value) })} />
            </div>
            <div>
              <label className="lbl">DESIGNATION</label>
              <input className="inp" placeholder="e.g. Senior Aesthetician" value={f.role} onChange={e => setF({ ...f, role: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="lbl">EMAIL</label>
            <input className="inp" type="email" placeholder="staff@snippoentertainment.com" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
          </div>
          <div>
            <label className="lbl">AVATAR COLOR</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setF({ ...f, c })} style={{ width: 30, height: 30, borderRadius: "50%", background: c, cursor: "pointer", border: f.c === c ? "3px solid white" : "3px solid transparent", transition: "all .15s" }} />
              ))}
            </div>
          </div>
          <div>
            <label className="lbl">ASSIGNED SERVICES</label>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {services.map(s => (
                <div
                  key={s.id}
                  onClick={() => tSvc(s.id)}
                  style={{
                    padding: "5px 11px",
                    borderRadius: 18,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: f.services.includes(s.id) ? "var(--red-dim)" : "var(--glass)",
                    border: `1px solid ${f.services.includes(s.id) ? "var(--border-red)" : "var(--border)"}`,
                    color: f.services.includes(s.id) ? "var(--red)" : "var(--muted)",
                    transition: "all .15s",
                  }}
                >
                  {s.name}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="lbl">AVAILABILITY</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {DAYS.map((d, i) => (
                <div
                  key={d}
                  onClick={() => tDay(i)}
                  style={{
                    padding: "5px 11px",
                    borderRadius: 18,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: f.avail[i] ? "var(--red-dim)" : "var(--glass)",
                    border: `1px solid ${f.avail[i] ? "var(--border-red)" : "var(--border)"}`,
                    color: f.avail[i] ? "var(--red)" : "var(--muted2)",
                    transition: "all .15s",
                  }}
                >
                  {d.slice(0, 3)}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 9, marginTop: 20 }}>
          <button className="btn btn-g" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-p" style={{ flex: 1 }} onClick={() => { if (!f.name || !f.role) return; onSave(f); }}>
            {member ? "Save Changes" : "Add Staff Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingDetailModal({ booking, onClose, onStatusChange }) {
  const bmap = { upcoming: "bu", completed: "bc", cancelled: "bx", active: "ba" };
  const hasExtension = (booking.additionalHours || 0) > 0;
  const originalDur = booking.originalDuration ? parseInt(booking.originalDuration) : null;
  const totalDur = originalDur ? originalDur + (booking.additionalHours || 0) * 60 : null;
  return (
    <div className="mov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 11, right: 11, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 19, width: 32, height: 32, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          ✕
        </button>
        <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 5, letterSpacing: "-.02em" }}>Booking Details</div>
        <div style={{ marginBottom: 14, display: "flex", gap: 7, flexWrap: "wrap" }}>
          <span className={`badge ${bmap[booking.s]}`}>{booking.s[0].toUpperCase() + booking.s.slice(1)}</span>
          {booking.paid && <span style={{ color: "var(--success)", fontSize: 12, fontWeight: 600 }}>✓ Paid</span>}
          {hasExtension && <span className="badge bw">+{booking.additionalHours}h Extended</span>}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: ".07em", marginBottom: 8 }}>BOOKING INFO</div>
        {[
          ["Booking ID", booking.id],
          ["Customer", booking.u],
          ["Service", booking.svc],
          ["Specialist", booking.stf],
          ["Date", booking.dt],
          ["Time", booking.t],
          ["Amount", booking.p],
        ].map(([l, v]) => (
          <div key={l} className="drow">
            <span style={{ color: "var(--muted)" }}>{l}</span>
            <span style={{ fontWeight: 600 }}>{v}</span>
          </div>
        ))}

        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: ".07em", margin: "14px 0 8px" }}>DURATION DETAILS</div>
        <div style={{ background: "var(--glass)", border: `1px solid ${hasExtension ? "var(--border-red)" : "var(--border)"}`, borderRadius: 12, padding: "12px 14px" }}>
          {[
            ["Original Duration", originalDur ? originalDur + " min" : "—"],
            ["Additional Hours", hasExtension ? `+${booking.additionalHours} hour${booking.additionalHours > 1 ? "s" : ""}` : "None"],
            ["Additional Cost", hasExtension ? `$${booking.additionalCost}` : "—"],
            ["Total Duration", totalDur ? totalDur + " min" : "—"],
          ].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <span style={{ color: "var(--muted)" }}>{l}</span>
              <span style={{ fontWeight: 600, color: l === "Additional Cost" && hasExtension ? "var(--red)" : "var(--text)" }}>{v}</span>
            </div>
          ))}
          {!hasExtension && <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)", textAlign: "center" }}>No extension on this booking</div>}
          {hasExtension && (
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ fontWeight: 700 }}>Total Charged</span>
              <span style={{ fontWeight: 900, color: "var(--red)" }}>
                {booking.p} + ${booking.additionalCost}
              </span>
            </div>
          )}
        </div>

        <div style={{ marginTop: 18 }}>
          <label className="lbl">UPDATE STATUS</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["upcoming", "active", "completed", "cancelled"].map(s => (
              <button key={s} className={`btn btn-sm ${booking.s === s ? "btn-p" : "btn-g"}`} onClick={() => onStatusChange(booking.id, s)}>
                {s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-g" style={{ width: "100%", marginTop: 14 }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function AdminDash({ services, setServices, staff, setStaff, bookings, setBookings, pendingStaff, setPendingStaff, onSignOut, token, embedUrl, initialSec = "overview", onSecChange }) {
  const [sec, setSec] = useState(initialSec);
  useEffect(() => { setSec(initialSec); }, [initialSec]);
  const changeSec = s => { setSec(s); onSecChange?.(s); };
  const [svcModal, setSvcModal] = useState(null);
  const [staffModal, setStaffModal] = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);
  const [bDetail, setBDetail] = useState(null);
  const [bFilter, setBFilter] = useState("all");
  const [copied, setCopied] = useState(false);
  const { toasts, toast } = useToast();
  const bmap = { upcoming: "bu", completed: "bc", cancelled: "bx", active: "ba" };
  const filtered = bookings.filter(b => bFilter === "all" || b.s === bFilter);
  const todayKey = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const todayBookings = bookings.filter(b => b.dt.includes(todayKey));
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="900" style="border:0;max-width:100%;" loading="lazy" title="Snippo Entertainment Booking"></iframe>`;

  const reloadAdminData = async () => {
    const data = await apiRequest("/admin/data", { token });
    setServices(data.services || []);
    setStaff(data.staff || []);
    setBookings(data.bookings || []);
    setPendingStaff(data.pendingStaff || []);
  };

  const saveSvc = async f => {
    try {
      if (svcModal === "add") {
        await apiRequest("/admin/services", { method: "POST", token, body: { ...f, price: parseFloat(f.price) } });
        toast("Service added!", "success");
      } else {
        await apiRequest(`/admin/services/${svcModal.id}`, { method: "PUT", token, body: { ...f, price: parseFloat(f.price) } });
        toast("Service updated!", "success");
      }
      await reloadAdminData();
      setSvcModal(null);
    } catch (e) {
      toast(e.message || "Action failed", "error");
    }
  };

  const saveStaff = async f => {
    try {
      if (staffModal === "add") {
        await apiRequest("/admin/staff", { method: "POST", token, body: { ...f, active: true } });
        toast("Staff added!", "success");
      } else {
        await apiRequest(`/admin/staff/${staffModal.id}`, { method: "PUT", token, body: { ...f, active: staffModal.active ?? true } });
        toast("Staff updated!", "success");
      }
      await reloadAdminData();
      setStaffModal(null);
    } catch (e) {
      toast(e.message || "Action failed", "error");
    }
  };

  const doDelete = async () => {
    try {
      if (delConfirm.type === "service") {
        await apiRequest(`/admin/services/${delConfirm.id}`, { method: "DELETE", token });
        toast("Service deleted", "info");
      } else {
        await apiRequest(`/admin/staff/${delConfirm.id}`, { method: "DELETE", token });
        toast("Staff removed", "info");
      }
      await reloadAdminData();
      setDelConfirm(null);
    } catch (e) {
      toast(e.message || "Delete failed", "error");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiRequest(`/admin/bookings/${id}/status`, { method: "PATCH", token, body: { status } });
      setBookings(p => p.map(b => (b.id === id ? { ...b, s: status } : b)));
      setBDetail(p => (p ? { ...p, s: status } : null));
      toast(`Status -> ${status}`, "success");
    } catch (e) {
      toast(e.message || "Status update failed", "error");
    }
  };

  const approveStaff = async p => {
    try {
      await apiRequest(`/admin/pending/${p.id}/approve`, { method: "POST", token });
      await reloadAdminData();
      toast(`${p.name} approved and activated!`, "success");
    } catch (e) {
      toast(e.message || "Approval failed", "error");
    }
  };

  const rejectStaff = async id => {
    try {
      await apiRequest(`/admin/pending/${id}/reject`, { method: "POST", token });
      await reloadAdminData();
      toast("Application rejected", "info");
    } catch (e) {
      toast(e.message || "Rejection failed", "error");
    }
  };

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(iframeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast("Embed code copied!", "success");
    } catch {
      toast("Copy failed. Select and copy manually.", "error");
    }
  };

  const nav = [
    {
      id: "overview",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
      l: "Overview",
    },
    {
      id: "bookings",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
      l: "Bookings",
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
      l: "Services",
    },
    {
      id: "staff",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      l: "Staff",
    },
    {
      id: "approvals",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      l: "Approvals",
      badge: pendingStaff.length,
    },
    {
      id: "embed",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      ),
      l: "Embed",
    },
  ];

  const stats = [
    { l: "Today's Bookings", v: todayBookings.length, c: "Live overview", col: "var(--red)" },
    { l: "Total Services", v: services.length, c: "Active + inactive", col: "#7c3aed" },
    { l: "Revenue Today", v: "$" + todayBookings.filter(b => b.paid).reduce((a, b) => a + parseInt(String(b.p || "$0").replace("$", "")), 0), c: "From paid bookings", col: "var(--success)" },
    { l: "Pending Approvals", v: pendingStaff.length, c: pendingStaff.length > 0 ? "Requires action" : "All clear", col: "var(--warn)" },
  ];

  return (
    <div className="dash">
      <div className="sidebar">
        <div style={{ padding: "9px 10px 13px", borderBottom: "1px solid var(--border)", marginBottom: 7 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>ADMIN PANEL</span>
        </div>
        <div className="ssec">MANAGEMENT</div>
        {nav.map(n => (
          <div key={n.id} className={`sitem ${sec === n.id ? "act" : ""}`} onClick={() => changeSec(n.id)}>
            <span>{n.icon}</span>
            {n.l}
            {n.badge > 0 && (
              <span style={{ marginLeft: "auto", background: "var(--warn)", color: "#000", borderRadius: 20, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
                {n.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="ca">
        {sec === "overview" && (
          <>
            <h1 className="sh">Dashboard</h1>
            <p className="ss">Admin overview</p>
            <div className="g4" style={{ marginBottom: 20 }}>
              {stats.map((s, i) => (
                <div key={i} className="stat">
                  <div className="stat-v" style={{ color: s.col }}>
                    {s.v}
                  </div>
                  <div className="stat-l">{s.l}</div>
                  <div className="stat-c">{s.c}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: ".07em", marginBottom: 10 }}>TODAY'S BOOKINGS</div>
            <div className="glass tw">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Staff</th>
                    <th>Time</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayBookings.map(b => (
                    <tr key={b.id} style={{ cursor: "pointer" }} onClick={() => setBDetail(b)}>
                      <td style={{ fontFamily: "monospace", color: "var(--muted)", fontSize: 11 }}>{b.id}</td>
                      <td style={{ fontWeight: 600 }}>{b.u}</td>
                      <td>{b.svc}</td>
                      <td style={{ color: "var(--muted)" }}>{b.stf}</td>
                      <td>{b.t}</td>
                      <td style={{ fontWeight: 700 }}>{b.p}</td>
                      <td>
                        <span className={`badge ${bmap[b.s]}`}>{b.s[0].toUpperCase() + b.s.slice(1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {sec === "bookings" && (
          <>
            <h1 className="sh">All Bookings</h1>
            <p className="ss">Click a row to view details and update status</p>
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {["all", "upcoming", "active", "completed", "cancelled"].map(f => (
                <div key={f} className={`filter-pill ${bFilter === f ? "on" : ""}`} onClick={() => setBFilter(f)}>
                  {f[0].toUpperCase() + f.slice(1)}
                  {f !== "all" && <span style={{ opacity: 0.6 }}> ({bookings.filter(b => b.s === f).length})</span>}
                </div>
              ))}
            </div>
            <div className="glass tw">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Staff</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: 28 }}>
                        No bookings
                      </td>
                    </tr>
                  ) : (
                    filtered.map(b => (
                      <tr key={b.id} style={{ cursor: "pointer" }} onClick={() => setBDetail(b)}>
                        <td style={{ fontFamily: "monospace", color: "var(--muted)", fontSize: 11 }}>{b.id}</td>
                        <td style={{ fontWeight: 600 }}>{b.u}</td>
                        <td>{b.svc}</td>
                        <td style={{ color: "var(--muted)" }}>{b.stf}</td>
                        <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{b.dt}</td>
                        <td style={{ fontWeight: 700 }}>{b.p}</td>
                        <td>
                          <span className={`badge ${bmap[b.s]}`}>{b.s[0].toUpperCase() + b.s.slice(1)}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {sec === "services" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h1 className="sh">Services</h1>
                <p className="ss" style={{ marginBottom: 0 }}>
                  Manage your offerings
                </p>
              </div>
              <button className="btn btn-p btn-sm" onClick={() => setSvcModal("add")}>
                + Add Service
              </button>
            </div>
            <div className="glass tw">
              <table>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                          <div style={{ width: 50, height: 40, borderRadius: 7, overflow: "hidden", flexShrink: 0, background: "#0d0d1a" }}>
                            {s.img ? (
                              <img src={s.img} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, background: "linear-gradient(135deg,rgba(230,57,70,.14),rgba(100,60,180,.14))" }}>
                                IMG
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)" }}>{String(s.desc || "").substring(0, 36)}...</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{fmtDur(s.dur)}</td>
                      <td style={{ fontWeight: 700, color: "var(--red)" }}>${s.price}</td>
                      <td>
                        <span className={s.active ? "badge bu" : "badge bc"}>{s.active ? "Active" : "Inactive"}</span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span className="ata" style={{ marginRight: 11 }} onClick={() => setSvcModal(s)}>
                          Edit
                        </span>
                        <span className="ata" style={{ color: "var(--muted)" }} onClick={() => setDelConfirm({ type: "service", id: s.id, name: s.name })}>
                          Delete
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {sec === "staff" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h1 className="sh">Active Staff</h1>
                <p className="ss" style={{ marginBottom: 0 }}>
                  Manage your team
                </p>
              </div>
              <button className="btn btn-p btn-sm" onClick={() => setStaffModal("add")}>
                + Add Staff
              </button>
            </div>
            <div className="g2">
              {staff
                .filter(s => s.active)
                .map(s => (
                  <div key={s.id} className="glass" style={{ padding: "clamp(13px,3vw,18px)" }}>
                    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                      <div className="avt" style={{ background: `linear-gradient(135deg,${s.c},rgba(0,0,0,.3))`, width: 44, height: 44, fontSize: 15, flexShrink: 0 }}>
                        {s.i}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</span>
                          <span className="badge bu" style={{ fontSize: 10 }}>
                            Active
                          </span>
                        </div>
                        <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 5 }}>{s.role}</div>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                        <button className="btn btn-g btn-sm" onClick={() => setStaffModal(s)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDelConfirm({ type: "staff", id: s.id, name: s.name })}>
                          X
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        {sec === "approvals" && (
          <>
            <h1 className="sh">Staff Approvals</h1>
            <p className="ss">Review and approve new staff registration requests</p>
            {pendingStaff.length === 0 ? (
              <div className="glass" style={{ padding: 48, textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>All clear!</div>
                <p style={{ color: "var(--muted)", fontSize: 13 }}>No pending approval requests</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {pendingStaff.map(p => (
                  <div key={p.id} className="glass" style={{ padding: "clamp(14px,3vw,22px)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                      <div className="avt" style={{ background: `linear-gradient(135deg,${p.c},rgba(0,0,0,.3))`, width: 48, height: 48, fontSize: 17, flexShrink: 0 }}>
                        {p.i}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                          <span className="badge bw">Pending Approval</span>
                          <span className="badge bc" style={{ fontSize: 10 }}>
                            Inactive
                          </span>
                        </div>
                        <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 4 }}>
                          {p.role} - {p.email}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted2)" }}>Applied: {p.appliedAt}</div>
                      </div>
                      <div style={{ display: "flex", gap: 7, flexShrink: 0, flexWrap: "wrap" }}>
                        <button className="btn btn-success btn-sm" onClick={() => approveStaff(p)}>
                          Approve & Activate
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => rejectStaff(p.id)}>
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {sec === "embed" && (
          <>
            <h1 className="sh">Embed Widget</h1>
            <p className="ss">Use this iframe code on other websites to show only booking form + user dashboard.</p>
            <div className="glass" style={{ padding: "clamp(14px,3vw,22px)", maxWidth: 860 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: ".07em", marginBottom: 8 }}>EMBED URL</div>
              <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 14, wordBreak: "break-all" }}>{embedUrl}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: ".07em", marginBottom: 8 }}>IFRAME CODE</div>
              <textarea className="inp" readOnly value={iframeCode} style={{ fontFamily: "monospace", minHeight: 120, marginBottom: 12 }} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn btn-p btn-sm" onClick={copyEmbedCode}>
                  {copied ? "Copied" : "Copy Code"}
                </button>
                <a className="btn btn-g btn-sm" href={embedUrl} target="_blank" rel="noreferrer">
                  Open Embed Page
                </a>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bnav">
        {nav.map(n => (
          <div key={n.id} className={`bni ${sec === n.id ? "act" : ""}`} onClick={() => changeSec(n.id)}>
            <span style={{ fontSize: 12, position: "relative" }}>
              {n.icon}
              {n.badge > 0 && (
                <span style={{ position: "absolute", top: -4, right: -5, background: "var(--warn)", color: "#000", borderRadius: 10, padding: "0 3px", fontSize: 8, fontWeight: 800, lineHeight: "14px" }}>
                  {n.badge}
                </span>
              )}
            </span>
            <span>{n.l}</span>
          </div>
        ))}
      </div>

      {svcModal && <ServiceModal svc={svcModal === "add" ? null : svcModal} services={services} onSave={saveSvc} onClose={() => setSvcModal(null)} />}
      {staffModal && <StaffModal member={staffModal === "add" ? null : staffModal} services={services} onSave={saveStaff} onClose={() => setStaffModal(null)} />}
      {delConfirm && <Confirm msg={`Delete "${delConfirm.name}"? This action cannot be undone.`} onOk={doDelete} onCancel={() => setDelConfirm(null)} />}
      {bDetail && <BookingDetailModal booking={bDetail} onClose={() => setBDetail(null)} onStatusChange={updateStatus} />}
      <Toasts toasts={toasts} />
    </div>
  );
}
