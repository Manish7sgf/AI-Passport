import React, { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import useUserStore from "../store/userStore";
import { usePortfolioVerifier } from "../hooks/useAI";
import RepoInput from "../components/portfolio/RepoInput";
import PortfolioCard from "../components/portfolio/PortfolioCard";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import Badge from "../components/ui/Badge";

export default function Portfolio() {
  const { user } = useAuthStore();
  const {
    portfolio, fetchPortfolio, removePortfolioItem,
    syncGitHub, isSyncing, syncResult
  } = useUserStore();
  const { result, isLoading, error, verify } = usePortfolioVerifier();
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    if (user?.id) fetchPortfolio(user.id);
  }, [user?.id]);

  const handleVerify = async (url) => {
    await verify(url);
  };

  const handleRemove = async (id) => {
    if (!user?.id) return;
    await removePortfolioItem(id, user.id);
  };

  const handleSync = async () => {
    if (!user?.id) return;
    setSyncError(null);
    try {
      await syncGitHub(user.id);
    } catch (err) {
      setSyncError(err.message);
    }
  };

  const verified  = portfolio.filter((p) => p.verified);
  const synced    = portfolio.filter((p) => !p.verified && p.source === "github_sync");
  const hasGitHub = !!user?.github_username;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Top action row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        {/* GitHub sync card */}
        <div
          className="card"
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <GitHubIcon />
              <span style={{ fontFamily: "var(--font)", fontSize: "13px", fontWeight: "500" }}>
                GitHub Sync
              </span>
            </div>
            {hasGitHub ? (
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                @{user.github_username} · {synced.length} repos synced
              </p>
            ) : (
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                Connect GitHub via OAuth to auto-sync repos
              </p>
            )}
            {syncResult && (
              <p style={{ fontSize: "11px", color: "var(--green)", marginTop: "4px" }}>
                ✓ {syncResult.message}
              </p>
            )}
            {syncError && (
              <p style={{ fontSize: "11px", color: "var(--red)", marginTop: "4px" }}>
                {syncError}
              </p>
            )}
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={handleSync}
            disabled={isSyncing || !hasGitHub}
          >
            {isSyncing ? (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Spinner size={13} />
                Syncing...
              </span>
            ) : (
              "Sync repos →"
            )}
          </Button>
        </div>
      </div>

      {/* Manual verify input */}
      <RepoInput onVerify={handleVerify} isLoading={isLoading} />

      {/* Errors */}
      {error && !isLoading && (
        <div style={{
          padding: "14px 16px",
          background: "var(--red-bg)",
          border: "0.5px solid var(--red)",
          borderRadius: "var(--radius-lg)",
          fontSize: "13px",
          color: "var(--red)"
        }}>
          {error}
        </div>
      )}

      {/* Newly analysed result */}
      {result && !isLoading && (
        <div>
          <span className="section-label" style={{ display: "block", marginBottom: "12px" }}>
            Latest AI Analysis
          </span>
          <PortfolioCard item={result} showRemove={false} />
        </div>
      )}

      {/* AI-Verified projects */}
      {verified.length > 0 && (
        <Section
          label="AI-Verified Projects"
          count={verified.length}
          items={verified}
          onRemove={handleRemove}
        />
      )}

      {/* GitHub-synced projects */}
      {synced.length > 0 && (
        <Section
          label="GitHub Synced"
          count={synced.length}
          items={synced}
          onRemove={handleRemove}
          badge="synced"
        />
      )}

      {/* Empty state */}
      {portfolio.length === 0 && !isLoading && !result && (
        <div style={{
          padding: "40px",
          textAlign: "center",
          color: "var(--text-tertiary)",
          border: "0.5px dashed var(--border)",
          borderRadius: "var(--radius-lg)"
        }}>
          <p style={{ fontFamily: "var(--font)", fontSize: "13px" }}>No projects yet</p>
          <p style={{ fontSize: "12px", marginTop: "4px" }}>
            {hasGitHub
              ? 'Click "Sync repos" to import your GitHub projects, or paste a URL below to AI-verify one.'
              : "Paste a GitHub repo URL above to verify your first project."}
          </p>
        </div>
      )}
    </div>
  );
}

function Section({ label, count, items, onRemove, badge }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="section-label">{label}</span>
          {badge === "synced" && (
            <Badge variant="default" style={{ fontSize: "10px", padding: "2px 6px" }}>GitHub</Badge>
          )}
        </div>
        <span style={{ fontFamily: "var(--font)", fontSize: "12px", color: "var(--text-tertiary)" }}>
          {count} project{count !== 1 ? "s" : ""}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
        {items.map((item) => (
          <PortfolioCard key={item.id} item={item} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text-secondary)" }}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
