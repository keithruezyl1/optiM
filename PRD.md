# OptiM — Product Requirements Document

**Version:** 1.0
**Owner:** Keith Ruezyl P. Tagarao
**Purpose of build:** Demo application for a Loom video pitch to JVM Solutions (Johnson Venture Management Solutions, Inc.), plus a live Vercel link sent as a follow-up. Built to be production-shaped, demo-scoped.

---

## 1. Background and Problem

JVM Solutions is a San Antonio-based government contractor supplying healthcare professionals, IT services, logistics, and administrative support to the Department of Defense and other federal agencies. Their operations involve:

- Tracking deployed medical staff (RNs, case managers, pharmacy technicians, MRI technologists, etc.) across military treatment facilities
- Monitoring professional credentials and license expirations under Joint Commission Healthcare Staffing Services standards
- Managing multiple federal contracts with hard deadlines, deliverables, and audit exposure
- Producing recurring status reports for leadership and contracting officers

Today, work like this typically lives in spreadsheets, email threads, and manual follow-ups. A lapsed credential or a missed contract deliverable is not an inconvenience — it is a compliance failure with financial and contractual consequences.

**OptiM** ("Opti" for optimize, "M" for management, echoing JVM) is a lightweight operations dashboard that demonstrates how this can be centralized, automated, and AI-assisted.

## 2. Goals

| # | Goal | Measured by |
|---|------|-------------|
| G1 | Show JVM their own world on screen within 10 seconds of the demo starting | Mock data uses their real staff categories, DoD-style facilities, and Joint Commission language |
| G2 | Demonstrate AI as a practical operations tool, not a gimmick | One-click AI compliance summary; AI-written executive summary inside the PDF report |
| G3 | Produce a tangible artifact JVM can hold | "Generate Weekly Report" button downloads a branded PDF suitable for emailing |
| G4 | Prove the system can run itself | API endpoints designed so n8n can trigger reminders and reports on a schedule with zero human action |
| G5 | Position Keith as builder, not tool-configurator | Custom app, not a monday.com board |

## 3. Non-Goals (explicitly out of scope)

- Authentication / user accounts (skipped entirely — app loads straight into the dashboard)
- Real PII — all staff, contracts, and facilities are fictional
- Multi-tenant support, role-based permissions, audit logging
- Mobile-first design (desktop demo; must merely not break on smaller screens)
- Editing UI for contracts (contracts are seeded; staff CRUD is the only write path shown)

## 4. Users

1. **Demo operator (Keith)** — drives the Loom; needs every key action to be one click and visually obvious on camera.
2. **JVM viewer (ops manager / executive)** — watches the Loom or clicks the live link; needs to recognize their business instantly and grasp value without explanation.
3. **Machine user (n8n)** — calls API endpoints on a schedule; needs stable JSON and a PDF endpoint.

## 5. Features and Requirements

### F1 — Staffing & Credential Tracker (default tab, the centerpiece)

**F1.1** Table of ~15 seeded staff members with columns: Name, Role, Credential(s), Credential Expiry, Facility/Deployment, Onboarding Status.
**F1.2** Roles drawn from JVM's actual service catalog: Registered Nurse, Clinical Social Worker, Case Manager, Nutritionist, Pharmacy Technician, Phlebotomist, Cardiovascular Technologist, MRI Technologist, Medical Laboratory Technician.
**F1.3** Credential expiry status is computed, not stored:
  - **Expired** (date < today) → red treatment
  - **Expiring soon** (within 60 days) → amber treatment
  - **Current** (> 60 days out) → green/neutral treatment
**F1.4** Summary stat strip above the table: Total Staff, Compliant, Expiring ≤ 60 Days, Expired, Onboarding In Progress.
**F1.5** Filter controls: by status (All / Expiring / Expired / Onboarding) and free-text search by name or role.
**F1.6** "Add Staff Member" action (modal or inline form) writing to Supabase — the single live-CRUD moment for the Loom ("this is a real database, not a mockup").
**F1.7** **"AI Compliance Summary" button**: calls OpenAI with current staffing data, renders a 3–5 sentence operational summary in a panel (e.g., "4 credentials expire within 60 days, concentrated at Brooke Army Medical Center; 2 onboarding files are incomplete…"). Must show a loading state and stream or render in < ~8 seconds for the demo.

### F2 — Contracts Tab

**F2.1** Table of ~5 seeded contracts: Contract Name/Number, Client Agency, Period of Performance, Value, Status, plus nested or related deliverables with due dates and owners.
**F2.2** Deliverable status computed: **Overdue** (red), **Due ≤ 14 days** (amber), **On track**.
**F2.3** **Visible overdue alert**: persistent banner at the top of the tab when any deliverable is overdue ("⚠ 2 deliverables overdue across 1 contract") — must be obvious on camera.
**F2.4** Stat strip: Active Contracts, Total Deliverables, Overdue, Due This Month.

### F3 — Weekly Operations Report (PDF)

**F3.1** Prominent **"Generate Weekly Report"** button in the header, visible from every tab.
**F3.2** Clicking it produces and downloads a PDF named `OptiM-Weekly-Operations-Report-YYYY-MM-DD.pdf`.
**F3.3** PDF contents, in order:
  1. Branded header (OptiM wordmark, "Prepared for JVM Solutions", report date, reporting period)
  2. **AI-written Executive Summary** (4–6 sentences, generated by OpenAI from live data at generation time)
  3. Staffing Compliance section: stat summary + table of expired and expiring-soon credentials
  4. Contract Status section: stat summary + table of overdue and upcoming deliverables
  5. Footer: "Generated automatically by OptiM" + timestamp
**F3.4** The same generation logic is exposed at `GET /api/report/pdf` returning `application/pdf`, so n8n can fetch the identical document for the weekly email. One code path, two consumers.
**F3.5** Generation must complete in < 15 seconds including the AI call; button shows a generating state.

### F4 — Automation-Ready API (consumed by n8n, built later by hand)

**F4.1** `GET /api/credentials/expiring?days=60` → JSON list of staff with credentials expiring within N days (name, role, credential, expiry date, facility, days remaining).
**F4.2** `GET /api/report/pdf` → the Weekly Operations Report as PDF bytes (see F3.4).
**F4.3** Optional `GET /api/summary` → JSON containing the AI executive summary text only (lets n8n put the summary in the email body alongside the PDF attachment).
**F4.4** Endpoints are unauthenticated for the demo but accept an optional `x-api-key` header check via env var, so Keith can say "secured by key in production" honestly.

## 6. n8n Workflows (manual build, post-app)

**Workflow A — Daily Credential Watchdog:** Cron (daily 07:00) → HTTP GET `/api/credentials/expiring?days=60` → IF list non-empty → format reminder email (table of expiring credentials) → send via Gmail/SMTP node to ops manager.

**Workflow B — Weekly Operations Report:** Cron (Mondays 06:00) → HTTP GET `/api/summary` (email body) → HTTP GET `/api/report/pdf` (binary) → send email with PDF attached to leadership distribution list.

Full node-level specs live in `ARCHITECTURE.md`.

## 7. Success Criteria

- The entire Loom demo path (open app → filter staff → add a staff member → AI summary → contracts overdue alert → generate PDF → open PDF) runs without a single error or dead end.
- A JVM ops manager watching can name at least two of their own daily problems the app addresses, unprompted.
- The PDF looks professional enough that Keith would attach it to a follow-up email as-is.
- Total build time stays within ~2–3 focused days.

## 8. Open Items

- Final mock facility names (suggest: Brooke Army Medical Center, Wilford Hall ASC, Naval Medical Center San Diego — all real DoD facilities, fine to reference as deployment sites with fictional staff)
- Whether to add a third "Reports history" view (recommended: cut; the button + PDF is enough)
