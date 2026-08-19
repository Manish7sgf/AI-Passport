import React, { useState } from "react";
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

export default function Topbar({
  collapsed = false,
  onToggleCollapse,
  onOpenMobile
}) {
  const location = useLocation();
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const title = pageTitles[location.pathname] || "AI Future Passport";

  const shareUrl = user?.github_username
    ? `${window.location.origin}/passport/${user.github_username}`
    : null;

  const copyShare = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <header
      style={{
        height: "var(--topbar-height)",
        background: "var(--bg)",
        borderBottom: "0.5px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 30,
        gap: "12px"
      }}
    >
      {/* Left side: Mobile menu toggle & Page Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Mobile Hamburger Button */}
        <button
          className="mobile-only"
          onClick={onOpenMobile}
          aria-label="Open Navigation"
          style={{
            background: "none",
            border: "0.5px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "6px 8px",
            cursor: "pointer",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <HamburgerIcon size={16} />
        </button>

        <span
          style={{
            fontFamily: "var(--font)",
            fontSize: "14px",
            fontWeight: "600",
            color: "var(--text-primary)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {title}
        </span>
      </div>

      {/* Right side actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Share button */}
        {shareUrl && (
          <button
            id="share-btn"
            onClick={copyShare}
            style={{
              fontSize: "12px",
              fontFamily: "var(--font-body)",
              color: copied ? "var(--green)" : "var(--text-secondary)",
              background: copied ? "var(--green-bg)" : "none",
              border: `0.5px solid ${copied ? "var(--green)" : "var(--border)"}`,
              borderRadius: "var(--radius)",
              padding: "6px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              transition: "all 0.15s ease"
            }}
          >
            {copied ? (
              <>
                <CheckIcon size={12} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <ShareIcon size={12} />
                <span className="desktop-only">Share</span>
              </>
            )}
          </button>
        )}

        {/* Public passport link (Desktop only to save mobile header space) */}
        {shareUrl && (
          <Link
            to={`/passport/${user.github_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="desktop-only"
            style={{
              fontSize: "12px",
              fontFamily: "var(--font-body)",
              color: "var(--text-secondary)",
              border: "0.5px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "6px 12px",
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "border-color 0.15s, color 0.15s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-strong)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            View public ↗
          </Link>
        )}

        <NotificationBell />
      </div>
    </header>
  );
}

function HamburgerIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
      <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
      <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
    </svg>
  );
}

function ShareIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function CheckIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

