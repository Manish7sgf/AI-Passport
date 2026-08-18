import React, { useState } from "react";

export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  fullWidth = false,
  style = {}
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: fullWidth ? "100%" : "auto" }}>
      {label && (
        <label
          style={{
            fontFamily: "var(--font)",
            fontSize: "11px",
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--text-tertiary)"
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: "var(--surface)",
          border: `0.5px solid ${error ? "var(--red)" : focused ? "var(--accent)" : "var(--border)"}`,
          borderRadius: "var(--radius)",
          padding: "10px 14px",
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: "var(--text-primary)",
          outline: "none",
          width: fullWidth ? "100%" : "auto",
          transition: "border-color 0.15s",
          opacity: disabled ? 0.6 : 1,
          ...style
        }}
      />
      {error && (
        <span style={{ fontSize: "12px", color: "var(--red)", fontFamily: "var(--font-body)" }}>
          {error}
        </span>
      )}
    </div>
  );
}
