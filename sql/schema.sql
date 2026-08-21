-- RAPI — Supabase schema
-- Jalankan di Supabase SQL Editor (dashboard project -> SQL Editor -> New query)

-- Profil user tambahan di luar auth.users bawaan Supabase.
-- auth.users sudah handle email/password; tabel ini nyimpen data spesifik RAPI.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  xp integer not null default 0,
  level integer not null default 1,
  streak_current integer not null default 0,
  streak_longest integer not null default 0,
  last_activity_date date,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  title text not null,
  amount numeric(14, 2) not null check (amount > 0),
  category text not null,
  date date not null,
  xp_earned integer not null default 10,
  created_at timestamptz not null default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  amount numeric(14, 2) not null check (amount > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists budgets (
  user_id uuid not null references profiles (id) on delete cascade,
  category text not null,
  monthly_limit numeric(14, 2) not null check (monthly_limit > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, category)
);

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  goal_name text not null,
  goal_amount numeric(14, 2) not null,
  completed_at date not null default current_date
);

-- badge_defs: daftar master semua badge yang bisa didapat (dipakai fase 5 - badge rarity)
create table if not exists badge_defs (
  code text primary key,
  title text not null,
  icon text not null,
  note text not null,
  rarity text not null check (rarity in ('common', 'rare', 'epic', 'legendary'))
);

create table if not exists user_badges (
  user_id uuid not null references profiles (id) on delete cascade,
  badge_code text not null references badge_defs (code) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, badge_code)
);

-- Row Level Security — WAJIB diaktifkan, tiap user cuma boleh akses data miliknya sendiri
alter table profiles enable row level security;
alter table transactions enable row level security;
alter table goals enable row level security;
alter table budgets enable row level security;
alter table achievements enable row level security;
alter table user_badges enable row level security;

create policy "profiles: user akses data sendiri" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "transactions: user akses data sendiri" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals: user akses data sendiri" on goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "budgets: user akses data sendiri" on budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "achievements: user akses data sendiri" on achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_badges: user akses data sendiri" on user_badges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- badge_defs boleh dibaca semua orang yang login (tidak sensitif, cuma daftar master)
alter table badge_defs enable row level security;
create policy "badge_defs: semua user login boleh baca" on badge_defs
  for select using (auth.role() = 'authenticated');
