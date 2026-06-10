"use client";

import { motion, useReducedMotion } from "motion/react";

export type AiState = "idle" | "loading" | "done" | "error";

// Presentational result card for the AI compliance summary. The trigger button
// lives in the toolbar (StaffingView); this renders the resting / loading / done
// / error states. Errors never dead-end: the route returns a deterministic
// fallback, so this only shows an error on transport failure, with retry.
export function AiSummaryPanel({
  state,
  summary,
  staffCount,
  onRetry,
}: {
  state: AiState;
  summary: string;
  staffCount: number;
  onRetry: () => void;
}) {
  const reduced = useReducedMotion();

  if (state === "idle") {
    // One-line resting state so the space reads intentional before first run.
    return (
      <div className="rounded-card border border-border border-t-2 border-t-gold bg-white p-4 shadow-card">
        <div className="text-label uppercase tracking-wide text-steel">AI Operations Summary</div>
        <p className="mt-1.5 text-ui text-steel">
          Run an AI compliance summary across {staffCount} staff records — credential risk, facility
          concentration, and the most urgent items.
        </p>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="rounded-card border border-border border-t-2 border-t-gold bg-white p-5 shadow-card">
        <div className="text-label uppercase tracking-wide text-steel">AI Operations Summary</div>
        <div className="mt-3 flex items-center gap-3 text-ui text-steel">
          <span className="h-2 w-2 animate-pulse rounded-full bg-gold" aria-hidden />
          Analyzing {staffCount} staff records…
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div
        role="alert"
        className="rounded-card border border-border border-l-[3px] border-l-signal-red bg-white p-5 text-ui text-ink shadow-card"
      >
        AI summary failed to load.{" "}
        <button type="button" onClick={onRetry} className="font-semibold text-navy-700 underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="rounded-card border border-border border-t-2 border-t-gold bg-white p-5 shadow-card"
    >
      <div className="text-label uppercase tracking-wide text-steel">AI Operations Summary</div>
      <p className="mt-3 text-[15px] leading-[1.6] text-ink">{summary}</p>
    </motion.div>
  );
}
