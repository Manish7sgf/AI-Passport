import React, { useEffect } from "react";
import useAuthStore from "../store/authStore";
import useUserStore from "../store/userStore";
import ScoreRing from "../components/passport/ScoreRing";
import PassportCard from "../components/passport/PassportCard";
import PortfolioCard from "../components/portfolio/PortfolioCard";
import { getScoreColor, getScoreLabel, toPercent } from "../utils/scoreCalc";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { passport, portfolio, isLoading, fetchPassport, fetchPortfolio, updatePassport, removePortfolioItem } =
    useUserStore();

  useEffect(() => {
    if (user?.id) {
      fetchPassport(user.id);
      fetchPortfolio(user.id);
    }
  }, [user?.id]);

  const handleUpdatePassport = async (updates) => {
    if (!user?.id) return;
    await updatePassport(user.id, updates);
    await fetchPassport(user.id);
  };

  const handleRemoveProject = async (id) => {
    if (!user?.id) return;
    await removePortfolioItem(id, user.id);
  };

  if (isLoading && !passport) {
    return <DashboardSkeleton />;
  }

  const score = passport?.employability_score ?? 0;
  const breakdown = passport?.score_breakdown || {};
  const skills = passport?.skills || [];
  const recentPortfolio = portfolio.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {/* Score card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <span className="section-label">Employability Score</span>
          <ScoreRing score={score} size={100} />
          <span style={{ fontSize: "12px", color: getScoreColor(score), fontFamily: "var(--font)" }}>
            {getScoreLabel(score)}
          </span>
        </div>

        {/* Projects card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="section-label" style={{ marginBottom: "12px" }}>Projects</span>
          <div style={{ fontFamily: "var(--font)", fontSize: "40px", fontWeight: "500", color: "var(--text-primary)", lineHeight: 1 }}>
            {portfolio.length}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {portfolio.filter((p) => p.verified).length} verified
          </div>
        </div>

        {/* Skills card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="section-label" style={{ marginBottom: "12px" }}>Skills</span>
          <div style={{ fontFamily: "var(--font)", fontSize: "40px", fontWeight: "500", color: "var(--text-primary)", lineHeight: 1 }}>
            {skills.length}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {skills.slice(0, 3).join(", ")}{skills.length > 3 ? "..." : ""}
          </div>
        </div>
      </div>

      {/* Passport card */}
      <PassportCard passport={passport} onUpdate={handleUpdatePassport} />

      {/* Quick stats */}
      <div className="card">
        <span className="section-label" style={{ display: "block", marginBottom: "16px" }}>Activity</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          <StatCounter
            label="Hackathons"
            value={passport?.hackathons ?? 0}
            onUpdate={(v) => handleUpdatePassport({ hackathons: v })}
          />
          <StatCounter
            label="Open Source PRs"
            value={passport?.open_source_prs ?? 0}
            onUpdate={(v) => handleUpdatePassport({ open_source_prs: v })}
          />
          <StatCounter
            label="Mentoring Sessions"
            value={passport?.mentoring_sessions ?? 0}
            onUpdate={(v) => handleUpdatePassport({ mentoring_sessions: v })}
          />
        </div>
      </div>

      {/* Score breakdown */}
      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="card">
          <span className="section-label" style={{ display: "block", marginBottom: "20px" }}>Score Breakdown</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { key: "projects", label: "Projects verified", max: 30 },
              { key: "skills", label: "Skills", max: 20 },
              { key: "hackathons", label: "Hackathons", max: 20 },
              { key: "openSource", label: "Open source", max: 15 },
              { key: "mentoring", label: "Mentoring", max: 15 }
            ].map(({ key, label, max }) => {
              const item = breakdown[key] || {};
              const itemScore = item.score ?? 0;
              const pct = toPercent(itemScore, max);
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "140px", fontSize: "12px", color: "var(--text-secondary)", flexShrink: 0 }}>
                    {label}
                  </div>
                  <div style={{ flex: 1 }} className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div
                    style={{
                      width: "50px",
                      textAlign: "right",
                      fontFamily: "var(--font)",
                      fontSize: "12px",
                      color: "var(--text-primary)",
                      flexShrink: 0
                    }}
                  >
                    {itemScore}/{max}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent activity */}
      {recentPortfolio.length > 0 && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span className="section-label">Recent Projects</span>
            <a
              href="/portfolio"
              style={{ fontSize: "12px", color: "var(--text-secondary)", textDecoration: "underline" }}
            >
              View all →
            </a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentPortfolio.map((item) => (
              <PortfolioCard key={item.id} item={item} onRemove={handleRemoveProject} showRemove={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCounter({ label, value, onUpdate }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
        <button
          onClick={() => onUpdate(Math.max(0, value - 1))}
          style={{
            width: "24px", height: "24px", border: "0.5px solid var(--border)", borderRadius: "4px",
            background: "var(--bg-secondary)", cursor: "pointer", fontSize: "14px", color: "var(--text-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >−</button>
        <span style={{ fontFamily: "var(--font)", fontSize: "20px", fontWeight: "500", minWidth: "24px", textAlign: "center" }}>
          {value}
        </span>
        <button
          onClick={() => onUpdate(value + 1)}
          style={{
            width: "24px", height: "24px", border: "0.5px solid var(--border)", borderRadius: "4px",
            background: "var(--bg-secondary)", cursor: "pointer", fontSize: "14px", color: "var(--text-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >+</button>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card">
            <div className="skeleton" style={{ height: "12px", width: "60%", marginBottom: "12px" }} />
            <div className="skeleton" style={{ height: "60px", width: "80px" }} />
          </div>
        ))}
      </div>
      <div className="card">
        <div className="skeleton" style={{ height: "12px", width: "40%", marginBottom: "20px" }} />
        <div className="skeleton" style={{ height: "80px", width: "100%" }} />
      </div>
    </div>
  );
}
