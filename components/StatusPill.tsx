// Status pill (DESIGN_GUIDELINES.md section 5): 11px uppercase, status-color
// text on a ~12%-opacity tint of the same color. Text-based, never icon-based.

export type PillTone = "red" | "amber" | "green" | "neutral";

const TONE: Record<PillTone, { color: string; bg: string }> = {
  red: { color: "#C0392B", bg: "rgba(192,57,43,0.12)" },
  amber: { color: "#C77D1F", bg: "rgba(199,125,31,0.12)" },
  green: { color: "#1F7A4D", bg: "rgba(31,122,77,0.12)" },
  neutral: { color: "#5B6B82", bg: "rgba(91,107,130,0.12)" },
};

export function StatusPill({ tone, label }: { tone: PillTone; label: string }) {
  const { color, bg } = TONE[tone];
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded px-2 py-0.5 text-label font-semibold uppercase"
      style={{ color, backgroundColor: bg }}
    >
      {label}
    </span>
  );
}
