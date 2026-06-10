import { AlertTriangle } from "lucide-react";

// Persistent overdue alert (Contracts). signal-red left border, pale red fill,
// bold count. Obvious in a 720p Loom. Renders nothing when nothing is overdue.
export function OverdueBanner({
  count,
  contractCount,
}: {
  count: number;
  contractCount: number;
}) {
  if (count === 0) return null;
  return (
    <div
      role="alert"
      className="mb-6 flex items-center gap-3 rounded-card border border-border border-l-[3px] border-l-signal-red bg-banner-red px-4 py-3.5 shadow-card"
    >
      <AlertTriangle size={20} className="shrink-0 text-signal-red" aria-hidden />
      <p className="text-ui text-ink">
        <span className="font-semibold text-signal-red">
          {count} deliverable{count === 1 ? "" : "s"} overdue
        </span>{" "}
        across {contractCount} contract{contractCount === 1 ? "" : "s"} — action needed.
      </p>
    </div>
  );
}
