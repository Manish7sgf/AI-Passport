import React, { useState, useRef, useEffect } from "react";
import useNotificationStore from "../../store/notificationStore";

const typeColors = {
  success: "var(--green)",
  warning: "var(--amber)",
  error:   "var(--red)",
  info:    "var(--text-secondary)"
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, markRead, dismiss, markAllRead } = useNotificationStore();
  const unread = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "none", border: "0.5px solid var(--border)", borderRadius: "var(--radius)",
          padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center",
          gap: "6px", color: "var(--text-secondary)", position: "relative"
        }}
      >
        <BellIcon />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: "-4px", right: "-4px",
            background: "var(--red)", color: "#fff",
            borderRadius: "50%", width: "16px", height: "16px",
            fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font)"
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: "320px", background: "var(--surface)",
          border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)", zIndex: 100
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px", borderBottom: "0.5px solid var(--border)"
          }}>
            <span style={{ fontFamily: "var(--font)", fontSize: "12px", fontWeight: "500" }}>
              Notifications {unread > 0 && `(${unread})`}
            </span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-body)"
              }}>
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", fontSize: "12px", color: "var(--text-tertiary)" }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  style={{
                    padding: "12px 16px",
                    background: n.read ? "transparent" : "var(--bg-secondary)",
                    borderBottom: "0.5px solid var(--border)",
                    cursor: "pointer",
                    display: "flex", gap: "10px", alignItems: "flex-start"
                  }}
                >
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: typeColors[n.type], marginTop: "5px", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "12px", color: "var(--text-primary)", lineHeight: "1.5", margin: 0 }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: "14px", padding: 0 }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
