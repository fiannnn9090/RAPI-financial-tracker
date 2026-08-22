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

## Konversi Mobile (Capacitor)
Project sedang dalam proses dijadikan aplikasi Android via Capacitor. Urutan milestone
(jangan lompat urutan tanpa konfirmasi user):
- **M1 — Static export (SELESAI)**: `next.config.js` memakai `output: 'export'`, hasil
  build adalah situs statis di folder `out/`. Konsekuensi: semua komponen harus tetap
  client-side (JANGAN tambahkan API routes / server actions / dynamic APIs),
  `npm run start` tidak lagi bisa dipakai — preview hasil build dengan
  `npx serve out`.
- **M2 — Navigasi tab-based**: restrukturisasi UI menjadi 4 tab (Beranda/Transaksi/
  Target/Profil) dengan bottom nav ala aplikasi native.
- **M3 — Overhaul CSS mobile**: safe-area inset (notch/home bar), touch target minimal
  44px, form & modal jadi bottom-sheet.
- **M4 — Integrasi Capacitor**: init platform Android, sinkronisasi folder `out/`,
  konfigurasi ikon & splash screen.
- **M5 — Polish native**: styling status bar, penanganan tombol back Android,
  transisi splash → app.

## Fase Redesign — Neo-Brutalist (N1–N7)
Setelah fase Mobile selesai, bahasa desain Claymorphism akan DIGANTI TOTAL dengan
Neo-Brutalist Bold. Ini bukan penyesuaian — semua soft shadow, gradient, dan
border-radius empuk akan dihapus. Karakter bahasa desain baru:
- Border tebal solid (standar 3px, warna ink) pada kartu & kontrol interaktif
- Warna flat kontras tinggi — TANPA gradient sama sekali
- Shadow hard-edge: offset murni TANPA blur (kesan stiker / kartu ditumpuk)
- Tipografi besar & berani (weight 800–900 untuk heading, ukuran hero besar)
- Dark mode adalah BAGIAN dari token desain — setiap token punya pasangan light/dark,
  bukan stylesheet terpisah. Default mengikuti `prefers-color-scheme`, bisa dioverride
  manual lewat atribut `[data-theme="light"|"dark"]` di `<html>`

Urutan milestone (jangan lompat urutan tanpa konfirmasi user):
- **N1 — Fondasi token + dark mode**: buat `app/brutalist.css` berisi custom properties
  kedua mode + primitif dasar `.brutal-card`/`.brutal-button`. File ini BELUM dipakai
  komponen mana pun; clay.css tetap utuh sampai minimal N5 selesai.
- **N2 — Terapkan tab Beranda** (heading, balance/stat card, insight, budget)
- **N3 — Terapkan tab Transaksi** (+ bottom-sheet form transaksi)
- **N4 — Terapkan tab Target** (goal card, badge list)
- **N5 — Terapkan Profil + Auth** (+ modal level-up)
- **N6 — Fitur struktural baru**: kustomisasi kategori, transaksi berulang,
  smart reminder pengeluaran
- **N7 — Recap cerita**: ringkasan naratif mingguan/bulanan aktivitas keuangan

Status: N1–N6 selesai. clay.css sudah DIHAPUS — seluruh basis struktural lama kini
tinggal di bagian atas `app/brutalist.css` (banner "CLEANUP LEGACY CSS") dan harus
tetap di atas rule override agar kaskade tidak berubah. Style baru = bahasa brutalist.

## Konvensi kode yang sudah ada (pertahankan gayanya)
- Komponen fungsi di `app/page.js`, memakai `'use client'` di baris pertama file
- Helper domain ditaruh sebagai fungsi murni di `lib/`: `xp.js` (XP & level),
  `streak.js` (daily streak), `badges.js` (evaluasi badge + progress),
  `profileCard.js` (kartu shareable via Canvas API, tanpa dependency tambahan),
  `recurring.js` (jadwal & catch-up transaksi berulang, fungsi murni — cap 6 per aturan),
  `reminders.js` (wrapper @capacitor/local-notifications, no-op aman di web)
- Formatter: `rupiah` (Intl.NumberFormat IDR) dan `dateFormatter` (Intl.DateTimeFormat id-ID)
  sudah didefinisikan di scope module — pakai ulang, jangan bikin formatter baru
- Kategori per-user disimpan di tabel `categories` (nama, emoji, type income/expense/both,
  flag is_default); dimuat via `loadData()` ke `data.categories[user.id]`, di-seed otomatis
  dari `DEFAULT_CATEGORIES` saat user belum punya baris. Emoji diambil dari memo `emojiMap`
  (fallback '✨' untuk kategori historis yang sudah terhapus) — JANGAN hardcode daftar kategori
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

## Desain — Claymorphism (legacy; digantikan mulai N1)
- Warna cerah, saturasi tinggi, background soft/pastel base
- Elemen "empuk": border-radius besar (16–28px), soft shadow ganda (outer soft shadow +
  inset highlight tipis di atas untuk efek 3D "clay")
- Tombol terasa bisa "ditekan": box-shadow berkurang + translateY kecil saat :active
- Hindari flat design / sharp corners — ini kebalikan dari neo-brutalist
- Semua CSS custom (tanpa Tailwind), taruh di file CSS yang relevan di `app/`
- PENTING: begitu fase Redesign dimulai (lihat bagian "Fase Redesign — Neo-Brutalist"),
  JANGAN menambah rule clay baru lagi — semua style baru masuk bahasa neo-brutalist

## Yang HARUS dihindari
- Jangan hardcode API key Supabase di source code
- Jangan hapus fitur yang sudah ada (badge, wishlist, budget) saat migrasi — hanya pindahkan
  penyimpanan datanya
- Jangan ubah bahasa UI ke Inggris
- Jangan tambah dependency besar (Tailwind, UI library) tanpa konfirmasi user dulu
