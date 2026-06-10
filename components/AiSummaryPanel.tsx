"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";

// "AI Operations Summary" — a card with a thin gold top border and an eyebrow
// label. The button calls /api/summary; the panel fades in. Loading state is
// narratable on camera ("Analyzing 15 staff records…"). Errors never dead-end:
// the route itself returns a deterministic fallback, so this only shows an
// error on transport failure, with a retry.

export function AiSummaryPanel({ staffCount }: { staffCount: number }) {
  const reduced = useReducedMotion();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [summary, setSummary] = useState<string>("");

  async function run() {
    setState("loading");
    try {
      const res = await fetch("/api/summary", { cache: "no-store" });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const json = (await res.json()) as { summary?: string };
      if (!json.summary) throw new Error("No summary returned");
      setSummary(json.summary);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={run}
          disabled={state === "loading"}
          className="inline-flex items-center gap-2 rounded-card border border-navy-900 px-4 py-2 text-ui font-semibold text-navy-900 transition-colors duration-150 ease-ops hover:bg-navy-900 hover:text-white disabled:cursor-wait disabled:opacity-70"
        >
          <Sparkles size={16} aria-hidden />
          {state === "loading" ? "Analyzing…" : "Run AI summary"}
        </button>
      </div>

      {state === "loading" && (
        <div className="rounded-card border border-border border-t-2 border-t-gold bg-white p-5 shadow-card">
          <div className="text-label uppercase tracking-wide text-steel">
            AI Operations Summary
          </div>
          <div className="mt-3 flex items-center gap-3 text-ui text-steel">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold" aria-hidden />
            Analyzing {staffCount} staff records…
          </div>
        </div>
      )}

      {state === "done" && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="rounded-card border border-border border-t-2 border-t-gold bg-white p-5 shadow-card"
        >
          <div className="text-label uppercase tracking-wide text-steel">
            AI Operations Summary
          </div>
          <p className="mt-3 text-[15px] leading-[1.6] text-ink">{summary}</p>
        </motion.div>
      )}

      {state === "error" && (
        <div
          role="alert"
          className="rounded-card border border-border border-l-[3px] border-l-signal-red bg-white p-5 text-ui text-ink shadow-card"
        >
          AI summary failed to load.{" "}
          <button type="button" onClick={run} className="font-semibold text-navy-700 underline">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
