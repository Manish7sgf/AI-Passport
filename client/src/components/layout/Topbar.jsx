import React from "react";
import { useLocation, Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import NotificationBell from "./NotificationBell";

const pageTitles = {
  "/dashboard":   "Passport",
  "/timemachine": "Career Time Machine",
  "/radar":       "Skill Gap Radar",
  "/portfolio":   "Portfolio Generator",
  "/profile":     "Profile"
};

export default function Topbar() {
  const location = useLocation();
  const { user }  = useAuthStore();
  const title = pageTitles[location.pathname] || "AI Future Passport";

  // Share URL for the current user's public passport
  const shareUrl = user?.github_username
    ? `${window.location.origin}/passport/${user.github_username}`
    : null;

  const copyShare = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      // Brief visual feedback
      const el = document.getElementById("share-btn");
      if (el) { el.textContent = "Copied!"; setTimeout(() => { el.textContent = "Share"; }, 2000); }
    });
  };

  return (
    <header style={{
      height: "56px",
      background: "var(--bg)",
      borderBottom: "0.5px solid var(--border)",
      display: "flex",
      alignItems: "center",
      padding: "0 40px",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 10
    }}>
      <span style={{
        fontFamily: "var(--font)", fontSize: "13px", fontWeight: "500",
        color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.08em"
      }}>
        {title}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Share button */}
        {shareUrl && (
          <button
            id="share-btn"
            onClick={copyShare}
            style={{
              fontSize: "12px", fontFamily: "var(--font-body)",
              color: "var(--text-secondary)",
              background: "none", border: "0.5px solid var(--border)",
              borderRadius: "var(--radius)", padding: "6px 12px", cursor: "pointer"
            }}
          >
            Share
          </button>
        )}

        {/* Public passport link */}
        {shareUrl && (
          <Link
            to={`/passport/${user.github_username}`}
            target="_blank"
            style={{
              fontSize: "12px", fontFamily: "var(--font-body)",
              color: "var(--text-secondary)",
              border: "0.5px solid var(--border)",
              borderRadius: "var(--radius)", padding: "6px 12px",
              textDecoration: "none"
            }}
          >
            View public →
          </Link>
        )}

        <NotificationBell />
      </div>
    </header>
  );
}
