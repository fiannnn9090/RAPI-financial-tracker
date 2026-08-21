# RAPI — Instruksi untuk GitHub Copilot

## Tentang project
RAPI (Rekap Arus Pengeluaran dan Income) adalah aplikasi catatan keuangan personal.
Sedang dalam proses migrasi besar dari MVP client-only (localStorage) menjadi aplikasi
dengan backend (Supabase) + sistem gamifikasi (XP, Level, badge) + redesign visual
bertema Claymorphism.

Semua teks UI menggunakan Bahasa Indonesia, gaya santai/gen-z-friendly ("bestie", emoji,
nada ramah). Pertahankan gaya ini di setiap komponen baru.

## Stack
- Next.js 16 (App Router), React 19
- Supabase (Postgres + Auth) — menggantikan localStorage
- CSS murni (tanpa Tailwind), tema Claymorphism (lihat bagian Desain di bawah)
- Tidak ada TypeScript — tetap gunakan JavaScript (.js) kecuali diminta lain

## Status migrasi saat ini
Urutan pengerjaan (jangan lompat urutan tanpa konfirmasi user):
1. [x] Setup Supabase: schema (lihat `sql/schema.sql`), Supabase Auth
2. [x] Migrasi data layer: ganti semua baca/tulis `localStorage` (STORAGE_KEY di app/page.js)
       menjadi query ke Supabase via `@supabase/supabase-js`
3. [x] Sistem XP & Level: hitung XP per transaksi, formula level, title level, modal level-up
4. [x] Redesign visual Claymorphism: ganti genz.css/playful.css/pastel.css jadi satu tema clay
5. [x] Fitur lanjutan: daily streak, badge rarity/progress, kartu profil shareable

Cek checklist di `TASKS.md` untuk task granular per fase. Kerjakan SATU task pada satu waktu,
jangan gabungkan beberapa fase dalam satu perubahan besar.

## Konvensi kode yang sudah ada (pertahankan gayanya)
- Komponen fungsi di `app/page.js`, memakai `'use client'` di baris pertama file
- Helper domain ditaruh sebagai fungsi murni di `lib/`: `xp.js` (XP & level),
  `streak.js` (daily streak), `badges.js` (evaluasi badge + progress),
  `profileCard.js` (kartu shareable via Canvas API, tanpa dependency tambahan)
- Formatter: `rupiah` (Intl.NumberFormat IDR) dan `dateFormatter` (Intl.DateTimeFormat id-ID)
  sudah didefinisikan di scope module — pakai ulang, jangan bikin formatter baru
- Emoji kategori disimpan di object `CATEGORY_EMOJI`
- State management: `useState` + `useEffect` biasa, tidak pakai library state management
- ID baru pakai `crypto.randomUUID()`
- Konfirmasi aksi destruktif (hapus akun, hapus transaksi besar) tetap harus ada,
  tapi setelah migrasi ke Supabase ganti `window.confirm`/`window.prompt` jadi modal UI biasa
  (window.prompt tidak cocok untuk UX gen-z-friendly yang lebih visual)

## Supabase
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  di `.env.local` (JANGAN commit file ini — sudah harus ada di `.gitignore`)
- Buat client Supabase di `lib/supabase.js`, import dari sana — jangan re-init client di
  banyak file
- Gunakan Supabase Auth (email atau bisa tetap username-based dengan sedikit trik email
  dummy) — JANGAN simpan password mentah di tabel sendiri seperti versi localStorage lama
- Selain `sql/schema.sql`, ada `sql/badge_seed.sql` yang WAJIB dijalankan manual di
  Supabase — `user_badges` tidak bisa di-insert sebelum `badge_defs` terisi (FK)

## Desain — Claymorphism
- Warna cerah, saturasi tinggi, background soft/pastel base
- Elemen "empuk": border-radius besar (16–28px), soft shadow ganda (outer soft shadow +
  inset highlight tipis di atas untuk efek 3D "clay")
- Tombol terasa bisa "ditekan": box-shadow berkurang + translateY kecil saat :active
- Hindari flat design / sharp corners — ini kebalikan dari neo-brutalist
- Semua CSS custom (tanpa Tailwind), taruh di file CSS yang relevan di `app/`

## Yang HARUS dihindari
- Jangan hardcode API key Supabase di source code
- Jangan hapus fitur yang sudah ada (badge, wishlist, budget) saat migrasi — hanya pindahkan
  penyimpanan datanya
- Jangan ubah bahasa UI ke Inggris
- Jangan tambah dependency besar (Tailwind, UI library) tanpa konfirmasi user dulu
