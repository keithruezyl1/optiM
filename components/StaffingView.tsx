"use client";

import { useMemo, useState } from "react";
import { Search, UserPlus, CheckCircle2 } from "lucide-react";
import type { ComputedStaff } from "@/lib/types";
import { StaffTable } from "./StaffTable";
import { AiSummaryPanel } from "./AiSummaryPanel";
import { AddStaffModal } from "./AddStaffModal";

type StatusFilter = "all" | "expiring" | "expired" | "onboarding";

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "expiring", label: "Expiring" },
  { key: "expired", label: "Expired" },
  { key: "onboarding", label: "Onboarding" },
];

export function StaffingView({ staff }: { staff: ComputedStaff[] }) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return staff.filter((s) => {
      const matchesStatus =
        filter === "all" ||
        (filter === "expiring" && s.bucket === "expiring") ||
        (filter === "expired" && s.bucket === "expired") ||
        (filter === "onboarding" && s.onboarding_status === "in_progress");
      const matchesQuery =
        q === "" ||
        s.full_name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [staff, filter, query]);

  function handleAdded() {
    setToast(true);
    window.setTimeout(() => setToast(false), 3200);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar: filters + search (left), add action (right) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1.5 text-table font-medium transition-colors duration-150 ease-ops ${
                    active
                      ? "border-gold text-gold"
                      : "border-border text-steel hover:text-navy-900"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or role"
              aria-label="Search staff by name or role"
              className="w-64 rounded-card border border-border bg-white py-1.5 pl-9 pr-3 text-ui text-ink placeholder:text-steel"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-card bg-navy-900 px-4 py-2 text-ui font-semibold text-white transition-colors duration-150 ease-ops hover:bg-navy-700"
        >
          <UserPlus size={16} aria-hidden />
          Add staff member
        </button>
      </div>

      <AiSummaryPanel staffCount={staff.length} />

      <StaffTable staff={filtered} />

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
