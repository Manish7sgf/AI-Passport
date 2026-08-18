import React, { useState } from "react";
import useUserStore from "../store/userStore";
import useAuthStore from "../store/authStore";
import { useTimeMachine } from "../hooks/useAI";
import JobCard from "../components/timemachine/JobCard";
import ReadinessBar from "../components/timemachine/ReadinessBar";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

export default function TimeMachine() {
  const { passport } = useUserStore();
  const { user } = useAuthStore();
  const { result, isLoading, error, predict } = useTimeMachine();

  const [skills, setSkills] = useState(passport?.skills || []);
  const [interests, setInterests] = useState(passport?.interests || []);
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      const s = skillInput.trim();
      if (!skills.includes(s)) setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const addInterest = (e) => {
    if (e.key === "Enter" && interestInput.trim()) {
      const i = interestInput.trim();
      if (!interests.includes(i)) setInterests([...interests, i]);
      setInterestInput("");
    }
  };

  const handlePredict = async () => {
    if (skills.length === 0) return;
    await predict({ skills, interests });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Input card */}
      <div className="card">
        <span className="section-label" style={{ display: "block", marginBottom: "20px" }}>
          Simulate Your Career
        </span>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Skills input */}
          <div>
            <label className="section-label" style={{ display: "block", marginBottom: "8px" }}>
              Current Skills (press Enter to add)
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {skills.map((s) => (
                <TagPill key={s} label={s} onRemove={() => setSkills(skills.filter((x) => x !== s))} />
              ))}
            </div>
            <TagInput
              value={skillInput}
              onChange={setSkillInput}
              onKeyDown={addSkill}
              placeholder="Type a skill and press Enter"
            />
          </div>

          {/* Interests input */}
          <div>
            <label className="section-label" style={{ display: "block", marginBottom: "8px" }}>
              Interests (press Enter to add)
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {interests.map((i) => (
                <TagPill
                  key={i}
                  label={i}
                  onRemove={() => setInterests(interests.filter((x) => x !== i))}
                  variant="interest"
                />
              ))}
            </div>
            <TagInput
              value={interestInput}
              onChange={setInterestInput}
              onKeyDown={addInterest}
              placeholder="Type an interest and press Enter"
            />
          </div>

          {skills.length === 0 && (
            <p style={{ fontSize: "12px", color: "var(--red)" }}>
              Please add at least one skill
            </p>
          )}

          <Button onClick={handlePredict} disabled={isLoading || skills.length === 0}>
            {isLoading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Spinner size={16} color="var(--accent-text)" />
                Simulating your 2030 career path...
              </span>
            ) : (
              "Simulate my future →"
            )}
          </Button>
        </div>
      </div>

      {/* Loading skeletons */}
      {isLoading && <CareerSkeletons />}

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
          <ReadinessBar
            readinessScore={result.readiness_score}
            gapSummary={result.gap_summary}
            recommendation={result.top_recommendation}
          />

          <div>
            <span className="section-label" style={{ display: "block", marginBottom: "16px" }}>
              Predicted Career Paths
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
              {(result.jobs || []).map((job, i) => (
                <JobCard key={i} job={job} index={i} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TagPill({ label, onRemove, variant = "skill" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 8px",
        background: variant === "interest" ? "var(--bg)" : "var(--bg-secondary)",
        border: "0.5px solid var(--border)",
        borderRadius: "4px",
        fontSize: "12px",
        color: "var(--text-secondary)"
      }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-tertiary)",
          lineHeight: 1,
          padding: 0,
          fontSize: "14px"
        }}
      >
        ×
      </button>
    </span>
  );
}

function TagInput({ value, onChange, onKeyDown, placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "8px 12px",
        background: "var(--surface)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius)",
        fontFamily: "var(--font-body)",
        fontSize: "13px",
        color: "var(--text-primary)",
        outline: "none"
      }}
    />
  );
}

function CareerSkeletons() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="card">
        <div className="skeleton" style={{ height: "12px", width: "30%", marginBottom: "16px" }} />
        <div className="skeleton" style={{ height: "48px", width: "60%", marginBottom: "16px" }} />
        <div className="skeleton" style={{ height: "8px", width: "100%", marginBottom: "8px" }} />
        <div className="skeleton" style={{ height: "13px", width: "80%" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card">
            <div className="skeleton" style={{ height: "14px", width: "70%", marginBottom: "12px" }} />
            <div className="skeleton" style={{ height: "12px", width: "100%", marginBottom: "6px" }} />
            <div className="skeleton" style={{ height: "12px", width: "90%", marginBottom: "12px" }} />
            <div className="skeleton" style={{ height: "10px", width: "50%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
