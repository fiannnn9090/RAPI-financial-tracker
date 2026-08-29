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

## Fase Finansial — Saran & Kesehatan Finansial
Engine rule-based deterministik (fungsi murni di lib/, tanpa AI/ML) — bukan nasihat
investasi. Urutan jangan dilompati; rancang F1 agar mudah dikondensasi ke F2.
- [x] F1 Saran finansial — engine analisis rule-based dari data transaksi/budget/
      kategori existing: deteksi pola (lonjakan kategori, langganan menumpuk, pacing
      vs budget), output daftar saran/nudge + alasan human-readable bilingual;
      fungsi murni di lib/ (pola recap.js/badges.js), UI hanya presentasi
      → lib/advice.js (8 detektor S1-S8, guard 14 hari/≥5 tx, dedupe per kategori,
      sort skor desc, deterministik; smoke test 11/11 di scripts/advice.smoke.mjs
      via esbuild). UI hybrid: teaser kondisional Beranda (hanya saat ada severity
      'tinggi', tap → Profil) + halaman Profil › 💡 Saran finansial (grup Perlu
      tindakan/Cuma pengingat, badge severity, disclaimer bukan-nasihat-investasi).
      i18n adv.* + prof.menu.saran (id/en). CSS section F1 adaptif dark via token.
      Terverifikasi on-device emulator: teaser+pesan highlight benar, 6 saran dari
      data QA asli, grup & warna severity sesuai.
- [x] F2 Skor kesehatan finansial — kondensasi sinyal F1 jadi satu angka/gauge
      0-100; reuse sub-skore per sinyal dari engine F1; tampilan gauge di Beranda/
      Profil → lib/score.js: 5 komponen berbobot (savings 35, budget 25, rutin 15,
      buffer 15, momentum 10) + renormalisasi bobot saat komponen tak relevan;
      computeStats() diekstrak dari advice.js (dipakai bersama, smoke F1 tetap
      11/11); trend historis via recompute previousMonthEnd() tanpa tabel baru.
      UI: kartu skor mandiri di Beranda (gauge semicircle SVG 3 segmen + jarum +
      chip level + delta ▲▼) + panel breakdown per komponen di halaman Saran.
      Smoke score.smoke.mjs 13/13. Fix bug: effect [tab] menimpa profileView saat
      navigasi dari kartu (kini hanya reset saat keluar tab profil). Terverifikasi
      on-device: skor 48/perhatian, delta +11 vs Juli cocok hitungan manual data QA.
- [x] F3 Rekomendasi pembagian budget — metode 50/30/20 (kebutuhan/keinginan/
      tabungan) sebagai starting point saat atur budget; prasyarat: kategori
      → sql/f3_allocation_type.sql (kolom categories.allocation_type NOT NULL
      DEFAULT 'kebutuhan' + backfill default mapping, Lainnya=keinginan). Kode
      tahan pra-migrasi: INSERT tak kirim field, mapCategory + DEFAULT_ALLOCATIONS
      fallback 'kebutuhan', PATCH gagal → toast instruksi migrasi. UI: picker di
      CategorySheet (tipe ≠ income) + chip siklus di Kelola kategori (fix: prop
      juga ke grup income utk kategori both). lib/recommend.js (aktual vs ideal,
      status ±10%, pesan prioritas over-keinginan→over-kebutuhan→under-tabungan),
      smoke recommend.smoke.mjs 9/9. Section BUDGET 50/30/20 di halaman Saran
      finansial di bawah panel skor. Terverifikasi on-device pra-SQL: angka cocok
      hitungan manual (income Rp10jt → ideal 5/3/2), toast migrasi muncul saat
      chip dicoba sebelum kolom ada. Verifikasi siklus sukses menunggu SQL
      dijalankan user.
      ditandai tipe alokasi (needs/wants/savings) → perubahan skema categories +
      UI penandaan
- [x] F4 Multi-dompet — selesai & terverifikasi on-device (qa_tint, emulator-5554).
      Model "dompet = lensa untuk SALDO & TRANSAKSI; analitik & gamifikasi GLOBAL":
      saldo/stat/insight/list transaksi mengikuti switcher; budget, goal, XP/streak/
      badge, recap N7, saran F1, skor F2, reko F3 tetap global. Maks 8 dompet,
      emoji-only (grid tetap). a) sql/f4_wallets.sql: tabel wallets + wallet_id
      NOT NULL FK ON DELETE RESTRICT di transactions & recurring_transactions;
      backfill ke Dompet Utama dijalankan user (34/34 tx, 3/3 rutin); probe
      graceful degradation pra-migrasi + seed klien akun baru. b) WalletSwitcher
      Beranda (muncul saat >1 dompet) + chip filter tab Transaksi; lensa aktif
      persist localStorage ('rapi.wallet.active'); transaksi baru ter-stamp ke
      dompet aktif (mode Semua → default). c) CRUD dompet: menu Profil › Dompet +
      WalletSheet (nama unik case-insensitive + grid emoji), guard hapus
      default/terakhir/terpakai, guard batas 8, edit prefill benar. d) Form &
      ekspor-impor: picker dompet di TransactionForm & RecurringSheet (tampil
      saat >1); kolom `dompet` opsional di akhir CSV/PDF (REQUIRED_COLUMNS beku,
      file lama tetap terbaca); impor cocokkan nama dompet case-insensitive,
      fallback dompet default. Regression smoke advice/score/recommend 3× PASS.
      Bug diperbaiki: TDZ crash urutan deklarasi blok dompet vs memo transaksi;
      17 goal duplikat "motor" (data QA lama) dibersihkan.
- [x] F5 Tantangan hemat mingguan — challenge mingguan (no-spend/limit kategori)
      terintegrasi sistem XP/badge/streak existing
      (katalog 4 jenis deterministik, aktivasi manual 1/minggu, reward XP +15/25/30/35,
      badge challenge_1/challenge_5; plus fix persistensi XP historis & seed badge_defs)
- [x] F6 Simulasi nabung — proyeksi sederhana dari pola historis user,
      output naratif + angka (bukan prediksi investasi)
      (lib/simulate.js pure dari computeStats: surplusAvg 3 bln penuh; slider what-if
      0–2jt real-time; ETA goal ±bulan kalender; proyeksi saldo 6/12 bln; global lintas
      dompet; panel di halaman Saran setelah ScorePanel + deep-link dari goal card;
      guard data tipis/deficit/reached; disclaimer historis bukan janji.
      Bonus fix: wallet.txCount & wallet.editAria kurung ganda → single-brace)
- [x] F7 Kelola akun — ganti username & password (Pengaturan › baris menu
      🔑 "Akun & kata sandi" › sub-halaman form; back nested ke Pengaturan)
      (password: verifikasi ulang lewat signIn lalu updateUser — hash dikelola
      Supabase Auth; username: identitas tampilan saja, pre-check unik
      case-insensitive via ilike + escape wildcard. Temuan: GoTrue menolak
      updateUser({email}) @rapi.local (email_address_invalid pada email
      tersimpan) → kolom baru profiles.auth_email stabil + RPC security
      definer resolve_login_email untuk login pre-auth (RLS memblokir select
      langsung). sql/f7_account.sql. Catatan: Danger Zone tak menghapus row
      auth.users (butuh service-role) → username bekas akun terhapus tak bisa
      didaftarkan ulang — keterbatasan pre-existing yang didokumentasikan)

## Fase Redesign 2 — Dark Premium
Ganti TOTAL neo-brutalist: base gelap nyaris hitam (#0F0F13/#1C1C24, varian terang
#F7F7FA/#FFFFFF), satu aksen kuning #FFC629, hijau #34D399 terkunci pemasukan,
coral #FF6B6B terkunci pengeluaran, tanpa border, radius 18-24px, shadow nyaris
tak terlihat, hierarki via ukuran/warna tipografi. Navigasi jadi 5 tab + FAB
(Beranda/Transaksi/[FAB +]/Analisis BARU/Target/Profil, aktif = pill kuning solid);
konten Profil › Saran finansial (Recap, Skor, Saran, 50/30/20, Simulasi) pindah ke
tab Analisis. Detail lengkap: `.github/copilot-instructions.md` →
"Fase Redesign 2 — Dark Premium".
- [x] DP1 Fondasi token dark premium (light+dark) + primitif dp-* — app/premium.css
      (token via mekanisme [data-theme] N9j; .dp-card, .dp-button + ghost/soft;
      belum dipakai komponen). DP2 nav: premium.css di-import layout.js
- [x] DP2 Restrukturisasi navigasi — 5 tab + FAB tengah geometris (grid
      1.5+1.5fr|64px|3×1fr), skin dp-* penuh (aktif = pill kuning icon+label,
      nonaktif ikon saja); tab Analisis baru berisi ScorePanel/Simulasi/50-30-20/
      saran F1 (pindah penuh dari Profil › Saran); recap N7 tetap di Beranda tanpa
      duplikasi; 3 deep-link retarget setTab('analisis'); menu Profil: baris 💡
      dihapus → 🔑 Ganti username & password jadi level-atas (submenu akun keluar
      dari Pengaturan); i18n nav.analisis/an.title/an.sub, prof.menu.saran dihapus
- [x] DP3 Terapkan tab Beranda — heading+CTA dp-button kuning, BalanceCard/StatCard/
      Insight/Budget/Tantangan/teaser/score → dp-card (tanpa border, radius 20,
      shadow halus); StatCard pakai --dp-income/-expense terkunci (tint ikon +
      ink teks per tema); level pill & bar kuning; budget-bar netral→kuning→coral
      (hijau tidak dipakai untuk progress); patch specificity utk rule brutalist
      komponen 0-4-0; perlakuan khusus kartu Recap menyusul (usulan dark-night
      card menunggu konfirmasi user)
- [x] DP4 Terapkan tab Transaksi (+ bottom-sheet form) — filter pills & chip
      kategori & segmented sort dp-*; item list flat radius 16 tanpa shadow;
      EmptyState dp-card + tombol kuning pill; nominal semantik terkunci
      (ink per tema); sheet form: input/select no-border bg elev radius 14 +
      fokus ring 2px kuning, type-switch selected pakai tint semantik
      (income/expense), submit dp-button kuning; kartu Recap jadi "kartu malam"
      permanen #17171C di kedua tema dengan ring inset + ambient glow kuning,
      mark <em> highlight kuning muda; rule warisan N9k (.clay-modal /
      :root:not dark-fix) dikalahkan via !important ter-scope (dibuang saat DP9);
      verifikasi CDP kedua tema lolos semua
- [x] DP5 Terapkan tab Target (goal card, badge list) — goal-card/badge-card
      dp-card (patch dasar atas rule clay 0-3-0); progress bar kuning pill 8px;
      goal-reached = ambient glow kuning + ring inset tipis (pola kartu Recap),
      kicker jadi pill "Tercapai!" tint kuning tanpa kapital, tombol klaim solid
      kuning; sistem rarity baru TANPA border/shadow: tangga tint ikon + chip
      (common netral / rare biru #60A5FA / epic ungu #A78BFA / legendary =
      aksen kuning sebagai "mahkota" — chip solid + ring inset di tile ikon);
      locked flat elev tanpa dashed + progress bar 6px fill abu; hover clay
      dinetralkan; verifikasi CDP kedua tema lolos (goal QA dibuat via UI lalu
      dihapus bersih via REST)
- [x] DP6 Polish visual tab Analisis (Recap/Skor/Saran/50-30-20/Simulasi) —
      Gauge di-REWRITE (JSX): semicircle dipertahankan tapi 3 segmen keras +
      jarum diganti track netral pill + arc nilai berwarna level skor
      (<60 coral / 60-79 kuning / >=80 hijau) + dot ujung ber-inti kartu +
      2 tick ambang di 60/80 (ambang riil lib/score.js, bukan 50/80);
      chip level & delta pakai tint+ink semantik; breakdown bar flat;
      slider: track 4px fill kuning via CSS var --fill dari state + thumb
      kuning solid tanpa border; sim-chip win/hot tint; 50/30/20 bar flat
      fill kuning seragam + status ok/warn/bad ink semantik; saran F1
      severity baru: tinggi=coral tint .14 + expense-ink, sedang=kuning tint
      .15 + gold-ink, ringan=elev+muted (mundur visual disengaja); item saran
      flat radius 16; verifikasi CDP live dengan data asli ter-seed (skor 100
      -> arc hijau) + injeksi utk tinggi/sedang, kedua tema
- [x] DP7 Terapkan Profil (termasuk fitur ganti username & password) — avatar
      kuning squircle radius 14; menu utama dp-card dengan row flat + tile ikon
      elev + chevron muted; baris Danger pakai tint coral + expense-ink; logout
      pill elev dengan ink coral; sub-header (back circle elev + aksi kuning
      pill); semua kartu kelola (Pengaturan/Kategori/Rutin/Dompet/Data/Pengingat/
      Akun/Kartu) dp-card; select & segmented Pengaturan pill elev/aksen;
      input AccountSettings ala sheet (elev radius 14 + fokus ring kuning),
      submit kuning; share-tier chip ikut tangga rarity DP5; danger-zone bg
      tint coral + tombol solid #FF6B6B tinta putih; patch !important utk
      lawan .brutal-share (blush !important); verifikasi CDP kedua tema lolos
      (fokus ring terkonfirmasi setelah transisi 300ms — bukan bug)
- [x] DP8 Terapkan Auth (+ modal level-up) — panel intro kiri jadi "panel malam"
      permanen #0F0F13 di kedua tema (konsisten kartu Recap): teks pucat,
      em tagline & chip brand kuning, dekorasi ::after clay dibuang; panel form
      kanan mengikuti tema (#F7F7FA/#0F0F13) dengan kartu dp radius-lg;
      input no-border elev radius 14 + fokus ring kuning (pola DP4/DP7);
      submit pill kuning + link switch gold-ink; LevelUpModal frame dp-card +
      glow kuning tipis, kicker/judul/copy/xp pakai token (XP = income-ink),
      CTA pill kuning — confetti CSS TIDAK disentuh; verifikasi CDP light+dark
      lolos (auth via swap sesi sementara, levelup via injeksi replika).
      CATATAN KEHATI-HATIAN: swap sesi utk verifikasi memakai backup di
      window global yang hilang saat reload → sesi device ter-logout dan tak
      bisa dipulihkan dari sisi client. Ke depan: simpan backup di luar
      window ATAU gunakan akun QA ber-password dikenal untuk uji auth.
- [x] FIX UX kritis — ganti password tanpa password lama: form AccountSettings
      sebelumnya me-re-autentikasi via signInWithPassword(password lama) sebelum
      updateUser → dengan auth_email palsu (@rapi.local) & tanpa jalur reset,
      lupa password lama = lockout permanen. Sekarang: field "kata sandi saat
      ini" dihapus, alur langsung updateUser({password}) setelah validasi lokal
      (best practice Supabase utk sesi aktif); key i18n acct.curPass &
      acct.wrongCurrent dibuang; verifikasi CDP: form tinggal 2 field,
      pesan validasi mismatch & terlalu-pendek tampil, string lama bersih dari
      bundle; smoke 4x PASS. Uji fungsional ganti password asli diserahkan ke
      user (sesi live).
- [x] DP9 Cleanup: brutalist.css DIHAPUS + audit kontras WCAG dark+light.
      Investigasi: 890 rule (6 keyframes) → 312 blok struktural (335 selektor)
      dimigrasi VERBATIM ke premium.css sebagai seksi "STRUKTUR LEGASI"
      (kerangka layout/spacing/animasi masih menopang class brutal-/clay- di
      JSX; keyframes clay-sheet-up dll ikut), 457 rule dekoratif + 35 rule
      mati dibuang. PELAJARAN: blok legasi awalnya ditempel di akhir file →
      30 selektor ber-properti visual menimpa patch dp DP1–DP8 (chip alokasi
      jadi putih-di-putih); diperbaiki dengan memindah legasi KE POSISI SETARA
      file lama (sebelum semua seksi dp). Audit otomatis via CDP (teks vs bg
      efektif, ambang 4.5 / 3.0 large-text) menemukan & memperbaiki: token
      light --dp-muted #66666F, --dp-income-ink #087954, --dp-expense-ink
      #B3382F (lolos di tint 12%), --dp-gold-ink #836200 (di atas krem modal),
      rare/epic dipisah per tema (light #2563EB/#7C3AED, dark pastel
      #93C5FD/#C4B5FD); warna legacy hardcoded dipetakan dual-scope (label
      balance-card, greeting em, meta transaksi, levelup-xp pill krem → tinta
      gelap di dark); tombol warisan tanpa dp diberi perlakuan (challenge
      "Pilih tantangan" = pill aksen, data-actions = ghost elev, alloc-chip =
      pill elev via .dp-page .alloc-chip); halaman Auth: kicker/welcome/
      switch-form/privacy dinaikkan kontrasnya. Hasil akhir: 0 pelanggaran
      live di 5 tab + sub-halaman Profil + sheet + LevelUpModal, kedua tema;
      pasangan statis Auth ≥4.5; smoke score/simulate/advice/recommend PASS.

---

## Fase Redesign 3 — GoPay-Inspired

RESTYLING dari Dark Premium, bukan rombak struktur/fitur. Prinsip & pola migrasi
(`gp-*` berdampingan dulu, dp-* dihapus di GP8) → lihat
`.github/copilot-instructions.md` → "Fase Redesign 3 — GoPay-Inspired (GP1–GP8)".
Murni visual: tanpa fitur baru, struktur navigasi/IA TETAP (4 tab + FAB + ActionSheet
+ RiwayatPage + semua alur).

- [x] **GP1 — Fondasi**: instalasi library ikon ilustrasi flat berwarna (flat-color-icons
      atau setara, pilih bersama user) + token hero gradient biru/teal + primitif pill
      `gp-*` (tombol/chip/badge radius penuh); belum menyentuh page.js
- [x] **GP2 — Beranda**: hero gradient di header + pill pada CTA/balance/stat/level/
      streak/budget
- [x] **GP3 — Transaksi + Riwayat**: item list, filter pills, ActionSheet, RiwayatPage
- [x] **GP4 — Analisis**: recap/skor/saran/50-30-20/simulasi dengan primitif gp
- [x] **GP5 — Target**: goal/badge/challenge
- [x] **GP6 — Profil**: menu, sub-halaman, kartu profil & share
- [x] **GP7 — Auth + modals**: auth page, LevelUpModal/CelebrateModal, sheet-sheet
- [x] **GP8 — Cleanup**: hapus rule dp-* lama + audit kontras light+dark + audit overflow
      WAJIB `node scripts/check-overflow.mjs` (56/56 hijau, exit 1 bila meluap) + verifikasi
      device fisik. Rincian tuntas GP8:
  - **B1 (11 blok `/* B1 hapus: */` di premium.css) DIHAPUS** (rule dp-* superseded —
    mapping 5→4 tab pada `check-overflow.mjs` ikut diperbaiki; brace 827/827, build OK).
  - **B2 (10 blok dead code) DIBIARKAN** (keputusan user; berisiko dihapus).
  - **BalanceCard scrim**: `.gp-balance` kini punya overlay gelap `::before`
    (rgba(0,0,0,.52)→.11) DI ATAS gradient hero + `position:relative;isolation:isolate` +
    `.gp-balance > *{z-index:1}` — teks putih dijamin kontras; token `--gp-hero-*`
    disetujui TIDAK diubah. Verifikasi: sampel nyata "Kekayaan Bersih" ratio 5.5:1 PASS.
  - **Gold text-ink diperbaiki**: 11 aturan gopay yang tadinya `color: var(--gp-hero-a)`
    (~2:1 di light) diganti `var(--dp-gold-ink)` (#836200 light / #FFD97A dark).
  - **Gate overflow HIJAU**: `node scripts/check-overflow.mjs` → exit 0, failures=0,
    56 screen (4 tab + 8 sub-profil → ×4 width + auth login/register ×4) semua tanpa luap.
  - **Audit kontras WCAG**: 0 computed fails di SEMUA tab (dark+light, 360/411);
    recap "Minggu" & challenge-chip "+35 XP" diperbaiki; kontras teks kecil ≥4.5.
  - **Auth intro (kartu malam #0F0F13)** terverifikasi analitik: kicker 5.49, copy 7.52,
    feature-note 8.76, feat small 4.73 — semua PASS; form sisi kanan pakai token dp
    terverifikasi.
  - **Modals perayaan (LevelUp/Celebrate/goal/tx)** memakai token dp (kicker=dp-muted,
    CTA=accent+on-accent, emoji filter:none) — kontras aman.
  - **Ikon multi-warna** (emoji, avatar-frame, digital-glow kuota) dibiarkan: pengantar
    warna grafis/inkorporal bukan teks — kontras teks sekitarnya tetap dipatuhi.
  - Kerangka layout `dp-*` dan 95% premium.css wajib DIPERTAHANKAN (lihat note fase).

---

# Fase Pasca-Redesign — Roadmap

Urutan pelaksanaan terkunci dari atas ke bawah; satu fase tuntas dulu baru
lanjut ke bawah. Scope detail tiap fase didiskusikan saat gilirannya tiba.

- [x] **DP9b — Bugfix & Konsistensi Visual** *(tuntas 2026-08-24)*:
  - **#8 logic simulate (akar ditemukan & diperbaiki)**: `computeStats`
    membagi `surplusAvg` dengan 3 bulan TETAP termasuk bulan kosong
    (income=0 & expense=0 → surplus 0), sementara `avgIncome`/`monthlyExpense`
    menyaring bulan kosong — ETA nabung pengguna baru terdilusi sampai 3×.
    Fix: bulan tanpa aktivitas dikeluarkan dari `surplusList`/`buffer.surplus3m`
    (bulan aktif tapi deficit tetap dihitung); smoke case 6 (sparse) ditambah,
    4 smoke suite PASS semua. Gap smoke test = hanya kasus 3-bulan-stabil.
  - **#2 chip alokasi overlap DEFAULT**: legacy `.category-row button{width:30px}`
    (rule tombol hapus ×) menekan `.alloc-chip` jadi 30px → teks tumpah ke badge.
    Fix: `.dp-page .category-row button.alloc-chip{width:auto}` + strong
    margin-right:auto; em jadi pill elev tanpa border. Terverifikasi CDP.
  - **#1 teks kepotong tepi kanan**: track grid/flex nowrap tak bisa menyusut
    (`score-row minmax(96px,auto)`, label span nowrap, dsb) + font-scale besar.
    Fix: track `minmax(0,…)`, label boleh wrap, nilai nowrap+flex:none;
    overflow scan CDP beranda/transaksi = 0 elemen keluar viewport.
  - **#3 toolbar Transaksi**: `.list-toolbar` kolom, filter kategori flex-wrap,
    sort toggle tak lagi bertabrakan (right=186 < vw).
  - **#4 FAB clearance**: padding-bottom dashboard = 144px (120 + safe-area).
  - **#5 switch pengingat**: styling legacy-nya terbuang saat migrasi DP9
    (terdeteksi "dead" padahal dipakai JSX) — dibangun ulang sebagai dp switch
    (off: elev + knob gelap; on: aksen + knob putih geser 22px; ring halus
    agar knob putih terlihat di track elev light).
  - **#6 kartu pengingat** pakai token dp (bg #1C1C24 dark), form-message
    coral di dark.
  - **#7 segmen rentang PDF**: track elev pill border-0 + indikator aktif aksen
    /on-accent.
  - **#9 ChallengeSheet**: opsi bg elev radius 18 border-0, teks dp-text/muted —
    terbaca di kedua tema (diverifikasi via replika DOM karena sheet tak bisa
    dibuka saat tantangan live).
  - **#10 ikon nav monokrom**: emoji tab diganti SVG stroke currentColor
    (NAV_ICON_PATHS + NavIcon); warna ikut state tab.
  - **#12 lilac sisa** → aksen (bar skor, level-chip/bar, chip "Bulan ini").
  - **#13 maroon ad-hoc** → severity tint resmi (streak chip expense-tint +
    ink resmi; idle = elev/muted).
  - **#14 serif Playfair sisa** → DM Sans untuk semua heading area app
    (auth intro brand tidak disentuh).
  - **#15 border sisa** dihapus (disclaimer Analisis, alloc-status/tag,
    advice-sev, score/streak/level chips).
  - **#16 avatar** satu treatment: kuning squircle radius 14 (56px di kartu
    profil), monospace bold, on-accent.
  - **#11 sistem ikon konsisten (TUNTAS 2026-08-24)**: library `ICON_PATHS` +
    komponen `Icon` di page.js (~30 ikon SVG stroke currentColor 1.9px).
    Emoji fungsional → SVG: menu profil & sub-halaman (card/key/sliders/grid/
    repeat/wallet/box/bell/alert/file), label pengaturan (exchange/type/globe/
    moon), edit dompet (pencil), stat income/expense (arrowDown/arrowUp),
    chip tantangan selesai (trophy), kartu insight (bulb), budget kosong
    (sparkle), toggle saldo (eye/eyeOff), status impor (xCircle/checkCircle/
    repeat/alert), tombol kembali sub-halaman (chevronLeft). Emoji KONTEN USER
    tetap: kategori default & pilihan emoji, WALLET_EMOJIS, ikon tantangan,
    fallback ✨/❓/📦, 🔥🏅 kartu share (paritas dengan render Canvas), ✦
    ornamen auth. Status impor ikut tint severity resmi. Verifikasi CDP:
    9/9 row-icon SVG, 4/4 setting icons, nav 5 SVG, 0 overflow.
  - Build + deploy emulator sukses; verifikasi CDP per item ✓.
- [x] **Revisi IA Beranda + Navigasi** *(tuntas penuh 2026-08-24)*:
  - Recap Cerita pindah PENUH ke tab Analisis sebagai headline (section
    pertama, sebelum advice/ScorePanel); Beranda bersih tanpa jejak recap.
  - Tantangan Minggu Ini pindah PENUH ke tab Target tepat setelah
    goal+badge (satu keluarga gamifikasi); ChallengeSheet terbuka dari Target.
  - Urutan Beranda final: header+switcher → heading+CTA → BalanceCard →
    StatCard×2 → insight (money check-in) → budget. ScoreCard & advice-teaser
    dihapus dari Beranda (duplikat konten Analisis); komponen ScoreCard +
    state adviceHigh ikut dibuang. CSS .score-card/.advice-teaser sengaja
    disimpan untuk kemungkinan dipakai lagi.
  - FAB "+" kembali ke kolom tengah geometris bar: grid
    `1.5fr 1.5fr 64px 1fr 1fr 1fr` + slot + FAB absolute center terangkat
    16px, skin pill aksen dp (geometri identik pra-DP9).
  - Deep-link audit: goal-sim-link & back-handler tetap valid; tidak ada lagi
    link menuju lokasi lama Recap/Tantangan dari Beranda.
  - Auth mobile dikompak: tagline clamp ~22px satu-dua baris, intro padding
    ringkas, panel min-height auto → form naik (form-top ±340px dari atas
    layar, sebelumnya lebih dalam).
  - Verifikasi CDP: urutan beranda ✓, analisis recap-first ✓, target
    challenge-setelah-badge ✓, sheet buka ✓, toggle week/month ✓, FAB center
    absolute ✓, overflow 0 ✓.
  - **Heading Opsi A (tuntas)**: "Halo, {nama} 👋" saja — DM Sans 20px bold
    1 baris (terukur 25px), em pertanyaan & subline dihapus dari markup;
    `home.greeting` i18n kehilangan titik akhir; kicker RINGKASAN KEUANGAN
    tetap; CTA "+" sejajar kanan. Verifikasi CDP live ✓.
- [x] **Hutang Piutang & Cicilan** *(tuntas — F8)*: track dua arah
      `receivable`/`payable` pada satu tabel `debts` (diskriminator `schedule`
      flex|installment) + kolom nullable `transactions.debt_id`. Saldo tetap
      murni kas; metrik baru **Kekayaan Bersih** = totalBalance global +
      Σpiutang aktif − Σhutang aktif, tampil berdampingan di BalanceCard dan
      jadi pintu masuk DebtsPage. Pembayaran (manual & auto catch-up) tercatat
      sebagai transaksi biasa: saldo normal, XP hanya untuk bayar manual
      (catch-up `xp_earned: 0`, konvensi N6b anti-farming). Cicilan reuse mesin
      jadwal recurring dengan clamp angsuran terakhir; auto-lunas pindah baris
      ke grup "Riwayat lunas". "Hapus sebagai rugi" (`written_off`) v1, hanya
      receivable, tanpa transaksi penolong. Guard pra-migrasi `hasDebts`
      menyembunyikan fitur bersih. Verifikasi CDP live end-to-end ✓ (matematika
      net worth persis di 4 titik, XP +10/pembayaran manual, tempo maju
      benar, clamp tepat, write-off tanpa transaksi, overflow scan 0 di 5
      permukaan). Bug perjalanan: insert debts wajib `user_id` eksplisit (RLS);
      `splitPrincipal` wajib diimpor di page.js (ReferenceError mematikan
      renderer tanpa error boundary).
- [x] **Sistem Avatar + Misi** *(tuntas — F9)*: avatar DiceBear **offline** via
      paket npm `@dicebear/core`+`@dicebear/collection` (SVG deterministik dari
      seed — tanpa network/API, aman offline). Pemilih: grid 12 varian
      deterministik per (username,batch) + "Acak lagi"; tanpa seed → fallback
      inisial huruf. Border = sistem misi terpisah dari badge: 4 tier
      Perunggu(lengkapi profil: avatar+ganti username)→Perak(streak 7)→
      Emas(Level 5)→Platinum(4 flag jelajah: simulasi/goal/hutang/tema),
      evaluasi murni tiap render ala badge; unlock persist di `user_missions`
      + `profiles.avatar_border` (auto-highest, tidak pernah turun tier);
      toast perayaan sekali per batch. Flag "pernah pakai" event-based di
      tabel `feature_usage` (tahan hapus-data), ditembakkan di 5 titik.
      Avatar ber-border tampil di header Beranda (tap → halaman); halaman
      "Avatar & Misi" submenu Profil. Platinum = ring conic-gradient berputar
      (hormati prefers-reduced-motion). Verifikasi CDP live ✓ (Perunggu &
      Platinum terbuka dengan toast, persist lintas restart, checklist live,
      overflow 0). Pilih border manual = backlog.
- [x] **Fix bug device fisik — overflow & nav hilang** *(tuntas)*: laporan dari
      HP fisik: konten lebih besar dari layar (perlu geser horizontal) +
      bottom nav ikut terpotong/bergeser. Akar berlapis: (1) `.alloc-row`
      (Analisis) punya kolom `auto` intrinsik ±290px (tag uppercase + angka
      nowrap + chip status) → meluap di viewport 360dp (emulator 411dp lolos
      karena slack 50px) dan membuat seluruh dokumen bisa di-pan; (2)
      `.bottom-nav` memakai centering `left:50%+translateX(-50%)` — pola
      fixed+transform yang rentan "hilang" saat halaman dalam keadaan
      pan/zoom di WebView Android. Fix level-dasar: media query ≤400px
      mengecilkan tag/status/gap alloc (intrinsik turun ke ±235px), nav
      diganti `inset-inline:0+margin-inline:auto` (tanpa transform), plus
      safety-net global `html,body{overflow-x:clip}`. Bonus: 4 rule CSS
      `font: … inherit` TIDAK VALID sejak F8 (shorthand dibuang parser →
      chip jatuh ke 16px) — diganti longhand. Tooling permanen:
      `scripts/check-overflow.mjs` = gerbang wajib scan 340/360/384/411dp ×
      5 tab + SEMUA sub-halaman menu Profil (60 kombinasi, exit 1 bila
      meluap); verifikasi akhir tiap fase kini butuh device fisik juga
      (CDP emulator terbukti buta terhadap kelas bug ini). CATATAN:
      min-width:0 pada grid children profil-stack TANPA overflow:hidden pada
      card SUDAH lebih dari cukup — overflow-x:clip global mencegah dokumen
      melebar; namun card tetap melebihi viewport secara visual. Fix lengkap:
      min-width:0 + overflow:hidden card + dp-page scoped overrides +
      sub-header tight + nama flex ellipsis.
- [x] **Overflow sub-halaman + overhaul notifikasi** *(tuntas)*: (a) gerbang
      kemarin ternyata buta terhadap sub-halaman — Kelola Kategori meluap
      hingga +42dp di 360dp (baris intrinsik ±344px: emoji+nama+chip alokasi+
      chip bawaan) dan Avatar & Misi terpotong (pilihan grid `--av-size`
      tetap 64px → kartu 357px vs kontainer 324px). Fix: media query ≤400px
      mengecilkan sel non-fleksibel + ellipsis nama + `min-width:0` di
      grid children profil-stack supaya track tak diekspansi ke min-content
      (fix DUA lapis yang diperlukan: tanpa min-width:0, flex per-row tak
      cukup — card tetap melebihi viewport). `.avatar-grid .avatar-frame`
      fluid (width:100%, aspect-ratio 1, max 72px). Nama kategori custom
      panjang apapun ter-truncasi dengan ellipsis (terverifikasi). VersionCode
      dinaikkan 1→3 (1.2) supaya sideload tak gagal diam-diam. (b) Sistem
      notifikasi dirapikan: komponen baru `CelebrateModal` (reuse shell
      LevelUpModal + confetti, tutup manual via tombol/back/ESC) untuk 4
      momen perayaan — border misi terbuka, avatar tersimpan, tantangan
      selesai, dan claim goal yang sebelumnya SENYAP tanpa notifikasi;
      toast informasional kini auto-dismiss universal 3,2 dtk (dulu hanya
      toast pertama yang punya timer — sisanya menggantung selamanya) dan
      distyle ulang dengan token dp-* di kedua tema; pesan status kartu
      Pengingat diberi pill ber-token dp-* (dulu teks polos + hardcode
      #FF8A80 di dark). Verifikasi CDP: toast & pill terukur benar di
      light+dark, auto-dismiss bekerja, modal buka/tutup + konfetti ✓,
      gerbang overflow 60/60 hijau.
- [x] **Restrukturisasi Beranda + Navigasi v2** *(tuntas)*:
      8 perubahan terkait navigasi & beranda dalam satu batch atomik:
      (1) Beranda diperas — kicker dihapus, greeting+add button merger jadi
      satu baris, statcard income/expense side-by-side, BalanceCard kompak
      (level+XP+streak dalam satu baris ringkas "Lv 3 · 165/250 XP · 🔥 3 hari");
      (2) Money check-in + Budget bulanan dipindah dari Beranda ke Analisis;
      (3) Preview 5 transaksi terakhir muncul di Beranda + tombol "Lihat Semua"
      yang membuka halaman Riwayat baru (gabungan transaksi+rutin, 2 segmen tab);
      (4) Nav bar jadi 4 tab (Beranda/Analisis/Target/Profil) — tab Transaksi
      dihapus dari NAV_TABS; (5) FAB "+" jadi action sheet (3 pilihan: Catat
      Transaksi, Atur Budget, Tambah Rutin); (6) Rutin dihapus dari
      PROFILE_MENU_ROWS (sudah diakses via Riwayat); (7) Tombol "Tes notifikasi"
      di Pengingat pakai pill styling (accent bg, border-radius 999px); (8) Avatar
      + border (F9) dipropagasi ke header Profil (size 52) dan Kartu Profil &
      Share (size 46), mengganti avatar inisial lama.
      RiwayatPage baru: state `historyOpen`, full-screen overlay (z-50) dengan
      back handler; ActionSheet: state `actionSheet`, overlay (z-45).
      Back handler priority chain diperbarui (17 level): modals → actionSheet →
      showForm → budgetSheet → ... → debtsOpen → historyOpen → profileView →
      tab → exitApp. Dependencies array bertambah `historyOpen` + `actionSheet`.
      Gate 60/60 hijau. versionCode 4 (1.3).
- [ ] **Leaderboard**: opt-in, pakai nickname bukan nama asli.
- [ ] **Mode Tanpa-Login / Guest Mode** *(paling akhir — proyek arsitektur
      besar)*: data guest tersimpan lokal + migrasi ke cloud saat login;
      scope detail didiskusikan saat gilirannya tiba.
