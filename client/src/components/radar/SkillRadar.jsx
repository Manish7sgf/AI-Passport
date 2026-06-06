import React from "react";

export default function SkillRadar({ currentSkills = [], futureSkills = [] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      {/* Current skills */}
      <div className="card">
        <span className="section-label" style={{ display: "block", marginBottom: "16px" }}>
          What You Have
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {currentSkills.map((skill) => {
            const relevance = skill.relevance_2030 || 0;
            const color = relevance >= 60 ? "var(--green)" : relevance >= 30 ? "var(--amber)" : "var(--red)";
            return (
              <div key={skill.name}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                    fontSize: "13px"
                  }}
                >
                  <span style={{ color: "var(--text-primary)" }}>{skill.name}</span>
                  <span style={{ color, fontFamily: "var(--font)", fontSize: "12px" }}>
                    {relevance}%
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${relevance}%`, background: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Future skills */}
      <div className="card">
        <span className="section-label" style={{ display: "block", marginBottom: "16px" }}>
          What 2030 Needs
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {futureSkills.map((skill) => {
            const demand = skill.demand_score || 0;
            const categoryColors = {
              technical: "var(--text-primary)",
              human: "var(--green)",
              "ai-collaboration": "var(--amber)"
            };
            return (
              <div key={skill.name}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px"
                  }}
                >
                  <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{skill.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        background: "var(--bg-secondary)",
                        border: "0.5px solid var(--border)",
                        borderRadius: "3px",
                        color: categoryColors[skill.category] || "var(--text-tertiary)",
                        fontFamily: "var(--font-body)"
                      }}
                    >
                      {skill.category}
                    </span>
                    <span style={{ fontFamily: "var(--font)", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {demand}%
                    </span>
                  </div>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${demand}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
