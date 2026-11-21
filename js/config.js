// ============================================================================
// KONFIGURASI & DATA BAWAAN — PERANGKAT PEMBELAJARAN MATEMATIKA SMP (FASE D)
// ----------------------------------------------------------------------------
// Semua isi di sini hanya nilai awal. Setelah diubah di aplikasi, data tersimpan
// di browser (state.js) dan bisa dipindah lewat Backup (.json).
// ============================================================================

const TINGKAT = ['VII', 'VIII', 'IX'];
const TINGKAT_ANGKA = { VII: 7, VIII: 8, IX: 9 };

const PAPER_SIZES = {
    A4: { name: 'A4', w: 21.0, h: 29.7 },
    F4: { name: 'F4 / Folio', w: 21.5, h: 33.0 }
};

// Warna kepala tabel dokumen
const DOC_THEMES = {
    navy:   { name: 'Biru dongker (seperti contoh)', head: '#1f3864', headText: '#ffffff', sub: '#d9e2f3', title: '#c00000', accent: '#ffff00', accentText: '#000000' },
    hijau:  { name: 'Hijau tua', head: '#1e5631', headText: '#ffffff', sub: '#dcefe0', title: '#1e5631', accent: '#ffe699', accentText: '#000000' },
    hitam:  { name: 'Hitam-putih (hemat tinta)', head: '#e7e6e6', headText: '#000000', sub: '#f2f2f2', title: '#000000', accent: '#f2f2f2', accentText: '#000000' }
};

const ELEMEN = [
    { kode: 'B', nama: 'Bilangan' },
    { kode: 'A', nama: 'Aljabar' },
    { kode: 'P', nama: 'Pengukuran' },
    { kode: 'G', nama: 'Geometri' },
    { kode: 'D', nama: 'Analisis Data dan Peluang' }
];
const elemenNama = kode => (ELEMEN.find(e => e.kode === kode) || {}).nama || kode;

// 8 Dimensi Profil Lulusan (Permendikdasmen No. 10 Tahun 2025)
const DIMENSI_PROFIL = [
    'Keimanan dan Ketakwaan terhadap Tuhan YME', 'Kewargaan', 'Penalaran Kritis', 'Kreativitas',
    'Kolaborasi', 'Kemandirian', 'Kesehatan', 'Komunikasi'
];

// Jenis agenda kalender: libur & kegiatan mengurangi hari efektif, info hanya keterangan
const JENIS_AGENDA = {
    libur:    { label: 'Libur', color: '#fecaca', ink: '#b91c1c' },
    kegiatan: { label: 'Kegiatan (tidak KBM)', color: '#fde68a', ink: '#92400e' },
    info:     { label: 'Keterangan (tetap KBM)', color: '#bfdbfe', ink: '#1e40af' }
};

const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

let _uid = 0;
function uid(prefix) { return (prefix || 'id') + Date.now().toString(36) + (++_uid).toString(36) + Math.random().toString(36).slice(2, 5); }

// ---------------------------------------------------------------------------
// Capaian Pembelajaran Matematika Fase D (Keputusan Kepala BSKAP No. 046/H/KR/2025)
// ---------------------------------------------------------------------------
const DEFAULT_CP = {
    dasar: 'Keputusan Kepala Badan Standar, Kurikulum, dan Asesmen Pendidikan Kementerian Pendidikan Dasar dan Menengah Nomor 046/H/KR/2025 tentang Capaian Pembelajaran pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah.',
    rasional: [
        'Matematika merupakan ilmu atau pengetahuan tentang belajar atau berpikir logis yang mendasari perkembangan teknologi modern dan sangat dibutuhkan dalam kehidupan manusia. Matematika berkontribusi terhadap pengembangan dan pemahaman dalam berbagai disiplin ilmu dan menjadi landasan bagi banyak inovasi saat ini maupun memberikan solusi masa depan. Matematika dipelajari bukan hanya untuk dipahami, tetapi juga berperan sebagai alat untuk membangun pemahaman, melatih cara berpikir, dan menyelesaikan masalah dalam kehidupan. Belajar matematika dapat meningkatkan kemampuan murid dalam berpikir logis, analitis, sistematis, kritis, dan kreatif. Kompetensi tersebut diperlukan agar murid memiliki kemampuan memperoleh, mengelola, dan memanfaatkan informasi untuk bertahan hidup pada keadaan yang selalu berubah, penuh dengan ketidakpastian, dan bersifat kompetitif.',
        'Mata pelajaran Matematika membekali murid dengan pengetahuan dan keterampilan yang diperlukan serta kapasitas untuk berpikir logis, kritis, dan analitis sehingga mereka belajar bernalar secara bertahap untuk memahami konsep, prinsip, dan solusi dalam matematika. Proses ini juga membentuk sikap positif terhadap matematika dan menumbuhkan nilai-nilai seperti kemandirian, ketekunan, ketelitian, rasionalitas, serta kreativitas.',
        'Dengan demikian, mata pelajaran matematika relevan dan berkontribusi dalam mewujudkan delapan dimensi profil lulusan, di antaranya untuk mengembangkan kompetensi penalaran kritis, kreativitas, kolaborasi, kemandirian, dan komunikasi murid. Materi pembelajaran pada mata pelajaran Matematika di setiap jenjang pendidikan dikemas melalui elemen, domain atau bidang kajian Bilangan, Aljabar, Pengukuran, Geometri, serta Analisis Data dan Peluang.'
    ],
    tujuan: [
        'Memahami materi pembelajaran matematika berupa fakta, konsep, prinsip, operasi, dan relasi matematis dan mengaplikasikannya secara luwes, akurat, efisien, dan tepat dalam pemecahan masalah matematis (pemahaman matematis dan kecakapan prosedural);',
        'Menggunakan penalaran pada pola dan sifat, melakukan manipulasi matematis dalam membuat generalisasi, menyusun bukti, atau menjelaskan gagasan dan pernyataan matematika (penalaran dan pembuktian matematis);',
        'Memecahkan masalah yang meliputi kemampuan memahami masalah, merancang model matematis, menyelesaikan model atau menafsirkan solusi yang diperoleh (pemecahan masalah matematis);',
        'Mengomunikasikan gagasan dengan simbol, tabel, diagram, atau media lain untuk memperjelas keadaan atau masalah, serta menyajikan suatu situasi ke dalam simbol atau model matematis (komunikasi dan representasi matematis);',
        'Mengaitkan materi pembelajaran matematika berupa fakta, konsep, prinsip, operasi, dan relasi matematis pada suatu bidang kajian, lintas bidang kajian, lintas bidang ilmu, dan dengan kehidupan (koneksi matematis); dan',
        'Memiliki sikap menghargai kegunaan matematika dalam kehidupan, yaitu memiliki rasa ingin tahu, perhatian, dan minat dalam mempelajari matematika, serta sikap kreatif, sabar, mandiri, tekun, terbuka, tangguh, ulet, dan percaya diri dalam pemecahan masalah (disposisi matematis).'
    ],
    karakteristikPengantar: 'Mata pelajaran Matematika diorganisasikan dalam lingkup lima elemen konten dan lima elemen proses.',
    kontenPengantar: 'Elemen konten dalam mata pelajaran Matematika terkait dengan pandangan bahwa matematika sebagai materi pembelajaran (subject matter) yang harus dipahami murid. Pemahaman matematis terkait erat dengan pembentukan alur pemahaman terhadap materi pembelajaran matematika berupa fakta, konsep, prinsip, operasi, dan relasi yang bersifat formal-universal. Elemen dan deskripsi elemen konten mata pelajaran Matematika adalah sebagai berikut.',
    elemenKonten: [
        { elemen: 'Bilangan', deskripsi: 'Bidang kajian Bilangan membahas tentang angka sebagai simbol bilangan, konsep bilangan, operasi hitung bilangan, dan relasi antara berbagai operasi hitung bilangan dalam sub-elemen representasi visual, sifat urutan, dan operasi.' },
        { elemen: 'Aljabar', deskripsi: 'Bidang kajian Aljabar membahas tentang aljabar non-formal dalam bentuk simbol gambar sampai dengan aljabar formal dalam bentuk simbol huruf yang mewakili bilangan tertentu dalam sub-elemen persamaan dan pertidaksamaan, relasi dan pola bilangan, serta rasio dan proporsi.' },
        { elemen: 'Pengukuran', deskripsi: 'Bidang kajian Pengukuran membahas tentang besaran-besaran pengukuran, cara mengukur besaran tertentu, dan membuktikan prinsip atau teorema terkait besaran tertentu dalam sub-elemen pengukuran besaran geometris dan non-geometris.' },
        { elemen: 'Geometri', deskripsi: 'Bidang kajian Geometri membahas tentang berbagai bentuk bangun datar dan bangun ruang serta ciri-cirinya dalam sub-elemen geometri datar dan geometri ruang.' },
        { elemen: 'Analisis Data dan Peluang', deskripsi: 'Bidang kajian Analisis Data dan Peluang membahas tentang pengertian data, jenis-jenis data, pengolahan data dalam berbagai bentuk representasi, dan analisis data kuantitatif terkait pemusatan dan penyebaran data serta peluang munculnya suatu data atau kejadian tertentu dalam sub-elemen data dan representasinya, serta ketidakpastian dan peluang.' }
    ],
    prosesPengantar: 'Elemen proses dalam mata pelajaran Matematika terkait dengan pandangan bahwa matematika sebagai alat konseptual untuk mengonstruksi dan merekonstruksi materi pembelajaran matematika berupa aktivitas mental yang membentuk alur berpikir dan alur pemahaman yang dapat mengembangkan kecakapan matematika berikut.',
    elemenProses: [
        { elemen: 'Penalaran dan Pembuktian Matematis', deskripsi: 'Penalaran terkait dengan proses penggunaan pola hubungan dalam menganalisis situasi untuk menyusun serta menyelidiki praduga. Pembuktian matematis terkait proses membuktikan kebenaran suatu prinsip, rumus, atau teorema tertentu.' },
        { elemen: 'Pemecahan Masalah Matematis', deskripsi: 'Pemecahan masalah matematis terkait dengan proses penyelesaian masalah matematis atau masalah sehari-hari dengan cara menerapkan dan mengadaptasi berbagai strategi yang efektif. Proses ini juga mencakup konstruksi dan rekonstruksi pemahaman matematika melalui pemecahan masalah.' },
        { elemen: 'Komunikasi Matematis', deskripsi: 'Komunikasi matematis terkait dengan pembentukan alur pemahaman materi pembelajaran matematika melalui cara mengomunikasikan pemikiran matematis menggunakan bahasa matematis yang tepat. Komunikasi matematis juga mencakup proses menganalisis dan mengevaluasi pemikiran matematis orang lain.' },
        { elemen: 'Representasi Matematis', deskripsi: 'Representasi matematis terkait dengan proses membuat dan menggunakan simbol, tabel, diagram, atau bentuk lain untuk mengomunikasikan gagasan dan pemodelan matematika. Proses ini juga mencakup fleksibilitas dalam mengubah dari satu bentuk representasi ke bentuk representasi lainnya, dan memilih representasi yang paling sesuai untuk memecahkan masalah.' },
        { elemen: 'Koneksi Matematis', deskripsi: 'Koneksi matematis terkait dengan proses mengaitkan antara materi pembelajaran matematika pada suatu bidang kajian, lintas bidang kajian, lintas bidang ilmu, dan dengan kehidupan.' }
    ],
    fasePengantar: 'Fase D (Umumnya untuk Kelas VII, VIII, dan IX SMP/MTs/Program Paket B). Pada akhir Fase D, murid memiliki kemampuan sebagai berikut.',
    // Capaian per elemen + konten/konsep utama (dipakai juga di dokumen TP & Modul Ajar)
    capaian: {
        B: { teks: 'Membaca, menulis, dan membandingkan bilangan bulat, bilangan rasional, bilangan desimal, bilangan berpangkat bulat dan akar, bilangan dalam notasi ilmiah; menerapkan operasi aritmatika pada bilangan real, dan memberikan estimasi/perkiraan dalam menyelesaikan masalah (termasuk berkaitan dengan literasi finansial).\nMurid dapat menggunakan rasio (skala, proporsi, dan laju perubahan) dalam penyelesaian masalah.',
             konsep: 'Bilangan Bulat, Bilangan Rasional, Bilangan Desimal, Bilangan Berpangkat Bulat dan Akar, Bilangan dalam Notasi Ilmiah (termasuk literasi finansial), Aritmetika Sosial, dan Rasio (skala, proporsi, dan laju perubahan).' },
        A: { teks: 'Mengenali, memprediksi dan menggeneralisasi pola dalam bentuk susunan benda dan bilangan; menyatakan suatu situasi ke dalam bentuk aljabar; menggunakan sifat-sifat operasi (komutatif, asosiatif, dan distributif) untuk menghasilkan bentuk aljabar yang ekuivalen.\nMurid dapat memahami relasi dan fungsi (domain, kodomain, range) serta menyajikannya dalam bentuk diagram panah, tabel, himpunan pasangan berurutan, dan grafik; membedakan beberapa fungsi non linear dari fungsi linear secara grafik; menyelesaikan persamaan dan pertidaksamaan linear satu variabel; menyajikan, menganalisis, dan menyelesaikan masalah dengan menggunakan relasi, fungsi dan persamaan linear; serta menyelesaikan sistem persamaan linear dua variabel melalui beberapa cara untuk penyelesaian masalah.',
             konsep: 'Pola Bilangan, Bentuk Aljabar, Relasi dan Fungsi (domain, kodomain, dan range), Fungsi Non Linear dari Fungsi Linear Secara Grafik, PLSV, PtLSV, PGL, dan SPLDV.' },
        P: { teks: 'Menentukan keliling, luas, panjang busur, sudut dan luas juring lingkaran, serta menyelesaikan masalah yang terkait; menjelaskan cara untuk menentukan luas permukaan dan volume bangun ruang (prisma, tabung, bola, limas dan kerucut) dan menyelesaikan masalah yang terkait; dan menjelaskan pengaruh perubahan secara proporsional dari bangun datar dan bangun ruang terhadap ukuran panjang, besar sudut, luas, dan/atau volume.',
             konsep: 'Lingkaran, Luas Permukaan dan Volume BRSD dan BRSL.' },
        G: { teks: 'Membuat jaring-jaring bangun ruang (prisma, tabung, limas dan kerucut) dan membuat bangun ruang dari jaring-jaringnya.\nMurid dapat menggunakan hubungan antar-sudut yang terbentuk oleh dua garis yang berpotongan, dan oleh dua garis sejajar yang dipotong sebuah garis transversal untuk menyelesaikan masalah (termasuk menentukan jumlah besar sudut dalam sebuah segitiga, menentukan besar sudut yang belum diketahui pada sebuah segitiga); menjelaskan sifat-sifat kekongruenan dan kesebangunan pada segitiga dan segiempat, dan menggunakannya untuk menyelesaikan masalah; menunjukkan kebenaran teorema Pythagoras dan menggunakannya dalam menyelesaikan masalah (termasuk pengenalan bilangan irasional dan jarak antara dua titik pada bidang koordinat Kartesius).\nMurid dapat melakukan transformasi tunggal (refleksi, translasi, rotasi, dan dilatasi) titik, garis, dan bangun datar pada bidang koordinat Kartesius dan menggunakannya untuk menyelesaikan masalah.',
             konsep: 'Jaring-jaring BRSD dan BRSL, Garis dan Sudut, Kekongruenan dan Kesebangunan, Teorema Pythagoras, Transformasi.' },
        D: { teks: 'Merumuskan pertanyaan, mengumpulkan, menyajikan, dan menganalisis data untuk menjawab pertanyaan dari situasi atau masalah; menggunakan diagram batang dan diagram lingkaran untuk menyajikan dan menginterpretasi data; mengambil sampel yang mewakili suatu populasi untuk mendapatkan data yang terkait dengan diri dan lingkungan mereka; menentukan dan menafsirkan rerata (mean), median, modus, dan jangkauan (range) dari data tersebut untuk menyelesaikan masalah (termasuk membandingkan suatu data terhadap kelompoknya, membandingkan dua kelompok data, memprediksi, membuat keputusan); menyelidiki kemungkinan adanya perubahan pengukuran pusat tersebut akibat perubahan data.\nMurid dapat menjelaskan dan menggunakan pengertian peluang dan frekuensi relatif untuk menentukan frekuensi harapan satu kejadian pada suatu percobaan sederhana (semua hasil percobaan dapat muncul secara merata).',
             konsep: 'Penyajian Data dan Diagram, Statistika, dan Peluang.' }
    }
};

// ---------------------------------------------------------------------------
// Tujuan Pembelajaran Fase D
// ---------------------------------------------------------------------------
const DEFAULT_TP = [
    ['B', 'B.1', 'Menjelaskan, menyatakan, membandingkan, mengurutkan, dan menentukan hasil operasi hitung (penjumlahan, pengurangan, perkalian, dan pembagian) bilangan bulat.', 'Bilangan Bulat', 10],
    ['B', 'B.2', 'Menyelesaikan permasalahan keseharian yang melibatkan konsep bilangan bulat termasuk berkaitan dengan penguatan literasi finansial.', 'Bilangan Bulat, Aritmetika Sosial', 10],
    ['B', 'B.3', 'Mengidentifikasi, menyatakan, membandingkan, menentukan operasi hitung (penjumlahan, pengurangan, perkalian, dan pembagian), menaksir, dan melakukan estimasi bilangan rasional serta menyelesaikan permasalahan kontekstual yang terkait termasuk berkaitan dengan penguatan literasi finansial.', 'Bilangan Rasional, Aritmetika Sosial', 15],
    ['B', 'B.4', 'Menjelaskan, membedakan, membandingkan, dan menentukan rasio (skala, proporsi, dan laju perubahan) serta menyelesaikan permasalahan kontekstual yang terkait.', 'Perbandingan', 20],
    ['B', 'B.5', 'Membaca, menulis, mengidentifikasi, menjelaskan, dan membandingkan bilangan berpangkat bulat serta menggunakannya dalam konteks kehidupan sehari-hari dan pemecahan masalah sederhana.', 'Bilangan Berpangkat', 10],
    ['B', 'B.6', 'Mengidentifikasi, mengubah, menentukan hasil operasi hitung (penjumlahan, pengurangan, perkalian, dan pembagian) dan merasionalkan bentuk akar serta menyelesaikan permasalahan kontekstual yang terkait.', 'Bentuk Akar', 10],
    ['B', 'B.7', 'Mengidentifikasi dan mengubah bentuk baku serta menyelesaikan permasalahan kontekstual yang terkait.', 'Bentuk Baku', 5],
    ['A', 'A.1', 'Mengidentifikasi dan menentukan unsur-unsur (suku, konstanta, koefisien, dan variabel), menggunakan sifat-sifat dan operasi hitung bentuk aljabar serta memodelkan suatu permasalahan menjadi suatu bentuk aljabar dan menggunakannya untuk menyelesaikan permasalahan yang terkait.', 'Bentuk Aljabar', 20],
    ['A', 'A.2', 'Menentukan, memodelkan dan menemukan persamaan linear satu variabel serta menyelesaikan permasalahan kontekstual yang terkait.', 'Persamaan Linear Satu Variabel', 10],
    ['A', 'A.3', 'Menentukan, memodelkan dan menemukan pertidaksamaan linear satu variabel serta menyelesaikan permasalahan kontekstual yang terkait.', 'Pertidaksamaan Linear Satu Variabel', 10],
    ['A', 'A.4', 'Mengidentifikasi, menentukan, dan memprediksi pola susunan benda dan bilangan serta menyelesaikan permasalahan yang terkait.', 'Pola Bilangan', 15],
    ['A', 'A.5', 'Menjelaskan, menentukan dan menyajikan relasi dan fungsi serta menyelesaikan permasalahan kontekstual yang terkait.', 'Relasi dan Fungsi', 10],
    ['A', 'A.6', 'Mengidentifikasi dan menyelesaikan masalah yang berkaitan dengan fungsi linear dan grafiknya (fungsi yang grafiknya berupa garis lurus, berbentuk umum y = ax + b, dengan a dan b sebagai konstanta, grafik berupa garis lurus, gradien/kemiringan) serta membedakan dengan fungsi non linear.', 'Persamaan Garis Lurus', 15],
    ['A', 'A.7', 'Mengidentifikasi, memodelkan dan menentukan penyelesaian sistem persamaan linear dua variabel dengan metode (grafik, substitusi, eliminasi, dan campuran) serta menyelesaikan permasalahan kontekstual yang terkait.', 'Sistem Persamaan Linear Dua Variabel', 20],
    ['P', 'P.1', 'Menentukan luas permukaan dan volume bangun ruang sisi datar dan menyelesaikan masalah yang terkait.', 'Bangun Ruang Sisi Datar', 10],
    ['P', 'P.2', 'Menjelaskan, menentukan keliling, luas, busur, sudut, dan luas juring lingkaran.', 'Lingkaran', 10],
    ['P', 'P.3', 'Menentukan luas permukaan dan volume bangun ruang sisi lengkung dan menyelesaikan masalah yang terkait.', 'Bangun Ruang Sisi Lengkung', 20],
    ['G', 'G.1', 'Mengidentifikasi dan menentukan sifat sudut yang terbentuk dari dua garis berpotongan, dua garis sejajar yang dipotong garis lain (garis transversal), serta mengestimasi besar sudut (pelurus, penyiku, sehadap, dan berseberangan).', 'Garis dan Sudut', 5],
    ['G', 'G.2', 'Mengidentifikasi dan menentukan sifat dan syarat dua benda sebangun (termasuk kesebangunan segitiga) dan menyelesaikan permasalahan kontekstual yang terkait.', 'Kesebangunan', 5],
    ['G', 'G.3', 'Menjelaskan dan menentukan syarat-syarat dua bangun saling kongruen, dan menerapkan kekongruenan dalam permasalahan yang terkait.', 'Kekongruenan', 5],
    ['G', 'G.4', 'Menganalisis dan menentukan teorema Pythagoras, tripel Pythagoras, panjang sisi segitiga, dan perbandingan sisi segitiga siku-siku istimewa, serta menyelesaikan permasalahan yang terkait (termasuk menghitung jarak antara dua titik pada bidang koordinat Kartesius).', 'Teorema Pythagoras', 25],
    ['G', 'G.5', 'Membuat dan menentukan jaring-jaring bangun ruang (prisma, tabung, limas dan kerucut) dan membuat bangun ruang tersebut dari jaring-jaringnya.', 'Bangun Ruang Sisi Datar', 10],
    ['G', 'G.6', 'Menjelaskan dan menerapkan karakteristik transformasi geometri (translasi, refleksi, rotasi, dan dilatasi) dengan menggunakan koordinat Kartesius serta menyelesaikan permasalahan kontekstual yang terkait.', 'Transformasi', 20],
    ['D', 'D.1', 'Melakukan investigasi, mengumpulkan, mengolah, menginterpretasi dan menganalisis data serta membedakan jenis data dan menentukan grafik yang sesuai.', 'Data dan Diagram', 5],
    ['D', 'D.2', 'Menggunakan, menyajikan, membuat, dan menginterpretasi diagram batang dan diagram lingkaran serta melakukan estimasi berdasarkan data.', 'Data dan Diagram', 10],
    ['D', 'D.3', 'Mengidentifikasi sampel dan populasi dari objek penelitian atau survei sederhana serta menjelaskan teknik sampling dalam penelitian atau pengumpulan data.', 'Statistika', 5],
    ['D', 'D.4', 'Menentukan dan menafsirkan rata-rata (mean), median, modus, dan jangkauan (range) suatu data serta menyelesaikan permasalahan kontekstual yang berkaitan dengan pemusatan data.', 'Statistika', 5],
    ['D', 'D.5', 'Mengidentifikasi dan menentukan ruang sampel suatu kejadian, serta menentukan nilai peluang suatu kejadian pasti dan kejadian mustahil.', 'Peluang', 10],
    ['D', 'D.6', 'Menentukan frekuensi relatif, peluang teoretik, dan frekuensi harapan serta menyelesaikan permasalahan kontekstual yang terkait.', 'Peluang', 10]
].map(([elemen, kode, tujuan, materi, jp]) => ({ id: 'tp-' + kode, elemen, kode, tujuan, materi, jp }));

const DEFAULT_TP_CATATAN = [
    '1 JP artinya 1 Jam Pelajaran dengan durasi {menit} menit.',
    'Tujuan pembelajaran dirumuskan berdasarkan analisis capaian pembelajaran pada masing-masing elemen.',
    'Materi diperoleh berdasarkan analisis dalam capaian pembelajaran masing-masing elemen.',
    'Kode TP merupakan pengodean agar mudah dalam pemetaan alur tujuan pembelajaran. Arti kode TP, misal B.7: "B" merupakan elemen Bilangan dan "7" nomor urut tujuan pembelajaran. Berikutnya, kode "A" elemen Aljabar, "P" elemen Pengukuran, "G" elemen Geometri, dan "D" elemen Analisis Data dan Peluang.',
    'Urutan elemen, capaian pembelajaran, tujuan pembelajaran, dan kode tidak menggambarkan urutan alur tujuan pembelajaran.',
    'Alokasi waktu merupakan estimasi jumlah jam pelajaran yang diperlukan untuk mencapai masing-masing tujuan pembelajaran.'
];

// ---------------------------------------------------------------------------
// ATP + rincian sub-bab (Prota). ash = JP asesmen sumatif harian setelah bab.
// ---------------------------------------------------------------------------
function bab(materi, kodeTp, ash, subbab) {
    return { id: uid('bab'), materi, kodeTp, ash, subbab: subbab.map(([nama, jp]) => ({ nama, jp })) };
}
function defaultAtp() {
    return {
        VII: {
            1: [
                bab('Bilangan Bulat', 'B.1, B.2', 3, [['Mengenal dan Membandingkan Bilangan Bulat', 5], ['Operasi Hitung Bilangan Bulat', 10], ['Masalah Sehari-hari dengan Bilangan Bulat', 5]]),
                bab('Bilangan Rasional', 'B.3', 2, [['Pecahan dan Desimal', 5], ['Operasi Hitung Bilangan Rasional', 5], ['Estimasi dan Masalah Kontekstual', 5]]),
                bab('Aritmetika Sosial', 'B.2, B.3', 2, [['Untung, Rugi, dan Persentase', 5], ['Diskon, Pajak, dan Bunga Tunggal', 5], ['Bruto, Neto, dan Tara', 5]]),
                bab('Perbandingan', 'B.4', 3, [['Rasio', 5], ['Skala', 5], ['Perbandingan Senilai dan Berbalik Nilai', 5], ['Laju Perubahan', 5]])
            ],
            2: [
                bab('Bentuk Aljabar', 'A.1', 3, [['Unsur-unsur Bentuk Aljabar', 5], ['Operasi Hitung Bentuk Aljabar', 10], ['Pemodelan dengan Bentuk Aljabar', 5]]),
                bab('Kesebangunan', 'G.1, G.2, G.3', 3, [['Garis dan Sudut', 5], ['Kesebangunan', 5], ['Kekongruenan', 5]]),
                bab('Data dan Diagram', 'D.1, D.2', 4, [['Jenis Data dan Pengumpulannya', 5], ['Diagram Batang dan Diagram Lingkaran', 10]])
            ]
        },
        VIII: {
            1: [
                bab('Bilangan Berpangkat dan Bentuk Akar', 'B.5, B.6, B.7', 2, [['Bilangan Berpangkat Bulat', 10], ['Bilangan Bentuk Akar', 10], ['Penulisan Bentuk Baku', 5]]),
                bab('Teorema Pythagoras', 'G.4', 3, [['Teorema Pythagoras', 10], ['Segitiga Istimewa', 10], ['Penerapan Teorema Pythagoras', 5]]),
                bab('Persamaan dan Pertidaksamaan Linear Satu Variabel', 'A.2, A.3', 5, [['Persamaan Linear Satu Variabel', 5], ['Penyelesaian Persamaan Linear Satu Variabel', 5], ['Pertidaksamaan Linear Satu Variabel', 5], ['Penyelesaian Pertidaksamaan Linear Satu Variabel', 5]])
            ],
            2: [
                bab('Pola Bilangan', 'A.4', 2, [['Barisan Bilangan', 5], ['Barisan Aritmetika', 5], ['Barisan Geometri', 5]]),
                bab('Relasi dan Fungsi', 'A.5', 3, [['Relasi', 5], ['Fungsi', 5]]),
                bab('Persamaan Garis Lurus', 'A.6', 2, [['Grafik Garis Lurus', 3], ['Gradien Garis Lurus', 2], ['Persamaan Garis Lurus', 5], ['Kedudukan Dua Garis Lurus', 5]]),
                bab('Statistika', 'D.3, D.4', 3, [['Ukuran Pemusatan Data', 5], ['Ukuran Penyebaran Data', 5]])
            ]
        },
        IX: {
            1: [
                bab('Sistem Persamaan Linear Dua Variabel', 'A.7', 2, [['Persamaan Linear Dua Variabel', 3], ['Konsep dan Pemodelan SPLDV', 5], ['Menyelesaikan SPLDV dengan Grafik', 3], ['Menyelesaikan SPLDV dengan Substitusi', 3], ['Menyelesaikan SPLDV dengan Eliminasi', 3], ['Menyelesaikan Permasalahan Sehari-hari Menggunakan SPLDV', 3]]),
                bab('Bangun Ruang Sisi Datar', 'G.5, P.1', 3, [['Kubus', 5], ['Balok', 5], ['Prisma', 5], ['Limas', 5]]),
                bab('Lingkaran', 'P.2', 2, [['Keliling dan Luas Lingkaran', 5], ['Panjang Busur, Sudut, dan Juring Lingkaran', 5]]),
                bab('Bangun Ruang Sisi Lengkung', 'P.3', 3, [['Tabung', 5], ['Kerucut', 10], ['Bola', 5]])
            ],
            2: [
                bab('Transformasi', 'G.6', 3, [['Translasi', 5], ['Refleksi', 5], ['Rotasi', 5], ['Dilatasi', 5]]),
                bab('Peluang', 'D.5, D.6', 2, [['Titik Sampel, Ruang Sampel, dan Kejadian', 5], ['Peluang Empiris atau Frekuensi Relatif', 5], ['Peluang Teoretis', 10]])
            ]
        }
    };
}

// ---------------------------------------------------------------------------
// Kalender pendidikan 2026/2027 (Lampung). Tanggal bertanda (perkiraan) belum
// tercantum di sumber yang dapat diakses — WAJIB disesuaikan dengan kaldik resmi.
// ---------------------------------------------------------------------------
function agenda(mulai, selesai, nama, jenis, kelas) {
    return { id: uid('ag'), mulai, selesai: selesai || mulai, nama, jenis, kelas: kelas || TINGKAT.slice() };
}
function defaultAgenda() {
    return [
        agenda('2026-07-01', '2026-07-10', 'Libur akhir tahun pelajaran 2025/2026', 'libur'),
        agenda('2026-07-13', null, 'Hari pertama masuk sekolah TP 2026/2027', 'info'),
        agenda('2026-07-13', '2026-07-17', 'Masa Pengenalan Lingkungan Sekolah (MPLS)', 'kegiatan', ['VII']),
        agenda('2026-08-17', null, 'HUT ke-81 Kemerdekaan RI', 'libur'),
        agenda('2026-08-25', null, 'Maulid Nabi Muhammad SAW', 'libur'),
        agenda('2026-09-21', '2026-09-25', 'Asesmen Sumatif Tengah Semester (perkiraan)', 'kegiatan'),
        agenda('2026-11-30', '2026-12-04', 'Asesmen Sumatif Akhir Semester (perkiraan)', 'kegiatan'),
        agenda('2026-12-07', '2026-12-17', 'Kegiatan kesiswaan & pengolahan rapor (perkiraan)', 'kegiatan'),
        agenda('2026-12-18', null, 'Pembagian rapor semester gasal', 'kegiatan'),
        agenda('2026-12-19', '2027-01-04', 'Libur semester gasal', 'libur'),
        agenda('2026-12-24', null, 'Cuti bersama Natal', 'info'),
        agenda('2026-12-25', null, 'Kelahiran Yesus Kristus', 'info'),
        agenda('2027-01-01', null, 'Tahun Baru 2027 Masehi', 'info'),
        agenda('2027-01-05', null, 'Isra Mikraj Nabi Muhammad SAW', 'libur'),
        agenda('2027-02-05', null, 'Cuti bersama Tahun Baru Imlek', 'libur'),
        agenda('2027-02-08', '2027-02-10', 'Libur awal Ramadan 1448 H (perkiraan)', 'libur'),
        agenda('2027-03-08', null, 'Hari Suci Nyepi', 'libur'),
        agenda('2027-03-01', '2027-03-05', 'Asesmen Sumatif Tengah Semester (perkiraan)', 'kegiatan'),
        agenda('2027-03-09', '2027-03-19', 'Libur Idulfitri 1448 H (perkiraan)', 'libur'),
        agenda('2027-03-25', '2027-03-26', 'Cuti bersama & Wafat Yesus Kristus', 'libur'),
        agenda('2027-04-19', '2027-04-23', 'Ujian Sekolah / Asesmen Sumatif Akhir Jenjang (perkiraan)', 'kegiatan', ['IX']),
        agenda('2027-04-26', '2027-06-11', 'Kegiatan akhir jenjang kelas IX (perkiraan)', 'kegiatan', ['IX']),
        agenda('2027-05-06', null, 'Kenaikan Yesus Kristus', 'libur'),
        agenda('2027-05-17', '2027-05-19', 'Iduladha 1448 H & cuti bersama', 'libur'),
        agenda('2027-05-20', null, 'Hari Raya Waisak', 'libur'),
        agenda('2027-05-24', '2027-05-28', 'Asesmen Sumatif Akhir Tahun (perkiraan)', 'kegiatan', ['VII', 'VIII']),
        agenda('2027-05-31', '2027-06-10', 'Kegiatan kesiswaan & pengolahan rapor (perkiraan)', 'kegiatan', ['VII', 'VIII']),
        agenda('2027-06-01', null, 'Hari Lahir Pancasila', 'libur'),
        agenda('2027-06-11', null, 'Pembagian rapor semester genap', 'kegiatan'),
        agenda('2027-06-12', '2027-06-30', 'Libur akhir tahun pelajaran', 'libur')
    ];
}

// ---------------------------------------------------------------------------
// Modul Ajar contoh (format Pembelajaran Mendalam)
// ---------------------------------------------------------------------------
function defaultModul(atp) {
    const spldv = atp.IX[1][0];
    return [{
        id: uid('mod'), tingkat: 'IX', semester: 1, babId: spldv.id,
        judul: 'Sistem Persamaan Linear Dua Variabel',
        kodeTp: 'A.7', alokasi: '5 × 40 menit (1 pertemuan)', pertemuanKe: '1',
        identifikasiMurid: 'Sebagian besar murid sudah menguasai persamaan linear satu variabel dan cara membuat tabel nilai. Sebagian kecil masih kesulitan mengubah kalimat sehari-hari menjadi model matematika. Murid senang belajar dengan konteks belanja dan permainan kelompok.',
        identifikasiMateri: 'Materi bersifat konseptual-prosedural: memahami makna penyelesaian SPLDV sebagai pasangan nilai yang memenuhi dua persamaan sekaligus, lalu menyelesaikannya dengan grafik, substitusi, dan eliminasi. Konteks nyata: harga paket belanja di kantin dan koperasi sekolah.',
        dimensi: ['Penalaran Kritis', 'Kolaborasi', 'Komunikasi'],
        lintasDisiplin: 'Ekonomi (literasi finansial: membandingkan harga), Bahasa Indonesia (menulis kesimpulan).',
        tujuan: 'Melalui diskusi kelompok dan eksplorasi masalah harga paket di kantin, murid dapat memodelkan situasi sehari-hari menjadi SPLDV dan menentukan penyelesaiannya dengan metode grafik, substitusi, dan eliminasi secara tepat.',
        topik: 'Berapa harga satu roti dan satu susu di kantin sekolah?',
        praktikPedagogis: 'Model Problem Based Learning, strategi diskusi kelompok heterogen (4 orang), metode tanya jawab dan galeri jawaban.',
        kemitraan: 'Pengelola kantin sekolah sebagai sumber data harga; orang tua untuk tugas mengamati harga di rumah.',
        lingkungan: 'Ruang kelas dengan tempat duduk berkelompok; budaya belajar saling menghargai pendapat.',
        digital: 'GeoGebra (menggambar dua garis dan menemukan titik potong), Quizizz untuk asesmen awal, IFP untuk menampilkan masalah.',
        pertemuan: [{
            judul: 'Pertemuan 1',
            awal: 'Guru menyapa, memeriksa kesiapan, dan mengajak murid berdoa (berkesadaran).\nAsesmen awal singkat: menyelesaikan 2 soal PLSV untuk mengetahui kesiapan murid.\nGuru menampilkan struk belanja kantin: "2 roti dan 1 susu Rp11.000; 1 roti dan 2 susu Rp10.000". Murid menebak harga satuan (bermakna).\nGuru menyampaikan tujuan dan alur kegiatan.',
            memahami: 'Murid dalam kelompok menuliskan informasi dari struk belanja dan memisalkan harga roti = x dan susu = y.\nMurid menyusun dua persamaan dan berdiskusi mengapa satu persamaan saja belum cukup.\nGuru memberi pertanyaan pemantik: "Pasangan (x, y) mana yang memenuhi kedua kondisi sekaligus?"',
            mengaplikasi: 'Kelompok menyelesaikan model dengan tiga cara: tabel/grafik (GeoGebra), substitusi, dan eliminasi.\nKelompok membandingkan kelebihan setiap cara, lalu menyelesaikan masalah baru dari data kantin yang mereka kumpulkan (menggembirakan).\nHasil dipajang dan kelompok lain memberi tanggapan (galeri jawaban).',
            merefleksi: 'Murid menuliskan: cara mana yang paling mudah bagiku dan mengapa? Bagian mana yang masih membingungkan?\nGuru memberi umpan balik dan meluruskan miskonsepsi.',
            penutup: 'Murid bersama guru menyimpulkan langkah menyelesaikan SPLDV.\nGuru memberi tugas mengamati dua harga paket di rumah dan memodelkannya.\nDoa dan salam penutup.'
        }],
        asesmenAwal: 'Tes diagnostik singkat (2 soal PLSV) melalui Quizizz.',
        asesmenProses: 'Observasi diskusi kelompok dengan lembar observasi kolaborasi dan komunikasi; penilaian LKPD.',
        asesmenAkhir: 'Tes tertulis 3 soal uraian kontekstual SPLDV (penilaian berdasarkan KKTP).',
        lampiran: 'LKPD "Belanja di Kantin", lembar observasi, rubrik penilaian, soal asesmen akhir.'
    }];
}

// ---------------------------------------------------------------------------
// KKTP: interval nilai + indikator contoh untuk beberapa TP
// ---------------------------------------------------------------------------
const DEFAULT_INTERVAL = [
    { min: 0, max: 40, keterangan: 'Belum mencapai ketuntasan, remedial di seluruh bagian' },
    { min: 41, max: 65, keterangan: 'Belum mencapai ketuntasan, remedial di bagian yang diperlukan' },
    { min: 66, max: 85, keterangan: 'Sudah mencapai ketuntasan, tidak perlu remedial' },
    { min: 86, max: 100, keterangan: 'Sudah mencapai ketuntasan, perlu pengayaan atau tantangan lebih' }
];
const DEFAULT_INDIKATOR = {
    'A.7': 'Memodelkan masalah kontekstual menjadi SPLDV.\nMenentukan penyelesaian SPLDV dengan metode grafik.\nMenentukan penyelesaian SPLDV dengan metode substitusi dan eliminasi.\nMenafsirkan penyelesaian SPLDV sesuai konteks masalah.',
    'G.5': 'Mengidentifikasi jaring-jaring prisma dan limas.\nMembuat bangun ruang dari jaring-jaringnya.',
    'P.1': 'Menentukan luas permukaan kubus, balok, prisma, dan limas.\nMenentukan volume kubus, balok, prisma, dan limas.\nMenyelesaikan masalah kontekstual terkait luas permukaan dan volume BRSD.',
    'P.2': 'Menentukan keliling dan luas lingkaran.\nMenentukan panjang busur dan luas juring lingkaran.\nMenyelesaikan masalah yang berkaitan dengan lingkaran.',
    'P.3': 'Menentukan luas permukaan tabung, kerucut, dan bola.\nMenentukan volume tabung, kerucut, dan bola.\nMenyelesaikan masalah kontekstual terkait BRSL.',
    'G.6': 'Menentukan bayangan titik dan bangun hasil translasi dan refleksi.\nMenentukan bayangan titik dan bangun hasil rotasi dan dilatasi.\nMenyelesaikan masalah kontekstual terkait transformasi.',
    'D.5': 'Menentukan titik sampel dan ruang sampel suatu percobaan.\nMenentukan peluang kejadian pasti dan kejadian mustahil.',
    'D.6': 'Menentukan frekuensi relatif dari hasil percobaan.\nMenentukan peluang teoretis dan frekuensi harapan.',
    'B.5': 'Menuliskan perkalian berulang dalam bentuk bilangan berpangkat.\nMenggunakan sifat-sifat bilangan berpangkat bulat.',
    'B.6': 'Menyederhanakan dan mengoperasikan bentuk akar.\nMerasionalkan penyebut bentuk akar.',
    'B.7': 'Menuliskan bilangan dalam bentuk baku (notasi ilmiah).',
    'G.4': 'Membuktikan teorema Pythagoras dan menentukan tripel Pythagoras.\nMenentukan panjang sisi segitiga siku-siku dan segitiga istimewa.\nMenghitung jarak dua titik pada bidang Kartesius.',
    'A.2': 'Memodelkan masalah menjadi PLSV.\nMenentukan penyelesaian PLSV.',
    'A.3': 'Memodelkan masalah menjadi PtLSV.\nMenentukan himpunan penyelesaian PtLSV.'
};

// Contoh rombel & murid (nama fiktif) untuk Daftar Nilai
function defaultRombel() {
    const n9 = ['Adi Saputra', 'Aisyah Putri', 'Bagas Pratama', 'Citra Lestari', 'Dimas Aditya', 'Dinda Ayu', 'Eka Wulandari', 'Fajar Nugroho', 'Gita Permata', 'Hendra Wijaya', 'Indah Sari', 'Joko Susilo'];
    const n8 = ['Agus Salim', 'Bella Safitri', 'Candra Kirana', 'Doni Kurniawan', 'Elsa Maharani', 'Farhan Hidayat', 'Galih Ramadhan', 'Hana Pertiwi'];
    const mk = (names, base) => names.map((nama, i) => ({ id: uid('m'), nis: String(base + i), nama, lp: /a$|i$|h$|ri$|ti$/i.test(nama.split(' ')[0]) && !/Joko|Adi|Dimas|Fajar|Hendra|Agus|Doni|Galih|Farhan/.test(nama) ? 'P' : 'L' }));
    return [
        { id: 'rb-9e', nama: 'IX.E', tingkat: 'IX', murid: mk(n9, 2425101) },
        { id: 'rb-8g', nama: 'VIII.G', tingkat: 'VIII', murid: mk(n8, 2526201) }
    ];
}
