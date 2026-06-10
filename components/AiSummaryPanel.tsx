"use client";

import { motion, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";

export type AiState = "idle" | "loading" | "done" | "error";

const EYEBROW = "AI Operations Summary";

function RunButton({
  label,
  onRun,
  disabled,
}: {
  label: string;
  onRun: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onRun}
      disabled={disabled}
      className="inline-flex shrink-0 items-center gap-2 rounded-card border border-navy-900 px-4 py-2 text-ui font-semibold text-navy-900 transition-colors duration-150 ease-ops hover:bg-navy-900 hover:text-white disabled:cursor-wait disabled:opacity-70"
    >
      <Sparkles size={16} aria-hidden />
      {label}
    </button>
  );
}

// AI compliance summary card. The trigger button lives inside the card. Errors
// never dead-end: the route returns a deterministic fallback, so this only shows
// an error on transport failure, with retry.
export function AiSummaryPanel({
  state,
  summary,
  staffCount,
  onRun,
}: {
  state: AiState;
  summary: string;
  staffCount: number;
  onRun: () => void;
}) {
  const reduced = useReducedMotion();

  if (state === "idle") {
    return (
      <div className="rounded-card border border-border border-t-2 border-t-gold bg-white p-4 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-label uppercase tracking-wide text-steel">{EYEBROW}</div>
            <p className="mt-1.5 text-ui text-steel">
              Summarize compliance across {staffCount} staff records — credential risk, facility
              concentration, and the most urgent items.
            </p>
          </div>
          <RunButton label="Run AI summary" onRun={onRun} />
        </div>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="rounded-card border border-border border-t-2 border-t-gold bg-white p-5 shadow-card">
        <div className="text-label uppercase tracking-wide text-steel">{EYEBROW}</div>
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
        className="flex items-center justify-between gap-4 rounded-card border border-border border-l-[3px] border-l-signal-red bg-white p-5 shadow-card"
      >
        <span className="text-ui text-ink">AI summary failed to load.</span>
        <RunButton label="Try again" onRun={onRun} />
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
      <div className="flex items-start justify-between gap-4">
        <div className="text-label uppercase tracking-wide text-steel">{EYEBROW}</div>
        <button
          type="button"
          onClick={onRun}
          className="shrink-0 text-table font-medium text-navy-700 underline hover:text-navy-900"
        >
          Regenerate
        </button>
      </div>
      <p className="mt-3 text-[15px] leading-[1.6] text-ink">{summary}</p>
    </motion.div>
  );
}
