import { useState } from "react";

/**
 * Shared modal component to display complete staff information.
 */
export default function StaffDetailsModal({ member, onClose }) {
  const [imgErr, setImgErr] = useState(false);
  const hasImage = member.profileImage && !imgErr;

  return (
    <div className="mov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420, textAlign: "center" }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 11,
            right: 11,
            background: "none",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
            fontSize: 19,
            width: 32,
            height: 32,
            borderRadius: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        {/* Profile image */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            overflow: "hidden",
            background: `linear-gradient(135deg,${member.c || "#E63946"},rgba(0,0,0,.35))`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            fontWeight: 800,
            margin: "0 auto 14px",
            border: "3px solid rgba(255,255,255,.08)",
            boxShadow: "0 6px 24px rgba(0,0,0,.35)",
          }}
        >
          {hasImage ? (
            <img
              src={member.profileImage}
              alt={member.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={() => setImgErr(true)}
            />
          ) : (
            member.i || member.name?.[0] || "?"
          )}
        </div>

        {/* Name & Designation */}
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 3, letterSpacing: "-.02em" }}>
          {member.name}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>{member.role}</div>

        {/* Stats row */}
        {(member.experience || member.totalWorkDone > 0) && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 18,
              background: "var(--glass)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "12px 18px",
              marginBottom: 14,
            }}
          >
            {member.experience && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: "var(--red)" }}>
                  {member.experience}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Experience</div>
              </div>
            )}
            {member.experience && member.totalWorkDone > 0 && (
              <div style={{ width: 1, background: "var(--border)", alignSelf: "stretch" }} />
            )}
            {member.totalWorkDone > 0 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: "var(--red)" }}>
                  {member.totalWorkDone}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  Projects Completed
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rate info */}
        {member.hourlyRate > 0 && (
          <div
            style={{
              padding: "10px 18px",
              background: "rgba(230,57,70,0.08)",
              border: "1px solid var(--border-red)",
              borderRadius: 12,
              marginBottom: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", letterSpacing: ".05em" }}>RATE (2 HOURS)</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>${member.hourlyRate * 2} / 2 Hours</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "var(--muted2)", fontWeight: 700 }}>MIN. BOOKING</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>2 Hours (${member.hourlyRate * 2})</div>
            </div>
          </div>
        )}

        {/* Bio */}
        {member.bio && (
          <div
            style={{
              background: "var(--glass)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 13,
              color: "var(--muted)",
              lineHeight: 1.7,
              textAlign: "left",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--muted2)",
                letterSpacing: ".06em",
                marginBottom: 6,
              }}
            >
              BIO
            </div>
            {member.bio}
          </div>
        )}

        <button className="btn btn-g" style={{ width: "100%" }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
