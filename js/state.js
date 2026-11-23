// ============================================================================
// DATA APLIKASI, SIMPAN OTOMATIS & VALIDASI BACKUP
// ============================================================================
const DEFAULT_PENGANTAR = `Puji syukur kami ucapkan kepada Allah SWT karena nikmat dan hidayah-Nya sehingga kami dapat menyelesaikan penyusunan perangkat pembelajaran {mapel} Kelas {rombel} yang saya ampu dengan lancar dan baik sesuai rencana pada tahun pelajaran {tapel}.

Penulisan perangkat KBM ini merupakan wujud perencanaan dalam melaksanakan kegiatan pembelajaran. Harapan saya, dengan penyusunan perangkat ini kegiatan belajar mengajar yang akan saya laksanakan dapat lebih terarah dan terencana di kelas {tingkat} pada Tahun Pelajaran {tapel}.

Penulis mengucapkan terima kasih kepada:
- {kepsek} selaku Kepala {namaResmi} yang telah mendukung saya dalam menyelesaikan penulisan perangkat KBM ini tepat waktu;
- {pengawas} selaku pengawas pembina {namaResmi};
- Rekan sejawat guru {mapel} {namaResmi} yang selalu berbaik hati dan memotivasi penulis dalam upaya perbaikan proses pembelajaran;
- Rekan-rekan Pengurus dan Anggota {mgmp} yang memberikan dukungan dan motivasi kepada penulis untuk menyusun perangkat KBM.

Tak ada gading yang tak retak, ungkapan itu berlaku pula pada perangkat yang saya susun ini; tentu masih ada kekurangan di setiap bagiannya. Penulis berharap ada kritik dan masukan yang membangun sehingga perangkat KBM ini menjadi lebih baik melalui surel {email}.`;

const DEFAULT_LANDASAN = [
    'Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional.',
    'Peraturan Presiden Nomor 87 Tahun 2017 tentang Penguatan Pendidikan Karakter.',
    'Peraturan Menteri Pendidikan dan Kebudayaan RI Nomor 23 Tahun 2015 tentang Penumbuhan Budi Pekerti.',
    'Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor 21 Tahun 2022 tentang Standar Penilaian Pendidikan pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah.',
    'Peraturan Menteri Pendidikan Dasar dan Menengah Republik Indonesia Nomor 10 Tahun 2025 tentang Standar Kompetensi Lulusan pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah.',
    'Peraturan Menteri Pendidikan Dasar dan Menengah Republik Indonesia Nomor 12 Tahun 2025 tentang Standar Isi pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah.',
    'Peraturan Menteri Pendidikan Dasar dan Menengah Republik Indonesia Nomor 13 Tahun 2025 tentang Perubahan atas Permendikbudristek Nomor 12 Tahun 2024 tentang Kurikulum pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah.',
    'Keputusan Kepala Badan Standar, Kurikulum, dan Asesmen Pendidikan Kementerian Pendidikan Dasar dan Menengah Nomor 046/H/KR/2025 tentang Capaian Pembelajaran pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah.',
    'Keputusan Kepala Dinas Pendidikan dan Kebudayaan Provinsi Lampung Nomor 400.3.8/1323/V.01/DP.2/2026 tanggal 22 Juni 2026 tentang Kalender Pendidikan dan Jumlah Jam Belajar Efektif Tahun Pelajaran 2026/2027 di Provinsi Lampung.',
    'Kurikulum Satuan Pendidikan (KSP) {sekolahTitle} Tahun Pelajaran {tapel}.'
];

function createDefaultState() {
    const atp = defaultAtp();
    const alokasi = {};
    TINGKAT.forEach(t => { alokasi[t] = { 1: { remidi: 5, cadangan: 5 }, 2: { remidi: 5, cadangan: 5 } }; });
    // Cadangan disesuaikan agar rencana = jam efektif pada kalender contoh
    alokasi.VII[2].cadangan = 10; alokasi.VIII[1].cadangan = 10; alokasi.VIII[2].cadangan = 10; alokasi.IX[1].cadangan = 10;
    const rombel = defaultRombel();
    const modul = defaultModul(atp);
    // Contoh nilai IX.E semester 1 (sebagian TP sudah dinilai)
    const nilai = {};
    const contoh = {};
    rombel[0].murid.forEach((m, i) => {
        const base = 58 + ((i * 17) % 34);
        contoh[m.id] = { 'A.7': base + 4, 'G.5': Math.min(100, base + 9), 'P.1': base, sts: base + 2 };
    });
    nilai[rombel[0].id + '|1'] = contoh;
    return {
        docMode: 'sampul',
        tingkat: 'IX',
        semester: 1,
        zoom: 1,
        sidebarHidden: false,
        identitas: {
            sekolah: 'SMP NEGERI 1 CONTOH',
            namaResmi: 'UPTD Satuan Pendidikan SMP Negeri 1 Contoh',
            kabupaten: 'Kabupaten Contoh',
            mapel: 'Matematika',
            fase: 'D',
            kurikulum: 'Merdeka',
            tapel: '2026/2027',
            guru: 'NAMA GURU, S.Pd.',
            nipGuru: '123456789012345678',
            email: 'guru@contoh.sch.id',
            kepsek: 'NAMA KEPALA SEKOLAH, S.Pd., M.Pd.',
            nipKepsek: '876543210987654321',
            jabatanKepsek: 'Kepala SMP Negeri 1 Contoh',
            pengawas: 'Bapak/Ibu Nama Pengawas, M.Pd.',
            mgmp: 'MGMP Matematika SMP Kabupaten Contoh',
            tempat: 'Kota Contoh',
            tanggal: 'Juli 2026',
            judulSampul: 'PERANGKAT PEMBELAJARAN',
            logo: DEFAULT_LOGO_SEKOLAH
        },
        kelas: {
            VII: { diampu: false, rombel: 'VII.A', jp: 5 },
            VIII: { diampu: true, rombel: 'VIII.G', jp: 5 },
            IX: { diampu: true, rombel: 'IX.E, F, G, H', jp: 5 }
        },
        setting: { paper: 'A4', theme: 'navy', hariSekolah: 5, minHariEfektif: 3, menitJp: 40 },
        pengantar: DEFAULT_PENGANTAR,
        landasan: DEFAULT_LANDASAN.slice(),
        cp: JSON.parse(JSON.stringify(DEFAULT_CP)),
        tp: JSON.parse(JSON.stringify(DEFAULT_TP)),
        tpCatatan: DEFAULT_TP_CATATAN.slice(),
        atp,
        alokasi,
        agenda: defaultAgenda(),
        promesOverride: {},
        mingguOverride: {},
        modul,
        modulAktif: modul[0].id,
        kktp: {
            pendekatan: 'interval',
            batas: 61,
            interval: JSON.parse(JSON.stringify(DEFAULT_INTERVAL)),
            skala: DEFAULT_SKALA.slice(),
            level: DEFAULT_LEVEL_RUBRIK.slice(),
            indikator: Object.assign({}, DEFAULT_INDIKATOR),
            tp: JSON.parse(JSON.stringify(DEFAULT_KKTP_TP))
        },
        jurnal: [],
        jurnalKosong: 5,
        rombel,
        rombelAktif: rombel[0].id,
        nilai,
        bobot: { tp: 50, sts: 25, sas: 25 }
    };
}

let appState = createDefaultState();
const STORAGE_KEY = 'perangkatAjar_state_v1';
let saveTimer = null;
let storageWarned = false;

function refreshIcons() {
    if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

// Muat skrip sekali saja. Janji (promise) disimpan supaya pemanggilan kedua yang datang saat skrip
// masih diunduh ikut menunggu, bukan langsung dianggap selesai.
const scriptLoads = new Map();
function loadScriptOnce(src) {
    if (scriptLoads.has(src)) return scriptLoads.get(src);
    const p = new Promise((resolve, reject) => {
        const el = document.createElement('script');
        el.src = src;
        el.dataset.src = src;
        el.onload = () => resolve();
        el.onerror = () => {
            el.remove();
            scriptLoads.delete(src);
            reject(new Error(`Pustaka ${src} tidak ditemukan. Pastikan folder "vendor" ikut tersalin bersama index.html.`));
        };
        document.head.appendChild(el);
    });
    scriptLoads.set(src, p);
    return p;
}

// Pustaka Excel (±1 MB) tidak dimuat saat aplikasi dibuka agar tampilan awal lebih cepat;
// dimuat di latar sesudah aplikasi siap (lihat utils.js) atau saat pertama dibutuhkan.
const XLSX_SRC = 'vendor/xlsx.full.min.js';
async function ensureXLSX() {
    if (window.XLSX) return true;
    try {
        await loadScriptOnce(XLSX_SRC);
        if (window.XLSX) return true;
    } catch (err) { console.warn(err); }
    showToast('Pustaka Excel gagal dimuat. Pastikan folder "vendor" lengkap, lalu muat ulang halaman.', 6000);
    return false;
}

// ---------- Validasi data dari penyimpanan / backup ----------
function isPlainObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function isSafeImageDataUrl(v) {
    return typeof v === 'string' && /^data:image\/(png|jpe?g|webp|gif|svg\+xml)[;,]/i.test(v) && v.length < 3 * 1024 * 1024;
}

// Gabungkan nilai tersimpan ke bentuk bawaan: tipe harus cocok; objek digabung rekursif,
// larik & nilai sederhana diganti. Kunci yang tidak dikenal di tingkat atas diabaikan.
function mergeTyped(def, val, depth) {
    if (val === undefined || val === null) return def;
    if (Array.isArray(def)) return Array.isArray(val) ? val : def;
    if (isPlainObject(def)) {
        if (!isPlainObject(val)) return def;
        // objek "kamus" (kunci bebas): ambil seluruhnya
        if (depth > 0 && Object.keys(def).length === 0) return val;
        const out = Object.assign({}, def);
        Object.keys(val).forEach(k => {
            if (k === '__proto__' || k === 'constructor' || k === 'prototype') return;
            out[k] = k in def ? mergeTyped(def[k], val[k], depth + 1) : val[k];
        });
        return out;
    }
    if (typeof def === 'number') { const n = Number(val); return Number.isFinite(n) ? n : def; }
    if (typeof def === 'boolean') return !!val;
    if (typeof def === 'string') return typeof val === 'string' || typeof val === 'number' ? String(val) : def;
    return val;
}

function sanitizeLoadedState(raw) {
    if (!isPlainObject(raw)) throw new Error('Berkas bukan data Perangkat Pembelajaran.');
    const fresh = createDefaultState();
    const out = {};
    Object.keys(fresh).forEach(k => { out[k] = mergeTyped(fresh[k], raw[k], 0); });
    if (!isSafeImageDataUrl(out.identitas.logo)) out.identitas.logo = fresh.identitas.logo;
    if (!TINGKAT.includes(out.tingkat)) out.tingkat = 'IX';
    if (![1, 2].includes(out.semester)) out.semester = 1;
    if (!DOC_THEMES[out.setting.theme]) out.setting.theme = 'navy';
    if (!PAPER_SIZES[out.setting.paper]) out.setting.paper = 'A4';
    // Larik dari data lama/backup bisa berisi butir rusak (null, angka, field hilang). Satu butir
    // rusak saja dulu membuat aplikasi macet setiap dibuka, jadi setiap butir dirapikan di sini.
    const str = v => (typeof v === 'string' || typeof v === 'number') ? String(v) : '';
    const objs = arr => (Array.isArray(arr) ? arr : []).filter(isPlainObject);
    const withId = (x, def, prefix) => { const o = Object.assign({}, def, x); if (!o.id) o.id = uid(prefix); return o; };
    const strArr = arr => (Array.isArray(arr) ? arr : []).filter(x => typeof x === 'string' || typeof x === 'number').map(String);
    const isIso = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
    out.landasan = strArr(out.landasan);
    out.tpCatatan = strArr(out.tpCatatan);
    out.tp = objs(out.tp).map(x => {
        const o = withId(x, { elemen: '', kode: '', tujuan: '', materi: '', jp: 0 }, 'tp');
        ['elemen', 'kode', 'tujuan', 'materi'].forEach(k => { o[k] = str(o[k]); });
        return o;
    });
    TINGKAT.forEach(t => {
        out.atp[t] = isPlainObject(out.atp[t]) ? out.atp[t] : { 1: [], 2: [] };
        [1, 2].forEach(s => {
            out.atp[t][s] = objs(out.atp[t][s]).map(b => {
                const o = withId(b, { materi: '', kodeTp: '', ash: 0 }, 'bab');
                o.subbab = objs(o.subbab).map(x => Object.assign({ nama: '', jp: 0 }, x));
                return o;
            });
        });
        out.alokasi[t] = isPlainObject(out.alokasi[t]) ? out.alokasi[t] : {};
        [1, 2].forEach(s => { if (!isPlainObject(out.alokasi[t][s])) out.alokasi[t][s] = { remidi: 5, cadangan: 5 }; });
        if (!isPlainObject(out.kelas[t])) out.kelas[t] = Object.assign({}, fresh.kelas[t]);
    });
    out.agenda = objs(out.agenda).filter(a => isIso(a.mulai)).map(a => {
        const o = withId(a, { nama: '' }, 'ag');
        if (!isIso(o.selesai) || o.selesai < o.mulai) o.selesai = o.mulai;
        if (!JENIS_AGENDA[o.jenis]) o.jenis = 'libur';
        const kelas = Array.isArray(o.kelas) ? o.kelas : typeof o.kelas === 'string' ? o.kelas.split(/[\s,;]+/) : TINGKAT;
        o.kelas = kelas.map(String).filter(k => TINGKAT.includes(k));
        o.nama = str(o.nama);
        return o;
    });
    out.rombel = objs(out.rombel).map(r => {
        const o = withId(r, { nama: '' }, 'rb');
        o.nama = str(o.nama);
        if (!TINGKAT.includes(o.tingkat)) o.tingkat = out.tingkat;
        o.murid = objs(o.murid).map(m => {
            const mm = withId(m, { nis: '', nama: '', lp: '' }, 'm');
            ['nis', 'nama', 'lp'].forEach(k => { mm[k] = str(mm[k]); });
            return mm;
        });
        return o;
    });
    if (out.rombel.length && !out.rombel.some(r => r.id === out.rombelAktif)) out.rombelAktif = out.rombel[0].id;
    out.jurnal = objs(out.jurnal).map(j => withId(j, {}, 'j'));
    const nilai = {};
    Object.keys(out.nilai).forEach(k => {
        if (!isPlainObject(out.nilai[k])) return;
        const box = {};
        Object.keys(out.nilai[k]).forEach(m => { if (isPlainObject(out.nilai[k][m])) box[m] = out.nilai[k][m]; });
        nilai[k] = box;
    });
    out.nilai = nilai;
    Object.keys(out.promesOverride).forEach(k => { if (!isPlainObject(out.promesOverride[k])) delete out.promesOverride[k]; });
    // Koreksi minggu efektif: { "VII|1": { "7": { efektif, ket } } }
    const mo = {};
    Object.keys(out.mingguOverride || {}).forEach(k => {
        if (!/^(VII|VIII|IX)\|[12]$/.test(k) || !isPlainObject(out.mingguOverride[k])) return;
        Object.keys(out.mingguOverride[k]).forEach(m => {
            const o = out.mingguOverride[k][m];
            if (!/^(\d|1[01])$/.test(m) || !isPlainObject(o)) return;
            const c = {};
            if (Number.isFinite(Number(o.efektif)) && o.efektif !== null && o.efektif !== '') c.efektif = Math.max(0, Math.min(6, Math.round(Number(o.efektif))));
            if (Number.isFinite(Number(o.total)) && o.total !== null && o.total !== '') c.total = Math.max(0, Math.min(6, Math.round(Number(o.total))));
            if (typeof o.ket === 'string') c.ket = o.ket.slice(0, 500);
            if (Object.keys(c).length) (mo[k] || (mo[k] = {}))[m] = c;
        });
    });
    out.mingguOverride = mo;
    // Pengaturan KKTP per TP diambil apa adanya dari data (tidak digabung dengan contoh bawaan);
    // data lama (sebelum ada pendekatan per TP) tetap memakai interval untuk semua TP
    out.kktp.tp = isPlainObject(raw.kktp) && isPlainObject(raw.kktp.tp) ? raw.kktp.tp : {};
    out.kktp = sanitizeKKTP(out.kktp, fresh.kktp);
    out.modul = objs(out.modul).map(m => {
        const o = withId(m, {}, 'mod');
        o.pertemuan = objs(o.pertemuan);
        o.dimensi = strArr(o.dimensi);
        return o;
    });
    if (out.modul.length && !out.modul.some(m => m.id === out.modulAktif)) out.modulAktif = out.modul[0].id;
    out.zoom = 1;
    out.sidebarHidden = false;
    return out;
}

// KKTP: pendekatan sah, tahap rubrik 2–5, skala 2–6, pengaturan per TP berbentuk benar
function sanitizeKKTP(k, def) {
    const strList = (arr, min, max, fallback) => {
        const xs = (Array.isArray(arr) ? arr : []).map(x => (typeof x === 'string' || typeof x === 'number') ? String(x).slice(0, 200) : '').slice(0, max);
        return xs.length >= min ? xs : fallback.slice();
    };
    k.pendekatan = PENDEKATAN_KKTP[k.pendekatan] ? k.pendekatan : 'interval';
    k.level = strList(k.level, 2, 5, def.level);
    k.skala = strList(k.skala, 2, 6, def.skala);
    k.interval = (Array.isArray(k.interval) ? k.interval : []).filter(isPlainObject)
        .map(iv => ({ min: Number(iv.min) || 0, max: Number(iv.max) || 0, keterangan: typeof iv.keterangan === 'string' ? iv.keterangan : '' }));
    if (!isPlainObject(k.indikator)) k.indikator = {};
    const tp = {};
    Object.keys(isPlainObject(k.tp) ? k.tp : {}).forEach(kode => {
        const o = k.tp[kode];
        if (!isPlainObject(o) || kode === '__proto__' || kode === 'constructor' || kode === 'prototype') return;
        const c = {};
        if (PENDEKATAN_KKTP[o.pendekatan]) c.pendekatan = o.pendekatan;
        if (Number.isFinite(Number(o.minKriteria)) && o.minKriteria !== null && o.minKriteria !== '') c.minKriteria = Math.max(1, Math.round(Number(o.minKriteria)));
        if (Array.isArray(o.minLevel)) c.minLevel = o.minLevel.map(x => Math.max(0, Math.min(4, Math.round(Number(x)) || 0)));
        if (Array.isArray(o.rubrik)) c.rubrik = o.rubrik.map(r => (Array.isArray(r) ? r : []).map(x => typeof x === 'string' ? x : ''));
        tp[kode] = c;
    });
    k.tp = tp;
    return k;
}

// Isi terakhir yang ditulis/dibaca dari penyimpanan: dipakai agar render yang tidak mengubah data
// tidak menulis ulang seluruh data (termasuk logo) dan agar tab lain tidak dikira mengubah data.
let lastSavedJson = null;
// Alasan simpan otomatis dihentikan sementara ('tab-lain' | 'data-rusak'), null = aktif
let storagePaused = null;

function setAutosaveStatus(text, ok) {
    const el = document.getElementById('autosave-status');
    if (!el) return;
    (el.querySelector('.nav-label') || el).textContent = text;
    el.classList.toggle('autosave-ok', ok);
    el.classList.toggle('autosave-err', !ok);
    el.classList.remove('autosave-flash');
    el.style.cursor = storagePaused === 'tab-lain' ? 'pointer' : '';
    el.onclick = storagePaused === 'tab-lain' ? promptOtherTabChange : null;
}

function saveStateNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    if (storagePaused) return;
    const el = document.getElementById('autosave-status');
    try {
        const json = JSON.stringify(appState);
        if (json === lastSavedJson) return;
        localStorage.setItem(STORAGE_KEY, json);
        lastSavedJson = json;
        if (el) {
            const t = new Date();
            (el.querySelector('.nav-label') || el).textContent = `Tersimpan ${String(t.getHours()).padStart(2, '0')}.${String(t.getMinutes()).padStart(2, '0')}`;
            el.classList.remove('autosave-err', 'autosave-flash');
            el.classList.add('autosave-ok');
            void el.offsetWidth;
            el.classList.add('autosave-flash');
        }
    } catch (err) {
        if (el) {
            (el.querySelector('.nav-label') || el).textContent = 'Gagal simpan otomatis — gunakan Backup';
            el.classList.remove('autosave-ok', 'autosave-flash');
            el.classList.add('autosave-err');
        }
        if (!storageWarned) {
            storageWarned = true;
            showToast('Penyimpanan browser penuh. Gunakan Data & Backup → Backup (.json).');
        }
    }
}

function saveStateSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { saveTimer = null; saveStateNow(); }, 600);
}

function safeStorageGet(key) {
    try { return window.localStorage.getItem(key); } catch (err) { return null; }
}

// ---------- Aplikasi terbuka di beberapa tab ----------
// Dulu tab yang terakhir menyimpan menimpa seluruh isian tab lain. Sekarang, begitu tab lain
// menyimpan data baru, tab ini berhenti menyimpan otomatis sampai pengguna memilih memuat data terbaru.
let otherTabDialogOpen = false;
window.addEventListener('storage', e => {
    if (e.key !== STORAGE_KEY || e.newValue === null || e.newValue === lastSavedJson) return;
    clearTimeout(saveTimer);
    saveTimer = null;
    storagePaused = 'tab-lain';
    setAutosaveStatus('Tidak menyimpan — data diubah di tab lain (klik)', false);
    promptOtherTabChange();
});

function promptOtherTabChange() {
    if (otherTabDialogOpen || storagePaused !== 'tab-lain') return;
    otherTabDialogOpen = true;
    showChoiceDialog({
        title: 'Data diubah di tab lain',
        html: 'Aplikasi ini juga terbuka di tab atau jendela lain, dan data baru saja disimpan dari sana. '
            + 'Agar isian tidak saling menimpa, <b>tab ini berhenti menyimpan otomatis</b>.<br><br>'
            + '<b>Muat data terbaru</b> = lanjut bekerja di tab ini dengan data dari tab lain '
            + '(perubahan di tab ini yang belum tersimpan diganti). Sebaiknya gunakan satu tab saja.',
        buttons: [
            { label: 'Muat data terbaru', value: 'muat', primary: true },
            { label: 'Nanti', value: null }
        ]
    }).then(v => {
        otherTabDialogOpen = false;
        if (v === 'muat') reloadFromStorage();
    });
}

function reloadFromStorage() {
    const raw = safeStorageGet(STORAGE_KEY);
    try {
        if (!raw) throw new Error('kosong');
        const view = { docMode: appState.docMode, tingkat: appState.tingkat, semester: appState.semester };
        appState = Object.assign(sanitizeLoadedState(JSON.parse(raw)), view);
    } catch (err) {
        showToast('Data dari tab lain tidak dapat dibaca.');
        return;
    }
    lastSavedJson = raw;
    storagePaused = null;
    setAutosaveStatus('Simpan otomatis aktif', true);
    initApp();
    showToast('Data terbaru dari tab lain dimuat.');
}

function loadSavedState() {
    try {
        const raw = safeStorageGet(STORAGE_KEY);
        if (!raw) return false;
        appState = sanitizeLoadedState(JSON.parse(raw));
        lastSavedJson = raw;
        return true;
    } catch (err) {
        console.warn('Data tersimpan tidak dapat dibaca:', err);
        return false;
    }
}

function resetAllData() {
    if (!confirm('Hapus semua isian di browser ini dan kembali ke data contoh?\n\nTips: simpan dulu lewat Backup (.json) bila masih diperlukan.')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (err) {}
    lastSavedJson = null;
    if (storagePaused) { storagePaused = null; setAutosaveStatus('Simpan otomatis aktif', true); }
    appState = createDefaultState();
    initApp();
    showToast('Data dikembalikan ke contoh bawaan.');
}

function toggleSidebar(force) {
    appState.sidebarHidden = typeof force === 'boolean' ? force : !appState.sidebarHidden;
    const panel = document.getElementById('left-sidebar');
    if (panel) panel.classList.toggle('panel-hidden', appState.sidebarHidden);
    if (typeof updateWorkspaceCompactButton === 'function') updateWorkspaceCompactButton();
    if (typeof refreshZoom === 'function') refreshZoom();
}

// ---------- Akses jalur data "a.b.0.c" (dipakai pengikat form) ----------
function getPath(obj, path) {
    return String(path).split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function setPath(obj, path, value) {
    const keys = String(path).split('.');
    if (keys.some(k => k === '__proto__' || k === 'constructor' || k === 'prototype')) return;
    let o = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (o[keys[i]] == null) o[keys[i]] = {};
        o = o[keys[i]];
    }
    o[keys[keys.length - 1]] = value;
}
