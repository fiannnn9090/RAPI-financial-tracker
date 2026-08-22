-- RAPI — F3: alokasi kategori untuk rekomendasi budget 50/30/20
-- Jalankan di Supabase SQL Editor (dashboard project -> SQL Editor -> New query).
-- Aman dijalankan berulang (idempotent).
--
-- allocation_type: bucket alokasi kategori untuk fitur rekomendasi 50/30/20.
--   kebutuhan / keinginan / tabungan
-- Kategori tipe income-only tetap punya nilai kolom ini tapi diabaikan engine.

alter table categories
  add column if not exists allocation_type text
  not null default 'kebutuhan';

-- Backfill kategori bawaan sesuai maknanya (Lainnya = keinginan, disepakati).
update categories set allocation_type = v.t
from (values
  ('Makan & Minum', 'kebutuhan'),
  ('Transportasi',  'kebutuhan'),
  ('Tagihan',       'kebutuhan'),
  ('Belanja',       'keinginan'),
  ('Hiburan',       'keinginan'),
  ('Lainnya',       'keinginan')
) as v(n, t)
where categories.name = v.n;

-- Constraint dipisah supaya ADD COLUMN di atas idempotent (tidak error saat sudah ada).
alter table categories drop constraint if exists categories_allocation_type_check;
alter table categories
  add constraint categories_allocation_type_check
  check (allocation_type in ('kebutuhan', 'keinginan', 'tabungan'));
