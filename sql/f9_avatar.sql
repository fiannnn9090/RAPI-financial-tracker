-- F9 — Avatar + Misi Border
-- Jalankan di Supabase SQL Editor (dashboard project -> SQL Editor -> New query)

-- 1) Kolom avatar di profiles (idempoten)
alter table profiles add column if not exists avatar_seed text;
alter table profiles add column if not exists avatar_border text not null default 'none';

-- 2) Misi border (pola user_badges) — persist = pernah tercapai, tidak turun tier
create table if not exists user_missions (
  user_id uuid not null references profiles (id) on delete cascade,
  code text not null check (code in ('bronze_profile', 'silver_streak', 'gold_level5', 'platinum_explore')),
  unlocked_at timestamptz not null default now(),
  primary key (user_id, code)
);

-- 3) Flag "pernah pakai fitur" — event-based, tahan terhadap hapus data
create table if not exists feature_usage (
  user_id uuid not null references profiles (id) on delete cascade,
  feature text not null check (feature in ('username_changed', 'simulate', 'goal', 'debts', 'theme')),
  first_used_at timestamptz not null default now(),
  primary key (user_id, feature)
);

-- 4) RLS — pola yang sama dengan tabel lain
alter table user_missions enable row level security;
alter table feature_usage enable row level security;

drop policy if exists "user_missions: user akses data sendiri" on user_missions;
create policy "user_missions: user akses data sendiri" on user_missions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "feature_usage: user akses data sendiri" on feature_usage;
create policy "feature_usage: user akses data sendiri" on feature_usage
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
