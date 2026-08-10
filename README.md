# RAPI — Rekap Arus Pengeluaran dan Income

![Next.js](https://img.shields.io/badge/Next.js-16.3.0-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.8-149eca?logo=react&logoColor=white)
![Storage](https://img.shields.io/badge/Storage-localStorage-4F8B66)

RAPI adalah aplikasi catatan keuangan personal yang membantu pengguna mencatat pemasukan, pengeluaran, target tabungan, dan anggaran kategori dalam satu dashboard yang ringkas. Dirancang untuk penggunaan pribadi dengan tampilan playful, tenang, dan mudah dipahami.

## Fitur

- Registrasi dan login lokal dengan username unik.
- Dashboard saldo, total pemasukan, dan total pengeluaran.
- Tambah serta hapus transaksi pemasukan maupun pengeluaran.
- Kategori transaksi dengan emoji.
- Filter riwayat transaksi berdasarkan jenis transaksi.
- Target tabungan atau wishlist dengan progress otomatis.
- Klaim badge saat wishlist berhasil dicapai.
- Badge pencapaian untuk kebiasaan mencatat transaksi.
- Budget bulanan per kategori dengan status aman, hampir habis, atau melewati batas.
- Insight kategori pengeluaran terbesar dan grafik perbandingan pengeluaran bulan berjalan.
- Hapus akun beserta seluruh data keuangan terkait.
- Antarmuka responsif dengan palet hijau pastel.

## Teknologi

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- CSS murni
- Browser localStorage
- [Vercel](https://vercel.com/) untuk deployment

## Menjalankan Proyek

Prasyarat: Node.js versi 20 atau lebih baru.

    npm install
    npm run dev

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Perintah

| Perintah | Kegunaan |
| --- | --- |
| npm run dev | Menjalankan aplikasi dalam mode pengembangan. |
| npm run build | Membuat build produksi dan memeriksa aplikasi. |
| npm run start | Menjalankan hasil build produksi. |

## Penyimpanan Data

RAPI tidak menggunakan backend atau database. Akun, transaksi, budget, wishlist, dan pencapaian disimpan pada localStorage browser perangkat yang digunakan.

Konsekuensinya:

- Data hanya tersedia pada browser dan perangkat yang sama.
- Data tidak dibagikan secara otomatis ke pengguna lain.
- Menghapus data browser dapat menghapus seluruh data aplikasi.
- Kata sandi lokal digunakan untuk kebutuhan demo atau portofolio, bukan autentikasi produksi.

Untuk versi produksi, aplikasi dapat dikembangkan dengan autentikasi dan database seperti Supabase, Neon, atau Firebase.

## Deploy ke Vercel

1. Push proyek ke repositori GitHub.
2. Buat proyek baru melalui [Vercel](https://vercel.com/new).
3. Pilih repositori RAPI.
4. Gunakan pengaturan bawaan Next.js lalu tekan **Deploy**.

## Lisensi

Proyek ini menggunakan lisensi [MIT](LICENSE).
