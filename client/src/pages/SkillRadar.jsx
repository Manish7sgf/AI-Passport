import React, { useState, useEffect, useRef } from "react";
import useUserStore from "../store/userStore";
import useNotificationStore from "../store/notificationStore";
import { useSkillRadar } from "../hooks/useAI";
import SkillRadarComponent from "../components/radar/SkillRadar";
import SpiderChart from "../components/radar/SpiderChart";
import GapBar from "../components/radar/GapBar";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

export default function SkillRadarPage() {
  const { passport } = useUserStore();
  const { add, checkGapChange } = useNotificationStore();
  const { result, isLoading, error, analyse, loadLatest } = useSkillRadar();
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const prevGap = useRef(null);

  useEffect(() => {
    const init = async () => {
      await loadLatest();
      if (passport?.skills?.length > 0 && skills.length === 0) {
        setSkills(passport.skills);
      }
    };
    init();
  }, [passport?.skills]);

  // Notify on gap change
  useEffect(() => {
    if (result?.gap_percentage !== undefined) {
      checkGapChange(prevGap.current, result.gap_percentage);
      prevGap.current = result.gap_percentage;
    }
  }, [result?.gap_percentage]);

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
          <span className="section-label">2030 Skill Gap Radar Analysis</span>
          {passport?.skills?.length > 0 && (
            <Button variant="secondary" size="small" onClick={importFromPassport}>
              Import from passport
            </Button>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
          {skills.map((s) => (
            <span
              key={s}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 8px",
                background: "var(--bg-secondary)",
                border: "0.5px solid var(--border)",
                borderRadius: "4px",
                fontSize: "12px",
                color: "var(--text-primary)"
              }}
            >
              {s}
              <button
                type="button"
                onClick={() => removeSkill(s)}
                aria-label={`Remove ${s}`}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", lineHeight: 1, padding: 0, fontSize: "14px" }}
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
          placeholder="Type a skill (e.g. Python, Docker, AI Agents) and press Enter"
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
            Please add at least one skill to analyse.
          </p>
        )}

        <Button onClick={handleAnalyse} disabled={isLoading || skills.length === 0}>
          {isLoading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Spinner size={16} color="var(--accent-text)" />
              Analysing 2030 skill gaps with AI...
            </span>
          ) : (
            "Analyse 2030 skill gap →"
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

          {/* Spider chart */}
          {result.current_skills?.length >= 3 && (
            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span className="section-label" style={{ display: "block", marginBottom: "16px", alignSelf: "flex-start" }}>
                Skills Radar
              </span>
              <SpiderChart
                size={300}
                current={result.current_skills.slice(0, 8).map((s) => ({
                  name: s.name,
                  value: s.relevance_2030 ?? 0
                }))}
                future={result.future_demanded_skills?.slice(0, 8).map((s) => ({
                  name: s.name,
                  value: s.demand_score ?? 0
                }))}
              />
            </div>
          )}

          {/* Bar comparison */}
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
