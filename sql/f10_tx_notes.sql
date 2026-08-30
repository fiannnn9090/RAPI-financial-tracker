-- RAPI — F10: Catatan & Waktu transaksi (note + time)
-- Jalankan di Supabase SQL Editor (dashboard project -> SQL Editor -> New query).
-- Aman dijalankan berulang (idempotent). Migrasi murni aditif: kolom baru nullable,
-- tidak mengubah data lama. Waktu (time) diisi HH:MM 24 jam; row lama NULL → aplikasi
-- menurunkan waktu dari created_at bila ada.
--
-- Client mem-praba kolom note (seperti wallet_id) untuk guard UI.

alter table transactions add column if not exists note text;
alter table transactions add column if not exists "time" text;
