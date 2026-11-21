// ============================================================================
// DAFTAR DOKUMEN & PENGATUR RENDER PRATINJAU
// ============================================================================
// perKelas: dokumen mengikuti tingkat kelas aktif (VII/VIII/IX di menu kiri)
const DOCS = {
    sampul:   { title: 'Sampul', icon: 'book-marked', fn: () => renderSampul() },
    pengantar:{ title: 'Kata Pengantar', icon: 'message-square-text', fn: () => renderPengantar() },
    landasan: { title: 'Landasan Penyusunan', icon: 'scale', fn: () => renderLandasan() },
    cp:       { title: 'Capaian Pembelajaran', icon: 'target', fn: () => renderCP() },
    tp:       { title: 'Tujuan Pembelajaran', icon: 'list-checks', fn: () => renderTP() },
    atp:      { title: 'Alur Tujuan Pembelajaran', icon: 'git-branch', fn: () => renderATP() },
    kalender: { title: 'Kalender Pendidikan', icon: 'calendar-days', fn: () => renderKalender() },
    minggu:   { title: 'Minggu Efektif', icon: 'calendar-check', perKelas: true, fn: t => renderMingguEfektif(t) },
    prota:    { title: 'Program Tahunan', icon: 'calendar-range', perKelas: true, fn: t => renderProta(t) },
    promes:   { title: 'Program Semester', icon: 'table-2', perKelas: true, fn: t => renderPromes(t) },
    modul:    { title: 'Modul Ajar', icon: 'notebook-pen', perKelas: true, fn: t => renderModul(t, true) },
    kktp:     { title: 'KKTP', icon: 'gauge', perKelas: true, fn: t => renderKKTP(t) },
    jurnal:   { title: 'Jurnal Mengajar', icon: 'notebook-tabs', perKelas: true, perSemester: true, fn: t => renderJurnal(t) },
    nilai:    { title: 'Daftar Nilai', icon: 'sheet', perKelas: true, perSemester: true, fn: t => renderNilai(t) },
    bundel:   { title: 'Bundel Lengkap', icon: 'library', fn: () => renderBundel() }
};

// Satu berkas berurutan seperti contoh perangkat: dokumen umum, lalu per kelas yang diampu
function renderBundel() {
    let segs = [].concat(renderSampul(), renderPengantar(), renderLandasan(), renderCP(), renderTP(), renderATP(), renderKalender());
    const list = diampuList().length ? diampuList() : [appState.tingkat];
    list.slice().reverse().forEach(t => {
        segs = segs.concat(renderMingguEfektif(t), renderProta(t), renderPromes(t), renderKKTP(t), modulUntuk(t).length ? renderModul(t, false) : []);
    });
    return segs;
}

let renderTimer = null;
let lastRenderMs = 0;
const RENDER_FAST_MS = 60;
const RENDER_TYPING_DELAY_MS = 250;

function renderSoon() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(flushRender, lastRenderMs < RENDER_FAST_MS ? 0 : RENDER_TYPING_DELAY_MS);
}
function flushRender() {
    if (renderTimer === null) return;
    clearTimeout(renderTimer);
    renderTimer = null;
    renderAll();
}
function flushPendingWork() {
    if (renderTimer !== null) flushRender();
    if (saveTimer !== null) { clearTimeout(saveTimer); saveTimer = null; saveStateNow(); }
}
window.addEventListener('pagehide', flushPendingWork);
window.addEventListener('beforeprint', flushPendingWork);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushPendingWork(); });

function renderAll() {
    clearTimeout(renderTimer);
    renderTimer = null;
    const t0 = performance.now();
    try { renderAllNow(); } catch (err) {
        console.error(err);
        document.getElementById('sheets-container').innerHTML = `<div class="empty-state"><p class="text-base font-bold text-rose-700">Dokumen gagal dibuat</p><p class="text-xs text-slate-600">${escapeHtml(err.message || String(err))}</p></div>`;
    } finally { lastRenderMs = performance.now() - t0; }
}

let fontsHooked = false;
function renderAllNow() {
    const mode = DOCS[appState.docMode] ? appState.docMode : 'sampul';
    const doc = DOCS[mode];
    const t = appState.tingkat;
    const paper = PAPER_SIZES[appState.setting.paper] || PAPER_SIZES.A4;
    document.getElementById('dynamic-print-style').textContent =
        `@page { size: ${paper.w}cm ${paper.h}cm; margin: 0; } @page lanskap { size: ${paper.h}cm ${paper.w}cm; margin: 0; }`;

    const segments = doc.fn(t);
    const sheets = paginateSegments(segments);
    const container = document.getElementById('sheets-container');
    container.replaceChildren(...sheets);

    const parts = [doc.title];
    if (doc.perKelas) parts.push('Kelas ' + t);
    if (doc.perSemester) parts.push('Semester ' + appState.semester);
    parts.push(sheets.length + ' halaman');
    document.getElementById('preview-summary-text').textContent = parts.join(' • ');

    // Font dokumen (Tinos, Inter) baru diunduh browser saat pertama dipakai → muat eksplisit,
    // lalu ukur ulang pembagian halaman setelah semuanya siap.
    if (!fontsHooked && document.fonts && document.fonts.load) {
        fontsHooked = true;
        Promise.all(['400 11pt Tinos', '700 11pt Tinos', 'italic 400 11pt Tinos', '400 11pt Inter', '600 11pt Inter', '700 11pt Inter', '800 11pt Inter']
            .map(f => document.fonts.load(f).catch(() => null)))
            .then(() => renderAll());
    }
    refreshIcons();
    refreshZoom();
    updateTabBadges();
    updateKelasInfo();
    const navSchool = document.getElementById('nav-school-name');
    if (navSchool) navSchool.textContent = appState.identitas.sekolah;
    saveStateSoon();
}
