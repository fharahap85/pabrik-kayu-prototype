/* =========================================================
   DATA HARDCODE — Serat Jati Nusantara
   Semua data di file ini adalah dummy untuk prototype.
   Nanti cukup ganti dengan respons API dari backend.
   ========================================================= */

const COMPANY = {
  name: "Serat Jati Nusantara",
  legal: "PT Serat Jati Nusantara",
  tagline: "Pabrik kayu gergajian dan olahan, Jepara",
  address: "Jl. Raya Jepara–Kudus Km 7, Tahunan, Jepara, Jawa Tengah 59427",
  phone: "0812-0000-0000",
  whatsapp: "6281200000000", // format internasional tanpa +
  email: "penjualan@seratjati.co.id",
  hours: { open: "07:30", close: "16:30", days: [1, 2, 3, 4, 5, 6] }, // Senin–Sabtu
  mapLat: -6.6105,
  mapLng: 110.6915,
};

/* Jenis kayu. price = harga dasar per m³ untuk grade A (Rupiah). */
const SPECIES = {
  jati:      { name: "Jati",          latin: "Tectona grandis",        base: "#B47B47", grain: "#7A4C26", durability: "Kelas awet I",  strength: "Kelas kuat II",  density: 0.67, price: 18500000 },
  merbau:    { name: "Merbau",        latin: "Intsia bijuga",          base: "#82492A", grain: "#4E2915", durability: "Kelas awet I",  strength: "Kelas kuat I",   density: 0.80, price: 12800000 },
  ulin:      { name: "Ulin",          latin: "Eusideroxylon zwageri",  base: "#5D4331", grain: "#33241A", durability: "Kelas awet I",  strength: "Kelas kuat I",   density: 1.04, price: 14500000 },
  bengkirai: { name: "Bengkirai",     latin: "Shorea laevis",          base: "#B58B50", grain: "#7C5C2E", durability: "Kelas awet I",  strength: "Kelas kuat I",   density: 0.91, price: 9800000 },
  kamper:    { name: "Kamper",        latin: "Dryobalanops spp.",      base: "#C39664", grain: "#8C6237", durability: "Kelas awet II", strength: "Kelas kuat II",  density: 0.75, price: 8600000 },
  mahoni:    { name: "Mahoni",        latin: "Swietenia macrophylla",  base: "#9E5032", grain: "#69301A", durability: "Kelas awet III",strength: "Kelas kuat II",  density: 0.64, price: 7200000 },
  meranti:   { name: "Meranti Merah", latin: "Shorea spp.",            base: "#A95C46", grain: "#72372A", durability: "Kelas awet III",strength: "Kelas kuat III", density: 0.55, price: 6500000 },
  pinus:     { name: "Pinus",         latin: "Pinus merkusii",         base: "#DDB97E", grain: "#AE8447", durability: "Kelas awet IV", strength: "Kelas kuat III", density: 0.52, price: 4200000 },
  sengon:    { name: "Sengon",        latin: "Falcataria moluccana",   base: "#E2D1AC", grain: "#BBA175", durability: "Kelas awet V",  strength: "Kelas kuat IV",  density: 0.33, price: 2300000 },
};

/* Faktor harga per grade (dikalikan ke harga grade A). */
const GRADES = {
  A: { label: "Grade A", factor: 1,    note: "Bebas mata kayu besar, serat lurus, tanpa gubal" },
  B: { label: "Grade B", factor: 0.85, note: "Mata kayu kecil sehat diperbolehkan, gubal maks. 10%" },
  C: { label: "Grade C", factor: 0.7,  note: "Untuk konstruksi tersembunyi dan bekisting" },
};

const CATEGORIES = [
  { id: "balok",    name: "Balok",          species: "kamper",    desc: "Rangka atap, struktur, dan kolom." },
  { id: "papan",    name: "Papan",          species: "jati",      desc: "Lantai, dinding, dan bahan mebel." },
  { id: "kaso-reng",name: "Kaso & reng",    species: "meranti",   desc: "Rangka atap genteng dan plafon." },
  { id: "decking",  name: "Decking",        species: "bengkirai", desc: "Lantai luar ruang, tepi kolam, dermaga." },
  { id: "plywood",  name: "Plywood",        species: "sengon",    desc: "Lembaran untuk mebel, bekisting, partisi." },
  { id: "moulding", name: "Moulding & list",species: "mahoni",    desc: "List plafon, plint, dan profil kusen." },
];

/*
  unit "m3"    → harga dihitung dari volume tiap varian (tebal cm × lebar cm × panjang m)
  unit lainnya → varian memiliki harga per satuan
*/
const PRODUCTS = [
  {
    id: "balok-kamper-a", name: "Balok Kamper Samarinda", category: "balok", species: "kamper", grade: "A",
    unit: "m3", moisture: "KD 12–15%", stock: "ready", stockQty: 42, minOrder: "0,5 m³", featured: true, popularity: 96,
    variants: [ { t: 5, l: 7, p: 4 }, { t: 6, l: 12, p: 4 }, { t: 8, l: 12, p: 4 }, { t: 10, l: 10, p: 4 } ],
    desc: "Kamper Samarinda dipotong presisi dan dikeringkan oven. Serat lurus, stabil, dan tahan rayap setelah diawetkan. Pilihan utama untuk rangka atap rumah tinggal.",
    uses: ["Rangka atap", "Kuda-kuda", "Kusen pintu dan jendela", "Struktur mezanin"],
  },
  {
    id: "balok-meranti-b", name: "Balok Meranti Merah", category: "balok", species: "meranti", grade: "B",
    unit: "m3", moisture: "AD 18–20%", stock: "ready", stockQty: 65, minOrder: "1 m³", featured: false, popularity: 81,
    variants: [ { t: 5, l: 7, p: 4 }, { t: 6, l: 12, p: 4 }, { t: 8, l: 15, p: 4 } ],
    desc: "Balok meranti ekonomis untuk struktur sementara dan rangka yang tertutup finishing. Dikeringkan alami di gudang beratap.",
    uses: ["Rangka plafon", "Bekisting", "Struktur sementara"],
  },
  {
    id: "balok-ulin-a", name: "Balok Ulin Kalimantan", category: "balok", species: "ulin", grade: "A",
    unit: "m3", moisture: "AD 15–18%", stock: "pre-order", stockQty: 0, minOrder: "0,5 m³", featured: true, popularity: 88,
    variants: [ { t: 8, l: 8, p: 4 }, { t: 10, l: 10, p: 4 }, { t: 12, l: 12, p: 4 } ],
    desc: "Kayu besi Kalimantan dengan berat jenis di atas 1. Tahan air laut dan rendaman, cocok untuk pondasi tiang dan dermaga. Produksi 3–4 minggu.",
    uses: ["Tiang dermaga", "Pondasi rumah panggung", "Jembatan kayu"],
  },
  {
    id: "papan-jati-a", name: "Papan Jati Perhutani", category: "papan", species: "jati", grade: "A",
    unit: "m3", moisture: "KD 10–12%", stock: "ready", stockQty: 18, minOrder: "0,25 m³", featured: true, popularity: 99,
    variants: [ { t: 2, l: 15, p: 2 }, { t: 2, l: 20, p: 2 }, { t: 3, l: 20, p: 2.5 }, { t: 4, l: 25, p: 3 } ],
    desc: "Jati TPK Perhutani bersertifikat legal. Dikeringkan oven hingga kadar air 10–12% sehingga siap diproses menjadi mebel tanpa risiko melengkung.",
    uses: ["Mebel premium", "Daun pintu panel", "Top meja", "Tangga"],
  },
  {
    id: "papan-mahoni-b", name: "Papan Mahoni", category: "papan", species: "mahoni", grade: "B",
    unit: "m3", moisture: "KD 10–12%", stock: "ready", stockQty: 26, minOrder: "0,5 m³", featured: false, popularity: 74,
    variants: [ { t: 2, l: 20, p: 2 }, { t: 3, l: 20, p: 2 }, { t: 4, l: 25, p: 2.5 } ],
    desc: "Mahoni dengan warna kemerahan merata dan mudah dibentuk. Favorit pengrajin mebel ukir dan kerajinan.",
    uses: ["Mebel ukir", "Kerajinan", "Rak dan lemari"],
  },
  {
    id: "papan-pinus-a", name: "Papan Pinus Grade A", category: "papan", species: "pinus", grade: "A",
    unit: "m3", moisture: "KD 10–12%", stock: "ready", stockQty: 33, minOrder: "0,5 m³", featured: false, popularity: 70,
    variants: [ { t: 1.5, l: 10, p: 2 }, { t: 2, l: 15, p: 2 }, { t: 2, l: 20, p: 3 } ],
    desc: "Pinus terang dengan corak serat yang khas. Ringan dan mudah difinishing untuk gaya Skandinavia.",
    uses: ["Panel dinding", "Mebel minimalis", "Rak display"],
  },
  {
    id: "kaso-meranti", name: "Kaso Meranti 4/6", category: "kaso-reng", species: "meranti", grade: "B",
    unit: "m3", moisture: "AD 18–20%", stock: "ready", stockQty: 80, minOrder: "1 m³", featured: false, popularity: 85,
    variants: [ { t: 4, l: 6, p: 3 }, { t: 4, l: 6, p: 4 }, { t: 5, l: 7, p: 4 } ],
    desc: "Kaso standar untuk rangka atap genteng. Dipotong seragam supaya pemasangan reng rata.",
    uses: ["Rangka atap genteng", "Rangka plafon"],
  },
  {
    id: "reng-kamper", name: "Reng Kamper 2/3", category: "kaso-reng", species: "kamper", grade: "B",
    unit: "m3", moisture: "AD 18–20%", stock: "ready", stockQty: 40, minOrder: "0,5 m³", featured: false, popularity: 77,
    variants: [ { t: 2, l: 3, p: 3 }, { t: 2, l: 3, p: 4 }, { t: 3, l: 4, p: 4 } ],
    desc: "Reng kamper lurus untuk dudukan genteng. Lebih kuat dari reng meranti dan tidak mudah patah saat dipaku.",
    uses: ["Dudukan genteng", "Rangka plafon gantung"],
  },
  {
    id: "decking-bengkirai", name: "Decking Bengkirai Alur", category: "decking", species: "bengkirai", grade: "A",
    unit: "m3", moisture: "KD 15–18%", stock: "ready", stockQty: 21, minOrder: "0,5 m³", featured: true, popularity: 90,
    variants: [ { t: 2, l: 9, p: 2 }, { t: 2, l: 12, p: 3 }, { t: 2.5, l: 14, p: 3 } ],
    desc: "Decking dengan alur anti-slip di satu sisi dan tepi dibulatkan. Tahan cuaca tropis tanpa perawatan berat.",
    uses: ["Lantai teras", "Tepi kolam renang", "Rooftop"],
  },
  {
    id: "decking-merbau", name: "Decking Merbau Halus", category: "decking", species: "merbau", grade: "A",
    unit: "m3", moisture: "KD 12–15%", stock: "pre-order", stockQty: 0, minOrder: "0,5 m³", featured: false, popularity: 83,
    variants: [ { t: 2, l: 9, p: 2 }, { t: 2, l: 12, p: 3 } ],
    desc: "Merbau dengan permukaan diserut halus dan warna cokelat tua yang makin gelap seiring waktu. Produksi 2 minggu.",
    uses: ["Lantai teras premium", "Gazebo", "Dek kapal wisata"],
  },
  {
    id: "plywood-sengon-9", name: "Plywood Sengon Film Faced", category: "plywood", species: "sengon", grade: "B",
    unit: "lembar", moisture: "—", stock: "ready", stockQty: 1200, minOrder: "20 lembar", featured: false, popularity: 79,
    variants: [ { label: "9 mm · 122 × 244 cm", price: 128000 }, { label: "12 mm · 122 × 244 cm", price: 162000 }, { label: "18 mm · 122 × 244 cm", price: 238000 } ],
    desc: "Plywood inti sengon dengan lapisan film phenolic. Dapat dipakai ulang 5–8 kali untuk bekisting beton.",
    uses: ["Bekisting beton", "Lantai kerja", "Partisi proyek"],
  },
  {
    id: "plywood-meranti", name: "Plywood Meranti Mebel", category: "plywood", species: "meranti", grade: "A",
    unit: "lembar", moisture: "—", stock: "ready", stockQty: 650, minOrder: "10 lembar", featured: false, popularity: 72,
    variants: [ { label: "3 mm · 122 × 244 cm", price: 72000 }, { label: "9 mm · 122 × 244 cm", price: 165000 }, { label: "15 mm · 122 × 244 cm", price: 255000 } ],
    desc: "Face meranti mulus siap dilapis HPL atau dicat. Lem tahan lembap tipe MR.",
    uses: ["Kabinet dapur", "Lemari", "Backdrop"],
  },
  {
    id: "list-plafon-mahoni", name: "List Plafon Mahoni", category: "moulding", species: "mahoni", grade: "A",
    unit: "batang", moisture: "KD 10–12%", stock: "ready", stockQty: 900, minOrder: "20 batang", featured: false, popularity: 68,
    variants: [ { label: "Profil klasik 5 cm · 3 m", price: 42000 }, { label: "Profil klasik 8 cm · 3 m", price: 61000 }, { label: "Profil minimalis 4 cm · 3 m", price: 34000 } ],
    desc: "List plafon diprofil mesin moulder, diamplas halus, siap dicat atau dipelitur.",
    uses: ["List plafon", "List dinding", "Bingkai"],
  },
  {
    id: "plint-jati", name: "Plint Lantai Jati", category: "moulding", species: "jati", grade: "B",
    unit: "batang", moisture: "KD 10–12%", stock: "ready", stockQty: 540, minOrder: "20 batang", featured: false, popularity: 64,
    variants: [ { label: "Tinggi 8 cm · 2,5 m", price: 58000 }, { label: "Tinggi 10 cm · 2,5 m", price: 72000 } ],
    desc: "Plint jati untuk tepi lantai, menyatu dengan lantai kayu atau keramik bermotif kayu.",
    uses: ["Plint lantai", "Pelindung dinding"],
  },
  {
    id: "kusen-kamper", name: "Kusen Pintu Kamper Jadi", category: "moulding", species: "kamper", grade: "A",
    unit: "set", moisture: "KD 12–15%", stock: "pre-order", stockQty: 0, minOrder: "5 set", featured: false, popularity: 75,
    variants: [ { label: "Pintu tunggal 90 × 210 cm", price: 1350000 }, { label: "Pintu ganda 160 × 210 cm", price: 1950000 } ],
    desc: "Kusen jadi dengan sponing dan alur, tinggal dipasang. Bisa custom ukuran sesuai gambar kerja.",
    uses: ["Rumah tinggal", "Perumahan", "Renovasi"],
  },
  {
    id: "papan-sengon-c", name: "Papan Sengon Peti", category: "papan", species: "sengon", grade: "C",
    unit: "m3", moisture: "AD 20%", stock: "ready", stockQty: 120, minOrder: "2 m³", featured: false, popularity: 60,
    variants: [ { t: 1.5, l: 15, p: 2 }, { t: 2, l: 20, p: 2 } ],
    desc: "Sengon ringan untuk peti kemas, palet, dan kemasan ekspor. Bisa fumigasi ISPM-15 atas permintaan.",
    uses: ["Peti kemas", "Palet", "Kemasan ekspor"],
  },
];

const TESTIMONIALS = [
  { quote: "Kami ambil kamper untuk 140 unit rumah. Ukuran balok seragam dan kiriman selalu tiba sesuai jadwal, jadi tukang di lapangan tidak menunggu.", name: "Hendra Wijaya", role: "Manajer Proyek, Griya Asri Developer, Semarang" },
  { quote: "Jati KD dari sini jarang melengkung setelah jadi mebel. Itu yang paling penting buat kami yang kirim ke pembeli luar negeri.", name: "Siti Rahmawati", role: "Pemilik, Rahma Furniture Export, Jepara" },
  { quote: "Bisa minta potongan ukuran khusus untuk decking resort tanpa ribet. Tim penjualannya kasih hitungan kubikasi yang jelas sebelum produksi.", name: "Made Suarjana", role: "Kontraktor, Bali Timber Works" },
];

const PROCESS = [
  { title: "Bahan baku legal", text: "Log dibeli dari TPK Perhutani dan pemasok ber-SVLK, setiap batang tercatat asal-usulnya." },
  { title: "Penggergajian", text: "Log dibelah dengan band saw sesuai daftar potong pesanan, sisa potongan diolah jadi produk kecil." },
  { title: "Pengeringan oven", text: "Kayu masuk kiln dry 7–21 hari tergantung jenis dan tebal, sampai kadar air target tercapai." },
  { title: "Grading & pengawetan", text: "Setiap batang diperiksa, diberi cap grade, lalu diawetkan anti-rayap bila diminta." },
  { title: "Pengiriman", text: "Dikirim dengan truk sendiri ke Jawa–Bali, atau kontainer untuk ekspor melalui Tanjung Emas." },
];

const FAQ = [
  { q: "Apakah bisa pesan ukuran di luar daftar?", a: "Bisa. Tulis ukuran yang Anda butuhkan di catatan permintaan penawaran atau gunakan kalkulator kubikasi. Ukuran khusus diproduksi 1–3 minggu." },
  { q: "Bagaimana cara menghitung harga kayu per kubik?", a: "Volume satu batang = tebal (cm) × lebar (cm) × panjang (m) ÷ 10.000. Kalikan dengan jumlah batang dan harga per m³. Kalkulator kubikasi di situs ini menghitungnya otomatis." },
  { q: "Apakah harga di situs sudah termasuk ongkos kirim?", a: "Belum. Harga adalah harga pabrik (loco Jepara). Ongkos kirim dihitung setelah kami menerima alamat dan volume pesanan." },
  { q: "Berapa minimal pemesanan?", a: "Tergantung produk, umumnya 0,25–2 m³ untuk kayu gergajian dan 10–20 lembar untuk plywood. Minimal order tertulis di setiap halaman produk." },
  { q: "Apakah tersedia dokumen legalitas kayu?", a: "Ya. Setiap pengiriman disertai Nota Angkutan dan dokumen V-Legal/SVLK. Untuk ekspor kami siapkan dokumen lengkap." },
  { q: "Metode pembayaran apa saja?", a: "Transfer bank dengan DP 50% sebelum produksi dan pelunasan sebelum barang dikirim. Pelanggan proyek rutin dapat mengajukan tempo." },
];
