# OptiM — Operations Dashboard

A lightweight operations dashboard demo built for the JVM Solutions pitch. It turns
staffing compliance, contract deadlines, and weekly reporting into one screen and one
click — with an AI compliance summary and a branded PDF report that the same API can
generate on a schedule for n8n.

> Demo application. All staff, contracts, and facilities are fictional; no real PII.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (Postgres) — service-role key, server-side only; all data access via API routes
- **OpenAI** `gpt-4o-mini` — server-side only, with a deterministic fallback
- **@react-pdf/renderer** — weekly report PDF (Node runtime)
- **Tailwind CSS** — design tokens per `DESIGN_GUIDELINES.md`
- **motion** — Readiness Strip count-up, AI panel fade-in (respects reduced motion)

## Key ideas

- **Status is always computed, never stored** (`lib/status.ts`) — one source of truth for
  the UI, the API routes, and the PDF. Credentials: expired / expiring (≤60d) / current.
  Deliverables: overdue / due ≤14d / on track.
- **Worst-credential bucketing** — each staff member is counted by their most urgent
  credential, so the Readiness Strip reconciles to headcount.
- **One engine, two consumers** — `/api/report/pdf` and `/api/summary` are standalone GET
  endpoints; the gold button and (later) n8n call the exact same code path.

## Local development

```bash
npm install
cp .env.local.example .env.local   # then fill in the values below
npm run dev                         # http://localhost:3000
```

### Environment variables (`.env.local`)

```
SUPABASE_URL=                 # https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=    # server-only, never NEXT_PUBLIC
OPENAI_API_KEY=
OPTIM_API_KEY=                # optional x-api-key gate; leave unset for the demo
```

### Database

`supabase/schema.sql` creates the tables (RLS enabled, no public policies — the browser
never touches the DB directly). `supabase/seed.sql` populates demo data using
`current_date` arithmetic, so statuses are always correct whenever it is run
(~2 expired, ~4 expiring, 5 contracts, exactly 2 overdue deliverables).

## API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/staff` | GET / POST | List staff (computed status) / create staff + credential |
| `/api/credentials/expiring?days=60` | GET | Credentials within the window — n8n watchdog |
| `/api/summary` | GET | AI compliance summary JSON (+ deterministic fallback) |
| `/api/report/pdf` | GET | Weekly Operations Report as `application/pdf` |
