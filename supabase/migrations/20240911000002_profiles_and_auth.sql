-- Migration: 20240911000002_profiles_and_auth
-- User profiles + roles. Signup pertama otomatis jadi admin (bootstrap).

create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  avatar_url text,
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Public access for demo" on public.profiles for all using (true) with check (true);

-- Trigger: otomatis buat profile saat user sign up
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
