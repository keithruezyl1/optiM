import { AlertTriangle } from "lucide-react";

// Persistent overdue alert (Contracts). Full-width, signal-red left border,
// pale red fill, bold count. Must be obvious in a 720p Loom. Renders nothing
// when there is nothing overdue.
export function OverdueBanner({
  count,
  contractCount,
}: {
  count: number;
  contractCount: number;
}) {
  if (count === 0) return null;
  return (
    <div className="border-b border-border bg-banner-red">
      <div className="mx-auto w-full max-w-[1280px] px-6">
        <div
          role="alert"
          className="flex items-center gap-3 border-l-[3px] border-signal-red py-3 pl-4"
        >
          <AlertTriangle size={18} className="shrink-0 text-signal-red" aria-hidden />
          <p className="text-ui text-ink">
            <span className="font-semibold text-signal-red">
              {count} deliverable{count === 1 ? "" : "s"} overdue
            </span>{" "}
            across {contractCount} contract{contractCount === 1 ? "" : "s"} — action needed.
          </p>
        </div>
      </div>
    </div>
  );
}
