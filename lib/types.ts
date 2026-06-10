// Database row shapes (Supabase) and the computed shapes the app passes around.
// Status is NEVER one of these stored fields — it is always derived in status.ts.

export type OnboardingStatus = "complete" | "in_progress";

export interface StaffRow {
  id: string;
  full_name: string;
  role: string;
  facility: string;
  onboarding_status: OnboardingStatus;
  created_at: string;
}

export interface CredentialRow {
  id: string;
  staff_id: string;
  credential_name: string;
  expires_on: string; // 'YYYY-MM-DD'
}

export interface ContractRow {
  id: string;
  contract_number: string;
  name: string;
  client_agency: string;
  pop_start: string | null;
  pop_end: string | null;
  value_usd: number | null;
  status: string;
}

export interface DeliverableRow {
  id: string;
  contract_id: string;
  title: string;
  owner: string;
  due_on: string; // 'YYYY-MM-DD'
  completed: boolean;
}

// ---- Computed (derived in status.ts) ----

export type CredentialStatus = "expired" | "expiring" | "current";
export type DeliverableStatus = "overdue" | "due_soon" | "on_track";

export interface ComputedCredential extends CredentialRow {
  status: CredentialStatus;
  days_remaining: number; // negative if expired
}

export interface ComputedStaff extends StaffRow {
  credentials: ComputedCredential[];
  bucket: CredentialStatus; // worst-credential rule
}

export interface ComputedDeliverable extends DeliverableRow {
  status: DeliverableStatus;
  days_remaining: number; // negative if past due
}

export interface ComputedContract extends ContractRow {
  deliverables: ComputedDeliverable[];
}

export interface StaffStats {
  total: number;
  compliant: number;
  expiring: number;
  expired: number;
  onboarding: number;
}

export interface ContractStats {
  activeContracts: number;
  totalDeliverables: number;
  overdue: number;
  dueThisMonth: number;
}
