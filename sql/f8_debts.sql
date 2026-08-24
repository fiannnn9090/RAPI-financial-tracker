-- RAPI — F8: hutang & piutang (track dua arah + cicilan berjadwal)
-- Jalankan di Supabase SQL Editor (dashboard project -> SQL Editor -> New query).
-- Pra-migrasi aman: aplikasi memakai guard hasDebts (pola sama dengan F4 wallets).

create table if not exists debts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles (id) on delete cascade,
  direction     text not null check (direction in ('receivable', 'payable')),
    -- receivable = PIUTANG (orang lain berhutang ke user) -> pembayaran = income
    -- payable    = HUTANG  (user berhutang)              -> pembayaran = expense
  party         text not null,
  title         text not null,
  principal     numeric(14, 2) not null check (principal > 0),
  remaining     numeric(14, 2) not null check (remaining >= 0),
  category      text not null default 'Lainnya',
  wallet_id     uuid references wallets (id) on delete set null,
  schedule      text not null default 'flex' check (schedule in ('flex', 'installment')),
    -- flex        : bayar manual kapan saja, nominal bebas <= sisa
    -- installment : N kali nominal tetap; auto-generate ala recurring, terakhir di-clamp
  installment_amount numeric(14, 2),
  installments_total integer check (installments_total > 0),
  installments_paid  integer not null default 0,
  frequency     text check (frequency in ('weekly', 'monthly')),
  day_of_period integer,
  next_run_date date,
  status        text not null default 'active' check (status in ('active', 'paid', 'written_off')),
  paid_at       timestamptz,
  note          text,
  created_at    timestamptz not null default now()
);
alter table debts enable row level security;
create policy "debts: user akses data sendiri" on debts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Penanda sumber pembayaran: setiap pelunasan/cicilan tercatat sebagai transaksi
-- biasa (saldo & XP otomatis). Nullable + on delete set null agar riwayat
-- transaksi tetap utuh saat hutang/piutang dihapus.
alter table transactions add column if not exists debt_id uuid references debts (id) on delete set null;
