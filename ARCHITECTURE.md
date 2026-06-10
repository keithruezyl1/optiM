# OptiM — Project Architecture

**Stack:** Next.js 14+ (App Router, TypeScript) · Supabase (Postgres) · OpenAI API · @react-pdf/renderer · Vercel · n8n (external, built manually)

---

## 1. System Overview

```
┌─────────────┐     ┌──────────────────────────────┐     ┌───────────┐
│   Browser    │────▶│  Next.js on Vercel           │────▶│ Supabase  │
│  (Loom demo) │     │  ├ App pages (Staffing,      │     │ Postgres  │
└─────────────┘     │  │  Contracts)               │     └───────────┘
                    │  ├ /api/summary       ───────┼────▶ OpenAI API
┌─────────────┐     │  ├ /api/report/pdf    ───────┼────▶ (gpt-4o-mini)
│    n8n       │────▶│  └ /api/credentials/expiring│
│ (cron A & B) │     └──────────────────────────────┘
└──────┬──────┘
       └──────────────▶ Gmail/SMTP (reminder + weekly report emails)
```

One code path serves both the on-camera button and the n8n automation: the PDF route is the engine, the UI button and the cron job are just two triggers.

## 2. Project Structure

```
optim/
├─ app/
│  ├─ layout.tsx                 # fonts (IBM Plex via next/font), header, tab rail
│  ├─ page.tsx                   # Staffing tab (default route)
│  ├─ contracts/page.tsx         # Contracts tab
│  └─ api/
│     ├─ staff/route.ts          # GET list, POST create
│     ├─ credentials/expiring/route.ts   # GET ?days=60
│     ├─ summary/route.ts        # GET → AI summary JSON
│     └─ report/pdf/route.ts     # GET → application/pdf
├─ components/
│  ├─ ReadinessStrip.tsx
│  ├─ StaffTable.tsx  StatusPill.tsx  AddStaffModal.tsx
│  ├─ ContractsTable.tsx  OverdueBanner.tsx
│  ├─ AiSummaryPanel.tsx
│  └─ pdf/WeeklyReport.tsx       # @react-pdf/renderer document
├─ lib/
│  ├─ supabase.ts                # server client (service role key, server-only)
│  ├─ openai.ts                  # chat completion helper
│  ├─ status.ts                  # expiry/deadline status computation (single source of truth)
│  └─ reportData.ts              # gathers all data needed by summary + PDF
├─ supabase/
│  ├─ schema.sql
│  └─ seed.sql
└─ .env.local
```

## 3. Data Model (Supabase)

No auth → use the service-role key in server routes only; RLS can stay enabled with no public policies since the browser never talks to Supabase directly (all reads/writes go through Next.js API routes). This is also a talking point: "the database is never exposed to the client."

```sql
create table staff (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role text not null,                -- 'Registered Nurse', 'Case Manager', ...
  facility text not null,            -- 'Brooke Army Medical Center', ...
  onboarding_status text not null default 'complete',  -- 'complete' | 'in_progress'
  created_at timestamptz default now()
);

create table credentials (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff(id) on delete cascade,
  credential_name text not null,     -- 'RN License (TX)', 'BLS', 'ACLS', 'ARRT (MRI)', ...
  expires_on date not null
);

create table contracts (
  id uuid primary key default gen_random_uuid(),
  contract_number text not null,     -- 'W81K04-25-C-0042' style
  name text not null,
  client_agency text not null,       -- 'Defense Health Agency', ...
  pop_start date, pop_end date,      -- period of performance
  value_usd numeric,
  status text not null default 'active'
);

create table deliverables (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid references contracts(id) on delete cascade,
  title text not null,
  owner text not null,
  due_on date not null,
  completed boolean not null default false
);
```

**Status is always computed, never stored** (lib/status.ts):
- Credential: `expired` if `expires_on < today`; `expiring` if `<= today + 60d`; else `current`.
- Deliverable: `overdue` if `!completed && due_on < today`; `due_soon` if `<= today + 14d`; else `on_track`.

**Seed data (seed.sql):** 15 staff across JVM's real role categories, 20–25 credentials engineered so the demo always has ~2 expired, ~4 expiring within 60 days, the rest current; 2 staff with `onboarding_status = 'in_progress'`. 5 contracts with 12–15 deliverables, exactly 2 overdue and 3 due within 14 days. **Tip:** write seed dates relative to a far-future anchor or regenerate before recording, so the demo never accidentally drifts to "everything expired."

## 4. API Routes

| Route | Method | Behavior |
|---|---|---|
| `/api/staff` | GET | All staff joined with credentials, status computed server-side |
| `/api/staff` | POST | Insert staff (+ one credential); returns created row for optimistic UI |
| `/api/credentials/expiring?days=60` | GET | `[{ full_name, role, facility, credential_name, expires_on, days_remaining }]` sorted by days_remaining — consumed by n8n Workflow A |
| `/api/summary` | GET | Runs `reportData.ts`, prompts OpenAI, returns `{ summary: string, generated_at }` — used by the in-app panel AND n8n Workflow B email body |
| `/api/report/pdf` | GET | Builds full report data, gets AI executive summary, renders `WeeklyReport.tsx` to a buffer, returns `application/pdf` with `Content-Disposition: attachment; filename="OptiM-Weekly-Operations-Report-{date}.pdf"` — used by the gold button AND n8n Workflow B attachment |

All routes check an optional `x-api-key` header against `process.env.OPTIM_API_KEY` **only if the env var is set** — off for the demo, one env var to turn on.

## 5. OpenAI Integration

- Model: `gpt-4o-mini` (cheap, fast, sufficient for summaries). Server-side only; key never reaches the browser.
- One helper, two prompts:
  - **Compliance summary** (in-app panel): system prompt "You are an operations analyst for a federal healthcare staffing contractor. Write a 3–5 sentence compliance summary. Be specific: name counts, roles, facilities, and the most urgent items. No preamble, no bullet points." User content = JSON of staffing data.
  - **Executive summary** (PDF): same persona, 4–6 sentences covering both staffing compliance and contract deliverable status, written for leadership.
- `temperature: 0.3`, `max_tokens: 350`. Wrap in try/catch with a deterministic fallback string (computed counts) so the PDF never fails on camera because OpenAI hiccupped.

## 6. PDF Generation

- **Library: `@react-pdf/renderer`** rendered server-side in the route handler via `renderToBuffer`. Chosen over jsPDF/pdf-lib because the report is a styled document and React components map cleanly to the design guidelines (navy header band, gold rules, status-colored text).
- Register IBM Plex fonts with `Font.register` (bundle the TTFs in `/public/fonts` — @react-pdf can't use next/font).
- `WeeklyReport.tsx` receives one props object from `reportData.ts`: `{ generatedAt, period, execSummary, staffing: { stats, expired[], expiring[] }, contracts: { stats, overdue[], dueSoon[] } }`.
- Force the route to Node runtime: `export const runtime = "nodejs"` (react-pdf does not run on Edge).

## 7. Environment Variables

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=        # server-only, never NEXT_PUBLIC
OPENAI_API_KEY=
OPTIM_API_KEY=                    # optional; unset for demo
```

## 8. n8n Workflows (manual build spec)

### Workflow A — Daily Credential Watchdog
1. **Schedule Trigger** — every day 07:00 (America/Chicago — JVM is San Antonio; nice detail to mention).
2. **HTTP Request** — GET `https://optim.vercel.app/api/credentials/expiring?days=60` (add `x-api-key` header if enabled).
3. **IF** — `{{ $json.length > 0 }}` (or check `items.length`). False branch: end silently.
4. **Code node** — build an HTML table: Name | Role | Credential | Expires | Days Left | Facility; rows with ≤30 days bolded.
5. **Gmail / SMTP node** — to: ops manager; subject: `⚠ {{count}} credentials expiring within 60 days — action needed`; HTML body from step 4.

### Workflow B — Weekly Operations Report
1. **Schedule Trigger** — Mondays 06:00 America/Chicago.
2. **HTTP Request** — GET `/api/summary` → JSON (email body text).
3. **HTTP Request** — GET `/api/report/pdf` with **Response Format: File** → binary property `report`.
4. **Gmail / SMTP node** — to: leadership list; subject: `OptiM Weekly Operations Report — {{ $now.format('MMM d, yyyy') }}`; body: short intro line + executive summary from step 2; **attachment:** binary `report`.

Both workflows are pure consumers of the app's API — zero duplicated logic, which is itself a line for the Loom: "the button I clicked and the Monday email run the exact same engine."

## 9. Build Order (suggested)

1. Supabase schema + seed → 2. `lib/status.ts` + `lib/reportData.ts` (pure functions, easy to verify) → 3. Staffing tab UI → 4. Contracts tab + overdue banner → 5. `/api/summary` + AI panel → 6. PDF route + button → 7. Add-staff modal → 8. Polish per design guidelines, deploy to Vercel → 9. Record Loom → 10. Build n8n A & B against the live URL.

## 10. Demo-Safety Notes

- Pre-warm the app (visit the live URL once) before recording to avoid a cold-start pause on camera.
- Keep a generated PDF from a rehearsal run as backup in case you want to cut to it.
- OpenAI fallback (section 5) guarantees the report button never visibly fails.
- Seed Supabase fresh the morning of recording so day-relative statuses are correct.
