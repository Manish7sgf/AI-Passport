import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import ScoreRing from "../components/passport/ScoreRing";
import BadgeGrid from "../components/passport/BadgeGrid";
import { getScoreLabel, getScoreColor, toPercent } from "../utils/scoreCalc";
import { formatDate, getInitials } from "../utils/formatters";

export default function PublicPassport() {
  const { username } = useParams();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    api.get(`/public/passport/${username}`)
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [username]);

  if (loading) return <LoadingState />;
  if (error)   return <NotFound username={username} />;

  const { user, passport, portfolio } = data;
  const score     = passport?.employability_score ?? 0;
  const breakdown = passport?.score_breakdown || {};
  const skills    = Array.isArray(passport?.skills) ? passport.skills : [];
  const interests = Array.isArray(passport?.interests) ? passport.interests : [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px 16px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header */}
        <div
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1 1 240px" }}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name}
                style={{ width: 64, height: 64, borderRadius: "50%", border: "0.5px solid var(--border)", objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--bg-secondary)", border: "0.5px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font)", fontSize: "20px", color: "var(--text-secondary)", flexShrink: 0
              }}>
                {getInitials(user.name)}
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{ fontFamily: "var(--font)", fontSize: "20px", fontWeight: "600", marginBottom: "4px" }}>
                {user.name}
              </h1>
              {user.github_username && (
                <a href={`https://github.com/${user.github_username}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "12px", color: "var(--text-tertiary)", textDecoration: "underline" }}>
                  @{user.github_username}
                </a>
              )}
              {passport?.bio && (
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "8px", lineHeight: "1.5" }}>
                  {passport.bio}
                </p>
              )}
            </div>
          </div>
          <div style={{ textAlign: "center", margin: "0 auto" }}>
            <ScoreRing score={score} size={80} />
            <div style={{ fontSize: "11px", color: getScoreColor(score), marginTop: "4px", fontFamily: "var(--font)", fontWeight: "500" }}>
              {getScoreLabel(score)}
            </div>
          </div>
        </div>

        {/* Skills & Interests */}
        {(skills.length > 0 || interests.length > 0) && (
          <div className="card">
            <span className="section-label" style={{ display: "block", marginBottom: "16px" }}>Skills & Interests</span>
            <BadgeGrid skills={skills} interests={interests} />
          </div>
        )}

        {/* Score breakdown */}
        {Object.keys(breakdown).length > 0 && (
          <div className="card">
            <span className="section-label" style={{ display: "block", marginBottom: "16px" }}>Score Breakdown</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { key: "projects",   label: "Projects verified", max: 30 },
                { key: "skills",     label: "Skills",            max: 20 },
                { key: "hackathons", label: "Hackathons",        max: 20 },
                { key: "openSource", label: "Open source PRs",   max: 15 },
                { key: "mentoring",  label: "Mentoring",         max: 15 }
              ].map(({ key, label, max }) => {
                const item = breakdown[key] || {};
                const pct  = toPercent(item.score ?? 0, max);
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "140px", fontSize: "12px", color: "var(--text-secondary)", flexShrink: 0 }}>{label}</div>
                    <div style={{ flex: 1 }} className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div style={{ width: "44px", textAlign: "right", fontFamily: "var(--font)", fontSize: "12px", flexShrink: 0 }}>
                      {item.score ?? 0}/{max}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Verified projects */}
        {portfolio.length > 0 && (
          <div className="card">
            <span className="section-label" style={{ display: "block", marginBottom: "16px" }}>Verified Projects</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {portfolio.map((item, i) => (
                <div key={i} style={{ padding: "12px", background: "var(--bg-secondary)", borderRadius: "var(--radius)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <a href={item.repo_url} target="_blank" rel="noopener noreferrer"
                        style={{ fontFamily: "var(--font)", fontSize: "13px", fontWeight: "500", textDecoration: "underline" }}>
                        {item.title}
                      </a>
                      {item.description && (
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {Array.isArray(item.tech_stack) && item.tech_stack.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                      {item.tech_stack.map((t) => (
                        <span key={t} style={{
                          padding: "2px 7px", background: "var(--surface)",
                          border: "0.5px solid var(--border)", borderRadius: "3px",
                          fontSize: "11px", color: "var(--text-secondary)"
                        }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font)" }}>
          AI FUTURE PASSPORT · Last updated {formatDate(passport?.last_updated)}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "var(--font)", fontSize: "13px", color: "var(--text-tertiary)" }}>Loading passport...</span>
    </div>
  );
}

function NotFound({ username }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px" }}>
      <span style={{ fontFamily: "var(--font)", fontSize: "16px" }}>Passport not found</span>
      <span style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>@{username} hasn't created a passport yet</span>
    </div>
  );
}
