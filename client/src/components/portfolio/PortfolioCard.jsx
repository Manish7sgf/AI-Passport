import React from "react";
import Badge from "../ui/Badge";
import { formatDate } from "../../utils/formatters";

export default function PortfolioCard({ item, onRemove, showRemove = true }) {
  const contributionVariant =
    item.contribution_level === "high"
      ? "green"
      : item.contribution_level === "medium"
      ? "amber"
      : "red";

  // Parse AI summary if it's a JSON string
  let aiData = {};
  try {
    aiData = typeof item.ai_summary === "string" ? JSON.parse(item.ai_summary) : {};
  } catch {
    aiData = {};
  }

  const techStack = Array.isArray(item.tech_stack)
    ? item.tech_stack
    : typeof item.tech_stack === "string"
    ? JSON.parse(item.tech_stack || "[]")
    : [];

  return (
    <div className="card fade-in" style={{ position: "relative" }}>
      {/* Remove button */}
      {showRemove && onRemove && (
        <button
          onClick={() => onRemove(item.id)}
          title="Remove"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-tertiary)",
            fontSize: "16px",
            padding: "4px",
            lineHeight: 1,
            transition: "color 0.15s"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
        >
          ×
        </button>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", paddingRight: "24px" }}>
        <span
          style={{
            fontFamily: "var(--font)",
            fontSize: "14px",
            fontWeight: "500",
            color: "var(--text-primary)"
          }}
        >
          {item.title || "Untitled Project"}
        </span>
        <Badge variant={contributionVariant}>
          {item.contribution_level || "unverified"}
        </Badge>
        {item.verified && (
          <Badge variant="green">verified</Badge>
        )}
      </div>

      {/* Description */}
      {item.description && (
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            lineHeight: "1.6",
            marginBottom: "12px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        >
          {item.description}
        </p>
      )}

      {/* Tech stack */}
      {techStack.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
          {techStack.map((tech) => (
            <span
              key={tech}
              style={{
                padding: "2px 8px",
                background: "var(--bg-secondary)",
                border: "0.5px solid var(--border)",
                borderRadius: "3px",
                fontSize: "11px",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)"
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Complexity + date */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "0.5px solid var(--border)",
          paddingTop: "10px",
          marginTop: "10px"
        }}
      >
        <div style={{ display: "flex", gap: "12px" }}>
          {aiData.complexity_score && (
            <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font)" }}>
              Complexity: {aiData.complexity_score}/10
            </span>
          )}
          <a
            href={item.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "11px",
              color: "var(--text-tertiary)",
              textDecoration: "underline",
              fontFamily: "var(--font)"
            }}
          >
            View on GitHub
          </a>
        </div>
        <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
          {formatDate(item.created_at)}
        </span>
      </div>
    </div>
  );
}
