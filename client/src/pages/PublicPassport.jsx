import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import ScoreRing from "../components/passport/ScoreRing";
import BadgeGrid from "../components/passport/BadgeGrid";
import Logo from "../components/ui/Logo";
import { TrophyIcon, GitPullRequestIcon, UsersIcon, CertificateIcon, ExternalLinkIcon } from "../components/ui/Icons";
import { getScoreLabel, getScoreColor, toPercent } from "../utils/scoreCalc";
import { formatDate, getInitials } from "../utils/formatters";

export default function PublicPassport() {
  const { username } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [viewingCert, setViewingCert] = useState(null);

  useEffect(() => {
    api.get(`/public/passport/${username}`)
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [username]);

  if (loading) return <LoadingState />;
  if (error)   return <NotFound username={username} />;

  const { user, passport, portfolio = [], activities = [] } = data;
  const score     = passport?.employability_score ?? 0;
  const breakdown = passport?.score_breakdown || {};
  const skills    = Array.isArray(passport?.skills) ? passport.skills : [];
  const interests = Array.isArray(passport?.interests) ? passport.interests : [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "24px 16px 48px" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Platform top banner */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <Logo size={26} />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font)", fontSize: "11px", color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Verified Candidate Passport
            </span>
          </div>
        </div>

        {/* Header Card */}
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
            <span className="section-label" style={{ display: "block", marginBottom: "16px" }}>
              Verified Skills ({skills.length})
            </span>
            <BadgeGrid skills={skills} interests={interests} />
          </div>
        )}

        {/* Score breakdown */}
        {Object.keys(breakdown).length > 0 && (
          <div className="card">
            <span className="section-label" style={{ display: "block", marginBottom: "16px" }}>
              Employability Score Breakdown ({score} / 100 pts)
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { key: "projects",   label: "Projects verified", max: 30 },
                { key: "skills",     label: "Skills",            max: 20 },
                { key: "hackathons", label: "Hackathons",        max: 20 },
                { key: "openSource", label: "Open source PRs",   max: 15 },
                { key: "mentoring",  label: "Mentoring sessions", max: 15 }
              ].map(({ key, label, max }) => {
                const item = breakdown[key] || {};
                const count = item.count ?? (key === "projects" ? portfolio.length : key === "skills" ? skills.length : 0);
                const itemScore = item.score ?? 0;
                const pct  = toPercent(itemScore, max);
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "170px", fontSize: "12px", color: "var(--text-secondary)", flexShrink: 0 }}>
                      {label} <span style={{ color: "var(--text-tertiary)", fontSize: "11px" }}>({count} verified)</span>
                    </div>
                    <div style={{ flex: 1 }} className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div style={{ minWidth: "90px", textAlign: "right", fontFamily: "var(--font)", fontSize: "12px", flexShrink: 0, whiteSpace: "nowrap" }}>
                      {itemScore} / {max} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Verified Activity Credentials */}
        {activities.length > 0 && (
          <div className="card">
            <span className="section-label" style={{ display: "block", marginBottom: "16px" }}>
              Verified Activity Credentials & Proof ({activities.length})
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {activities.map((a) => {
                const details = typeof a.details === "string" ? JSON.parse(a.details || "{}") : a.details || {};
                const typeIcon = a.activity_type === "hackathon" ? <TrophyIcon size={18} color="var(--accent)" /> : a.activity_type === "open_source_pr" ? <GitPullRequestIcon size={18} color="var(--accent)" /> : <UsersIcon size={18} color="var(--accent)" />;
                const typeLabel = a.activity_type === "hackathon" ? "Hackathon" : a.activity_type === "open_source_pr" ? "Open Source PR" : "Mentoring";
                const hasImage = details.certificate_image || a.proof_url?.startsWith("data:image");

                return (
                  <div
                    key={a.id}
                    style={{
                      padding: "12px 14px",
                      background: "var(--bg-secondary)",
                      borderRadius: "var(--radius)",
                      border: "0.5px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "200px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center" }}>{typeIcon}</span>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "500" }}>{a.title}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                          <span style={{ textTransform: "uppercase", fontFamily: "var(--font)", fontSize: "10px", color: "var(--text-tertiary)", marginRight: "6px" }}>
                            {typeLabel}
                          </span>
                          {details.role_or_award && `· ${details.role_or_award}`}
                          {details.year_or_date && ` · ${details.year_or_date}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {hasImage && (
                        <button
                          type="button"
                          onClick={() => setViewingCert({ title: a.title, image: details.certificate_image || a.proof_url, details })}
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--font)",
                            color: "var(--accent)",
                            background: "rgba(16, 185, 129, 0.12)",
                            border: "0.5px solid var(--accent)",
                            borderRadius: "var(--radius)",
                            padding: "4px 10px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px"
                          }}
                        >
                          <CertificateIcon size={12} color="var(--accent)" />
                          Certificate Photo
                        </button>
                      )}
                      {a.proof_url && !a.proof_url.startsWith("data:") && (
                        <a
                          href={a.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--font)",
                            color: "var(--text-primary)",
                            background: "var(--surface)",
                            border: "0.5px solid var(--border)",
                            borderRadius: "var(--radius)",
                            padding: "4px 10px",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          View Proof
                          <ExternalLinkIcon size={10} color="var(--text-secondary)" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Verified Projects */}
        {portfolio.length > 0 && (
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span className="section-label">
                All Verified Projects ({portfolio.length})
              </span>
              <span style={{ fontSize: "11px", color: "var(--green)", fontFamily: "var(--font)", fontWeight: "500" }}>
                ✓ 100% AI Code Verified
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {portfolio.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius)",
                    border: "0.5px solid var(--border)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <a
                        href={item.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: "var(--font)",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "var(--text-primary)",
                          textDecoration: "none"
                        }}
                      >
                        {item.title} ↗
                      </a>
                      {item.description && (
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.4 }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.contribution_level && (
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontFamily: "var(--font)",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          background: item.contribution_level === "high" ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                          color: item.contribution_level === "high" ? "var(--green)" : "var(--amber)",
                          border: `0.5px solid ${item.contribution_level === "high" ? "var(--green)" : "var(--amber)"}`
                        }}
                      >
                        {item.contribution_level} complexity
                      </span>
                    )}
                  </div>

                  {Array.isArray(item.tech_stack) && item.tech_stack.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
                      {item.tech_stack.map((t) => (
                        <span
                          key={t}
                          style={{
                            padding: "2px 8px",
                            background: "var(--surface)",
                            border: "0.5px solid var(--border)",
                            borderRadius: "3px",
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                            fontFamily: "var(--font-mono)"
                          }}
                        >
                          {t}
                        </span>
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
          AI FUTURE PASSPORT · Verified profile of @{user.github_username}
        </div>
      </div>

      {/* Certificate Lightbox Modal */}
      {viewingCert && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "20px"
          }}
          onClick={() => setViewingCert(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "20px",
              background: "var(--bg)",
              borderRadius: "var(--radius)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              border: "0.5px solid var(--border)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontFamily: "var(--font)", fontSize: "16px", fontWeight: "600" }}>
                  {viewingCert.title}
                </h3>
                <p style={{ fontSize: "12px", color: "var(--accent)", marginTop: "2px" }}>
                  {viewingCert.details?.role_or_award} {viewingCert.details?.year_or_date && `· ${viewingCert.details.year_or_date}`}
                </p>
              </div>
              <button
                onClick={() => setViewingCert(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "var(--text-tertiary)", padding: "4px" }}
              >
                ✕
              </button>
            </div>
            {viewingCert.image ? (
              <img
                src={viewingCert.image}
                alt={viewingCert.title}
                style={{ width: "100%", borderRadius: "var(--radius)", border: "0.5px solid var(--border)", objectFit: "contain", maxHeight: "65vh" }}
              />
            ) : (
              <div style={{ padding: "30px", textAlign: "center", background: "var(--bg-secondary)", borderRadius: "var(--radius)" }}>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Certificate link: <a href={viewingCert.proof_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "underline" }}>{viewingCert.proof_url}</a>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "var(--font)", fontSize: "13px", color: "var(--text-tertiary)" }}>Loading verified passport...</span>
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
