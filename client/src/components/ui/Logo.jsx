import React from "react";

export function LogoIcon({ size = 32, className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id={`shieldGrad-${size}`} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5B738" />
          <stop offset="50%" stopColor="#E08E1A" />
          <stop offset="100%" stopColor="#8C4E03" />
        </linearGradient>
        <linearGradient id={`chipGrad-${size}`} x1="14" y1="14" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1C1A17" />
          <stop offset="100%" stopColor="#2A2621" />
        </linearGradient>
        <linearGradient id={`neonGlow-${size}`} x1="16" y1="16" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Main Biometric Shield */}
      <path
        d="M24 4L39 9.5V22C39 31.8 32.6 40.8 24 44C15.4 40.8 9 31.8 9 22V9.5L24 4Z"
        fill="#141311"
        stroke={`url(#shieldGrad-${size})`}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Hologram Inner Border */}
      <path
        d="M24 8.5L35.5 12.8V22C35.5 29.8 30.5 37 24 39.8C17.5 37 12.5 29.8 12.5 22V12.8L24 8.5Z"
        stroke="#F5B738"
        strokeOpacity="0.4"
        strokeWidth="1"
        strokeLinejoin="round"
        strokeDasharray="2 2"
      />

      {/* Center Passport Neural Chip */}
      <rect
        x="18"
        y="18"
        width="12"
        height="12"
        rx="2.5"
        fill={`url(#chipGrad-${size})`}
        stroke={`url(#neonGlow-${size})`}
        strokeWidth="1.5"
      />

      {/* Neural Hub Center Node */}
      <circle cx="24" cy="24" r="2" fill="#FDE68A" />
      <line x1="24" y1="18" x2="24" y2="22" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="24" y1="26" x2="24" y2="30" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="18" y1="24" x2="22" y2="24" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="26" y1="24" x2="30" y2="24" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />

      {/* Upper Neural Nodes */}
      <circle cx="24" cy="13" r="1.5" fill="#FDE68A" />
      <circle cx="18" cy="15" r="1.2" fill="#F5B738" />
      <circle cx="30" cy="15" r="1.2" fill="#F5B738" />
      <line x1="18" y1="15" x2="24" y2="13" stroke="#F5B738" strokeWidth="1" strokeOpacity="0.8" />
      <line x1="30" y1="15" x2="24" y2="13" stroke="#F5B738" strokeWidth="1" strokeOpacity="0.8" />
      <line x1="24" y1="13" x2="24" y2="18" stroke="#F5B738" strokeWidth="1" strokeOpacity="0.8" />

      {/* Base Biometric Arcs */}
      <path d="M21 34C21 32.5 22.3 31.5 24 31.5C25.7 31.5 27 32.5 27 34" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M19 36C19 33.5 21.2 32.5 24 32.5C26.8 32.5 29 33.5 29 36" stroke="#FDE68A" strokeOpacity="0.5" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({
  size = 32,
  showText = true,
  theme = "auto", // "auto" | "light" | "dark"
  className = "",
  style = {}
}) {
  const textColor = theme === "dark" ? "var(--accent-text)" : "var(--text-primary)";
  const subtextColor = theme === "dark" ? "rgba(245,244,240,0.5)" : "var(--text-tertiary)";

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size > 28 ? "10px" : "8px",
        userSelect: "none",
        ...style
      }}
    >
      <LogoIcon size={size} />
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span
            style={{
              fontFamily: "var(--font)",
              fontSize: size > 32 ? "18px" : "15px",
              fontWeight: "600",
              color: textColor,
              letterSpacing: "-0.02em"
            }}
          >
            AI Passport
          </span>
          <span
            style={{
              fontFamily: "var(--font)",
              fontSize: "9px",
              fontWeight: "500",
              color: subtextColor,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginTop: "2px"
            }}
          >
            Future Passport
          </span>
        </div>
      )}
    </div>
  );
}
