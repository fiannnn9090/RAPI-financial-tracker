# RAPI — Task breakdown

Kerjakan satu task per sesi Copilot Chat. Paste task-nya ke Copilot Chat (bukan inline
completion) supaya dia baca konteks penuh + `.github/copilot-instructions.md`.

## Fase 1 — Setup Supabase
- [x] Buat project baru di supabase.com, catat Project URL & anon key
- [x] Jalankan `sql/schema.sql` di SQL Editor Supabase
- [x] `npm install @supabase/supabase-js`
- [x] Buat `.env.local` berisi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Prompt Copilot: "Buatkan lib/supabase.js yang inisialisasi Supabase client dari
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
- [ ] Test manual: register, login, tambah transaksi, refresh browser, data masih ada

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
- [ ] Prompt Copilot: "Buat file app/clay.css dengan design token claymorphism: variabel
      CSS untuk warna (base pastel cerah + accent), border-radius besar, soft double
      shadow, dan style tombol yang terasa 'ditekan' saat :active. Ikuti panduan di
      bagian Desain pada .github/copilot-instructions.md"
- [ ] Ganti import CSS lama (genz.css/playful.css/pastel.css) di layout.js dengan clay.css
- [ ] Terapkan class-class baru ke komponen di app/page.js satu section per satu
      (jangan sekaligus semua — cek visual tiap section dulu)
- [ ] Hapus genz.css/playful.css/pastel.css setelah migrasi selesai & dicek semua halaman

## Fase 5 — Fitur lanjutan
- [ ] Daily streak: increment streak_current kalau last_activity_date = kemarin,
      reset kalau lebih dari 1 hari, update streak_longest
- [ ] Isi tabel badge_defs dengan daftar badge + rarity, tampilkan progress bar untuk
      badge yang belum unlock (bukan cuma locked/unlocked binary)
- [ ] Kartu profil shareable: generate gambar/canvas berisi level, streak, jumlah badge,
      saldo yang di-blur — tombol "Download" atau "Share"

---
Setelah tiap fase selesai, jalankan `npm run build` buat mastiin gak ada error sebelum
lanjut ke fase berikutnya.
