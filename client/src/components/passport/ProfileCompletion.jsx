import React from "react";

const STEPS = [
  { key: "bio",        label: "Add a bio",             check: (p) => !!p?.bio?.trim() },
  { key: "skills",     label: "Add at least 3 skills", check: (p) => (p?.skills?.length || 0) >= 3 },
  { key: "interests",  label: "Add interests",         check: (p) => (p?.interests?.length || 0) >= 1 },
  { key: "projects",   label: "Add a project",         check: (p, port) => (port?.length || 0) >= 1 },
  { key: "hackathons", label: "Log a hackathon",       check: (p) => (p?.hackathons || 0) >= 1 },
];

export function calcCompletion(passport, portfolio) {
  const done = STEPS.filter((s) => s.check(passport, portfolio)).length;
  return Math.round((done / STEPS.length) * 100);
}

export default function ProfileCompletion({ passport, portfolio, onEdit }) {
  const pct     = calcCompletion(passport, portfolio);
  const pending = STEPS.filter((s) => !s.check(passport, portfolio));
  if (pct === 100) return null; // hide when complete

  const color = pct >= 60 ? "var(--green)" : pct >= 30 ? "var(--amber)" : "var(--red)";

  return (
    <div
      className="card"
      style={{ borderLeft: `3px solid ${color}`, borderRadius: "0 var(--radius-lg) var(--radius-lg) 0" }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div>
          <span className="section-label">Profile Completion</span>
          <span
            style={{
              fontFamily: "var(--font)",
              fontSize: "22px",
              fontWeight: "500",
              color,
              marginLeft: "12px"
            }}
          >
            {pct}%
          </span>
        </div>
        <button
          onClick={onEdit}
          style={{
            fontSize: "12px",
            color: "var(--text-secondary)",
            background: "none",
            border: "0.5px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "4px 10px",
            cursor: "pointer",
            fontFamily: "var(--font-body)"
          }}
        >
          Complete profile →
        </button>
      </div>

      {/* Progress bar */}
      <div className="progress-track" style={{ marginBottom: "14px" }}>
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: color, transition: "width 0.6s ease" }}
        />
      </div>

      {/* Pending steps */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {pending.map((step) => (
          <span
            key={step.key}
            style={{
              padding: "3px 10px",
              background: "var(--bg-secondary)",
              border: "0.5px solid var(--border)",
              borderRadius: "4px",
              fontSize: "11px",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)"
            }}
          >
            + {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
