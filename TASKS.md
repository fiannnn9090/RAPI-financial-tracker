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
- [x] N5 Terapkan Profil + Auth (+ modal level-up) → clay.css dihapus: basis struktural
      yang masih hidup dipindah ke atas app/brutalist.css (banner "CLEANUP LEGACY CSS",
      urutan kaskade dipertahankan); rule mati (topbar, blobs) dibuang
- [ ] N6 Fitur struktural baru: kustomisasi kategori [x N6a], transaksi berulang
      [x N6b — tabel + generate catch-up cap 6 + UI Profil + toast], smart reminder
      [x N6c — local notifications: streak harian + due tagihan, toggle di Profil]
- [x] N7 Recap cerita mingguan/bulanan — lib/recap.js (template deterministik, kategori
      selalu dari data aktual), kartu wrapped gelap di Beranda, toggle Minggu/Bulan
- [x] N8 Export & Import Data — lib/csv.js (RFC4180 parser/escaper, validasi + dup-skip),
      lib/reportPdf.js (jspdf lazy, tabel manual), section Data & backup di Profil +
      ImportSheet 2 langkah
- [x] N9a Pengaturan mata uang tampilan — lib/fx.js (fawazahmed0+mirror+er-api, cache
      24 jam localStorage, fallback IDR), formatter terpusat money.format, section
      Pengaturan di Profil; DB & export tetap IDR
- [x] N9b Ukuran teks (a11y) — konversi 120 deklarasi px→rem (brutalist+globals),
      root `--font-scale` 100/115/130%, 10 selector ikon dekoratif di-pin px,
      segmented control di card Pengaturan, persist localStorage
- [x] N9c Dukungan Bahasa Inggris (i18n) — lib/i18n.js (DICT flat id/en, t()/useT untuk
      komponen, tl(lang,...) non-hook untuk libs murni); Fase 1: semua string statis
      page.js+LevelUpModal; Fase 2: recap/badges/xp/reminders/profileCard/reportPdf/csv
      menerima param lang eksplisit; kontrak terjaga: header CSV tetap Indonesia,
      format uang tetap Rp/id-ID, kategori & badge dari DB tidak diterjemahkan (fallback);
      Fase 3: sweep bersih + fix interpolasi tl() + plural EN rc.count + <html lang> &
      document.title dinamis + resync notifikasi saat ganti bahasa; toggle ID↔EN stress
      test lolos, build + cap sync android OK
- [x] N9d Polish layout — ritme antar-seksi (`.brutal-section` margin + header
      wrap-safe), toolbar swipe kategori (scroll-snap, shadow chip aktif tak
      terpotong, toolbar boleh wrap), fix badge tier pill menimpa teks
      (`position:absolute` warisan clay → static + min-width kolom teks),
      normalisasi sub-halaman Profil (netral `.danger-zone` margin-top 52px &
      trailing margin seksi, sub-header wrap-safe); build + cap sync OK
- [x] N9e Kartu profil & audit CSS — view 'kartu' diperkaya pratinjau identitas
      (avatar, username, Lv·gelar, pill tier) + statistik streak/badge; audit
      otomatis dual-cascade clay+brutal (skrip diff properti 16 pasangan kelas):
      strip atas kartu & titik judul seksi dipindah ke palet brutal, handle sheet
      & glow streak dibersihkan, sisa bevel/tilt/warna locked pada badge
      dinetralkan (hard shadow tier epik/legendary dipertahankan); build + cap
      sync OK
- [x] N9f Flatten sub-halaman Profil — 5 wrapper `<section class="manage-* brutal-section">`
      ganda (pengaturan/kategori/rutin/data/pengingat) dihapus; kartu kini anak
      langsung `.profile-sub` (satu sumber jarak: grid gap), rule CSS mati
      `.manage-categories .section-header h2` & override `.profile-sub
      .brutal-section` dibuang; build + cap sync OK
- [x] N9g De-box kategori & rutin — kartu pembungkus besar (tanpa padding,
      menghimpit baris) dihapus: chip baris jadi satu-satunya kotak; guard
      min-width + overflow-wrap pada nama kategori/rutin agar teks panjang tak
      meluber menimpa komponen sebelah; APK di-rebuild & terverifikasi berisi
      CSS baru
- [x] N9h Fix toggle pengingat & padding kartu — akar bug toggle: dynamic-import
      `@capacitor/local-notifications` menghasilkan error bridge "then() is not
      implemented" (proxy plugin ter-await); ganti static import standar +
      guard `nativeReady()` + try/catch toggleReminders agar gagal selalu tampil;
      verifikasi end-to-end di emulator via CDP (permission → channel → jadwal
      harian 1001 + tes 9001, state persist, pesan aktif). Padding 20px untuk
      settings/data/reminder card (satu-satunya kartu tanpa padding, isi
      menghimpit border); inset terverifikasi ~23 css px di 3 halaman via
      uiautomator bounds
- [x] N9i Warna kartu per kategori (selaras money card) — 4 var tint baru di
      :root + kedua blok dark (--br-tint-lilac #F1EAFF pengaturan,
      --br-tint-mint #DCF5EB ekspor&impor, --br-tint-sun #FFF1C2 pengingat,
      --br-tint-blush #FFE6EC kartu profil); semua kartu sub-halaman diseragamkan
      padding 22px persis money card (.share-card.brutal-share perlu specificity
      0-2-0 untuk takluki clay 21px); gradasi clay pada share-card dikalahkan.
      Terverifikasi via CDP computed style di emulator: 4/4 warna & padding tepat
- [x] N9j Tema gelap + toggle — kabelkan sistem tema 3-status (system/light/dark,
      localStorage `rapi.theme`, default system): efek menulis/membersihkan
      [data-theme] di <html> + listener matchMedia change; toggle segmen
      Sistem/Terang/Gelap di kartu Pengaturan (pola .sort-toggle, i18n baru).
      Body akhirnya di-repaint brutal (`body{background:var(--br-bg)}` — globals
      masih --paper terang). StatusBar native mengikuti tema efektif
      (Style.Dark/Light, import statis + catch). Verifikasi CDP: toggle ✓ persist
      reload ✓ mode sistem mengikuti emulasi prefers-color-scheme dua arah ✓ tint
      dark terpakai (#2D2547 dkk) ✓ audit elemen-berlatar-terang bersih (sisa:
      money card translusen & recap invert — keduanya disengaja)
- [x] N9k Audit & perbaikan kontras dark mode — audit otomatis via CDP di 12
      layar (beranda/transaksi/target/profil×8/form): WCAG ratio teks + deteksi
      permukaan terang. Ditemukan & diperbaiki: (1) modal catat-transaksi masih
      terang penuh → flip var clay (--clay-surface/ink/muted) di dark + input/
      select/backdrop gelap; (2) heading & nominal fg #463A52 di bg gelap
      (ratio 1.5) → ikut flip clay; (3) tombol aksen kuning/lilac/coral teks krem
      (1.3) → teks #141414 permanen, ghost tetap tinta tema; (4) chip aktif &
      type-switch putih-di-lilac/coral (2.6) → hitam; (5) kartu badge & goal
      terang → surface gelap + tier legendary chip gold teks hitam (!important,
      dua sistem selector .badge-card/.badges); (6) brand & insight-card &
      form-message. Sisa audit = false positive gradient (mint/lilac + hitam,
      5.8-12:1). Sanity light: tanpa regresi
