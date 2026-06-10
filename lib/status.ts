// SINGLE SOURCE OF TRUTH for all status computation.
// Imported by the UI, the API routes, and the PDF. Status is never stored.
//
// Thresholds (ARCHITECTURE.md section 3):
//   Credential:  expired  if expires_on < today
//                expiring if expires_on <= today + 60d
//                current  otherwise
//   Deliverable: overdue  if !completed && due_on < today
//                due_soon if !completed && due_on <= today + 14d
//                on_track otherwise

import type {
  ComputedContract,
  ComputedCredential,
  ComputedDeliverable,
  ComputedStaff,
  ContractRow,
  ContractStats,
  CredentialRow,
  CredentialStatus,
  DeliverableRow,
  DeliverableStatus,
  StaffRow,
  StaffStats,
} from "./types";

export const EXPIRING_WINDOW_DAYS = 60;
export const DUE_SOON_WINDOW_DAYS = 14;

/** Midnight (local) of the given date — strips time so comparisons are whole-day. */
function atMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Parse a 'YYYY-MM-DD' date string as a local calendar date (no TZ drift). */
function parseDateOnly(value: string): Date {
  const [y, m, day] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, day ?? 1);
}

/** Whole calendar days from `today` to `dateStr`. Negative = in the past. */
export function daysUntil(dateStr: string, today: Date = new Date()): number {
  const a = atMidnight(today).getTime();
  const b = atMidnight(parseDateOnly(dateStr)).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function credentialStatus(
  expiresOn: string,
  today: Date = new Date()
): CredentialStatus {
  const days = daysUntil(expiresOn, today);
  if (days < 0) return "expired";
  if (days <= EXPIRING_WINDOW_DAYS) return "expiring";
  return "current";
}

export function deliverableStatus(
  dueOn: string,
  completed: boolean,
  today: Date = new Date()
): DeliverableStatus {
  if (completed) return "on_track";
  const days = daysUntil(dueOn, today);
  if (days < 0) return "overdue";
  if (days <= DUE_SOON_WINDOW_DAYS) return "due_soon";
  return "on_track";
}

/** Worst credential wins: expired > expiring > current. Empty => current. */
export function worstBucket(
  credentials: Pick<CredentialRow, "expires_on">[],
  today: Date = new Date()
): CredentialStatus {
  let worst: CredentialStatus = "current";
  for (const c of credentials) {
    const s = credentialStatus(c.expires_on, today);
    if (s === "expired") return "expired";
    if (s === "expiring") worst = "expiring";
  }
  return worst;
}

export function computeCredential(
  c: CredentialRow,
  today: Date = new Date()
): ComputedCredential {
  return {
    ...c,
    status: credentialStatus(c.expires_on, today),
    days_remaining: daysUntil(c.expires_on, today),
  };
}

export function computeStaff(
  staff: StaffRow,
  credentials: CredentialRow[],
  today: Date = new Date()
): ComputedStaff {
  const computed = credentials
    .map((c) => computeCredential(c, today))
    // Most urgent credential first within each person's row.
    .sort((a, b) => a.days_remaining - b.days_remaining);
  return {
    ...staff,
    credentials: computed,
    bucket: worstBucket(credentials, today),
  };
}

export function computeDeliverable(
  d: DeliverableRow,
  today: Date = new Date()
): ComputedDeliverable {
  return {
    ...d,
    status: deliverableStatus(d.due_on, d.completed, today),
    days_remaining: daysUntil(d.due_on, today),
  };
}

export function computeContract(
  contract: ContractRow,
  deliverables: DeliverableRow[],
  today: Date = new Date()
): ComputedContract {
  return {
    ...contract,
    deliverables: deliverables
      .map((d) => computeDeliverable(d, today))
      .sort((a, b) => a.days_remaining - b.days_remaining),
  };
}

// ---- Aggregations (drive the Readiness Strip + stat strips everywhere) ----

export function staffStats(staff: ComputedStaff[]): StaffStats {
  return {
    total: staff.length,
    compliant: staff.filter((s) => s.bucket === "current").length,
    expiring: staff.filter((s) => s.bucket === "expiring").length,
    expired: staff.filter((s) => s.bucket === "expired").length,
    onboarding: staff.filter((s) => s.onboarding_status === "in_progress").length,
  };
}

export function contractStats(contracts: ComputedContract[]): ContractStats {
  const deliverables = contracts.flatMap((c) => c.deliverables);
  return {
    activeContracts: contracts.filter((c) => c.status === "active").length,
    totalDeliverables: deliverables.length,
    overdue: deliverables.filter((d) => d.status === "overdue").length,
    dueThisMonth: deliverables.filter(
      (d) => d.status !== "overdue" && d.days_remaining >= 0 && d.days_remaining <= 30
    ).length,
  };
}

// ---- Pill labels (DESIGN_GUIDELINES.md section 5) ----

/** Short month/day, e.g. "Jun 19". Used in mono date contexts and pills. */
export function formatShortDate(dateStr: string): string {
  return parseDateOnly(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function credentialPillLabel(c: ComputedCredential): string {
  if (c.status === "expired") return "EXPIRED";
  if (c.status === "expiring") return `EXPIRES IN ${c.days_remaining}D`;
  return "CURRENT";
}

export function deliverablePillLabel(d: ComputedDeliverable): string {
  if (d.status === "overdue") return "OVERDUE";
  if (d.status === "due_soon") return `DUE ${formatShortDate(d.due_on).toUpperCase()}`;
  return "ON TRACK";
}
