import React from "react";
import { useLocation } from "react-router-dom";

const pageTitles = {
  "/dashboard": "Passport",
  "/timemachine": "Career Time Machine",
  "/radar": "Skill Gap Radar",
  "/portfolio": "Portfolio Generator",
  "/profile": "Profile"
};

export default function Topbar() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "AI Future Passport";

  return (
    <header
      style={{
        height: "56px",
        background: "var(--bg)",
        borderBottom: "0.5px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 40px",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}
    >
      <span
        style={{
          fontFamily: "var(--font)",
          fontSize: "13px",
          fontWeight: "500",
          color: "var(--text-primary)",
          textTransform: "uppercase",
          letterSpacing: "0.08em"
        }}
      >
        {title}
      </span>
    </header>
  );
}
