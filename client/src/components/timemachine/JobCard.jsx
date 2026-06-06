import React from "react";
import Badge from "../ui/Badge";

export default function JobCard({ job, index = 0 }) {
  const fitScore = job.fit_score || 0;
  const variant = fitScore >= 70 ? "green" : fitScore >= 40 ? "amber" : "red";

  return (
    <div
      className="card fade-in"
      style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px"
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font)",
            fontSize: "15px",
            fontWeight: "500",
            color: "var(--text-primary)",
            lineHeight: 1.3
          }}
        >
          {job.title}
        </h3>
        <Badge variant="default" style={{ marginLeft: "8px", flexShrink: 0 }}>
          {job.year_emerging}
        </Badge>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: "13px",
          color: "var(--text-secondary)",
          lineHeight: "1.6",
          marginBottom: "14px"
        }}
      >
        {job.description}
      </p>

      {/* Skills */}
      <div style={{ marginBottom: "14px" }}>
        {job.skills_you_have?.length > 0 && (
          <div style={{ marginBottom: "6px" }}>
            <span
              style={{
                fontSize: "10px",
                fontFamily: "var(--font)",
                color: "var(--green)",
                textTransform: "uppercase",
                letterSpacing: "0.08em"
              }}
            >
              You have:{" "}
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              {job.skills_you_have.join(", ")}
            </span>
          </div>
        )}
        {job.skills_needed?.length > 0 && (
          <div>
            <span
              style={{
                fontSize: "10px",
                fontFamily: "var(--font)",
                color: "var(--amber)",
                textTransform: "uppercase",
                letterSpacing: "0.08em"
              }}
            >
              Also need:{" "}
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              {job.skills_needed.join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* Fit score */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font)" }}>
          FIT SCORE
        </span>
        <Badge variant={variant}>{fitScore}% match</Badge>
      </div>
    </div>
  );
}
