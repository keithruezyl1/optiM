"use client";

import { useMemo, useState } from "react";
import { credentialPillLabel, formatShortDate } from "@/lib/status";
import type { ComputedStaff, CredentialStatus } from "@/lib/types";
import { StatusPill, type PillTone } from "./StatusPill";
import { Avatar } from "./Avatar";
import { ColumnFilter } from "./ColumnFilter";

const CRED_TONE: Record<CredentialStatus, PillTone> = {
  expired: "red",
  expiring: "amber",
  current: "green",
};

const BUCKET_BORDER: Record<CredentialStatus, string> = {
  expired: "#C0392B",
  expiring: "#C77D1F",
  current: "transparent",
};

// Self-contained staff table with per-column filters. Each filter narrows the
// rows live and the container reflows; a summary line reports the visible count.
// Credentials, Status, and Expiry are three aligned stacked columns (one entry
// per credential per row).
export function StaffTable({ staff }: { staff: ComputedStaff[] }) {
  const [name, setName] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [creds, setCreds] = useState<string[]>([]);
  const [status, setStatus] = useState("all"); // all | expired | expiring | current (worst bucket)
  const [facilities, setFacilities] = useState<string[]>([]);
  const [onboarding, setOnboarding] = useState("all"); // all | complete | in_progress

  const roleOptions = useMemo(
    () => Array.from(new Set(staff.map((s) => s.role))).sort(),
    [staff]
  );
  const facilityOptions = useMemo(
    () => Array.from(new Set(staff.map((s) => s.facility))).sort(),
    [staff]
  );
  const credOptions = useMemo(
    () => Array.from(new Set(staff.flatMap((s) => s.credentials.map((c) => c.credential_name)))).sort(),
    [staff]
  );

  const filtered = useMemo(() => {
    const q = name.trim().toLowerCase();
    return staff.filter((s) => {
      if (q && !s.full_name.toLowerCase().includes(q)) return false;
      if (roles.length && !roles.includes(s.role)) return false;
      if (facilities.length && !facilities.includes(s.facility)) return false;
      if (creds.length && !s.credentials.some((c) => creds.includes(c.credential_name))) return false;
      if (status !== "all" && s.bucket !== status) return false;
      if (onboarding !== "all" && s.onboarding_status !== onboarding) return false;
      return true;
    });
  }, [staff, name, roles, facilities, creds, status, onboarding]);

  const anyFilter =
    name !== "" || roles.length > 0 || creds.length > 0 || status !== "all" || facilities.length > 0 || onboarding !== "all";

  function clearAll() {
    setName("");
    setRoles([]);
    setCreds([]);
    setStatus("all");
    setFacilities([]);
    setOnboarding("all");
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3 text-table text-steel">
        <span>
          Showing <span className="font-semibold text-ink tabular-nums">{filtered.length}</span> of{" "}
          <span className="tabular-nums">{staff.length}</span> staff
        </span>
        {anyFilter && (
          <button type="button" onClick={clearAll} className="font-medium text-navy-700 underline">
            Clear filters
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-card border border-border bg-white shadow-card">
        <table className="w-full border-collapse text-table">
          <thead className="bg-white">
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3">
                <ColumnFilter kind="text" label="Name" active={name !== ""} value={name} onChange={setName} />
              </th>
              <th className="px-4 py-3">
                <ColumnFilter kind="multi" label="Role" active={roles.length > 0} value={roles} options={roleOptions} onChange={setRoles} />
              </th>
              <th className="px-4 py-3">
                <ColumnFilter kind="multi" label="Credentials" active={creds.length > 0} value={creds} options={credOptions} onChange={setCreds} />
              </th>
              <th className="px-4 py-3">
                <ColumnFilter
                  kind="single"
                  label="Status"
                  active={status !== "all"}
                  value={status}
                  options={[
                    { value: "all", label: "All" },
                    { value: "expired", label: "Expired" },
                    { value: "expiring", label: "Expiring ≤60d" },
                    { value: "current", label: "Current" },
                  ]}
                  onChange={setStatus}
                />
              </th>
              <th className="px-4 py-3 text-center">
                <span className="text-label uppercase tracking-wide text-steel">Expiry</span>
              </th>
              <th className="px-4 py-3">
                <ColumnFilter kind="multi" label="Facility / Deployment" active={facilities.length > 0} value={facilities} options={facilityOptions} onChange={setFacilities} />
              </th>
              <th className="px-4 py-3 text-center">
                <div className="flex justify-center">
                  <ColumnFilter
                    kind="single"
                    label="Onboarding"
                    align="right"
                    active={onboarding !== "all"}
                    value={onboarding}
                    options={[
                      { value: "all", label: "All" },
                      { value: "complete", label: "Complete" },
                      { value: "in_progress", label: "In progress" },
                    ]}
                    onChange={setOnboarding}
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-border align-top last:border-b-0">
                <td className="px-4 py-3" style={{ boxShadow: `inset 3px 0 0 ${BUCKET_BORDER[s.bucket]}` }}>
                  <span className="flex items-center gap-2.5">
                    <Avatar name={s.full_name} role={s.role} />
                    <span className="font-medium text-ink">{s.full_name}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-ink">{s.role}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1.5">
                    {s.credentials.map((c) => (
                      <span key={c.id} className="leading-[22px] text-ink">
                        {c.credential_name}
                      </span>
                    ))}
                    {s.credentials.length === 0 && <span className="text-steel">No credentials on file</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-start gap-1.5">
                    {s.credentials.map((c) => (
                      <span key={c.id} className="flex h-[22px] items-center">
                        <StatusPill tone={CRED_TONE[c.status]} label={credentialPillLabel(c)} />
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    {s.credentials.map((c) => (
                      <span key={c.id} className="font-mono text-[12px] leading-[22px] text-ink tnum">
                        {formatShortDate(c.expires_on)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-ink">{s.facility}</td>
                <td className="px-4 py-3 text-center">
                  {s.onboarding_status === "in_progress" ? (
                    <span className="font-medium" style={{ color: "#C77D1F" }}>
                      Onboarding
                    </span>
                  ) : (
                    <span className="font-medium" style={{ color: "#2BA66B" }}>
                      Complete
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-10 text-center text-ui text-steel">No staff match these filters.</div>
        )}
      </div>
    </div>
  );
}
