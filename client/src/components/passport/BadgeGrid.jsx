import React from "react";

export default function BadgeGrid({ skills = [], interests = [] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {skills.length > 0 && (
        <div>
          <div
            style={{
              fontFamily: "var(--font)",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-tertiary)",
              marginBottom: "8px"
            }}
          >
            Skills
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {skills.map((skill) => (
              <SkillTag key={skill}>{skill}</SkillTag>
            ))}
          </div>
        </div>
      )}

      {interests.length > 0 && (
        <div>
          <div
            style={{
              fontFamily: "var(--font)",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-tertiary)",
              marginBottom: "8px"
            }}
          >
            Interests
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {interests.map((interest) => (
              <SkillTag key={interest} variant="interest">{interest}</SkillTag>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SkillTag({ children, variant = "skill" }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        background: variant === "interest" ? "var(--bg)" : "var(--bg-secondary)",
        border: "0.5px solid var(--border)",
        borderRadius: "4px",
        fontSize: "12px",
        fontFamily: "var(--font-body)",
        color: "var(--text-secondary)"
      }}
    >
      {children}
    </span>
  );
}
