import { useState } from "react";
import AuthModal from "../components/Shared/AuthModal";
import BookingForm from "../components/Booking/BookingForm";

export default function HomePage({ user, onUserAuth, onGoDash, services, staff, bookings, busySlots, onCreateBooking, embedMode, embedHeader, stripeKey, token }) {
  return (
    <div style={{ padding: "clamp(12px,4vw,24px) 13px" }}>
      <div className="container" style={{ position: "relative", minHeight: "calc(100vh - var(--nh) - 48px)", display: "grid", gridTemplateColumns: embedMode ? "1fr" : "1fr 1fr", gap: "clamp(24px,4vw,40px)", alignItems: "start" }}>
        
        {!embedMode && <section style={{ padding: "clamp(20px,4vw,50px) 0" }}>
          <div className="glass" style={{ display: "inline-block", padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "rgba(230,57,70,.1)", color: "var(--red)", marginBottom: 18, border: "1px solid var(--border-red)" }}>
            ✨ EXPERIENCE EXCELLENCE
          </div>
          <h1 style={{ fontSize: "clamp(32px,6vw,54px)", fontWeight: 900, lineHeight: 1.05, marginBottom: 18, letterSpacing: "-.04em" }}>
            Revolutionizing <br />
            <span style={{ color: "var(--red)" }}>Entertainment</span> <br />
            Booking.
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "clamp(15px,2vw,18px)", lineHeight: 1.6, maxWidth: 460, marginBottom: 30 }}>
            Join Snippo Entertainment to discover premium services and book the best specialists in the industry instantly.
          </p>
          <div style={{ display: "flex", gap: 11, flexWrap: "wrap" }}>
            <button className="btn btn-p" onClick={() => (window.location.hash = "#booking")}>Book Appointment</button>
            <button className="btn btn-g" onClick={onGoDash}>View Dashboard</button>
          </div>
        </section>}

        <section id="booking" style={{ position: "sticky", top: "calc(var(--nh) + 20px)", padding: embedMode ? 0 : "20px 0" }}>
          <div className="glass" style={{ overflow: "hidden", border: "1px solid var(--border-red)", boxShadow: "0 20px 50px rgba(230,57,70,.15)" }}>
            <div style={{ background: "var(--red)", color: "white", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-.02em" }}>BOOK A CONSULTATION</span>
              <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.8 }}>EST. 2024</span>
            </div>
            <div style={{ padding: "clamp(12px,3vw,24px)" }}>
              <BookingForm 
                user={user} 
                onNeedAuth={onUserAuth} 
                services={services} 
                staff={staff} 
                bookings={bookings} 
                busySlots={busySlots} 
                onCreateBooking={onCreateBooking} 
                onGoDash={onGoDash}
                stripeKey={stripeKey}
                token={token}
              />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
