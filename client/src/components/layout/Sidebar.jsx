import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useUserStore from "../../store/userStore";
import { getScoreColor } from "../../utils/scoreCalc";
import { getInitials } from "../../utils/formatters";

const navItems = [
  { to: "/dashboard", label: "Passport", icon: PassportIcon },
  { to: "/timemachine", label: "Career Time Machine", icon: TimeMachineIcon },
  { to: "/radar", label: "Skill Radar", icon: RadarIcon },
  { to: "/portfolio", label: "Portfolio", icon: PortfolioIcon },
  { to: "/profile", label: "Profile", icon: ProfileIcon }
];

export default function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile
}) {
  const { user, logout } = useAuthStore();
  const { passport } = useUserStore();
  const navigate = useNavigate();

  const score = passport?.employability_score ?? 0;
  const scoreColor = getScoreColor(score);

  const handleLogout = () => {
    logout();
    navigate("/auth");
    if (onCloseMobile) onCloseMobile();
  };

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      style={{
        width: collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
        minHeight: "100vh",
        height: "100vh",
        background: "var(--bg)",
        borderRight: "0.5px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 50,
        transition: "width 0.25s ease, transform 0.25s ease"
      }}
      className={`app-sidebar ${mobileOpen ? "sidebar-mobile-open" : ""}`}
    >
      {/* Brand & Close */}
      <div
        style={{
          padding: collapsed ? "16px 8px" : "16px 18px",
          borderBottom: "0.5px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          height: "var(--topbar-height)"
        }}
      >
        <NavLink
          to="/dashboard"
          onClick={handleNavClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none"
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "6px",
              background: "var(--text-primary)",
              color: "var(--accent-text)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font)",
              fontSize: "12px",
              fontWeight: "600",
              flexShrink: 0
            }}
          >
            FP
          </div>
          {!collapsed && (
            <span
              style={{
                fontFamily: "var(--font)",
                fontSize: "15px",
                fontWeight: "600",
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap"
              }}
            >
              AI Passport
            </span>
          )}
        </NavLink>

        {/* Mobile close button */}
        <button
          className="mobile-only"
          onClick={onCloseMobile}
          aria-label="Close Navigation"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-secondary)",
            padding: "6px",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* User Info Header */}
      <div
        style={{
          padding: collapsed ? "16px 8px" : "16px 18px",
          borderBottom: "0.5px solid var(--border)",
          transition: "padding 0.25s ease"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            justifyContent: collapsed ? "center" : "flex-start"
          }}
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name || "Avatar"}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "0.5px solid var(--border)",
                flexShrink: 0,
                objectFit: "cover"
              }}
            />
          ) : (
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "var(--bg-secondary)",
                border: "0.5px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font)",
                fontSize: "12px",
                fontWeight: "500",
                color: "var(--text-secondary)",
                flexShrink: 0
              }}
            >
              {getInitials(user?.name || user?.email || "U")}
            </div>
          )}

          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {user?.name || "Student"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-tertiary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {user?.github_username ? `@${user.github_username}` : user?.email || ""}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav List */}
      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto", overflowX: "hidden" }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <div key={to} style={{ position: "relative" }} className={collapsed ? "sidebar-item-collapsed" : ""}>
            <NavLink
              to={to}
              onClick={handleNavClick}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: collapsed ? "0" : "12px",
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "12px 0" : "11px 18px",
                fontSize: "13px",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                background: isActive ? "var(--bg-secondary)" : "transparent",
                borderRight: isActive && !collapsed ? "2px solid var(--accent)" : "2px solid transparent",
                borderLeft: isActive && collapsed ? "2px solid var(--accent)" : "2px solid transparent",
                transition: "background 0.15s, color 0.15s",
                textDecoration: "none",
                fontFamily: "var(--font-body)",
                fontWeight: isActive ? "500" : "400"
              })}
            >
              <Icon size={18} />
              {!collapsed && (
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {label}
                </span>
              )}
            </NavLink>
            {collapsed && <span className="sidebar-tooltip">{label}</span>}
          </div>
        ))}
      </nav>

      {/* Bottom section: Score & Sign Out */}
      <div
        style={{
          padding: collapsed ? "14px 8px" : "16px 18px",
          borderTop: "0.5px solid var(--border)",
          background: "var(--bg)"
        }}
      >
        {!collapsed ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px"
              }}
            >
              <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font)", letterSpacing: "0.08em" }}>
                SCORE
              </span>
              <span
                style={{
                  fontFamily: "var(--font)",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: scoreColor,
                  background: "var(--bg-secondary)",
                  border: `0.5px solid ${scoreColor}`,
                  borderRadius: "4px",
                  padding: "2px 8px"
                }}
              >
                {score} / 100
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "8px",
                background: "transparent",
                border: "0.5px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: "12px",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "border-color 0.15s, color 0.15s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--red)";
                e.currentTarget.style.color = "var(--red)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <SignOutIcon size={14} />
              Sign out
            </button>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <div
              title={`Employability Score: ${score}/100`}
              style={{
                fontFamily: "var(--font)",
                fontSize: "12px",
                fontWeight: "600",
                color: scoreColor,
                background: "var(--bg-secondary)",
                border: `0.5px solid ${scoreColor}`,
                borderRadius: "4px",
                padding: "4px 6px",
                textAlign: "center",
                width: "100%"
              }}
            >
              {score}
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{
                width: 36,
                height: 36,
                background: "none",
                border: "0.5px solid var(--border)",
                borderRadius: "var(--radius)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--red)";
                e.currentTarget.style.color = "var(--red)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <SignOutIcon size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function PassportIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function TimeMachineIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 4.5V8l2.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function RadarIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 8L12 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function PortfolioIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1 8h14" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ProfileIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.5 14c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SignOutIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
