import React from "react";

const variantStyles = {
  default: {
    background: "var(--bg-secondary)",
    border: "0.5px solid var(--border)",
    color: "var(--text-secondary)"
  },
  green: {
    background: "var(--green-bg)",
    border: "0.5px solid var(--green)",
    color: "var(--green)"
  },
  amber: {
    background: "var(--amber-bg)",
    border: "0.5px solid var(--amber)",
    color: "var(--amber)"
  },
  red: {
    background: "var(--red-bg)",
    border: "0.5px solid var(--red)",
    color: "var(--red)"
  },
  dark: {
    background: "var(--accent)",
    border: "0.5px solid var(--accent)",
    color: "var(--accent-text)"
  }
};

export default function Badge({ children, variant = "default", style = {} }) {
  const variantStyle = variantStyles[variant] || variantStyles.default;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "4px",
        fontSize: "11px",
        fontFamily: "var(--font-body)",
        fontWeight: "500",
        letterSpacing: "0.02em",
        ...variantStyle,
        ...style
      }}
    >
      {children}
    </span>
  );
}
