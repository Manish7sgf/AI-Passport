/**
 * Format date to readable string
 */
export function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Extract owner/repo from GitHub URL
 */
export function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([\w-]+)\/([\w.-]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

/**
 * Truncate text to given length
 */
export function truncate(str, length = 100) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
