import React, { useEffect, useRef, useState } from "react";
import useAuthStore from "../store/authStore";
import useUserStore from "../store/userStore";
import useNotificationStore from "../store/notificationStore";
import ScoreRing from "../components/passport/ScoreRing";
import PassportCard from "../components/passport/PassportCard";
import PortfolioCard from "../components/portfolio/PortfolioCard";
import ProfileCompletion from "../components/passport/ProfileCompletion";
import ActivityModal from "../components/passport/ActivityModal";
import Button from "../components/ui/Button";
import { TrophyIcon, GitPullRequestIcon, UsersIcon, CertificateIcon, ExternalLinkIcon } from "../components/ui/Icons";
import { getScoreColor, getScoreLabel, toPercent } from "../utils/scoreCalc";

export default function Dashboard() {
  const { user, isInitialising } = useAuthStore();
  const {
    passport,
    portfolio,
    activities,
    isLoading,
    fetchPassport,
    fetchPortfolio,
    fetchActivities,
    addActivity,
    removeActivity,
    updatePassport,
    removePortfolioItem
  } = useUserStore();
  const { add, checkScoreChange } = useNotificationStore();
  const prevScore = useRef(null);
  const [editingPassport, setEditingPassport] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("hackathon");
  const [viewingCert, setViewingCert] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchPassport(user.id);
      fetchPortfolio(user.id);
      fetchActivities(user.id);
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

  const handleOpenModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleAddActivity = async (data) => {
    if (!user?.id) return;
    await addActivity(data, user.id);
  };

  const handleRemoveActivity = async (id) => {
    if (!user?.id) return;
    await removeActivity(id, user.id);
  };

  if (isInitialising || (isLoading && !passport)) return <DashboardSkeleton />;

  const score          = passport?.employability_score ?? 0;
  const breakdown      = passport?.score_breakdown || {};
  const skills         = passport?.skills || [];
  const recentPortfolio = portfolio.slice(0, 3);

  const hackathons = activities.filter((a) => a.activity_type === "hackathon");
  const openSourcePrs = activities.filter((a) => a.activity_type === "open_source_pr");
  const mentoring = activities.filter((a) => a.activity_type === "mentoring");

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

      {/* Verified Activity Metrics & Proof Section */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <span className="section-label" style={{ display: "block" }}>Verified Activity Credentials</span>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
              Submit proof-backed hackathons, pull requests, and leadership to power your score.
            </p>
          </div>
          <Button size="small" variant="secondary" onClick={() => handleOpenModal("hackathon")}>
            + Add Verified Proof
          </Button>
        </div>

        <div className="grid-responsive-3" style={{ gap: "16px" }}>
          {/* Hackathons */}
          <ActivityCategoryCard
            title="Hackathons"
            icon={<TrophyIcon size={16} color="var(--accent)" />}
            count={hackathons.length || (passport?.hackathons ?? 0)}
            items={hackathons}
            onAdd={() => handleOpenModal("hackathon")}
            onRemove={handleRemoveActivity}
            onViewCert={setViewingCert}
            emptyText="No verified hackathons logged yet."
          />

          {/* Open Source PRs */}
          <ActivityCategoryCard
            title="Open Source PRs"
            icon={<GitPullRequestIcon size={16} color="var(--accent)" />}
            count={openSourcePrs.length || (passport?.open_source_prs ?? 0)}
            items={openSourcePrs}
            onAdd={() => handleOpenModal("open_source_pr")}
            onRemove={handleRemoveActivity}
            onViewCert={setViewingCert}
            emptyText="No open source PRs verified yet."
          />

          {/* Mentoring Sessions */}
          <ActivityCategoryCard
            title="Mentoring & Leadership"
            icon={<UsersIcon size={16} color="var(--accent)" />}
            count={mentoring.length || (passport?.mentoring_sessions ?? 0)}
            items={mentoring}
            onAdd={() => handleOpenModal("mentoring")}
            onRemove={handleRemoveActivity}
            onViewCert={setViewingCert}
            emptyText="No leadership sessions verified yet."
          />
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

      {/* Activity Verification Modal */}
      <ActivityModal
        isOpen={modalOpen}
        defaultType={modalType}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddActivity}
      />

      {/* Certificate Photo Lightbox Modal */}
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

function ActivityCategoryCard({ title, icon, count, items = [], onAdd, onRemove, onViewCert, emptyText }) {
  return (
    <div
      style={{
        padding: "16px",
        background: "var(--bg-secondary)",
        borderRadius: "var(--radius)",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {title}
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font)",
            fontSize: "12px",
            fontWeight: "600",
            background: "var(--surface)",
            padding: "2px 8px",
            borderRadius: "4px",
            border: "0.5px solid var(--border)"
          }}
        >
          {count}
        </span>
      </div>

      {items.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "160px", overflowY: "auto" }}>
          {items.map((item) => {
            const details = typeof item.details === "string" ? JSON.parse(item.details || "{}") : item.details || {};
            const hasImage = details.certificate_image || item.proof_url?.startsWith("data:image");
            return (
              <div
                key={item.id}
                style={{
                  padding: "8px 10px",
                  background: "var(--surface)",
                  borderRadius: "var(--radius)",
                  border: "0.5px solid var(--border)",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "8px"
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: "12px", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </div>
                  {details.role_or_award && (
                    <div style={{ fontSize: "10px", color: "var(--accent)", marginTop: "2px", fontWeight: "500" }}>
                      {details.role_or_award} {details.year_or_date && `· ${details.year_or_date}`}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                    {hasImage && (
                      <button
                        type="button"
                        onClick={() => onViewCert({ title: item.title, image: details.certificate_image || item.proof_url, details })}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          background: "rgba(16, 185, 129, 0.12)",
                          border: "0.5px solid var(--accent)",
                          borderRadius: "4px",
                          padding: "2px 8px",
                          fontSize: "10px",
                          color: "var(--accent)",
                          cursor: "pointer",
                          fontFamily: "var(--font)"
                        }}
                      >
                        <CertificateIcon size={12} color="var(--accent)" />
                        Certificate Photo
                      </button>
                    )}
                    {item.proof_url && !item.proof_url.startsWith("data:") && (
                      <a
                        href={item.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "10px",
                          color: "var(--text-tertiary)",
                          textDecoration: "underline",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px"
                        }}
                      >
                        View Proof
                        <ExternalLinkIcon size={10} color="var(--text-tertiary)" />
                      </a>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  title="Remove activity"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-tertiary)",
                    fontSize: "11px",
                    padding: "2px 4px"
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ fontSize: "11px", color: "var(--text-tertiary)", lineHeight: 1.4 }}>
          {emptyText}
        </p>
      )}

      <button
        type="button"
        onClick={onAdd}
        style={{
          width: "100%",
          padding: "6px",
          background: "transparent",
          border: "0.5px dashed var(--border)",
          borderRadius: "var(--radius)",
          fontSize: "11px",
          color: "var(--text-secondary)",
          cursor: "pointer",
          marginTop: "auto",
          textAlign: "center"
        }}
      >
        + Add {title}
      </button>
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
