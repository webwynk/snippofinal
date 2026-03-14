import { useState } from "react";
import { STEPS, MNS, DS, TIMES, cal, fmtDur } from "../../utils/helpers";
import Progress from "../Shared/Progress";
import StaffDetailsModal from "../Shared/StaffDetailsModal";

function S1({ sel, onSel, services }) {
  return (
    <div className="se">
      <h2 className="sh">Choose a Service</h2>
      <p className="ss">Select the treatment you'd like to book</p>
      <div className="sg">
        {services.filter(s => s.active).map(s => (
          <div key={s.id} className={`scard ${sel?.id === s.id ? "sel" : ""}`} onClick={() => onSel(s)}>
            <div className="simg">
              {s.img ? <img src={s.img} alt={s.name} loading="lazy" /> : <div className="simg-fb">🧖</div>}
            </div>
            <div className="sbody">
              <div className="sname">{s.name}</div>
              <div className="sdesc">{s.desc}</div>
              <div className="smeta">
                <span className="sprice">${s.price}</span>
                <span className="sdur">⏱ {fmtDur(s.dur)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function S2({ sel, onSel, staff, svcId, onDetails }) {
  const list = staff.filter(s => s.active && (!svcId || s.services.includes(svcId)));
  return (
    <div className="se">
      <h2 className="sh">Choose Your Specialist</h2>
      <p className="ss">Available for your selected service</p>
      {list.length === 0 ? (
        <div className="glass" style={{ padding: 28, textAlign: "center", color: "var(--muted)" }}>
          No specialists available for this service
        </div>
      ) : (
        <div className="staffg" style={{ gap: 16 }}>
          {list.map(s => (
            <div 
              key={s.id} 
              className={`stcard ${sel?.id === s.id ? "sel" : ""}`} 
              style={{ 
                cursor: "default", 
                padding: 16,
                borderColor: sel?.id === s.id ? '#2ecc17' : 'var(--border)',
                boxShadow: sel?.id === s.id ? '0 0 15px rgba(46, 204, 23, 0.2)' : 'none'
              }}
            >
              <div 
                onClick={() => onSel(s)} 
                style={{ cursor: "pointer" }}
              >
                <div
                  className="avt"
                  style={{
                    width: 64,
                    height: 64,
                    margin: "0 auto 12px",
                    background: s.profileImage ? "transparent" : `linear-gradient(135deg,${s.c},rgba(0,0,0,.3))`,
                    fontSize: 22,
                    overflow: 'hidden'
                  }}
                >
                  {s.profileImage ? (
                    <img src={s.profileImage} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    s.i
                  )}
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>{s.role}</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {sel?.id === s.id ? (
                  <div 
                    style={{ 
                      padding: '8px 0', 
                      borderRadius: 8, 
                      background: 'linear-gradient(135deg, #2ecc17, #24b011)',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 700,
                      textAlign: 'center',
                      boxShadow: '0 2px 8px rgba(46, 204, 23, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 32
                    }}
                  >
                    ✓ Selected
                  </div>
                ) : (
                  <button 
                    className="btn btn-p btn-sm" 
                    style={{ fontSize: 11, padding: '6px 0', width: '100%', height: 32 }}
                    onClick={() => onSel(s)}
                  >
                    Select
                  </button>
                )}
                <button 
                  className="btn btn-g btn-sm" 
                  style={{ fontSize: 11, padding: '4px 0', width: '100%' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDetails(s);
                  }}
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function S3({ selDate, selTime, onDate, onTime, busySlots, stf }) {
  const now = new Date();
  const [mn, setMn] = useState(now.getMonth());
  const [yr, setYr] = useState(now.getFullYear());
  const days = cal(yr, mn);
  const selStr = selDate ? `${selDate.getFullYear()}-${selDate.getMonth()}-${selDate.getDate()}` : "";

  // Dynamic booking check from global busySlots
  const blockedTimes = (busySlots || [])
    .filter(b => b.staffId === stf?.id && b.dt === (selDate ? selDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" }) : ""))
    .map(b => b.t);

  // Staff availability check (0=Sunday, 1=Monday, etc.)
  // s.avail mapping: [Mon, Tue, Wed, Thu, Fri, Sat, Sun] 
  // Date.getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const isOffDay = (date) => {
    if (!stf || !stf.avail) return false;
    const dayIndex = date.getDay(); // 0-6 (Sun-Sat)
    const availIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Map Sun to 6, Mon to 0
    return !stf.avail[availIndex];
  };

  const to12h = t24 => {
    const [h, m] = t24.split(":");
    let hr = parseInt(h, 10);
    const ampm = hr >= 12 ? "PM" : "AM";
    if (hr > 12) hr -= 12;
    if (hr === 0) hr = 12;
    return `${hr}:${m} ${ampm}`;
  };

  const isSlotDisabled = (t) => {
    if (!selDate) return true;
    if (isOffDay(selDate)) return true;
    return blockedTimes.includes(to12h(t));
  };

  return (
    <div className="se">
      <h2 className="sh">Pick a Date & Time</h2>
      <p className="ss">Strikethrough slots are already booked</p>
      <div className="dtg">
        <div className="glass" style={{ padding: "clamp(12px,3vw,18px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <button
              className="btn btn-g btn-sm btn-icon"
              onClick={() => (mn === 0 ? (setMn(11), setYr(y => y - 1)) : setMn(m => m - 1))}
            >
              ‹
            </button>
            <span style={{ fontWeight: 700, fontSize: 13 }}>
              {MNS[mn]} {yr}
            </span>
            <button
              className="btn btn-g btn-sm btn-icon"
              onClick={() => (mn === 11 ? (setMn(0), setYr(y => y + 1)) : setMn(m => m + 1))}
            >
              ›
            </button>
          </div>
          <div className="calg">
            {DS.map(d => (
              <div key={d} className="cdn">
                {d}
              </div>
            ))}
            {days.map((d, i) => {
              if (!d) return <div key={i} className="cd cem" />;
              const date = new Date(yr, mn, d);
              const past = date < new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const today = d === now.getDate() && mn === now.getMonth() && yr === now.getFullYear();
              return (
                <div
                  key={i}
                  className={`cd${past ? " cpast" : ""}${today ? " ctoday" : ""}${
                    selStr === `${yr}-${mn}-${d}` ? " csel" : ""
                  }`}
                  onClick={() => !past && onDate(date)}
                >
                  {d}
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div
            style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 10, letterSpacing: ".07em" }}
          >
            AVAILABLE TIMES
          </div>
          <div className="tg">
            {isOffDay(selDate || new Date()) && selDate && (
              <div style={{ gridColumn: "1/-1", padding: 20, textAlign: "center", color: "var(--red)", fontSize: 13, fontWeight: 600 }}>
                Specialist is not available on this day
              </div>
            )}
            {TIMES.map(t => {
              const disabled = isSlotDisabled(t);
              return (
                <div
                  key={t}
                  className={`ts${disabled ? " tbk" : ""}${selTime === t ? " tsel" : ""}`}
                  onClick={() => !disabled && onTime(t)}
                >
                  {t}
                  {disabled ? (blockedTimes.includes(to12h(t)) ? " ✕" : " Off") : ""}
                </div>
              );
            })}
          </div>
          {selDate && selTime && (
            <div className="glass" style={{ padding: 13, marginTop: 11, borderColor: "var(--border-red)" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>Selected</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>
                {selDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </div>
              <div style={{ color: "var(--red)", fontWeight: 700, marginTop: 2 }}>{selTime}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function S4({ det, onChange, user }) {
  const v = k => det[k] ?? (k === "name" ? user?.name : k === "email" ? user?.email : k === "phone" ? user?.phone : "") ?? "";
  return (
    <div className="se" style={{ maxWidth: 500, margin: "0 auto" }}>
      <div style={{ textAlign: "center" }}>
        <h2 className="sh">Your Details</h2>
        <p className="ss">Pre-filled from your account</p>
      </div>
      <div className="glass" style={{ padding: "clamp(14px,4vw,24px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {[
            { l: "FULL NAME", k: "name", t: "text", ph: "Your full name" },
            { l: "EMAIL", k: "email", t: "email", ph: "your@email.com" },
            { l: "PHONE", k: "phone", t: "tel", ph: "+1 (555) 000-0000" },
          ].map(fi => (
            <div key={fi.k}>
              <label className="lbl">{fi.l}</label>
              <input
                className="inp"
                type={fi.t}
                placeholder={fi.ph}
                value={v(fi.k)}
                onChange={e => onChange({ ...det, [fi.k]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <label className="lbl">NOTES (Optional)</label>
            <textarea
              className="inp"
              placeholder="Any special requests…"
              value={det.notes || ""}
              onChange={e => onChange({ ...det, notes: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function S5({ svc, stf, date, time }) {
  return (
    <div className="se" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div style={{ textAlign: "center" }}>
        <h2 className="sh">Booking Summary</h2>
        <p className="ss">Review your appointment before payment</p>
      </div>
      <div className="glass" style={{ padding: "clamp(14px,4vw,24px)" }}>
        <div
          style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: ".07em", marginBottom: 11 }}
        >
          DETAILS
        </div>
        {[
          ["Service", svc?.name],
          ["Specialist", stf?.name],
          [
            "Date",
            date?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
          ],
          ["Time", time],
          ["Duration", fmtDur(svc?.dur)],
        ].map(([l, v]) => (
          <div key={l} className="srow">
            <span className="slbl">{l}</span>
            <span className="sval">{v}</span>
          </div>
        ))}
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>Total</span>
          <span style={{ fontSize: "clamp(24px,5vw,30px)", fontWeight: 900, color: "var(--red)", letterSpacing: "-.03em" }}>
            ${svc?.price}
          </span>
        </div>
      </div>
    </div>
  );
}

function S6({ svc, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState({ num: "", exp: "", cvc: "" });
  const [err, setErr] = useState("");
  const pay = async () => {
    if (card.num.replace(/\s/g, "").length < 16) {
      setErr("Enter a valid 16-digit card number");
      return;
    }
    if (!card.exp.match(/^\d{2}\/\d{2}$/)) {
      setErr("Format: MM/YY");
      return;
    }
    if (card.cvc.length < 3) {
      setErr("Enter a valid CVC");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      await onSuccess();
    } catch (e) {
      setErr(e.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="se" style={{ maxWidth: 460, margin: "0 auto" }}>
      <div style={{ textAlign: "center" }}>
        <h2 className="sh">Secure Payment</h2>
        <p className="ss">Encrypted and secure checkout</p>
      </div>
      <div className="glass" style={{ padding: "clamp(14px,4vw,24px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Amount due</span>
          <span style={{ fontSize: "clamp(22px,5vw,28px)", fontWeight: 900, color: "var(--red)", letterSpacing: "-.03em" }}>
            ${svc?.price}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <div>
            <label className="lbl">CARD NUMBER</label>
            <input
              className="sinp"
              placeholder="4242 4242 4242 4242"
              maxLength={19}
              value={card.num}
              onChange={e =>
                setCard({
                  ...card,
                  num: e.target.value
                    .replace(/\D/g, "")
                    .replace(/(.{4})/g, "$1 ")
                    .trim(),
                })
              }
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
            <div>
              <label className="lbl">EXPIRY</label>
              <input
                className="sinp"
                placeholder="MM/YY"
                maxLength={5}
                value={card.exp}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, "");
                  if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                  setCard({ ...card, exp: v });
                }}
              />
            </div>
            <div>
              <label className="lbl">CVC</label>
              <input
                className="sinp"
                placeholder="•••"
                maxLength={4}
                value={card.cvc}
                onChange={e => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "") })}
              />
            </div>
          </div>
        </div>
        {err && (
          <div
            style={{
              color: "var(--red)",
              fontSize: 12,
              marginTop: 9,
              padding: "9px 11px",
              background: "rgba(230,57,70,.08)",
              borderRadius: 8,
            }}
          >
            ⚠ {err}
          </div>
        )}
        <button
          className="btn btn-p"
          style={{ width: "100%", marginTop: 16, padding: 14, fontSize: 14 }}
          onClick={pay}
          disabled={loading}
        >
          {loading ? (
            <span className="ld">
              <span>●</span>
              <span>●</span>
              <span>●</span>
            </span>
          ) : (
            `🔒 Pay $${svc?.price} Securely`
          )}
        </button>
      </div>
    </div>
  );
}

function S7({ svc, stf, date, time, booking, onDash, onRebook }) {
  const ref = booking?.id || "BK-" + (2410 + Math.floor(Math.random() * 90));
  return (
    <div className="se" style={{ textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
      <div className="check-c">✓</div>
      <h2 style={{ fontSize: "clamp(22px,5vw,30px)", fontWeight: 900, marginBottom: 9, letterSpacing: "-.03em" }}>
        You're all booked!
      </h2>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
        Appointment confirmed. A confirmation email has been sent.
      </p>
      <div className="glass" style={{ padding: "clamp(13px,4vw,24px)", textAlign: "left", marginBottom: 18 }}>
        {[
          ["Booking Ref", <span className="refcode" key="ref">{ref}</span>],
          ["Service", svc?.name],
          ["Specialist", stf?.name],
          ["When", `${date?.toLocaleDateString("en-US", { month: "long", day: "numeric" })} at ${time}`],
          ["Status", <span className="badge bu" key="stat">✓ Confirmed</span>],
        ].map(([l, v]) => (
          <div key={l} className="srow">
            <span className="slbl">{l}</span>
            <span className="sval">{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn btn-p" onClick={onDash}>
          View My Dashboard
        </button>
        <button className="btn btn-g" onClick={onRebook}>
          Book Another
        </button>
      </div>
    </div>
  );
}

export default function BookingForm({ user, onNeedAuth, services, staff, bookings, busySlots, onCreateBooking, onGoDash }) {
  const [step, setStep] = useState(0);
  const [svc, setSvc] = useState(null);
  const [stf, setStf] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [det, setDet] = useState({});
  const [createdBooking, setCreatedBooking] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const canNext = () => {
    if (step === 0) return !!svc;
    if (step === 1) return !!stf;
    if (step === 2) return !!date && !!time;
    return true;
  };

  const handleSvcSel = s => {
    setSvc(s);
    if (!user) {
      onNeedAuth(() => setStep(1));
    }
  };

  const next = () => {
    if (step === 0) {
      if (!svc) return;
      if (!user) {
        onNeedAuth(() => setStep(1));
        return;
      }
      setStep(1);
      return;
    }
    setStep(s => Math.min(s + 1, 6));
  };

  const back = () => setStep(s => Math.max(s - 1, 0));

  const reset = () => {
    setStep(0);
    setSvc(null);
    setStf(null);
    setDate(null);
    setTime(null);
    setDet({});
    setCreatedBooking(null);
  };

  const createBooking = async () => {
    if (!svc || !stf || !date || !time) throw new Error("Missing booking details");
    
    // Best practice for global bookings: Send the literal calendar date (YYYY-MM-DD) 
    // instead of an ISO string (which shifts the day based on local timezone offsets).
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const localDateString = `${y}-${m}-${d}`;

    const payload = { serviceId: svc.id, staffId: stf.id, date: localDateString, time, details: det };
    const booking = await onCreateBooking?.(payload);
    setCreatedBooking(booking || null);
    setStep(6);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Progress step={step} />
      <div>
        {step === 0 && <S1 sel={svc} onSel={handleSvcSel} services={services} />}
        {step === 1 && <S2 sel={stf} onSel={setStf} staff={staff} svcId={svc?.id} onDetails={setSelectedStaff} />}
        {step === 2 && <S3 selDate={date} selTime={time} onDate={setDate} onTime={setTime} busySlots={busySlots || bookings} stf={stf} />}
        {step === 3 && <S4 det={det} onChange={setDet} user={user} />}
        {step === 4 && <S5 svc={svc} stf={stf} date={date} time={time} />}
        {step === 5 && <S6 svc={svc} onSuccess={createBooking} />}
        {step === 6 && (
          <S7 svc={svc} stf={stf} date={date} time={time} booking={createdBooking} onDash={onGoDash} onRebook={reset} />
        )}
      </div>
      {selectedStaff && (
        <StaffDetailsModal member={selectedStaff} onClose={() => setSelectedStaff(null)} />
      )}
      {step < 6 && (
        <div className="bfoot">
          <button className="btn btn-g btn-sm" onClick={back} disabled={step === 0}>
            ← Back
          </button>

          {step < 5 && (
            <button className="btn btn-p btn-sm" onClick={next} disabled={!canNext()}>
              {step === 4 ? "Pay Now →" : "Continue →"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
