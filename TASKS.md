# RAPI — Task breakdown

Kerjakan satu task per sesi Copilot Chat. Paste task-nya ke Copilot Chat (bukan inline
completion) supaya dia baca konteks penuh + `.github/copilot-instructions.md`.

## Fase 1 — Setup Supabase
- [x] Buat project baru di supabase.com, catat Project URL & anon key
- [x] Jalankan `sql/schema.sql` di SQL Editor Supabase
- [x] `npm install @supabase/supabase-js`
- [x] Buat `.env.local` berisi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] Prompt Copilot: "Buatkan lib/supabase.js yang inisialisasi Supabase client dari
      environment variable NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY"

## Fase 2 — Migrasi Auth & data layer
- [x] Prompt Copilot: "Ganti komponen Auth di app/page.js supaya pakai Supabase Auth
      (signUp/signInWithPassword) alih-alih localStorage users array. Username tetap
      dipakai sebagai identitas utama, tapi Supabase Auth butuh email — gunakan pola
      email dummy `${username}@rapi.local` di baliknya, transparan buat user."
- [x] Prompt Copilot: "Ganti seluruh baca/tulis transactions, goals, budgets, achievements
      dari object `data` + localStorage menjadi query Supabase (select/insert/delete) sesuai
      schema di sql/schema.sql. Pertahankan nama fungsi (addTransaction,
      removeTransaction, setGoal, dst) dan behavior yang sama seperti sekarang."
- [x] Test manual: register, login, tambah transaksi, refresh browser, data masih ada

## Fase 3 — Sistem XP & Level
- [x] Definisikan formula & title level (contoh, sesuaikan sama user):
      - XP per transaksi: 10 (base), +5 bonus jika kategori masih di bawah budget
      - Level = floor(sqrt(xp / 50)) + 1
      - Title: Lv1-2 "Pemula Nabung", Lv3-5 "Rajin Cuan", Lv6-9 "Jagoan Anggaran",
        Lv10+ "Sultan Circle" (bebas disesuaikan)
- [x] Prompt Copilot: "Tambahkan logic hitung XP dan level berdasarkan formula di atas,
      update kolom xp/level di tabel profiles setiap kali transaksi baru ditambahkan"
- [x] Prompt Copilot: "Buat komponen modal LevelUpModal yang muncul dengan animasi
      confetti CSS ketika level user naik, tampilkan level baru dan title-nya"

## Fase 4 — Redesign Claymorphism
- [x] Prompt Copilot: "Buat file app/clay.css dengan design token claymorphism: variabel
      CSS untuk warna (base pastel cerah + accent), border-radius besar, soft double
      shadow, dan style tombol yang terasa 'ditekan' saat :active. Ikuti panduan di
      bagian Desain pada .github/copilot-instructions.md"
- [x] Ganti import CSS lama (genz.css/playful.css/pastel.css) di layout.js dengan clay.css
- [x] Terapkan class-class baru ke komponen di app/page.js satu section per satu
      (jangan sekaligus semua — cek visual tiap section dulu)
- [x] Hapus genz.css/playful.css/pastel.css setelah migrasi selesai & dicek semua halaman

## Fase 5 — Fitur lanjutan
- [x] Daily streak: increment streak_current kalau last_activity_date = kemarin,
      reset kalau lebih dari 1 hari, update streak_longest
- [x] Isi tabel badge_defs dengan daftar badge + rarity (via `sql/badge_seed.sql`),
      tampilkan progress bar untuk badge yang belum unlock (bukan cuma locked/unlocked binary)
- [x] Kartu profil shareable: generate gambar/canvas berisi level, streak, jumlah badge,
      saldo yang di-blur — tombol "Download" atau "Share"

---
Setelah tiap fase selesai, jalankan `npm run build` buat mastiin gak ada error sebelum
lanjut ke fase berikutnya.

## Fase Mobile — Konversi Android (Capacitor)
- [x] M1 Static export: `output: 'export'` di next.config.js, build sukses ke folder `out/`
- [x] M2 Restrukturisasi navigasi tab-based: Beranda/Transaksi/Target/Profil dengan bottom nav
- [ ] M3 Overhaul CSS mobile:
  - [x] M3a Auth mobile: kompress intro agar form di atas fold, safe-area padding, min-height
        100dvh (anti-tertutup keyboard), touch target ≥44px (input & tombol switch)
  - [x] M3b `viewport-fit=cover` via export viewport di layout.js (wajib agar env(safe-area-inset)
        aktif — memengaruhi juga hasil M2)
  - [x] M3c Safe-area inset menyeluruh dashboard + audit touch target ≥44px semua kontrol
  - [x] M3d Bottom-sheet untuk TransactionForm/BudgetForm/GoalForm (LevelUpModal tetap center)
  - [x] M3e Konversi window.prompt() Budget & Goal jadi BudgetSheet/GoalSheet terkontrol
        (style .modal sama; Budget = kategori + limit, Goal = nama target + nominal)
- [x] M4 Integrasi Capacitor: init platform Android (appId com.rapi.app), sinkronisasi build
      statis (`npm run cap:sync`), ikon & splash screen (generator `scripts/make-cap-assets.py`,
      butuh pillow; regenerate via `npm run cap:assets`)
- [x] M5 Polish native: styling status bar (krem #FAF3EE + ikon gelap, via config StatusBar),
      penanganan tombol back Android berjenjang (tutup modal → tab Beranda → exit,
      @capacitor/app), transisi splash → app (auto-hide + fade 400ms via @capacitor/splash-screen)

---

## Fase Redesign — Neo-Brutalist Bold
Ganti TOTAL claymorphism: border tebal solid, warna flat kontras tinggi tanpa gradient,
shadow hard-edge (offset tanpa blur), tipografi besar & berani. Dark mode bagian dari token.
Detail lengkap: `.github/copilot-instructions.md` → "Fase Redesign — Neo-Brutalist".
- [x] N1 Fondasi token + dark mode: `app/brutalist.css` (token light & dark, 4 aksen solid,
      border-width standar, resep shadow hard-edge offset-no-blur, skala tipografi besar,
      primitif .brutal-card/.brutal-button) — TANPA menyentuh page.js / clay.css
- [x] N2 Terapkan tab Beranda (heading, balance/stat card, insight, budget)
- [x] N3 Terapkan tab Transaksi + bottom-sheet form transaksi
- [x] N4 Terapkan tab Target (goal card, badge list) + sheet Budget (koreksi cakupan dari
      N2) & Goal
- [x] N5 Terapkan Profil + Auth (+ modal level-up) → setelah dicek, hapus clay.css &
      sisa legacy globals.css
- [ ] N6 Fitur struktural baru: kustomisasi kategori [x N6a], transaksi berulang
      [x N6b — tabel + generate catch-up cap 6 + UI Profil + toast], smart reminder
      [x N6c — local notifications: streak harian + due tagihan, toggle di Profil]
- [ ] N7 Recap cerita mingguan/bulanan
