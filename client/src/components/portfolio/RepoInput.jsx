import React, { useState } from "react";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";

const GITHUB_REGEX = /^https:\/\/github\.com\/([\w-]+)\/([\w.-]+)\/?$/;

export default function RepoInput({ onVerify, isLoading }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!url.trim()) {
      setError("Please enter a GitHub repository URL");
      return;
    }
    if (!GITHUB_REGEX.test(url.trim())) {
      setError("Must be a valid GitHub repo URL (https://github.com/owner/repo)");
      return;
    }
    setError("");
    onVerify(url.trim());
  };

  return (
    <div className="card">
      <span className="section-label" style={{ display: "block", marginBottom: "16px" }}>
        Verify a GitHub Repository
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <input
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="https://github.com/username/repo"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "var(--surface)",
              border: `0.5px solid ${error ? "var(--red)" : "var(--border)"}`,
              borderRadius: "var(--radius)",
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "var(--text-primary)",
              outline: "none"
            }}
          />
          {error && (
            <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "4px" }}>{error}</p>
          )}
        </div>

        <Button onClick={handleSubmit} disabled={isLoading} fullWidth>
          {isLoading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Spinner size={16} color="var(--accent-text)" />
              Analysing...
            </span>
          ) : (
            "Verify & analyse →"
          )}
        </Button>

        {isLoading && (
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)", textAlign: "center" }}>
            Fetching repository data... Analysing with AI...
          </p>
        )}
      </div>
    </div>
  );
}
