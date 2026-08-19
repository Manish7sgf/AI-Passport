import React, { useEffect, useRef, useState } from "react";
import useAuthStore from "../store/authStore";
import useUserStore from "../store/userStore";
import useNotificationStore from "../store/notificationStore";
import ScoreRing from "../components/passport/ScoreRing";
import PassportCard from "../components/passport/PassportCard";
import PortfolioCard from "../components/portfolio/PortfolioCard";
import ProfileCompletion from "../components/passport/ProfileCompletion";
import { getScoreColor, getScoreLabel, toPercent } from "../utils/scoreCalc";

export default function Dashboard() {
  const { user, isInitialising } = useAuthStore();
  const { passport, portfolio, isLoading, fetchPassport, fetchPortfolio, updatePassport, removePortfolioItem } =
    useUserStore();
  const { add, checkScoreChange } = useNotificationStore();
  const prevScore = useRef(null);
  const [editingPassport, setEditingPassport] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPassport(user.id);
      fetchPortfolio(user.id);
    }
  }, [user?.id]);

  // Fire notification when score changes
  useEffect(() => {
    const current = passport?.employability_score;
    if (current !== undefined) {
      checkScoreChange(prevScore.current, current);
      prevScore.current = current;
    }
  }, [passport?.employability_score]);

  const handleUpdatePassport = async (updates) => {
    if (!user?.id) return;
    await updatePassport(user.id, updates);
    await fetchPassport(user.id);
  };

  const handleRemoveProject = async (id) => {
    if (!user?.id) return;
    await removePortfolioItem(id, user.id);
  };

  if (isInitialising || (isLoading && !passport)) return <DashboardSkeleton />;

  const score          = passport?.employability_score ?? 0;
  const breakdown      = passport?.score_breakdown || {};
  const skills         = passport?.skills || [];
  const recentPortfolio = portfolio.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Profile completion banner */}
      <ProfileCompletion
        passport={passport}
        portfolio={portfolio}
        onEdit={() => setEditingPassport(true)}
      />

      {/* Top stat cards */}
      <div className="grid-responsive-3">
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
          <span className="section-label">Employability Score</span>
          <ScoreRing score={score} size={100} />
          <span style={{ fontSize: "12px", color: getScoreColor(score), fontFamily: "var(--font)", fontWeight: "500" }}>
            {getScoreLabel(score)}
          </span>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="section-label" style={{ marginBottom: "10px" }}>Projects</span>
          <div style={{ fontFamily: "var(--font)", fontSize: "36px", fontWeight: "500", lineHeight: 1 }}>
            {portfolio.length}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
            {portfolio.filter((p) => p.verified).length} AI-verified
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="section-label" style={{ marginBottom: "10px" }}>Skills Count</span>
          <div style={{ fontFamily: "var(--font)", fontSize: "36px", fontWeight: "500", lineHeight: 1 }}>
            {skills.length}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {skills.length > 0 ? skills.slice(0, 3).join(", ") + (skills.length > 3 ? "..." : "") : "No skills logged"}
          </div>
        </div>
      </div>

      {/* Passport card — force edit mode if triggered from completion banner */}
      <PassportCard
        passport={passport}
        onUpdate={handleUpdatePassport}
        forceEdit={editingPassport}
        onEditDone={() => setEditingPassport(false)}
      />

      {/* Activity counters */}
      <div className="card">
        <span className="section-label" style={{ display: "block", marginBottom: "16px" }}>Activity Metrics</span>
        <div className="grid-responsive-3">
          <StatCounter label="Hackathons" value={passport?.hackathons ?? 0} onUpdate={(v) => handleUpdatePassport({ hackathons: v })} />
          <StatCounter label="Open Source PRs" value={passport?.open_source_prs ?? 0} onUpdate={(v) => handleUpdatePassport({ open_source_prs: v })} />
          <StatCounter label="Mentoring Sessions" value={passport?.mentoring_sessions ?? 0} onUpdate={(v) => handleUpdatePassport({ mentoring_sessions: v })} />
        </div>
      </div>

      {/* Score breakdown */}
      {Object.keys(breakdown).length > 0 && (
        <div className="card">
          <span className="section-label" style={{ display: "block", marginBottom: "20px" }}>Score Breakdown</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { key: "projects",   label: "Projects verified", max: 30 },
              { key: "skills",     label: "Skills",            max: 20 },
              { key: "hackathons", label: "Hackathons",        max: 20 },
              { key: "openSource", label: "Open source PRs",   max: 15 },
              { key: "mentoring",  label: "Mentoring sessions", max: 15 }
            ].map(({ key, label, max }) => {
              const item      = breakdown[key] || {};
              const itemScore = item.score ?? 0;
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "130px", fontSize: "12px", color: "var(--text-secondary)", flexShrink: 0 }}>
                    {label}
                  </div>
                  <div style={{ flex: 1 }} className="progress-track">
                    <div className="progress-fill" style={{ width: `${toPercent(itemScore, max)}%` }} />
                  </div>
                  <div style={{ width: "48px", textAlign: "right", fontFamily: "var(--font)", fontSize: "12px", flexShrink: 0 }}>
                    {itemScore}/{max}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent projects */}
      {recentPortfolio.length > 0 && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span className="section-label">Recent Projects</span>
            <a href="/portfolio" style={{ fontSize: "12px", color: "var(--text-secondary)", textDecoration: "underline" }}>
              View all ({portfolio.length}) →
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
    <div
      style={{
        textAlign: "center",
        padding: "12px",
        background: "var(--bg-secondary)",
        borderRadius: "var(--radius)"
      }}
    >
      <div style={{ fontSize: "10px", color: "var(--text-tertiary)", fontFamily: "var(--font)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
        <button
          type="button"
          onClick={() => onUpdate(Math.max(0, value - 1))}
          aria-label={`Decrease ${label}`}
          style={{
            width: "32px",
            height: "32px",
            border: "0.5px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "var(--surface)",
            cursor: "pointer",
            fontSize: "16px",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "border-color 0.15s"
          }}
        >
          −
        </button>
        <span style={{ fontFamily: "var(--font)", fontSize: "20px", fontWeight: "600", minWidth: "30px", textAlign: "center" }}>
          {value}
        </span>
        <button
          type="button"
          onClick={() => onUpdate(value + 1)}
          aria-label={`Increase ${label}`}
          style={{
            width: "32px",
            height: "32px",
            border: "0.5px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "var(--surface)",
            cursor: "pointer",
            fontSize: "16px",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "border-color 0.15s"
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="grid-responsive-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card">
            <div className="skeleton" style={{ height: "12px", width: "60%", marginBottom: "12px" }} />
            <div className="skeleton" style={{ height: "48px", width: "80px" }} />
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
