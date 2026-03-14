import { useState } from "react";
import AuthModal from "../components/Shared/AuthModal";
import BookingForm from "../components/Booking/BookingForm";

export default function HomePage({ user, onUserAuth, onGoDash, services, staff, bookings, busySlots, onCreateBooking, embedMode = false, embedHeader = null }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authCb, setAuthCb] = useState(null);

  const handleNeedAuth = cb => {
    setAuthCb(() => cb);
    setShowAuth(true);
  };

  const handleAuth = u => {
    setShowAuth(false);
    onUserAuth(u);
    if (authCb) {
      authCb(u);
      setAuthCb(null);
    }
  };

  const loggedUser = user;
  
  return (
    <>
      <div className="home" style={embedMode ? { paddingTop: 14, minHeight: "auto" } : undefined}>
        <div className="home-form">
          {embedMode && embedHeader}
          <div className="home-title">
            Book Your Studio Session
          </div>
          <div className="home-sub">
            <span>Reserve your recording, photography, or videography session in minutes.</span>
          </div>
          <BookingForm
            user={loggedUser}
            onNeedAuth={handleNeedAuth}
            services={services}
            staff={staff}
            bookings={bookings}
            busySlots={busySlots} // Passed down for correct global slot disabling
            onCreateBooking={onCreateBooking}
            onGoDash={onGoDash}
          />
        </div>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuth} />}
    </>
  );
}
