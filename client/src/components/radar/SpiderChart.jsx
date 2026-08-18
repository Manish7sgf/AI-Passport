import React from "react";

/**
 * Pure SVG spider/radar chart — no dependencies.
 * Props:
 *   current  : [{ name, value }]   — 0-100
 *   future   : [{ name, value }]   — 0-100 (optional overlay)
 *   size     : number (default 300)
 */
export default function SpiderChart({ current = [], future = [], size = 300 }) {
  if (current.length < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const R  = size * 0.38; // outer radius
  const N  = current.length;
  const levels = 4;

  // Angle for each axis (top = -90deg)
  const angle = (i) => (Math.PI * 2 * i) / N - Math.PI / 2;

  // Point on axis at 0-1 scale
  const point = (i, scale) => ({
    x: cx + R * scale * Math.cos(angle(i)),
    y: cy + R * scale * Math.sin(angle(i))
  });

  // Polygon path from array of {x,y}
  const poly = (pts) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

  // Grid rings
  const rings = Array.from({ length: levels }, (_, i) => {
    const scale = (i + 1) / levels;
    const pts = current.map((_, idx) => point(idx, scale));
    return poly(pts);
  });

  // Data polygons
  const currentPoly = poly(current.map((d, i) => point(i, (d.value || 0) / 100)));
  const futurePoly  = future.length === current.length
    ? poly(future.map((d, i) => point(i, (d.value || 0) / 100)))
    : null;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid rings */}
      {rings.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="var(--border)" strokeWidth="0.5" />
      ))}

      {/* Axis lines */}
      {current.map((_, i) => {
        const p = point(i, 1);
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={p.x} y2={p.y}
            stroke="var(--border)"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Future overlay */}
      {futurePoly && (
        <path
          d={futurePoly}
          fill="var(--green)"
          fillOpacity="0.08"
          stroke="var(--green)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      )}

      {/* Current data */}
      <path
        d={currentPoly}
        fill="var(--accent)"
        fillOpacity="0.12"
        stroke="var(--accent)"
        strokeWidth="1.5"
      />

      {/* Data dots */}
      {current.map((d, i) => {
        const p = point(i, (d.value || 0) / 100);
        return <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--accent)" />;
      })}

      {/* Labels */}
      {current.map((d, i) => {
        const labelR = R + 18;
        const lx = cx + labelR * Math.cos(angle(i));
        const ly = cy + labelR * Math.sin(angle(i));
        const anchor = Math.cos(angle(i)) > 0.1 ? "start" : Math.cos(angle(i)) < -0.1 ? "end" : "middle";
        return (
          <text
            key={i}
            x={lx}
            y={ly + 4}
            textAnchor={anchor}
            fontSize="10"
            fontFamily="var(--font-body)"
            fill="var(--text-secondary)"
          >
            {d.name.length > 14 ? d.name.slice(0, 13) + "…" : d.name}
          </text>
        );
      })}

      {/* Legend */}
      <g transform={`translate(12, ${size - 32})`}>
        <rect width="10" height="2" y="4" fill="var(--accent)" />
        <text x="14" y="9" fontSize="10" fontFamily="var(--font-body)" fill="var(--text-secondary)">Current</text>
        {futurePoly && (
          <>
            <rect width="10" height="2" y="4" x="70" fill="var(--green)" />
            <text x="84" y="9" fontSize="10" fontFamily="var(--font-body)" fill="var(--text-secondary)">2030</text>
          </>
        )}
      </g>
    </svg>
  );
}
