import React, { useEffect } from "react";
import useAuthStore from "../store/authStore";
import useUserStore from "../store/userStore";
import { usePortfolioVerifier } from "../hooks/useAI";
import RepoInput from "../components/portfolio/RepoInput";
import PortfolioCard from "../components/portfolio/PortfolioCard";

export default function Portfolio() {
  const { user } = useAuthStore();
  const { portfolio, fetchPortfolio, removePortfolioItem } = useUserStore();
  const { result, isLoading, error, verify } = usePortfolioVerifier();

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Input */}
      <RepoInput onVerify={handleVerify} isLoading={isLoading} />

      {/* Error */}
      {error && !isLoading && (
        <div
          style={{
            padding: "14px 16px",
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

      {/* New result */}
      {result && !isLoading && (
        <div>
          <span className="section-label" style={{ display: "block", marginBottom: "12px" }}>
            Latest Analysis
          </span>
          <PortfolioCard item={result} showRemove={false} />
        </div>
      )}

      {/* Portfolio grid */}
      {portfolio.length > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px"
            }}
          >
            <span className="section-label">Your Verified Projects</span>
            <span
              style={{
                fontFamily: "var(--font)",
                fontSize: "12px",
                color: "var(--text-tertiary)"
              }}
            >
              {portfolio.length} project{portfolio.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            {portfolio.map((item) => (
              <PortfolioCard key={item.id} item={item} onRemove={handleRemove} />
            ))}
          </div>
        </div>
      )}

      {portfolio.length === 0 && !isLoading && !result && (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--text-tertiary)",
            border: "0.5px dashed var(--border)",
            borderRadius: "var(--radius-lg)"
          }}
        >
          <p style={{ fontFamily: "var(--font)", fontSize: "13px" }}>No projects yet</p>
          <p style={{ fontSize: "12px", marginTop: "4px" }}>
            Paste a GitHub URL above to verify your first project
          </p>
        </div>
      )}
    </div>
  );
}
