import React from "react";

/**
 * Concept A: Sovereign Quantum Crest
 * - Isometric double-beveled gold security shield
 * - Concentric 2030 Skill Radar wave arcs
 * - Central AI neural microprocessor chip
 * - Converging proof-of-work baseline chevrons
 */
export function LogoIcon({ size = 32, className = "", style = {} }) {
  const idPrefix = `crest-${size}-${Math.random().toString(36).substr(2, 4)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        filter: "drop-shadow(0 2px 8px rgba(245, 158, 11, 0.12))",
        ...style
      }}
    >
      <defs>
        {/* Outer Gold Gradient */}
        <linearGradient id={`${idPrefix}-gold`} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Shield Obsidian Background */}
        <linearGradient id={`${idPrefix}-bg`} x1="32" y1="6" x2="32" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1A1815" />
          <stop offset="100%" stopColor="#0E0D0C" />
        </linearGradient>

        {/* Microchip Core Fill */}
        <linearGradient id={`${idPrefix}-chip`} x1="22" y1="22" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#26231E" />
          <stop offset="100%" stopColor="#141311" />
        </linearGradient>

        {/* Microchip Glow Border */}
        <linearGradient id={`${idPrefix}-glow`} x1="20" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* 1. Outer Faceted Security Shield */}
      <path
        d="M32 4L54 12V30C54 44.5 44.5 56.5 32 60C19.5 56.5 10 44.5 10 30V12L32 4Z"
        fill={`url(#${idPrefix}-bg)`}
        stroke={`url(#${idPrefix}-gold)`}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* 2. Chiseled Inner Holographic Edge */}
      <path
        d="M32 9L49 15.5V29C49 41.5 41 51.8 32 55C23 51.8 15 41.5 15 29V15.5L32 9Z"
        stroke={`url(#${idPrefix}-gold)`}
        strokeWidth="1.2"
        strokeOpacity="0.45"
        strokeLinejoin="round"
      />

      {/* 3. Skill Radar Concentric Arc Waves */}
      <path
        d="M18 29C18 21.268 24.268 15 32 15C39.732 15 46 21.268 46 29"
        stroke="#F59E0B"
        strokeWidth="1.2"
        strokeOpacity="0.35"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />
      <path
        d="M21.5 29C21.5 23.201 26.201 18.5 32 18.5C37.799 18.5 42.5 23.201 42.5 29"
        stroke="#FCD34D"
        strokeWidth="1.4"
        strokeOpacity="0.65"
        strokeLinecap="round"
      />
      <path
        d="M25 29C25 25.134 28.134 22 32 22C35.866 22 39 25.134 39 29"
        stroke="#FDE68A"
        strokeWidth="1.5"
        strokeOpacity="0.85"
        strokeLinecap="round"
      />

      {/* 4. Central Microprocessor Core */}
      {/* Chip Pins */}
      <line x1="32" y1="21" x2="32" y2="25" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="21" x2="28" y2="25" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="36" y1="21" x2="36" y2="25" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />

      <line x1="32" y1="39" x2="32" y2="43" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="39" x2="28" y2="43" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="36" y1="39" x2="36" y2="43" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />

      <line x1="21" y1="32" x2="25" y2="32" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="21" y1="28" x2="25" y2="28" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="21" y1="36" x2="25" y2="36" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />

      <line x1="39" y1="32" x2="43" y2="32" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="39" y1="28" x2="43" y2="28" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="39" y1="36" x2="43" y2="36" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />

      {/* Chip Body */}
      <rect
        x="24"
        y="24"
        width="16"
        height="16"
        rx="3"
        fill={`url(#${idPrefix}-chip)`}
        stroke={`url(#${idPrefix}-glow)`}
        strokeWidth="1.6"
      />

      {/* Silicon Logic Grid */}
      <rect x="27.5" y="27.5" width="9" height="9" rx="1.5" stroke="#FCD34D" strokeWidth="1" strokeOpacity="0.8" fill="#1A1815" />
      <circle cx="32" cy="32" r="1.6" fill="#FDE68A" />

      {/* 5. Base Converging Proof-of-Work Lines */}
      <path d="M22 47L32 52L42 47" stroke={`url(#${idPrefix}-gold)`} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 44L32 47L38 44" stroke={`url(#${idPrefix}-gold)`} strokeWidth="1" strokeOpacity="0.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({
  size = 34,
  showText = true,
  theme = "auto", // "auto" | "light" | "dark"
  className = "",
  style = {}
}) {
  const isDark = theme === "dark";
  const textColor = isDark ? "var(--accent-text)" : "var(--text-primary)";
  const subtextColor = isDark ? "rgba(245,244,240,0.6)" : "var(--text-tertiary)";

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size > 28 ? "11px" : "8px",
        userSelect: "none",
        ...style
      }}
    >
      <LogoIcon size={size} />
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
          <span
            style={{
              fontFamily: "var(--font)",
              fontSize: size > 32 ? "16px" : "14.5px",
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
              fontSize: "8.5px",
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
