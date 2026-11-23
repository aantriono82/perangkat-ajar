# Perangkat Pembelajaran Matematika SMP (Fase D)

Aplikasi statis untuk menyusun perangkat pembelajaran guru: buka `index.html` di Chrome/Edge/Firefox.
**Tidak perlu internet.** Semua pustaka, CSS, dan font sudah ada di folder ini. Struktur dan cara kerjanya
mengikuti aplikasi [adm-ujian](https://github.com/aantriono82/adm-ujian): menu di kiri, pengaturan di tengah,
pratinjau kertas di kanan, lalu Cetak/PDF, Word, atau Excel.

> Saat menyalin ke komputer/flashdisk lain, salin **seluruh folder** (bukan hanya `index.html`).

## Dokumen yang dihasilkan

| No | Dokumen | Sumber isi |
|---|---|---|
| 1 | Sampul | Identitas sekolah, guru, kelas yang diampu |
| 2 | Kata Pengantar | Teks dengan tanda otomatis `{rombel}`, `{tapel}`, `{kepsek}`, … |
| 3 | Landasan Penyusunan | Daftar dasar hukum |
| 4 | Capaian Pembelajaran | Rasional, tujuan, karakteristik, CP Fase D (Kep. BSKAP 046/H/KR/2025) |
| 5 | Tujuan Pembelajaran | Tabel TP per elemen (lanskap); bisa diisi massal lewat **template Excel** (Unduh Template → isi → Impor Excel) |
| 6 | Alur Tujuan Pembelajaran | ATP kelas VII, VIII, IX |
| 7 | Kalender Pendidikan | Agenda libur/kegiatan, digambar per bulan; agenda bisa diisi massal lewat **template Excel** |
| 8 | Perhitungan Minggu Efektif | **Otomatis** dari kalender |
| 9 | Program Tahunan | **Otomatis** dari ATP + minggu tidak efektif |
| 10 | Program Semester | **JP disebar otomatis** ke minggu efektif, bisa dikoreksi per sel |
| 11 | Modul Ajar | Format Pembelajaran Mendalam (identifikasi, desain, pengalaman belajar, asesmen) |
| 12 | KKTP | Tiga pendekatan Panduan Pembelajaran & Asesmen 2025 — deskripsi kriteria, rubrik, interval nilai — dipilih umum atau per TP |
| 13 | Jurnal Mengajar | Catatan per pertemuan; bisa diisi dari Program Semester |
| 14 | Daftar Nilai | Per rombel: nilai TP, ASTS, ASAS/ASAT, nilai akhir & ketuntasan; nilai TP di bawah batas KKTP ditandai * |
| 15 | Bundel Lengkap | Dokumen 1–12 untuk semua kelas yang diampu, berurutan |

Dokumen 8–14 mengikuti **kelas aktif** (tombol VII/VIII/IX di menu kiri); Jurnal dan Daftar Nilai juga mengikuti
**semester aktif**.

## Cara kerja perhitungan otomatis

- **Minggu** dihitung mulai hari Senin dan masuk ke bulan tempat Senin itu berada. Hari sekolah 5 atau 6 hari.
- **Hari tidak efektif** = tanggal yang tercakup agenda berjenis *Libur* atau *Kegiatan* untuk tingkat kelas tsb.
  Agenda *Keterangan* hanya ditulis di kalender. Agenda bisa dibatasi untuk kelas tertentu (mis. Ujian Sekolah hanya IX).
- **Minggu efektif** = minggu dengan hari efektif ≥ batas (bawaan 3 hari). Jam efektif = minggu efektif × JP/minggu.
- **Rencana** = jumlah JP sub-bab di ATP + asesmen sumatif harian + remidi/pengayaan + cadangan. Panel ATP
  menandai bila rencana ≠ jam efektif.
- **Program Semester**: materi diisi berurutan ke minggu efektif (JP/minggu), cadangan di minggu efektif terakhir,
  minggu tidak efektif diarsir dan diberi baris kegiatannya. Angka bisa dikoreksi; sel kuning = koreksi manual;
  tombol *Kembalikan ke otomatis* menghapus koreksi.

> **Kalender contoh 2026/2027.** Hari libur nasional mengikuti SKB 3 Menteri 2026 dan 2027; hari pertama sekolah,
> MPLS, rapor, dan libur semester mengikuti ringkasan kaldik Provinsi Lampung 2026/2027. Agenda bertanda
> **(perkiraan)** (ASTS, ASAS, ASAT, Ujian Sekolah, libur Ramadan/Idulfitri) belum dari dokumen resmi —
> cocokkan dengan Keputusan Kadisdikbud Provinsi Lampung No. 400.3.8/1323/V.01/DP.2/2026 dan kaldik sekolah.

## Menjalankan

**Cara A — langsung:** klik dua kali `index.html`.

**Cara B — server lokal (opsional, untuk PWA/perangkat lain):**

```bash
python3 -m http.server 8000     # atau: npx serve .
```

Data tersimpan otomatis di browser (terpisah per browser dan per cara membuka). Pindahkan data dengan
*Data & Backup → Backup (.json)* lalu *Muat Backup*.

**Paket Linux (.deb):** `npm run build:deb` → `dist/perangkat-ajar_<versi>_all.deb`.

**Versi online (Cloudflare):** `npm run build && npm test && npm run deploy:cf` (Worker `perangkat-ajar`;
sambungkan domain sekali lewat dasbor Cloudflare).

## Struktur

```
index.html              Tata letak (menu, panel pengaturan, pratinjau)
css/app.css             Gaya aplikasi, lembar dokumen, cetak
js/                     Dimuat berurutan:
  assets.js               logo contoh (SVG)
  config.js               data bawaan: CP, TP, ATP+sub-bab, kalender 2026/2027, modul, KKTP, rombel contoh
  state.js                appState, simpan otomatis, validasi backup, setPath/getPath
  image-tools.js          kompresi logo unggahan
  kalender.js             minggu efektif, rencana semester, sebaran Program Semester
  layout.js               pembagian halaman otomatis, judul, identitas, tanda tangan, sel tabel
  render-dasar.js         sampul, pengantar, landasan, CP, TP, ATP, kalender
  render-program.js       minggu efektif, prota, promes
  render-asesmen.js       modul ajar, KKTP, jurnal, daftar nilai
  render-main.js          daftar dokumen (DOCS), bundel, pengatur render
  ui.js                   navigasi, kelas/semester aktif, pengikat form (data-bind)
  editors.js              editor panel: TP, ATP, agenda, promes, modul, KKTP, jurnal, nilai
  data-io.js              backup/muat JSON
  export.js, export-word.js  cetak PDF, Excel, Word (.docx)
  utils.js, pwa.js        zoom, toast, menu, tema, service worker
vendor/                 SheetJS, Lucide, docx, font Inter & Tinos
build/                  Tailwind, sw.js, ikon, uji otomatis, paket .deb, deploy Cloudflare
```

## Untuk pengembang

```bash
npm install
npm run build        # css/tailwind.css + sw.js (WAJIB setelah mengubah berkas apa pun)
npm test             # uji semua dokumen & fitur di Chrome headless (mode offline)
```

- Isian sederhana cukup diberi `data-bind="jalur.ke.data"` (atau `data-bind-lines` untuk daftar per baris);
  `ui.js` menulis nilainya ke `appState` dan merender ulang. Tambahkan `data-rerender="atpsum"` dsb. bila panel
  angka turunan perlu diperbarui.
- Dokumen baru: tulis fungsi yang mengembalikan larik segmen `{ orientation, blocks }` (lihat `layout.js`), daftarkan
  di `DOCS` (`render-main.js`) dan di `<select id="doc-mode-select">`. Tabel panjang memakai blok `{ table: {...} }`
  agar terpotong per baris dengan kepala tabel diulang.
- Pembagian halaman diukur pada zoom 100% di wadah tersembunyi; selalu periksa hasil dengan `npm test`
  (gagal bila ada lembar yang meluap).
