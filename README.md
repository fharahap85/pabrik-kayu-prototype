# Serat Jati Nusantara — Prototype Website Pabrik Kayu

Prototype awal website untuk pabrik kayu (gergajian, olahan, dan plywood). Semua fitur frontend sudah berfungsi, tetapi **data masih hardcode** di JavaScript, tanpa backend dan database. Tujuannya untuk review alur dan tampilan bersama client sebelum masuk tahap pengembangan backend.

> Nama perusahaan, alamat, nomor telepon, produk, dan harga di prototype ini adalah **contoh**. Ganti di `assets/js/data.js`.

## Halaman & fitur

| Halaman | File | Fitur |
|---|---|---|
| Beranda | `index.html` | Hero penampang log interaktif (ganti jenis kayu), kategori, alur produksi, produk unggulan, legalitas, testimoni |
| Katalog | `produk.html` | Pencarian, filter kategori / jenis kayu / grade / stok, urutkan harga & popularitas, chip filter aktif, filter tersimpan di URL (bisa dibagikan) |
| Detail produk | `detail.html?id=...` | Galeri tekstur serat & penampang, pilih ukuran, hitung harga dan volume otomatis, tambah ke daftar penawaran, produk serupa |
| Kalkulator kubikasi | `kalkulator.html` | Hitung volume m³, batang per m³, perkiraan berat, estimasi harga; daftar banyak ukuran; kirim semua ke penawaran |
| Daftar penawaran | `penawaran.html` | Ubah jumlah / hapus item, ringkasan + PPN 11%, formulir dengan validasi, nomor penawaran otomatis, cetak / simpan PDF, konfirmasi via WhatsApp, riwayat permintaan |
| Kontak | `kontak.html` | Status buka/tutup real-time (WIB), peta, formulir dengan validasi, FAQ |

Data daftar penawaran dan riwayat disimpan di `localStorage` browser, jadi tetap ada setelah halaman di-refresh.

## Cara menjalankan

Tidak perlu install apa pun.

- **Paling cepat:** buka `index.html` langsung di browser.
- **Dengan server lokal** (disarankan):
  ```bash
  # Python
  python3 -m http.server 8000
  # atau Node
  npx serve .
  ```
  Lalu buka http://localhost:8000

## Publikasi ke GitHub Pages

1. Push folder ini ke repository GitHub.
2. Buka **Settings → Pages**.
3. Pada *Source*, pilih branch `main` dan folder `/ (root)`, lalu **Save**.
4. Website tersedia di `https://<username>.github.io/<nama-repo>/` dalam 1–2 menit. Link ini yang dibagikan ke client.

## Struktur folder

```
├── index.html
├── produk.html
├── detail.html
├── kalkulator.html
├── penawaran.html
├── kontak.html
└── assets/
    ├── css/style.css        # seluruh styling + design token di :root
    └── js/
        ├── data.js          # SEMUA data hardcode (perusahaan, kayu, produk, FAQ, dll.)
        ├── app.js           # header/footer, penyimpanan penawaran, format Rupiah, generator tekstur kayu
        ├── home.js
        ├── produk.js
        ├── detail.js
        ├── kalkulator.js
        ├── penawaran.js
        └── kontak.js
```

## Mengubah data

Semua konten ada di `assets/js/data.js`:

- `COMPANY` — nama, alamat, telepon, nomor WhatsApp (format `62...`), email, jam operasional, koordinat peta.
- `SPECIES` — jenis kayu, warna tekstur, berat jenis, dan **harga dasar per m³ (grade A)**.
- `GRADES` — faktor pengali harga per grade.
- `PRODUCTS` — daftar produk. Produk `unit: "m3"` memakai varian ukuran `{ t, l, p }` (tebal cm, lebar cm, panjang m) dan harganya dihitung otomatis dari harga per m³. Produk lain (`lembar`, `batang`, `set`) memakai `{ label, price }`.
- `CATEGORIES`, `TESTIMONIALS`, `PROCESS`, `FAQ`.

Gambar produk saat ini berupa **tekstur serat kayu yang dibuat otomatis (SVG)** sesuai warna jenis kayu, jadi prototype tidak bergantung pada foto. Saat foto asli tersedia, ganti fungsi `productCard()` di `app.js` dan galeri di `detail.js`.

## Catatan untuk tahap backend

Titik integrasi yang perlu diganti saat backend siap:

| Saat ini | Nanti |
|---|---|
| `PRODUCTS`, `SPECIES`, dll. di `data.js` | `GET /api/products`, `GET /api/species` |
| `Store` (localStorage) di `app.js` | Tetap di browser untuk keranjang, atau sinkron ke `/api/cart` |
| `setTimeout` di `penawaran.js` (simulasi kirim) | `POST /api/quotes` → nomor penawaran dari server, notifikasi email ke sales |
| `setTimeout` di `kontak.js` | `POST /api/messages` |
| Riwayat permintaan dari localStorage | `GET /api/quotes?customer=...` (perlu login) |

Fitur yang belum ada dan disarankan untuk fase berikutnya: panel admin (kelola produk, stok, harga, status penawaran), login pelanggan, upload foto produk, notifikasi email/WhatsApp otomatis, dan multi-bahasa (Indonesia/Inggris) untuk pembeli ekspor.

## Teknologi

HTML, CSS, dan JavaScript murni — tanpa framework dan tanpa build step. Font dari Google Fonts (Big Shoulders Display & Archivo). Peta dari OpenStreetMap.
