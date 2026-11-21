// ============================================================================
// KALENDER, MINGGU EFEKTIF & SEBARAN PROGRAM SEMESTER (OTOMATIS)
// ----------------------------------------------------------------------------
// Aturan:
//  • Satu minggu = Senin s.d. Jumat (5 hari sekolah) atau Senin s.d. Sabtu (6 hari).
//  • Minggu masuk ke bulan tempat hari Seninnya berada.
//  • Hari tidak efektif = tercakup agenda berjenis "libur" atau "kegiatan" yang berlaku
//    untuk tingkat kelas tsb. Agenda "info" hanya keterangan.
//  • Minggu efektif = jumlah hari efektif ≥ batas (bawaan 3 hari).
// Tanggal disimpan sebagai teks ISO "YYYY-MM-DD" dan dihitung dalam UTC agar tidak
// terpengaruh zona waktu.
// ============================================================================
const DAY_MS = 86400000;
const isoToDay = iso => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) / DAY_MS; };
const dayToIso = n => new Date(n * DAY_MS).toISOString().slice(0, 10);
const dayOfWeek = n => new Date(n * DAY_MS).getUTCDay(); // 0 = Minggu
const dayParts = n => { const d = new Date(n * DAY_MS); return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() }; };

function tapelYears() {
    const m = String(appState.identitas.tapel || '').match(/(\d{4})\D+(\d{4})/);
    if (m) return [Number(m[1]), Number(m[2])];
    const y = new Date().getFullYear();
    return [y, y + 1];
}

// Bulan-bulan dalam semester: [{y, m}] (m = 0..11)
function semesterMonths(sem) {
    const [y1, y2] = tapelYears();
    return sem === 1 ? [6, 7, 8, 9, 10, 11].map(m => ({ y: y1, m })) : [0, 1, 2, 3, 4, 5].map(m => ({ y: y2, m }));
}

function schoolDayNumbers() { return appState.setting.hariSekolah === 6 ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5]; }

function agendaApplies(a, tingkat) {
    return !tingkat || !Array.isArray(a.kelas) || a.kelas.length === 0 || a.kelas.includes(tingkat);
}

// Agenda yang mencakup hari ke-n untuk tingkat tsb.
function agendaOnDay(n, tingkat) {
    return (appState.agenda || []).filter(a => {
        if (!a.mulai) return false;
        const s = isoToDay(a.mulai), e = isoToDay(a.selesai || a.mulai);
        return n >= s && n <= e && agendaApplies(a, tingkat);
    });
}

function isBlocking(a) { return a.jenis === 'libur' || a.jenis === 'kegiatan'; }

// Daftar minggu dalam satu semester untuk satu tingkat kelas
const weeksCache = new Map();
function semesterWeeks(tingkat, sem) {
    const cacheKey = JSON.stringify([tingkat, sem, appState.agenda, appState.setting.hariSekolah, appState.setting.minHariEfektif, appState.identitas.tapel]);
    if (weeksCache.has(cacheKey)) return weeksCache.get(cacheKey);
    const months = semesterMonths(sem);
    const first = Date.UTC(months[0].y, months[0].m, 1) / DAY_MS;
    const last = Date.UTC(months[5].y, months[5].m + 1, 0) / DAY_MS;
    let monday = first + ((8 - dayOfWeek(first)) % 7); // Senin pertama di dalam semester
    const schoolDays = schoolDayNumbers();
    const minEff = Math.max(1, Number(appState.setting.minHariEfektif) || 3);
    const weeks = [];
    const perMonthCount = {};
    for (; monday <= last; monday += 7) {
        const { y, m } = dayParts(monday);
        const mk = y * 12 + m;
        perMonthCount[mk] = (perMonthCount[mk] || 0) + 1;
        const blockers = new Map();
        let efektifDays = 0;
        const days = schoolDays.map(dw => monday + dw - 1);
        days.forEach(n => {
            const blocking = agendaOnDay(n, tingkat).filter(isBlocking);
            if (!blocking.length) { efektifDays++; return; }
            blocking.forEach(a => blockers.set(a.id, (blockers.get(a.id) || 0) + 1));
        });
        let primary = null;
        blockers.forEach((cnt, id) => {
            const a = appState.agenda.find(x => x.id === id);
            if (!primary || cnt > primary.cnt || (cnt === primary.cnt && a.jenis === 'kegiatan')) primary = { a, cnt };
        });
        weeks.push({
            key: dayToIso(monday), monday, y, m, mingguKe: perMonthCount[mk],
            efektifDays, efektif: efektifDays >= minEff,
            primary: primary ? primary.a : null,
            blockerIds: [...blockers.keys()]
        });
    }
    if (weeksCache.size > 40) weeksCache.clear();
    weeksCache.set(cacheKey, weeks);
    return weeks;
}

// ---------- Koreksi manual minggu efektif per bulan ----------
// appState.mingguOverride["VII|1"]["7"] = { efektif?: number, ket?: string }  (kunci = indeks bulan 0..11)
function mingguOverrideKey(tingkat, sem) { return tingkat + '|' + sem; }
function mingguOverrideOf(tingkat, sem, m) {
    const o = ((appState.mingguOverride || {})[mingguOverrideKey(tingkat, sem)] || {})[m];
    return isPlainObject(o) ? o : null;
}
const MANUAL_TIDAK_EFEKTIF = 'Kegiatan sekolah lainnya';

// Minggu semester setelah koreksi manual per bulan:
//  • Jumlah minggu (total) diturunkan → minggu terakhir bulan itu dibuang; dinaikkan → minggu
//    tambahan (efektif) ditambahkan di akhir bulan.
//  • Jumlah minggu efektif diturunkan → minggu dengan hari efektif paling sedikit dijadikan tidak
//    efektif; dinaikkan → minggu tidak efektif dengan hari efektif paling banyak dijadikan efektif.
// Setiap minggu diberi autoEf = status efektif sebelum koreksi jumlah efektif.
const hasNum = v => v !== undefined && v !== null && v !== '' && Number.isFinite(Number(v));
function semesterWeeksFinal(tingkat, sem) {
    const base = semesterWeeks(tingkat, sem);
    const ovAll = (appState.mingguOverride || {})[mingguOverrideKey(tingkat, sem)];
    if (!ovAll || !Object.keys(ovAll).length) return base;
    const schoolDays = schoolDayNumbers().length;
    const out = [];
    semesterMonths(sem).forEach(({ y, m }) => {
        let ws = base.filter(w => w.y === y && w.m === m).map(w => Object.assign({}, w));
        const o = mingguOverrideOf(tingkat, sem, m) || {};
        if (hasNum(o.total)) {
            const total = Math.max(0, Math.min(6, Math.round(Number(o.total))));
            if (total < ws.length) ws = ws.slice(0, total);
            const firstMonday = Date.UTC(y, m, 1) / DAY_MS + ((8 - dayOfWeek(Date.UTC(y, m, 1) / DAY_MS)) % 7);
            while (ws.length < total) {
                const prev = ws[ws.length - 1];
                const monday = prev ? prev.monday + 7 : firstMonday;
                const n = ws.length + 1;
                ws.push({
                    key: `${y}-${String(m + 1).padStart(2, '0')}-m${n}`, monday, y, m, mingguKe: n,
                    efektifDays: schoolDays, efektif: true, primary: null, blockerIds: [], manual: true, tambahan: true
                });
            }
        }
        ws.forEach(w => { w.autoEf = w.efektif; });
        if (hasNum(o.efektif)) {
            const target = Math.max(0, Math.min(ws.length, Math.round(Number(o.efektif))));
            let cur = ws.filter(w => w.efektif).length;
            const ket = (o.ket || '').trim();
            if (target < cur) {
                // hari efektif paling sedikit dulu, lalu yang paling akhir
                const cand = ws.filter(w => w.efektif).sort((a, b) => a.efektifDays - b.efektifDays || b.monday - a.monday);
                for (const w of cand) {
                    if (cur <= target) break;
                    w.efektif = false; w.manual = true;
                    if (ket || !w.primary) w.primary = { nama: ket || MANUAL_TIDAK_EFEKTIF };
                    cur--;
                }
            } else if (target > cur) {
                const cand = ws.filter(w => !w.efektif).sort((a, b) => b.efektifDays - a.efektifDays || a.monday - b.monday);
                for (const w of cand) {
                    if (cur >= target) break;
                    w.efektif = true; w.manual = true; cur++;
                }
            }
        }
        out.push(...ws);
    });
    return out;
}

function jpPerMinggu(tingkat) { return Math.max(1, Number((appState.kelas[tingkat] || {}).jp) || 5); }

const fmtNum = v => {
    const r = Math.round(v * 10) / 10;
    return String(r).replace('.', ',');
};
const mingguKeText = list => {
    if (list.length === 1) return `Minggu ke-${list[0]}`;
    return `Minggu ke-${list.slice(0, -1).join(', ')} & ${list[list.length - 1]}`;
};

// Ringkasan minggu efektif per bulan + penggunaan minggu tidak efektif
function mingguEfektif(tingkat, sem) {
    const weeks = semesterWeeksFinal(tingkat, sem);
    const jp = jpPerMinggu(tingkat);
    const bulan = semesterMonths(sem).map(({ y, m }) => {
        const ws = weeks.filter(w => w.y === y && w.m === m);
        const tidak = ws.filter(w => !w.efektif);
        const autoKet = [...new Set(tidak.map(w => w.primary ? w.primary.nama : 'Hari efektif kurang'))].join('; ');
        const o = mingguOverrideOf(tingkat, sem, m);
        const hasKet = !!o && typeof o.ket === 'string';
        return {
            y, m, nama: NAMA_BULAN[m], total: ws.length, efektif: ws.length - tidak.length, tidak: tidak.length,
            keterangan: hasKet ? o.ket : autoKet, autoKeterangan: autoKet,
            autoTotal: semesterWeeks(tingkat, sem).filter(w => w.y === y && w.m === m).length,
            autoEfektif: ws.filter(w => w.autoEf === undefined ? w.efektif : w.autoEf).length,
            manualTotal: !!o && hasNum(o.total), manualEfektif: !!o && hasNum(o.efektif), manualKet: hasKet
        };
    });
    const total = bulan.reduce((s, b) => s + b.total, 0);
    const efektif = bulan.reduce((s, b) => s + b.efektif, 0);

    // Penggunaan minggu tidak efektif, dikelompokkan menurut agenda utama
    const groups = new Map();
    weeks.filter(w => !w.efektif).forEach(w => {
        const nama = w.primary ? w.primary.nama : 'Hari efektif kurang dari batas';
        if (!groups.has(nama)) groups.set(nama, { nama, weeks: [] });
        groups.get(nama).weeks.push(w);
    });
    const tidakEfektif = [...groups.values()].map(g => {
        const perBulan = new Map();
        g.weeks.forEach(w => {
            const k = w.y * 12 + w.m;
            if (!perBulan.has(k)) perBulan.set(k, { m: w.m, list: [] });
            perBulan.get(k).list.push(w.mingguKe);
        });
        const ket = [...perBulan.values()].map(b => `${NAMA_BULAN[b.m]} (${mingguKeText(b.list)})`).join(', ');
        return { nama: g.nama, minggu: g.weeks.length, jp: g.weeks.length * jp, keterangan: ket };
    });
    return { bulan, total, efektif, tidak: total - efektif, jp, totalJp: efektif * jp, tidakEfektif, weeks };
}

// ---------- Rencana pembelajaran (dari ATP) ----------
function babJp(b) { return (b.subbab || []).reduce((s, x) => s + (Number(x.jp) || 0), 0); }

function rencanaSemester(tingkat, sem) {
    const babs = ((appState.atp[tingkat] || {})[sem]) || [];
    const al = ((appState.alokasi[tingkat] || {})[sem]) || { remidi: 0, cadangan: 0 };
    const tatapMuka = babs.reduce((s, b) => s + babJp(b), 0);
    const ash = babs.reduce((s, b) => s + (Number(b.ash) || 0), 0);
    const remidi = Number(al.remidi) || 0, cadangan = Number(al.cadangan) || 0;
    return { babs, tatapMuka, ash, remidi, cadangan, total: tatapMuka + ash + remidi + cadangan };
}

// Nomor bab berurutan lintas semester (Bab 1.. di semester 1, lanjut di semester 2)
function babNumber(tingkat, sem, idx) {
    return (sem === 2 ? (((appState.atp[tingkat] || {})[1]) || []).length : 0) + idx + 1;
}

// ---------- Program Semester: baris, sebaran otomatis, koreksi manual ----------
function promesRows(tingkat, sem) {
    const r = rencanaSemester(tingkat, sem);
    const rows = [];
    r.babs.forEach(b => {
        rows.push({ id: b.id + ':m', label: b.materi, jp: babJp(b), type: 'materi', kodeTp: b.kodeTp });
        if (Number(b.ash) > 0) rows.push({ id: b.id + ':a', label: 'Asesmen Sumatif Harian', jp: Number(b.ash), type: 'ash' });
    });
    if (r.remidi > 0) rows.push({ id: 'remidi', label: 'Remidi/Pengayaan', jp: r.remidi, type: 'remidi' });
    if (r.cadangan > 0) rows.push({ id: 'cadangan', label: 'Cadangan', jp: r.cadangan, type: 'cadangan' });
    return rows;
}

function promesKey(tingkat, sem) { return tingkat + '|' + sem; }

function promesMatrix(tingkat, sem) {
    const me = mingguEfektif(tingkat, sem);
    const jp = me.jp;
    const weeks = me.weeks;
    const rows = promesRows(tingkat, sem);
    const auto = {};
    rows.forEach(r => { auto[r.id] = {}; });

    // Isi minggu efektif berurutan; "Cadangan" ditaruh di minggu efektif terakhir yang tersisa
    const effWeeks = weeks.filter(w => w.efektif);
    const capacity = {};
    effWeeks.forEach(w => { capacity[w.key] = jp; });
    const cad = rows.find(r => r.id === 'cadangan');
    let overflow = 0;
    if (cad) {
        let need = cad.jp;
        for (let i = effWeeks.length - 1; i >= 0 && need > 0; i--) {
            const w = effWeeks[i];
            const take = Math.min(need, capacity[w.key]);
            if (take > 0) { auto.cadangan[w.key] = take; capacity[w.key] -= take; need -= take; }
        }
        overflow += need;
    }
    let wi = 0;
    rows.filter(r => r.id !== 'cadangan').forEach(r => {
        let need = r.jp;
        while (need > 0 && wi < effWeeks.length) {
            const w = effWeeks[wi];
            const take = Math.min(need, capacity[w.key]);
            if (take > 0) { auto[r.id][w.key] = (auto[r.id][w.key] || 0) + take; capacity[w.key] -= take; need -= take; }
            if (capacity[w.key] <= 0) wi++;
        }
        overflow += need;
    });

    // Koreksi manual
    const ov = appState.promesOverride[promesKey(tingkat, sem)] || {};
    const cells = {};
    rows.forEach(r => {
        cells[r.id] = {};
        weeks.forEach(w => {
            const k = r.id + '|' + w.key;
            const v = Object.prototype.hasOwnProperty.call(ov, k) ? ov[k] : auto[r.id][w.key];
            if (v !== undefined && v !== null && v !== '' && Number(v) !== 0) cells[r.id][w.key] = Number(v);
        });
    });

    // Baris kegiatan/libur (minggu tidak efektif) diberi arsir
    const eventRows = [];
    weeks.filter(w => !w.efektif).forEach(w => {
        const nama = w.primary ? w.primary.nama : 'Hari efektif kurang';
        let row = eventRows.find(e => e.label === nama);
        if (!row) { row = { id: 'ev:' + nama, label: nama, type: 'event', weeks: [] }; eventRows.push(row); }
        row.weeks.push(w.key);
    });

    const weekTotals = {};
    weeks.forEach(w => { weekTotals[w.key] = rows.reduce((s, r) => s + (cells[r.id][w.key] || 0), 0); });
    const rowTotals = {};
    rows.forEach(r => { rowTotals[r.id] = Object.values(cells[r.id]).reduce((s, v) => s + v, 0); });
    const hasOverride = Object.keys(ov).length > 0;
    return { me, weeks, rows, auto, cells, eventRows, weekTotals, rowTotals, overflow, hasOverride, jp };
}

// Materi yang dijadwalkan pada minggu tertentu (dipakai jurnal otomatis)
function promesMateriOnWeek(matrix, weekKey) {
    return matrix.rows.filter(r => matrix.cells[r.id][weekKey]).map(r => r);
}

function formatTanggalIndo(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || '';
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${NAMA_BULAN[m - 1]} ${y}`;
}
function formatRentang(a) {
    if (!a.selesai || a.selesai === a.mulai) return formatTanggalIndo(a.mulai);
    const [y1, m1, d1] = a.mulai.split('-').map(Number);
    const [y2, m2, d2] = a.selesai.split('-').map(Number);
    if (y1 === y2 && m1 === m2) return `${d1}–${d2} ${NAMA_BULAN[m1 - 1]} ${y1}`;
    if (y1 === y2) return `${d1} ${NAMA_BULAN[m1 - 1]} – ${d2} ${NAMA_BULAN[m2 - 1]} ${y1}`;
    return `${formatTanggalIndo(a.mulai)} – ${formatTanggalIndo(a.selesai)}`;
}
