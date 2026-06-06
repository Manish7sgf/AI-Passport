/**
 * Returns score color class based on value
 */
export function getScoreClass(score) {
  if (score >= 70) return "score-high";
  if (score >= 40) return "score-mid";
  return "score-low";
}

/**
 * Returns score color value based on value
 */
export function getScoreColor(score) {
  if (score >= 70) return "var(--green)";
  if (score >= 40) return "var(--amber)";
  return "var(--red)";
}

/**
 * Returns score label
 */
export function getScoreLabel(score) {
  if (score >= 70) return "Advanced";
  if (score >= 40) return "Intermediate";
  return "Emerging";
}

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate percentage for progress bar
 */
export function toPercent(value, max) {
  return Math.round((value / max) * 100);
}
