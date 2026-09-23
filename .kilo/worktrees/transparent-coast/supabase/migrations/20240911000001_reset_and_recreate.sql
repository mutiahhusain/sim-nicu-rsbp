-- NICU: Reset & recreate schema (dev only)
-- Run this whole file in Supabase Studio -> SQL Editor -> Run (one shot)
-- This drops the stale tables and rebuilds them with the correct column types.

drop table if exists patient_treatments cascade;
drop table if exists patient_diagnoses cascade;
drop table if exists clinical_notes cascade;
drop table if exists patients cascade;
drop table if exists profiles cascade;
drop table if exists treatments cascade;
drop table if exists diagnoses cascade;

create table diagnoses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Lainnya',
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table treatments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Lainnya',
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

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

create table clinical_notes (
  id bigint generated always as identity primary key,
  patient_id bigint references patients(id) on delete cascade,
  note_date date not null,
  note text,
  created_at timestamp with time zone not null default now()
);

alter table patients enable row level security;
alter table patient_diagnoses enable row level security;
alter table patient_treatments enable row level security;
alter table clinical_notes enable row level security;
alter table diagnoses enable row level security;
alter table treatments enable row level security;

-- Demo/dev: anon full access (no auth). Replace w/ auth.uid() IS NOT NULL in production.
create policy "Public access for demo" on patients for all using (true) with check (true);
create policy "Public access for demo" on patient_diagnoses for all using (true) with check (true);
create policy "Public access for demo" on patient_treatments for all using (true) with check (true);
create policy "Public access for demo" on clinical_notes for all using (true) with check (true);
create policy "Public read access for demo" on diagnoses for select using (true);
create policy "Public read access for demo" on treatments for select using (true);

-- 7. Profiles (user roles)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  avatar_url text,
  updated_at timestamp with time zone default now()
);
alter table public.profiles enable row level security;
create policy "Public access for demo" on public.profiles for all using (true) with check (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, role, updated_at)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    case when not exists (select 1 from public.profiles) then 'admin' else 'user' end,
    now()
  );
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
