# RAPI — Instruksi untuk GitHub Copilot

## Tentang project
RAPI (Rekap Arus Pengeluaran dan Income) adalah aplikasi catatan keuangan personal.
Sedang dalam proses migrasi besar dari MVP client-only (localStorage) menjadi aplikasi
dengan backend (Supabase) + sistem gamifikasi (XP, Level, badge) + redesign visual
bertema Claymorphism.

Semua teks UI bilingual Indonesia/Inggris via sistem i18n (lib/i18n.js), gaya santai
gen-z-friendly ("bestie", emoji, nada ramah) di KEDUA bahasa. Pertahankan gaya ini di
setiap komponen baru.

## Sistem i18n (N9c)
- Kamus: DICT flat di `lib/i18n.js`, pasangan `"kunci": { id: "...", en: "..." }`
  berdampingan. SEMUA teks UI baru wajib lewat DICT — dilarang hardcode string tampilan.
- Komponen React: pakai hook `t(key, vars)` / `useT()`; bahasa aktif = state `lang` di
  Home (persist localStorage `rapi.lang`), disinkronkan ke global via `setLang(lang)`.
- Libs murni non-React (recap, badges, xp, reminders, profileCard, reportPdf, csv):
  fungsi publik menerima param `lang = 'id'` eksplisit dan menerjemahkan via
  `tl(lang, key, vars, fallback)` — JANGAN baca state global dari libs. Param `fallback`
  dipakai bila kunci tidak ada (mis. badge kustom dari DB jatuh ke judul aslinya).
- Kontrak yang sengaja TIDAK diterjemahkan: header kolom CSV (`tanggal,tipe,kategori,
  judul,nominal`) agar file ekspor lama tetap terbaca; format uang selalu Rp gaya id-ID;
  nama kategori & badge dari DB selalu data aktual.
- `<html lang>` & `document.title` ikut bahasa aktif (efek di Home); notifikasi
  terjadwal di-resync otomatis saat ganti bahasa (efek di Dashboard).

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

## Fase Finansial (F1–F6)
Fase fitur bernilai finansial setelah fondasi visual/gamifikasi selesai. Semua engine
analisis bersifat RULE-BASED & DETERMINISTIK (fungsi murni di `lib/`, tanpa AI/ML,
tanpa panggilan API eksternal) — hasil harus bisa dijelaskan ke user ("kenapa saya
dapat saran ini"). BUKAN nasihat investasi spesifik; tetap di area kebiasaan:
nudge pola belanja, pacing budget, kebiasaan menabung. Urutan pengerjaan
(jangan lompat urutan tanpa konfirmasi user):
- **F1 — Saran finansial**: engine analisis rule-based yang membaca data transaksi/
  budget/kategori existing dan menghasilkan saran/nudge kebiasaan finansial
  (deteksi pola: lonjakan kategori, langganan menumpuk, spending pacing vs budget).
  Output berupa daftar saran dengan alasan yang human-readable & bilingual (i18n).
- **F2 — Skor kesehatan finansial**: kondensasi sinyal dari F1 menjadi satu angka/
  gauge (misal 0-100). Kemungkinan besar reuse logic engine F1 (sub-skore per sinyal)
  — rancang F1 supaya mudah dikondensasi.
- **F3 — Rekomendasi pembagian budget**: metode 50/30/20 (kebutuhan/keinginan/
  tabungan) sebagai starting point saat user mengatur budget. Prasyarat struktural:
  kategori perlu ditandai tipe alokasinya (needs/wants/savings) — ada perubahan skema
  (`categories`) + UI penandaan.
- **F4 — Multi-dompet/akun**: perubahan struktural terbesar di fase ini — tabel
  `wallets` baru, transaksi terhubung ke wallet, UI switch antar wallet. Sentuh data
  layer, schema, dan banyak layar; kerjakan setelah fitur analitik (F1-F3) stabil.
- **F5 — Tantangan hemat mingguan**: challenge mingguan (target no-spend/limit
  kategori) terintegrasi dengan sistem XP/badge/streak yang sudah ada.
- **F6 — Simulasi nabung**: proyeksi sederhana berdasarkan pola menabung historis
  user (trend saldo/tabungan dari transaksi), output naratif + angka, bukan grafik
  prediksi investasi.

Prinsip lintas F1-F6: fungsi engine = murni & testable di `lib/` (pola `recap.js`/
`badges.js`), UI hanya presentasi; semua string via i18n; saran selalu sertakan "mengapa".

## Fase Redesign 2 — Dark Premium (DP1–DP9)
Bahasa desain berikutnya yang menggantikan TOTAL Neo-Brutalist — bukan penyesuaian:
semua border tebal, shadow hard-edge, dan label kapital ala brutalist akan dihapus.
Karakter bahasa desain baru:
- Base gelap nyaris hitam: `#0F0F13` background / `#1C1C24` card; varian terang:
  `#F7F7FA` background / `#FFFFFF` card. Light + dark adalah SATU set token, bukan
  stylesheet terpisah (pola sama dengan token brutalist saat ini).
- SATU aksen dominan kuning `#FFC629` untuk CTA, progress bar, level pill, streak.
- Warna semantik TERKUNCI: hijau `#34D399` khusus pemasukan, coral `#FF6B6B` khusus
  pengeluaran — coral tidak lagi dipakai untuk tombol netral seperti di brutalist.
- TANPA border; radius besar 18–24px; shadow nyaris tak terlihat (bukan hard-edge).
- Hierarki tipografi lewat ukuran & warna teks — BUKAN label kapital mono-spasi
  ala brutalist.

Restrukturisasi navigasi (berjalan bareng redesign):
- Bottom nav tetap 5 tab + FAB, di-re-style: tab aktif jadi pill kuning solid.
  Urutan: **Beranda / Transaksi / [FAB +] / Analisis (BARU) / Target / Profil**.
- Tab **Analisis** baru: memindahkan konten yang saat ini terkubur di
  Profil › "Saran finansial" menjadi tab level-atas — Skor kesehatan (F2),
  Saran finansial (F1), Rekomendasi 50/30/20 (F3), Simulasi nabung (F6).
  Recap cerita (N7) TETAP di Beranda tanpa duplikasi — hook keterbukaan
  harian; keputusan final saat perencanaan DP2.
- Profil disederhanakan pasca-pemindahan: Kartu profil, Ganti username & password
  (baru), Pengaturan (mata uang/teks/bahasa/tema), Kelola Kategori,
  Langganan & Rutin, Data & Backup, Pengingat, Danger Zone.

Urutan milestone (jangan lompat urutan tanpa konfirmasi user):
- **DP1 — Fondasi token**: buat CSS token dark premium (light + dark) + primitif
  dasar kartu/tombol `dp-*`; belum menyentuh page.js.
- **DP2 — Restrukturisasi navigasi**: bottom nav baru + tab Analisis +
  migrasi konten dari halaman Saran ke tab tersebut.
- **DP3 — Beranda**, **DP4 — Transaksi**, **DP5 — Target**,
  **DP6 — Analisis** (polish visual konten yang sudah pindah),
  **DP7 — Profil** (termasuk fitur ganti username & password),
  **DP8 — Auth**.
- **DP9 — Cleanup**: hapus `app/brutalist.css` lama + audit kontras dark+light
  menyeluruh.

Pola migrasi sama seperti transisi Claymorphism→Brutalist dulu: class `dp-*`
DITAMBAHKAN berdampingan dengan brutalist.css terlebih dahulu, lalu rule brutalist
dihapus di akhir (DP9) setelah semua layar terverifikasi di kedua tema.
Begitu fase ini dimulai: JANGAN menambah rule brutalist/clay baru lagi — semua
style baru masuk bahasa dark premium (`dp-*`). brutalist.css DIHAPUS saat DP9:
kerangka layout/spacing/animasinya kini hidup sebagai seksi "STRUKTUR LEGASI" di
premium.css — diposkan SEBELUM seksi-seksi patch dp (urutan = cascade file lama;
jangan pindah ke bawah atau patch dp akan ditimpa). Status: Fase Redesign 2 TUNTAS
(DP1–DP9); audit kontras WCAG kedua tema bersih, token light/dark lihat blok token atas + catatan DP9 di TASKS.md.

## Fase Pasca-Redesign — Roadmap (urutan terkunci)
1. **DP9b — Bugfix & Konsistensi Visual** — TUNTAS PENUH 2026-08-24 (termasuk
   #11 sistem ikon): 16 item review ditangani (lihat rincian TASKS.md). Yang
   penting ingat:
   - `computeStats` kini mengecualikan bulan kosong dari `surplusAvg`/`buffer`
     (bulan aktif-deficit tetap dihitung); smoke case sparse ada di
     `scripts/simulate.smoke.mjs`.
   - `.category-row button.alloc-chip` punya width:auto sendiri — jangan biarkan
     legacy `width:30px` menekannya lagi.
   - **Ikon UI = library `ICON_PATHS` + komponen `<Icon name size>` di page.js**
     (SVG stroke currentColor ~1.9px). Untuk ikon UI baru: tambah path ke
     ICON_PATHS, JANGAN pakai emoji. Emoji hanya untuk konten user (kategori,
     dompet, tantangan, badge) dan ornamen kartu share/auth.
2. Revisi IA Beranda + Navigasi — TUNTAS PENUH 2026-08-24: Recap → headline
   tab Analisis; Tantangan → tab Target setelah goal/badge; Beranda = heading
   ringkas "Halo, {nama} 👋" (DM Sans 20px, tanpa subline/pertanyaan) + CTA,
   Balance, Stat×2, insight, budget (ScoreCard & advice-teaser dibuang —
   komponen ScoreCard sudah dihapus, CSS .score-card/.advice-teaser
   dipertahankan); FAB tengah geometris (grid `1.5fr 1.5fr 64px 1fr 1fr 1fr`,
   slot + FAB absolute); Auth mobile dikompak via blok media ≤770px di ekor
   premium.css.
3. Hutang Piutang & Cicilan (TUNTAS — F8; lihat catatan di bawah)
4. Sistem Avatar + Misi (TUNTAS — F9; lihat catatan di bawah)
5. Leaderboard (opt-in; nickname bukan nama asli)
6. Mode Tanpa-Login / Guest Mode (paling akhir; proyek arsitektur besar:
   guest data lokal + migrasi ke cloud saat login; scope diskusi nanti)

Jangan mulai fase berikutnya sebelum fase berjalan tuntas; rinci scope saat gilirannya tiba.

## Konvensi kode yang sudah ada (pertahankan gayanya)
- Komponen fungsi di `app/page.js`, memakai `'use client'` di baris pertama file
- Helper domain ditaruh sebagai fungsi murni di `lib/`: `xp.js` (XP & level),
  `streak.js` (daily streak), `badges.js` (evaluasi badge + progress),
  `profileCard.js` (kartu shareable via Canvas API, tanpa dependency tambahan),
  `recurring.js` (jadwal & catch-up transaksi berulang, fungsi murni — cap 6 per aturan),
  `debts.js` (F8 hutang/piutang: jadwal cicilan reuse pola recurring dengan clamp
  angsuran terakhir, netWorth = totalBalance global + Σpiutang − Σhutang, fungsi murni),
  `avatar.js` (F9 avatar & misi border: DiceBear offline via @dicebear/core — SVG
  deterministik dari seed TANPA network, evaluasi misi murni ala badge, fungsi murni),
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
- Migrasi F8 (`sql/f8_debts.sql`) menambah tabel `debts` + kolom nullable
  `transactions.debt_id`; insert baris `debts` WAJIB menyertakan `user_id` eksplisit
  (kegagalan = 403 RLS "new row violates row-level security policy")
- Migrasi F9 (`sql/f9_avatar.sql`) menambah kolom `profiles.avatar_seed/avatar_border`
  + tabel `user_missions`/`feature_usage`; fitur "pernah pakai" SENGAJA event-based
  (bukan derivasi data) agar kredit bertahan walau goal/hutang kemudian dihapus —
  jangan ganti jadi query data; tier border auto-highest & tidak pernah turun
- Fitur yang butuh migrasi baru dijaga guard data (mis. `hasDebts`, `hasAvatar` dari probe
  `loadData`) supaya build lama/pra-migrasi tetap aman tanpa crash

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
- Jangan hardcode string teks UI — semua lewat DICT di lib/i18n.js (lihat bagian i18n);
  kalau menambah kunci, isi lengkap pasangan id+en dan update backup /tmp/i18n_entries.json
- Jangan tambah dependency besar (Tailwind, UI library) tanpa konfirmasi user dulu

## Responsif & Verifikasi Device
- CDP emulator (411dp) TERBUKTI buta terhadap bug overflow yang muncul di device
  fisik ±360dp — elemen intrinsik-lebar lolos karena slack lebar. WAJIB jalankan
  gerbang `node scripts/check-overflow.mjs` (scan 340/360/384/411dp × 5 tab,
  exit 1 bila meluap) sebelum menganggap perubahan layout tuntas, dan minta user
  verifikasi di device fisik untuk perubahan layout besar
- Elemen `position:fixed` JANGAN di-center dengan `left:50%+translateX()` — pola
  fixed+transform rentan "hilang" saat halaman dalam keadaan pan/zoom di WebView
  Android; pakai `inset-inline:0 + margin-inline:auto`. Guard global
  `html,body{overflow-x:clip}` ada sebagai safety-net — jangan dihapus
- Grid/flex dengan kolom `auto` berukuran intrinsik (label uppercase, angka
  `nowrap`, chip ber-border) bisa meluap di layar sempit — kecilkan via media
  query ≤400px atau pakai `minmax(0,…)`; lihat `.alloc-row` di premium.css
- Gotcha CSS: shorthand `font: 800 .68rem/1 inherit` TIDAK VALID (kata kunci
  `inherit` tak boleh jadi komponen shorthand) — seluruh deklarasi dibuang
  parser diam-diam dan elemen jatuh ke ukuran default. Pakai longhand
  (`font-weight/font-size/line-height`)

## Notifikasi & Perayaan
- Dua jalur resmi, jangan campur: (1) **perayaan** (border misi, avatar baru,
  tantangan selesai, claim goal) → `CelebrateModal` (app/CelebrateModal.js,
  reuse shell LevelUpModal + confetti) via state `celebrate` — modal WAJIB
  ditutup manual (tombol/back/ESC), tanpa auto-dismiss; (2) **informasional**
  (hapus/simpan, ekspor-impor, peringatan) → toast global via `setToast`,
  auto-dismiss universal 3,2 dtk di useEffect (JANGAN bikin setTimeout
  sendiri di titik pemanggil)
- Toast & pesan status WAJIB pakai token dp-* (`--dp-card/--dp-text/
  --dp-radius`) sehingga kontras aman di light+dark — dilarang hardcode
  warna hex untuk teks/background elemen UI yang tampil di kedua tema
- Naikkan `versionCode` di android/app/build.gradle setiap kali APK
  dibagikan untuk di-install ulang di device fisik (versionCode sama bisa
  gagal replace diam-diam)
