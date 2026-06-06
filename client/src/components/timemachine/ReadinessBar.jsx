import React, { useEffect, useState } from "react";

export default function ReadinessBar({ readinessScore = 0, gapSummary = "", recommendation = "" }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(readinessScore), 100);
    return () => clearTimeout(t);
  }, [readinessScore]);

  const color = readinessScore >= 70 ? "var(--green)" : readinessScore >= 40 ? "var(--amber)" : "var(--red)";

  return (
    <div className="card" style={{ marginBottom: "24px" }}>
      <span className="section-label" style={{ display: "block", marginBottom: "16px" }}>
        Readiness Score
      </span>

      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "16px" }}>
        <span
          style={{
            fontFamily: "var(--font)",
            fontSize: "48px",
            fontWeight: "500",
            color,
            lineHeight: 1
          }}
        >
          {readinessScore}%
        </span>
        <span style={{ fontFamily: "var(--font)", fontSize: "14px", color: "var(--text-tertiary)" }}>
          ready
        </span>
      </div>

      <div className="progress-track" style={{ height: "8px", marginBottom: "12px" }}>
        <div
          style={{
            height: "100%",
            width: `${animated}%`,
            background: color,
            borderRadius: "4px",
            transition: "width 0.8s ease"
          }}
        />
      </div>

      {gapSummary && (
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
          {gapSummary}
        </p>
      )}

      {recommendation && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            background: "var(--green-bg)",
            borderLeft: "3px solid var(--green)",
            borderRadius: "0 var(--radius) var(--radius) 0"
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontFamily: "var(--font)",
              color: "var(--green)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              display: "block",
              marginBottom: "4px"
            }}
          >
            Next Step
          </span>
          <p style={{ fontSize: "13px", color: "var(--text-primary)" }}>{recommendation}</p>
        </div>
      )}
    </div>
  );
}
