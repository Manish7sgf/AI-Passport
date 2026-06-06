import React, { useEffect, useState } from "react";
import { getScoreColor, getScoreLabel } from "../../utils/scoreCalc";

export default function ScoreRing({ score = 0, size = 120 }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(animatedScore);
  const dashOffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <svg width={size} height={size} style={{ position: "absolute", transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-secondary)"
          strokeWidth="8"
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.3s ease" }}
        />
      </svg>

      {/* Center text */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px"
        }}
      >
        <span
          style={{
            fontFamily: "var(--font)",
            fontSize: size >= 120 ? "28px" : "20px",
            fontWeight: "500",
            color,
            lineHeight: 1
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontFamily: "var(--font)",
            fontSize: "10px",
            color: "var(--text-tertiary)",
            lineHeight: 1
          }}
        >
          / 100
        </span>
      </div>
    </div>
  );
}
