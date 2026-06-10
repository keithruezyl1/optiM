import { credentialPillLabel, formatShortDate } from "@/lib/status";
import type { ComputedStaff, CredentialStatus } from "@/lib/types";
import { StatusPill, type PillTone } from "./StatusPill";

// Maps a credential status to its pill tone. Single mapping reused everywhere.
const CRED_TONE: Record<CredentialStatus, PillTone> = {
  expired: "red",
  expiring: "amber",
  current: "green",
};

// Left-border accent color by worst-credential bucket (3px, never a full fill).
const BUCKET_BORDER: Record<CredentialStatus, string> = {
  expired: "#C0392B",
  expiring: "#C77D1F",
  current: "transparent",
};

export function StaffTable({ staff }: { staff: ComputedStaff[] }) {
  if (staff.length === 0) {
    return (
      <div className="rounded-card border border-border bg-white p-10 text-center text-ui text-steel shadow-card">
        No staff match this filter.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-border bg-white shadow-card">
      <table className="w-full border-collapse text-table">
        <thead className="sticky top-0 z-[1] bg-white">
          <tr className="border-b border-border text-left text-label uppercase text-steel">
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Role</th>
            <th className="px-4 py-3 font-semibold">Credentials</th>
            <th className="px-4 py-3 text-right font-semibold">Expiry</th>
            <th className="px-4 py-3 font-semibold">Facility / Deployment</th>
            <th className="px-4 py-3 font-semibold">Onboarding</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s.id} className="border-b border-border align-top last:border-b-0">
              <td className="px-4 py-3" style={{ boxShadow: `inset 3px 0 0 ${BUCKET_BORDER[s.bucket]}` }}>
                <span className="font-medium text-ink">{s.full_name}</span>
              </td>
              <td className="px-4 py-3 text-ink">{s.role}</td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1.5">
                  {s.credentials.map((c) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <span className="text-ink">{c.credential_name}</span>
                      <StatusPill tone={CRED_TONE[c.status]} label={credentialPillLabel(c)} />
                    </div>
                  ))}
                  {s.credentials.length === 0 && (
                    <span className="text-steel">No credentials on file</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex flex-col gap-1.5">
                  {s.credentials.map((c) => (
                    <span key={c.id} className="font-mono text-[12px] leading-[22px] text-ink tnum">
                      {formatShortDate(c.expires_on)}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-ink">{s.facility}</td>
              <td className="px-4 py-3">
                {s.onboarding_status === "in_progress" ? (
                  <StatusPill tone="neutral" label="ONBOARDING" />
                ) : (
                  <span className="text-steel">Complete</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
