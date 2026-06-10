"use client";

import { useMemo, useState } from "react";
import { UserPlus, CheckCircle2, Sparkles } from "lucide-react";
import type { ComputedStaff } from "@/lib/types";
import { StaffTable } from "./StaffTable";
import { AiSummaryPanel, type AiState } from "./AiSummaryPanel";
import { AddStaffModal } from "./AddStaffModal";

// Orchestrates the Staffing tab. The coarse status view comes from the sidebar
// via the `status` prop (URL query); fine-grained filtering lives in the table's
// per-column filters. Owns the AI summary state so its trigger can sit in the
// toolbar while the result card renders below.
export function StaffingView({
  staff,
  status,
}: {
  staff: ComputedStaff[];
  status: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [aiState, setAiState] = useState<AiState>("idle");
  const [summary, setSummary] = useState("");

  const scoped = useMemo(() => {
    switch (status) {
      case "compliant":
        return staff.filter((s) => s.bucket === "current");
      case "expiring":
        return staff.filter((s) => s.bucket === "expiring");
      case "expired":
        return staff.filter((s) => s.bucket === "expired");
      case "onboarding":
        return staff.filter((s) => s.onboarding_status === "in_progress");
      default:
        return staff;
    }
  }, [staff, status]);

  async function runAi() {
    setAiState("loading");
    try {
      const res = await fetch("/api/summary", { cache: "no-store" });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const json = (await res.json()) as { summary?: string };
      if (!json.summary) throw new Error("No summary returned");
      setSummary(json.summary);
      setAiState("done");
    } catch {
      setAiState("error");
    }
  }

  function handleAdded() {
    setToast(true);
    window.setTimeout(() => setToast(false), 3200);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="t-h2">Staff directory</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={runAi}
            disabled={aiState === "loading"}
            className="inline-flex items-center gap-2 rounded-card border border-navy-900 px-4 py-2 text-ui font-semibold text-navy-900 transition-colors duration-150 ease-ops hover:bg-navy-900 hover:text-white disabled:cursor-wait disabled:opacity-70"
          >
            <Sparkles size={16} aria-hidden />
            {aiState === "loading" ? "Analyzing…" : "Run AI summary"}
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-card bg-navy-900 px-4 py-2 text-ui font-semibold text-white transition-colors duration-150 ease-ops hover:bg-navy-700"
          >
            <UserPlus size={16} aria-hidden />
            Add staff member
          </button>
        </div>
      </div>

      <AiSummaryPanel state={aiState} summary={summary} staffCount={staff.length} onRetry={runAi} />

      <StaffTable staff={scoped} />

      <AddStaffModal open={modalOpen} onClose={() => setModalOpen(false)} onAdded={handleAdded} />

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-card border border-border bg-white px-4 py-3 text-ui font-medium text-ink shadow-card"
        >
          <CheckCircle2 size={18} className="text-ops-green" aria-hidden />
          Staff member added.
        </div>
      )}
    </div>
  );
}
