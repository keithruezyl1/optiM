-- OptiM schema. No auth: all access via Next.js API routes using the service-role key.
-- RLS enabled with NO public policies => the browser (anon key) can never read/write directly.

create table staff (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role text not null,
  facility text not null,
  onboarding_status text not null default 'complete', -- 'complete' | 'in_progress'
  created_at timestamptz default now()
);

create table credentials (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff(id) on delete cascade,
  credential_name text not null,
  expires_on date not null
);

create table contracts (
  id uuid primary key default gen_random_uuid(),
  contract_number text not null,
  name text not null,
  client_agency text not null,
  pop_start date,
  pop_end date,
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

create index on credentials (staff_id);
create index on deliverables (contract_id);

-- RLS on, no policies: client is locked out; server service-role key bypasses RLS.
alter table staff enable row level security;
alter table credentials enable row level security;
alter table contracts enable row level security;
alter table deliverables enable row level security;
