import React, { useState, useEffect } from "react";
import useUserStore from "../store/userStore";
import { useSkillRadar } from "../hooks/useAI";
import SkillRadarComponent from "../components/radar/SkillRadar";
import GapBar from "../components/radar/GapBar";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

export default function SkillRadarPage() {
  const { passport } = useUserStore();
  const { result, isLoading, error, analyse, loadLatest } = useSkillRadar();
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    const init = async () => {
      await loadLatest();
      if (passport?.skills?.length > 0) {
        setSkills(passport.skills);
      }
    };
    init();
  }, [passport?.skills]);

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      const s = skillInput.trim();
      if (!skills.includes(s)) setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const removeSkill = (s) => setSkills(skills.filter((x) => x !== s));

  const importFromPassport = () => {
    if (passport?.skills) setSkills([...passport.skills]);
  };

  const handleAnalyse = async () => {
    if (skills.length === 0) return;
    await analyse({ skills });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Input card */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <span className="section-label">Analyse Skill Gap</span>
          {passport?.skills?.length > 0 && (
            <Button variant="secondary" size="small" onClick={importFromPassport}>
              Import from passport
            </Button>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
          {skills.map((s) => (
            <span
              key={s}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 8px",
                background: "var(--bg-secondary)",
                border: "0.5px solid var(--border)",
                borderRadius: "4px",
                fontSize: "12px",
                color: "var(--text-secondary)"
              }}
            >
              {s}
              <button
                onClick={() => removeSkill(s)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", lineHeight: 1, padding: 0 }}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <input
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={addSkill}
          placeholder="Type a skill and press Enter to add"
          style={{
            width: "100%",
            padding: "8px 12px",
            background: "var(--surface)",
            border: "0.5px solid var(--border)",
            borderRadius: "var(--radius)",
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--text-primary)",
            outline: "none",
            marginBottom: "12px"
          }}
        />

        {skills.length === 0 && (
          <p style={{ fontSize: "12px", color: "var(--red)", marginBottom: "8px" }}>
            Please add at least one skill
          </p>
        )}

        <Button onClick={handleAnalyse} disabled={isLoading || skills.length === 0}>
          {isLoading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Spinner size={16} color="var(--accent-text)" />
              Analysing gap...
            </span>
          ) : (
            "Analyse gap →"
          )}
        </Button>
      </div>

      {/* Error */}
      {error && !isLoading && (
        <div
          style={{
            padding: "16px",
            background: "var(--red-bg)",
            border: "0.5px solid var(--red)",
            borderRadius: "var(--radius-lg)",
            fontSize: "13px",
            color: "var(--red)"
          }}
        >
          {error}
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <>
          {/* Gap score */}
          <GapBar gapPercentage={result.gap_percentage ?? 0} />

          {/* Skill comparison */}
          <SkillRadarComponent
            currentSkills={result.current_skills || []}
            futureSkills={result.future_demanded_skills || []}
          />

          {/* Missing critical skills */}
          {result.missing_critical?.length > 0 && (
            <div
              className="card"
              style={{ background: "var(--red-bg)", border: "0.5px solid var(--red)" }}
            >
              <span className="section-label" style={{ display: "block", marginBottom: "12px", color: "var(--red)" }}>
                Critical Gaps
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {result.missing_critical.map((skill) => (
                  <Badge key={skill} variant="red">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="card">
              <span className="section-label" style={{ display: "block", marginBottom: "16px" }}>
                Recommendations
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {result.recommendations.map((rec, i) => {
                  const impactVariant =
                    rec.impact === "high" ? "red" : rec.impact === "medium" ? "amber" : "green";
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        padding: "12px",
                        background: "var(--bg-secondary)",
                        borderRadius: "var(--radius)",
                        gap: "12px"
                      }}
                    >
                      <span style={{ fontSize: "13px", color: "var(--text-primary)", flex: 1 }}>
                        {rec.action}
                      </span>
                      <Badge variant={impactVariant}>{rec.impact?.toUpperCase()}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
