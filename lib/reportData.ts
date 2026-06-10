import "server-only";
import { getSupabaseAdmin } from "./supabase";
import {
  computeContract,
  computeStaff,
  contractStats,
  formatShortDate,
  staffStats,
} from "./status";
import type {
  ComputedContract,
  ComputedStaff,
  ContractRow,
  ContractStats,
  CredentialRow,
  DeliverableRow,
  StaffRow,
  StaffStats,
} from "./types";

// Gathers everything the AI summary and the PDF need. One place that talks to
// the database for reporting, so the in-app panel, /api/summary, and the PDF
// route all see identical numbers.

// ---- Flattened report line shapes ----

export interface CredentialLine {
  full_name: string;
  role: string;
  facility: string;
  credential_name: string;
  expires_on: string;
  days_remaining: number;
}

export interface DeliverableLine {
  contract_number: string;
  contract_name: string;
  title: string;
  owner: string;
  due_on: string;
  days_remaining: number;
}

export interface ReportData {
  generatedAt: string; // ISO
  period: string; // human-readable reporting window
  staffing: {
    stats: StaffStats;
    expired: CredentialLine[];
    expiring: CredentialLine[];
  };
  contracts: {
    stats: ContractStats;
    overdue: DeliverableLine[];
    dueSoon: DeliverableLine[];
  };
}

// ---- DB fetch + compute ----

export async function getStaffData(today: Date = new Date()): Promise<ComputedStaff[]> {
  const supabaseAdmin = getSupabaseAdmin();
  const [{ data: staff, error: sErr }, { data: creds, error: cErr }] = await Promise.all([
    supabaseAdmin.from("staff").select("*").order("full_name"),
    supabaseAdmin.from("credentials").select("*"),
  ]);
  if (sErr) throw sErr;
  if (cErr) throw cErr;

  const byStaff = new Map<string, CredentialRow[]>();
  for (const c of (creds as CredentialRow[]) ?? []) {
    const list = byStaff.get(c.staff_id) ?? [];
    list.push(c);
    byStaff.set(c.staff_id, list);
  }
  return ((staff as StaffRow[]) ?? []).map((s) =>
    computeStaff(s, byStaff.get(s.id) ?? [], today)
  );
}

export async function getContractData(
  today: Date = new Date()
): Promise<ComputedContract[]> {
  const supabaseAdmin = getSupabaseAdmin();
  const [{ data: contracts, error: ctErr }, { data: dels, error: dErr }] =
    await Promise.all([
      supabaseAdmin.from("contracts").select("*").order("contract_number"),
      supabaseAdmin.from("deliverables").select("*"),
    ]);
  if (ctErr) throw ctErr;
  if (dErr) throw dErr;

  const byContract = new Map<string, DeliverableRow[]>();
  for (const d of (dels as DeliverableRow[]) ?? []) {
    const list = byContract.get(d.contract_id) ?? [];
    list.push(d);
    byContract.set(d.contract_id, list);
  }
  return ((contracts as ContractRow[]) ?? []).map((c) =>
    computeContract(c, byContract.get(c.id) ?? [], today)
  );
}

// ---- Reporting-window label ----

function reportingPeriod(today: Date): string {
  const end = today;
  const start = new Date(today);
  start.setDate(start.getDate() - 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

// ---- Assemble the structured report (PDF props + summary input) ----

export async function buildReportData(today: Date = new Date()): Promise<ReportData> {
  const [staff, contracts] = await Promise.all([
    getStaffData(today),
    getContractData(today),
  ]);

  const credLines: CredentialLine[] = staff.flatMap((s) =>
    s.credentials.map((c) => ({
      full_name: s.full_name,
      role: s.role,
      facility: s.facility,
      credential_name: c.credential_name,
      expires_on: c.expires_on,
      days_remaining: c.days_remaining,
    }))
  );

  const delLines: DeliverableLine[] = contracts.flatMap((c) =>
    c.deliverables.map((d) => ({
      contract_number: c.contract_number,
      contract_name: c.name,
      title: d.title,
      owner: d.owner,
      due_on: d.due_on,
      days_remaining: d.days_remaining,
    }))
  );

  const expired = credLines
    .filter((c) => c.days_remaining < 0)
    .sort((a, b) => a.days_remaining - b.days_remaining);
  const expiring = credLines
    .filter((c) => c.days_remaining >= 0 && c.days_remaining <= 60)
    .sort((a, b) => a.days_remaining - b.days_remaining);

  const overdue = delLines
    .filter((d) => d.days_remaining < 0)
    .sort((a, b) => a.days_remaining - b.days_remaining);
  const dueSoon = delLines
    .filter((d) => d.days_remaining >= 0 && d.days_remaining <= 14)
    .sort((a, b) => a.days_remaining - b.days_remaining);

  return {
    generatedAt: today.toISOString(),
    period: reportingPeriod(today),
    staffing: { stats: staffStats(staff), expired, expiring },
    contracts: { stats: contractStats(contracts), overdue, dueSoon },
  };
}

// ---- AI input blobs (compact, what we hand the model) ----

export function staffingSummaryInput(report: ReportData) {
  return {
    stats: report.staffing.stats,
    expired_credentials: report.staffing.expired,
    expiring_credentials: report.staffing.expiring,
  };
}

export function executiveSummaryInput(report: ReportData) {
  return {
    reporting_period: report.period,
    staffing: {
      stats: report.staffing.stats,
      expired_credentials: report.staffing.expired,
      expiring_credentials: report.staffing.expiring,
    },
    contracts: {
      stats: report.contracts.stats,
      overdue_deliverables: report.contracts.overdue,
      due_soon_deliverables: report.contracts.dueSoon,
    },
  };
}

// ---- Deterministic fallbacks (used when OpenAI is unavailable) ----

function topFacilities(lines: CredentialLine[]): string {
  const counts = new Map<string, number>();
  for (const l of lines) counts.set(l.facility, (counts.get(l.facility) ?? 0) + 1);
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([f]) => f);
  if (sorted.length === 0) return "";
  if (sorted.length === 1) return sorted[0];
  return `${sorted[0]} and ${sorted[1]}`;
}

export function fallbackComplianceSummary(report: ReportData): string {
  const { stats, expired, expiring } = report.staffing;
  const parts: string[] = [];
  parts.push(
    `Of ${stats.total} staff, ${stats.compliant} are fully compliant, ${stats.expiring} have a credential expiring within 60 days, and ${stats.expired} have an expired credential.`
  );
  if (expired.length > 0) {
    const e = expired[0];
    parts.push(
      `Most urgent: ${e.full_name} (${e.role}) — ${e.credential_name} expired ${Math.abs(e.days_remaining)} day(s) ago at ${e.facility}.`
    );
  }
  if (expiring.length > 0) {
    parts.push(
      `${expiring.length} credential(s) expire within 60 days, concentrated at ${topFacilities(expiring)}.`
    );
  }
  if (stats.onboarding > 0) {
    parts.push(`${stats.onboarding} onboarding file(s) remain in progress.`);
  }
  return parts.join(" ");
}

export function fallbackExecutiveSummary(report: ReportData): string {
  const s = report.staffing.stats;
  const c = report.contracts.stats;
  const parts: string[] = [];
  parts.push(
    `For the reporting period ${report.period}, ${s.compliant} of ${s.total} staff are fully credentialed; ${s.expiring} face an expiry within 60 days and ${s.expired} are already lapsed.`
  );
  if (report.staffing.expired.length > 0) {
    parts.push(
      `Immediate action is required on ${report.staffing.expired.length} expired credential(s), led by ${report.staffing.expired[0].full_name} at ${report.staffing.expired[0].facility}.`
    );
  }
  parts.push(
    `Across ${c.activeContracts} active contracts and ${c.totalDeliverables} deliverables, ${c.overdue} are overdue and ${c.dueThisMonth} are due within the next 30 days.`
  );
  if (report.contracts.overdue.length > 0) {
    const o = report.contracts.overdue[0];
    parts.push(
      `The most overdue item is "${o.title}" (${o.contract_number}), owned by ${o.owner} and due ${formatShortDate(o.due_on)}.`
    );
  }
  parts.push("Recommend prioritizing lapsed credentials and overdue deliverables this week.");
  return parts.join(" ");
}
