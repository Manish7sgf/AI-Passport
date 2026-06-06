import React from "react";

const styles = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    fontWeight: "500",
    padding: "10px 20px",
    borderRadius: "var(--radius)",
    border: "none",
    cursor: "pointer",
    transition: "opacity 0.15s, background 0.15s, border-color 0.15s",
    whiteSpace: "nowrap"
  },
  primary: {
    background: "var(--accent)",
    color: "var(--accent-text)"
  },
  secondary: {
    background: "transparent",
    color: "var(--text-primary)",
    border: "0.5px solid var(--border-strong)"
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "none",
    padding: "6px 10px"
  },
  danger: {
    background: "var(--red-bg)",
    color: "var(--red)",
    border: "0.5px solid var(--red)"
  },
  fullWidth: {
    width: "100%"
  },
  disabled: {
    opacity: 0.5,
    cursor: "not-allowed"
  },
  small: {
    fontSize: "12px",
    padding: "6px 14px"
  }
};

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  size = "default",
  onClick,
  type = "button",
  style = {}
}) {
  const variantStyle = styles[variant] || styles.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.base,
        ...variantStyle,
        ...(fullWidth ? styles.fullWidth : {}),
        ...(disabled ? styles.disabled : {}),
        ...(size === "small" ? styles.small : {}),
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "0.85";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
}
