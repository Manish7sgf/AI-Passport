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
  { to: "/portfolio", label: "Portfolio", icon: PortfolioIcon }
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { passport } = useUserStore();
  const navigate = useNavigate();

  const score = passport?.employability_score ?? 0;
  const scoreColor = getScoreColor(score);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        minHeight: "100vh",
        background: "var(--bg)",
        borderRight: "0.5px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: "0.5px solid var(--border)"
        }}
      >
        <span
          style={{
            fontFamily: "var(--font)",
            fontSize: "18px",
            fontWeight: "500",
            color: "var(--text-primary)",
            letterSpacing: "-0.02em"
          }}
        >
          AFP
        </span>
      </div>

      {/* User info */}
      <div style={{ padding: "20px", borderBottom: "0.5px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              style={{ width: 32, height: 32, borderRadius: "50%", border: "0.5px solid var(--border)" }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--bg-secondary)",
                border: "0.5px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font)",
                fontSize: "11px",
                fontWeight: "500",
                color: "var(--text-secondary)"
              }}
            >
              {getInitials(user?.name || "")}
            </div>
          )}
          <div>
            <div style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)" }}>
              {user?.name || "User"}
            </div>
            {user?.github_username && (
              <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                @{user.github_username}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 0" }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 20px",
              fontSize: "13px",
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              background: isActive ? "var(--bg-secondary)" : "transparent",
              borderRight: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              transition: "background 0.15s, color 0.15s",
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              fontWeight: isActive ? "500" : "400"
            })}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Score pill + logout */}
      <div style={{ padding: "16px 20px", borderTop: "0.5px solid var(--border)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px"
          }}
        >
          <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font)" }}>
            SCORE
          </span>
          <span
            style={{
              fontFamily: "var(--font)",
              fontSize: "13px",
              fontWeight: "500",
              color: scoreColor,
              background: "var(--bg-secondary)",
              border: `0.5px solid ${scoreColor}`,
              borderRadius: "4px",
              padding: "2px 8px"
            }}
          >
            {score}
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
            transition: "border-color 0.15s"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

// Icon components
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
