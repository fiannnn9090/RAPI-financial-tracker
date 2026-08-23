-- RAPI — F5: tantangan hemat mingguan
-- Jalankan di Supabase SQL Editor (dashboard project -> SQL Editor -> New query).
-- Aman dijalankan berulang (idempoten). Murni aditif.
--
-- Model: 1 tantangan aktif per user per minggu (kalender Senin-Minggu).
-- Progress TIDAK disimpan — selalu dihitung ulang dari transaksi (pure function
-- lib/challenge.js). DB hanya mencatat pilihan user, penyelesaian (untuk reward
-- sekali + badge kumulatif), dan riwayat kedaluwarsa.

-- 1) Tabel challenges + RLS (pola categories/wallets)
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  code text not null check (char_length(code) between 1 and 40),
  week_start date not null,
  status text not null default 'active' check (status in ('active', 'completed', 'expired')),
  activated_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, code, week_start)
);
alter table challenges enable row level security;
create policy "challenges: user akses data sendiri" on challenges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists challenges_user_week_idx on challenges (user_id, week_start);

-- 2) Seed badge tantangan (metrik kumulatif challenges_won — jumlah row completed)
insert into badge_defs (code, title, icon, note, rarity) values
  ('challenge_1', 'Menang pertama', '🥇', 'Selesaikan 1 tantangan mingguan', 'common'),
  ('challenge_5', 'Pemburu tantangan', '🎖️', 'Selesaikan 5 tantangan mingguan', 'rare')
on conflict (code) do nothing;

-- 3) Repair historis XP (disetujui user): profiles.xp/level tidak pernah ditulis
--    sejak Fase 3, padahal transactions.xp_earned tersimpan per baris. Recompute
--    akurat & idempoten — rumus level sama dengan lib/xp.js levelFromXp():
--    floor(sqrt(xp / 50)) + 1.
update profiles p set
  xp = coalesce((select sum(t.xp_earned)::int from transactions t where t.user_id = p.id), 0),
  level = greatest(1, floor(sqrt(coalesce((select sum(t.xp_earned) from transactions t where t.user_id = p.id), 0))::numeric / 50)::int + 1);
