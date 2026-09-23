-- Schema for NICU Registration & Patient Management
-- Migration: 20240911000000_create_core_tables

-- 1. Diagnoses master table
create table diagnoses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Lainnya',
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- 2. Treatments master table
create table treatments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Lainnya',
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- 3. Patients table (id = bigint generated identity, matches app flow)
create table patients (
  id bigint generated always as identity primary key,
  medical_record_number text not null unique,
  baby_name text not null,
  gender text not null,
  birth_date date not null,
  birth_time time not null,
  gestational_age integer,
  birth_weight integer,
  twins text,
  room_origin text,
  referral text,
  born_at text,
  birth_process text,
  service_status text,
  follow_up text,
  discharge_date date,
  discharge_rm text,

  -- Contact
  contact_phone text,
  contact_address text,
  province_code text,
  regency_code text,
  district_code text,
  village_code text,
  postal_code text,
  emergency_name text,
  emergency_relation text,
  emergency_phone text,

  -- Clinical
  admission_date date,
  dpjp text,
  status text,
  respiratory_status text,
  attention_status text,
  spo2 numeric,
  nutrition_status text,
  discharge_status text,

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- 4. Junction table: patient -> diagnoses
create table patient_diagnoses (
  id bigint generated always as identity primary key,
  patient_id bigint references patients(id) on delete cascade,
  diagnosis_id uuid references diagnoses(id) on delete cascade,
  diagnosis_type text not null check (diagnosis_type in ('primary', 'secondary')),
  score_silverman integer check (score_silverman between 0 and 10),
  score_apgar_1 integer check (score_apgar_1 between 0 and 10),
  score_apgar_5 integer check (score_apgar_5 between 0 and 10),
  resuscitation text,
  nicu_indication text,
  created_at timestamp with time zone not null default now()
);

-- 5. Junction table: patient -> treatments
create table patient_treatments (
  id bigint generated always as identity primary key,
  patient_id bigint references patients(id) on delete cascade,
  treatment_id uuid references treatments(id) on delete cascade,
  respiratory_detail text,
  vascular_access text,
  nutrition text,
  antibiotics text,
  other_plan text,
  created_at timestamp with time zone not null default now()
);

-- 6. Clinical notes
create table clinical_notes (
  id bigint generated always as identity primary key,
  patient_id bigint references patients(id) on delete cascade,
  note_date date not null,
  note text,
  created_at timestamp with time zone not null default now()
);

-- Enable Row Level Security
alter table patients enable row level security;
alter table patient_diagnoses enable row level security;
alter table patient_treatments enable row level security;
alter table clinical_notes enable row level security;
alter table diagnoses enable row level security;
alter table treatments enable row level security;

-- Demo/dev: allow full access with anonymous key (no auth login)
-- PRODUCTION: replace with authenticated policies, e.g.:
--   using (auth.uid() IS NOT NULL) with check (auth.uid() IS NOT NULL)
create policy "Public access for demo" on patients for all using (true) with check (true);
create policy "Public access for demo" on patient_diagnoses for all using (true) with check (true);
create policy "Public access for demo" on patient_treatments for all using (true) with check (true);
create policy "Public access for demo" on clinical_notes for all using (true) with check (true);
create policy "Public read access for demo" on diagnoses for select using (true);
create policy "Public read access for demo" on treatments for select using (true);
