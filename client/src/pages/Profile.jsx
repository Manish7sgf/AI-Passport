import React, { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import useUserStore from "../store/userStore";
import { getInitials, formatDate } from "../utils/formatters";
import ScoreRing from "../components/passport/ScoreRing";

export default function Profile() {
  const { user } = useAuthStore();
  const { passport, activities, fetchActivities, fetchPassport } = useUserStore();
  const [viewingCert, setViewingCert] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchPassport(user.id);
      fetchActivities(user.id);
    }
  }, [user?.id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1 1 240px" }}>
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || "Avatar"}
                style={{ width: 64, height: 64, borderRadius: "50%", border: "0.5px solid var(--border)", objectFit: "cover", flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "var(--bg-secondary)",
                  border: "0.5px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font)",
                  fontSize: "20px",
                  fontWeight: "500",
                  color: "var(--text-secondary)",
                  flexShrink: 0
                }}
              >
                {getInitials(user?.name || user?.email || "U")}
              </div>
            )}

            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontFamily: "var(--font)", fontSize: "20px", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name || "Student"}
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{user?.email}</p>
              {user?.github_username && (
                <a
                  href={`https://github.com/${user.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "12px", color: "var(--text-tertiary)", textDecoration: "underline", marginTop: "4px", display: "inline-block" }}
                >
                  @{user.github_username}
                </a>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <ScoreRing score={passport?.employability_score ?? 0} size={80} />
            <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font)", marginTop: "6px" }}>
              SCORE
            </span>
          </div>
        </div>
      </div>

      {passport && (
        <div className="card">
          <span className="section-label" style={{ display: "block", marginBottom: "16px" }}>Passport Activity Summary</span>
          <div className="grid-responsive-2">
            {[
              { label: "Member since", value: formatDate(user?.created_at) },
              { label: "Last updated", value: formatDate(passport.last_updated) },
              { label: "Skills logged", value: (passport.skills || []).length },
              { label: "Hackathons", value: activities.filter(a => a.activity_type === "hackathon").length || passport.hackathons || 0 },
              { label: "Open source PRs", value: activities.filter(a => a.activity_type === "open_source_pr").length || passport.open_source_prs || 0 },
              { label: "Mentoring sessions", value: activities.filter(a => a.activity_type === "mentoring").length || passport.mentoring_sessions || 0 }
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  padding: "14px 16px",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius)"
                }}
              >
                <div style={{ fontSize: "10px", color: "var(--text-tertiary)", fontFamily: "var(--font)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                  {label}
                </div>
                <div style={{ fontFamily: "var(--font)", fontSize: "16px", fontWeight: "600" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Activity Proof List */}
      {activities.length > 0 && (
        <div className="card">
          <span className="section-label" style={{ display: "block", marginBottom: "16px" }}>Verified Proof & Credentials</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {activities.map((a) => {
              const details = typeof a.details === "string" ? JSON.parse(a.details || "{}") : a.details || {};
              const typeIcon = a.activity_type === "hackathon" ? "🏆" : a.activity_type === "open_source_pr" ? "🐙" : "👥";
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
                    <span style={{ fontSize: "18px" }}>{typeIcon}</span>
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
                          gap: "4px"
                        }}
                      >
                        📜 View Certificate Photo
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
                          textDecoration: "none"
                        }}
                      >
                        View Proof ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
