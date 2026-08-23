-- RAPI — F4: multi-dompet (wallets)
-- Jalankan di Supabase SQL Editor (dashboard project -> SQL Editor -> New query).
-- Aman dijalankan berulang (idempotent). Migrasi murni aditif: tidak ada data yang
-- diubah kecuali mengisi kolom baru.
--
-- Model: dompet = sumber dana (tunai/bank/e-wallet). Setiap transaksi & aturan rutin
-- terikat tepat satu dompet. Analitik (skor/saran/recap/budget/goal) tetap global.
--
-- Urutan aman:
--   1) tabel wallets + RLS
--   2) seed "Dompet Utama" untuk semua user existing
--   3) kolom wallet_id (nullable dulu) di transactions & recurring_transactions
--   4) backfill semua baris lama -> dompet default masing-masing user
--   5) jaring pengaman user tanpa dompet, lalu NOT NULL
--   6) index query per-dompet

create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  emoji text not null default '👛',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);
alter table wallets enable row level security;
create policy "wallets: user akses data sendiri" on wallets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2) Seed dompet default (hanya user yang belum punya dompet sama sekali)
insert into wallets (user_id, name, emoji, is_default)
select p.id, 'Dompet Utama', '👛', true
from profiles p
where not exists (select 1 from wallets w where w.user_id = p.id);

-- 3) Kolom pengikat (nullable dulu supaya backfill di bawah bisa jalan)
alter table transactions add column if not exists wallet_id uuid references wallets (id) on delete restrict;
alter table recurring_transactions add column if not exists wallet_id uuid references wallets (id) on delete restrict;

-- 4) Backfill: semua transaksi lama masuk dompet default usernya
update transactions t
set wallet_id = w.id
from wallets w
where w.user_id = t.user_id and w.is_default and t.wallet_id is null;

update recurring_transactions r
set wallet_id = w.id
from wallets w
where w.user_id = r.user_id and w.is_default and r.wallet_id is null;

-- 5a) Jaring pengaman: transaksi milik user yang belum punya dompet apa pun
--     (mis. terdaftar setelah script pertama kali jalan) — buatkan dompetnya.
insert into wallets (user_id, name, emoji, is_default)
select distinct t.user_id, 'Dompet Utama', '👛', true
from transactions t
where t.wallet_id is null
  and not exists (select 1 from wallets w where w.user_id = t.user_id);

insert into wallets (user_id, name, emoji, is_default)
select distinct r.user_id, 'Dompet Utama', '👛', true
from recurring_transactions r
where r.wallet_id is null
  and not exists (select 1 from wallets w where w.user_id = r.user_id);

-- 5b) Ulangi backfill untuk sisa baris dari jaring pengaman di atas
update transactions t
set wallet_id = w.id
from wallets w
where w.user_id = t.user_id and w.is_default and t.wallet_id is null;

update recurring_transactions r
set wallet_id = w.id
from wallets w
where w.user_id = r.user_id and w.is_default and r.wallet_id is null;

-- 5c) Kunci: mulai sekarang setiap baris WAJIB punya dompet
alter table transactions alter column wallet_id set not null;
alter table recurring_transactions alter column wallet_id set not null;

-- 6) Index untuk filter per-dompet
create index if not exists transactions_user_wallet_idx on transactions (user_id, wallet_id);
