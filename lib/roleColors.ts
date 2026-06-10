// Distinct, color-coded identity per JVM role. Used for the generated avatars
// (initials on a role gradient) so the eye can group people by discipline at a
// glance without adding another status color to the table.

export interface RoleColor {
  from: string; // gradient start
  to: string; // gradient end
}

const ROLE_COLORS: Record<string, RoleColor> = {
  "Registered Nurse": { from: "#0E9D8E", to: "#0B7A6E" }, // teal
  "Clinical Social Worker": { from: "#7C5CD6", to: "#5B3FB0" }, // violet
  "Case Manager": { from: "#4763C9", to: "#324BA6" }, // indigo
  Nutritionist: { from: "#3E9B57", to: "#2C7A42" }, // green
  "Pharmacy Technician": { from: "#D98A34", to: "#B86E1E" }, // amber
  Phlebotomist: { from: "#D2566B", to: "#B23A50" }, // rose
  "Cardiovascular Technologist": { from: "#C0453B", to: "#9E322A" }, // crimson
  "MRI Technologist": { from: "#3576C9", to: "#255CA6" }, // blue
  "Medical Laboratory Technician": { from: "#2C9BB0", to: "#1F7A8C" }, // cyan
};

const FALLBACK: RoleColor = { from: "#5B6B82", to: "#3F4D63" }; // steel

export function roleColor(role: string): RoleColor {
  return ROLE_COLORS[role] ?? FALLBACK;
}

/** First + last initial, e.g. "Maria Delgado" -> "MD". */
export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
