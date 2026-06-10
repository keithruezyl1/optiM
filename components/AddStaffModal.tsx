"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ROLES, FACILITIES, COMMON_CREDENTIALS } from "@/lib/constants";

// The single live-CRUD moment for the Loom: plain labeled fields, gold submit,
// success toast. Writes to Supabase via POST /api/staff, then refreshes the
// server data so the table + Readiness Strip recompute from the source.

export function AddStaffModal({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    role: ROLES[0] as string,
    facility: FACILITIES[0] as string,
    onboarding_status: "complete" as "complete" | "in_progress",
    credential_name: COMMON_CREDENTIALS[0] as string,
    expires_on: "",
  });

  // Close on Escape; reset form whenever the modal is opened.
  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm((f) => ({ ...f, full_name: "", expires_on: "" }));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `Server responded ${res.status}`);
      }
      router.refresh();
      onAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add staff member.");
    } finally {
      setSubmitting(false);
    }
  }

  const field = "w-full rounded-card border border-border bg-white px-3 py-2 text-ui text-ink";
  const labelCls = "text-label uppercase text-steel";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-navy-900/40 p-4 pt-[10vh]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-staff-title"
        className="w-full max-w-lg rounded-card border border-border bg-white shadow-card"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="add-staff-title" className="text-section font-semibold text-navy-900">
            Add staff member
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-steel hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4 px-5 py-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="full_name" className={labelCls}>Full name</label>
            <input
              id="full_name"
              required
              autoFocus
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className={field}
              placeholder="e.g. Jordan Mireles"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="role" className={labelCls}>Role</label>
              <select id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={field}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="facility" className={labelCls}>Facility / Deployment</label>
              <select id="facility" value={form.facility} onChange={(e) => setForm({ ...form, facility: e.target.value })} className={field}>
                {FACILITIES.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="credential_name" className={labelCls}>Credential</label>
              <input
                id="credential_name"
                required
                list="credential-options"
                value={form.credential_name}
                onChange={(e) => setForm({ ...form, credential_name: e.target.value })}
                className={field}
              />
              <datalist id="credential-options">
                {COMMON_CREDENTIALS.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="expires_on" className={labelCls}>Credential expiry</label>
              <input
                id="expires_on"
                type="date"
                required
                value={form.expires_on}
                onChange={(e) => setForm({ ...form, expires_on: e.target.value })}
                className={`${field} font-mono`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="onboarding_status" className={labelCls}>Onboarding status</label>
            <select
              id="onboarding_status"
              value={form.onboarding_status}
              onChange={(e) => setForm({ ...form, onboarding_status: e.target.value as "complete" | "in_progress" })}
              className={field}
            >
              <option value="complete">Complete</option>
              <option value="in_progress">In progress</option>
            </select>
          </div>

          {error && (
            <p role="alert" className="rounded-card border-l-[3px] border-signal-red bg-banner-red px-3 py-2 text-table text-ink">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-ui font-medium text-steel hover:text-ink">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-card bg-gold px-4 py-2 text-ui font-semibold text-navy-900 transition-colors duration-150 ease-ops hover:bg-[#A6851F] disabled:cursor-wait disabled:opacity-80"
            >
              {submitting ? "Adding…" : "Add staff member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
