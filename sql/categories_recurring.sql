-- RAPI — N6a/N6b: kategori kustom + transaksi berulang
-- Jalankan di Supabase SQL Editor (dashboard project -> SQL Editor -> New query)
-- recurring_transactions disiapkan sekalian untuk N6b, kode aplikasinya menyusul.

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  emoji text not null,
  type text not null check (type in ('income', 'expense', 'both')),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);
alter table categories enable row level security;
create policy "categories: user akses data sendiri" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  title text not null,
  amount numeric(14, 2) not null check (amount > 0),
  category text not null,
  frequency text not null check (frequency in ('weekly', 'monthly')),
  day_of_period integer not null,
  next_run_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table recurring_transactions enable row level security;
create policy "recurring: user akses data sendiri" on recurring_transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
