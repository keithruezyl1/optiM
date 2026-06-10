"use client";

import { useMemo, useState } from "react";
import { UserPlus, CheckCircle2 } from "lucide-react";
import type { ComputedStaff } from "@/lib/types";
import { StaffTable } from "./StaffTable";
import { AiSummaryPanel } from "./AiSummaryPanel";
import { AddStaffModal } from "./AddStaffModal";

// Orchestrates the Staffing tab. The coarse status view comes from the sidebar
// via the `status` prop (URL query); fine-grained filtering lives in the table's
// per-column filters.
export function StaffingView({
  staff,
  status,
}: {
  staff: ComputedStaff[];
  status: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(false);

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

  function handleAdded() {
    setToast(true);
    window.setTimeout(() => setToast(false), 3200);
  }

  return (
    <div className="flex flex-col gap-5">
      <AiSummaryPanel staffCount={staff.length} />

      <div className="flex items-center justify-between">
        <h2 className="t-h2">Staff directory</h2>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-card bg-navy-900 px-4 py-2 text-ui font-semibold text-white transition-colors duration-150 ease-ops hover:bg-navy-700"
        >
          <UserPlus size={16} aria-hidden />
          Add staff member
        </button>
      </div>

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
