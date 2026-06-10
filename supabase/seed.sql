-- Idempotent reseed: safe to run any morning; dates are relative to current_date,
-- so computed statuses are always correct whenever this runs.
truncate table deliverables, contracts, credentials, staff restart identity cascade;

-- 15 staff. Buckets are engineered via credentials below (worst-credential rule):
--   Expired worst: Maria Delgado, James Whitfield (2)
--   Expiring worst: Aisha Bello, Robert Hsu, Linda Park, Daniel Cruz (4)
--   Compliant: remaining 9
--   Onboarding in_progress: Sofia Ramirez, Marcus Lee (2)
insert into staff (full_name, role, facility, onboarding_status) values
  ('Maria Delgado',   'Registered Nurse',              'Brooke Army Medical Center',      'complete'),
  ('James Whitfield', 'MRI Technologist',              'Wilford Hall Ambulatory Surgical Center', 'complete'),
  ('Aisha Bello',     'Case Manager',                  'Brooke Army Medical Center',      'complete'),
  ('Robert Hsu',      'Pharmacy Technician',           'Naval Medical Center San Diego',  'complete'),
  ('Linda Park',      'Registered Nurse',              'Wilford Hall Ambulatory Surgical Center', 'complete'),
  ('Daniel Cruz',     'Cardiovascular Technologist',   'Brooke Army Medical Center',      'complete'),
  ('Sofia Ramirez',   'Clinical Social Worker',        'Naval Medical Center San Diego',  'in_progress'),
  ('Marcus Lee',      'Phlebotomist',                  'Brooke Army Medical Center',      'in_progress'),
  ('Emily Carter',    'Medical Laboratory Technician', 'Wilford Hall Ambulatory Surgical Center', 'complete'),
  ('Nathan Brooks',   'Nutritionist',                  'Naval Medical Center San Diego',  'complete'),
  ('Olivia Nguyen',   'Registered Nurse',              'Brooke Army Medical Center',      'complete'),
  ('Grace Okafor',    'Case Manager',                  'Wilford Hall Ambulatory Surgical Center', 'complete'),
  ('Henry Adams',     'Pharmacy Technician',           'Brooke Army Medical Center',      'complete'),
  ('Isabella Torres', 'MRI Technologist',              'Naval Medical Center San Diego',  'complete'),
  ('William Foster',  'Cardiovascular Technologist',   'Wilford Hall Ambulatory Surgical Center', 'complete');

-- 24 credentials. expires_on relative to current_date.
insert into credentials (staff_id, credential_name, expires_on)
select s.id, c.credential_name, c.expires_on from staff s join (values
  -- EXPIRED bucket
  ('Maria Delgado',   'RN License (TX)',   current_date + 400),
  ('Maria Delgado',   'BLS',               current_date - 12),   -- expired
  ('James Whitfield', 'ARRT (MRI)',        current_date - 5),    -- expired
  ('James Whitfield', 'BLS',               current_date + 200),
  -- EXPIRING bucket (<= +60, none expired)
  ('Aisha Bello',     'CCM',               current_date + 25),   -- expiring
  ('Aisha Bello',     'BLS',               current_date + 300),
  ('Robert Hsu',      'PTCB (CPhT)',       current_date + 45),   -- expiring
  ('Linda Park',      'RN License (TX)',   current_date + 500),
  ('Linda Park',      'ACLS',              current_date + 58),   -- expiring
  ('Daniel Cruz',     'RCIS',              current_date + 12),   -- expiring
  ('Daniel Cruz',     'BLS',               current_date + 150),
  -- COMPLIANT bucket (all > +60)
  ('Sofia Ramirez',   'LCSW (TX)',         current_date + 365),
  ('Marcus Lee',      'Phlebotomy (NHA)',  current_date + 220),
  ('Emily Carter',    'MLT (ASCP)',        current_date + 700),
  ('Emily Carter',    'BLS',               current_date + 120),
  ('Nathan Brooks',   'RDN',               current_date + 400),
  ('Olivia Nguyen',   'RN License (TX)',   current_date + 600),
  ('Olivia Nguyen',   'ACLS',              current_date + 90),
  ('Olivia Nguyen',   'BLS',               current_date + 90),
  ('Grace Okafor',    'CCM',               current_date + 300),
  ('Henry Adams',     'PTCB (CPhT)',       current_date + 250),
  ('Isabella Torres', 'ARRT (MRI)',        current_date + 450),
  ('Isabella Torres', 'BLS',               current_date + 75),
  ('William Foster',  'RCIS',              current_date + 500)
) as c(full_name, credential_name, expires_on) on s.full_name = c.full_name;

-- 5 contracts
insert into contracts (contract_number, name, client_agency, pop_start, pop_end, value_usd, status) values
  ('W81K04-25-C-0042', 'Medical Staffing Augmentation - BAMC',     'Defense Health Agency',     current_date - 200, current_date + 160, 4200000, 'active'),
  ('W81K04-25-C-0067', 'Behavioral Health Support Services',       'Defense Health Agency',     current_date - 150, current_date + 210, 2800000, 'active'),
  ('SP4709-25-D-0033', 'Pharmacy Technician Staffing - NMCSD',     'Defense Logistics Agency',  current_date - 300, current_date + 60,  1600000, 'active'),
  ('W91YTZ-25-C-0088', 'Diagnostic Imaging Support - Wilford Hall','Army Medical Command',      current_date - 100, current_date + 300, 3500000, 'active'),
  ('N00259-26-C-0012', 'Laboratory Services Augmentation',         'Naval Medical Forces',      current_date - 60,  current_date + 400, 2100000, 'active');

-- 13 deliverables. Exactly 2 overdue (both on contract 0042 => "across 1 contract"); 3 due <= +14.
insert into deliverables (contract_id, title, owner, due_on, completed)
select ct.id, d.title, d.owner, d.due_on, d.completed from contracts ct join (values
  ('W81K04-25-C-0042', 'Monthly staffing compliance report - May', 'Dana Reyes',    current_date - 3,  false),  -- OVERDUE
  ('W81K04-25-C-0042', 'Quarterly credential audit',               'Dana Reyes',    current_date - 1,  false),  -- OVERDUE
  ('W81K04-25-C-0042', 'Onboarding packet - 3 new RNs',            'Priya Shah',    current_date + 9,  false),  -- due soon
  ('W81K04-25-C-0042', 'April compliance report',                  'Dana Reyes',    current_date - 35, true),   -- completed
  ('W81K04-25-C-0067', 'Clinical supervision logs submission',     'Marcus Hale',   current_date + 13, false),  -- due soon
  ('W81K04-25-C-0067', 'Staffing plan update',                     'Marcus Hale',   current_date + 40, false),
  ('W81K04-25-C-0067', 'Patient load summary',                     'Marcus Hale',   current_date + 90, false),
  ('SP4709-25-D-0033', 'Pharmacy tech coverage schedule - June',   'Lena Ortiz',    current_date + 7,  false),  -- due soon
  ('SP4709-25-D-0033', 'Contract closeout checklist',              'Lena Ortiz',    current_date + 55, false),
  ('W91YTZ-25-C-0088', 'MRI tech credential verification',         'Sam Okoye',     current_date + 30, false),
  ('W91YTZ-25-C-0088', 'Equipment utilization report',             'Sam Okoye',     current_date + 120,false),
  ('N00259-26-C-0012', 'Lab staffing ramp-up plan',                'Grace Bennett', current_date + 20, false),
  ('N00259-26-C-0012', 'Kickoff deliverable - staffing roster',    'Grace Bennett', current_date - 20, true)    -- completed
) as d(contract_number, title, owner, due_on, completed) on ct.contract_number = d.contract_number;
