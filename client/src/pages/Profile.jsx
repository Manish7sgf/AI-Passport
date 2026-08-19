import React from "react";
import useAuthStore from "../store/authStore";
import useUserStore from "../store/userStore";
import { getInitials, formatDate } from "../utils/formatters";
import ScoreRing from "../components/passport/ScoreRing";

export default function Profile() {
  const { user } = useAuthStore();
  const { passport } = useUserStore();

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
              { label: "Hackathons", value: passport.hackathons || 0 },
              { label: "Open source PRs", value: passport.open_source_prs || 0 },
              { label: "Mentoring sessions", value: passport.mentoring_sessions || 0 }
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
    </div>
  );
}
