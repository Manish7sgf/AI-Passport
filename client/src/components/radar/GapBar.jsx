import React, { useEffect, useState } from "react";
import { getScoreColor } from "../../utils/scoreCalc";

export default function GapBar({ gapPercentage = 0 }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(gapPercentage), 100);
    return () => clearTimeout(t);
  }, [gapPercentage]);

  const color = gapPercentage >= 70 ? "var(--red)" : gapPercentage >= 40 ? "var(--amber)" : "var(--green)";

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: "var(--font)",
          fontSize: "52px",
          fontWeight: "500",
          color,
          lineHeight: 1,
          marginBottom: "8px"
        }}
      >
        {gapPercentage}%
      </div>
      <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
        Between your skills and 2030 market demands
      </div>
      <div className="progress-track" style={{ height: "8px" }}>
        <div
          style={{
            height: "100%",
            width: `${animated}%`,
            background: color,
            borderRadius: "4px",
            transition: "width 0.8s ease"
          }}
        />
      </div>
    </div>
  );
}
