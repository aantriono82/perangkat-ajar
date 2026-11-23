// ============================================================================
// 24. UTILITAS ZOOM, MODAL PENGEMBANG & ESCAPE HTML
// ============================================================================
// Zoom memakai properti CSS `zoom` (bukan transform) supaya area gulir ikut membesar/mengecil
// dan sisi kiri lembar tidak terpotong saat dokumen lebih lebar dari layar.
// zoomFitMode: 'width' = pas lebar (bawaan), 'page' = satu halaman utuh terlihat, null = manual
let zoomFitMode = 'width';
const ZOOM_MIN = 0.25, ZOOM_MAX = 2;

function setZoom(value) {
    appState.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +value.toFixed(2)));
    applyZoom();
}

function adjustZoom(delta) {
    zoomFitMode = null;
    setZoom(appState.zoom + delta);
}

function resetZoom() {
    zoomFitMode = null;
    setZoom(1);
}

// Ukuran asli (zoom 100%) isi pratinjau dan ruang yang tersedia
function measurePreview() {
    const wrapper = document.getElementById('preview-wrapper');
    const container = document.getElementById('sheets-container');
    if (!wrapper || !container || !wrapper.clientWidth) return null;
    const firstSheet = container.querySelector('.print-sheet');
    const read = () => ({
        width: container.scrollWidth,
        sheetHeight: firstSheet ? firstSheet.offsetHeight : container.scrollHeight
    });
    // Browser modern (zoom CSS terstandar) memberi ukuran tanpa zoom, jadi cukup satu kali layout.
    // Mengubah zoom ke 1 lalu mengembalikannya memaksa 2× layout ulang seluruh dokumen
    // (±1 detik untuk ratusan kartu) — hanya dilakukan bila browser lama menghitung ukuran ber-zoom.
    let m = read();
    const z = parseFloat(container.style.zoom) || 1;
    if (z !== 1 && firstSheet && Math.abs(firstSheet.getBoundingClientRect().width - firstSheet.offsetWidth * z) > 2) {
        const prev = container.style.zoom;
        container.style.zoom = '1';
        m = read();
        container.style.zoom = prev;
    }
    const cs = getComputedStyle(wrapper);
    m.availW = wrapper.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    m.availH = wrapper.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    return m.width > 0 ? m : null;
}

function fitZoom() {
    zoomFitMode = 'width';
    const m = measurePreview();
    if (m) setZoom(Math.floor(Math.min(1, m.availW / m.width) * 100) / 100);
    else applyZoom();
}

function fitPageZoom() {
    zoomFitMode = 'page';
    const m = measurePreview();
    if (m) setZoom(Math.floor(Math.min(1, m.availW / m.width, m.availH / m.sheetHeight) * 100) / 100);
    else applyZoom();
}

function applyZoom() {
    const container = document.getElementById('sheets-container');
    const zoomText = String(appState.zoom);
    if (container.style.zoom !== zoomText) container.style.zoom = zoomText;
    document.getElementById('zoom-label').textContent = Math.round(appState.zoom * 100) + '%';
    const fitBtn = document.getElementById('zoom-fit-btn');
    if (fitBtn) fitBtn.classList.toggle('is-active', zoomFitMode === 'width');
    const pageBtn = document.getElementById('zoom-page-btn');
    if (pageBtn) pageBtn.classList.toggle('is-active', zoomFitMode === 'page');
    updatePageIndicator();
}

// Dipanggil setelah dokumen dirender / ukuran jendela berubah
function refreshZoom() {
    if (zoomFitMode === 'width') fitZoom();
    else if (zoomFitMode === 'page') fitPageZoom();
    else applyZoom();
}

// ---------- Penunjuk halaman "Hal X / N" ----------
function getSheets() {
    return [...document.querySelectorAll('#sheets-container .print-sheet')];
}

function currentSheetIndex() {
    const wrapper = document.getElementById('preview-wrapper');
    const sheets = getSheets();
    if (!wrapper || !sheets.length) return -1;
    const line = wrapper.getBoundingClientRect().top + wrapper.clientHeight * 0.35;
    let idx = 0;
    sheets.forEach((sh, i) => { if (sh.getBoundingClientRect().top <= line) idx = i; });
    return idx;
}

function updatePageIndicator() {
    const el = document.getElementById('page-indicator');
    if (!el) return;
    const total = getSheets().length;
    el.textContent = total ? `${currentSheetIndex() + 1} / ${total}` : '–';
}

function gotoSheet(delta) {
    const wrapper = document.getElementById('preview-wrapper');
    const sheets = getSheets();
    if (!wrapper || !sheets.length) return;
    const target = sheets[Math.min(sheets.length - 1, Math.max(0, currentSheetIndex() + delta))];
    const offset = target.getBoundingClientRect().top - wrapper.getBoundingClientRect().top;
    wrapper.scrollTo({ top: wrapper.scrollTop + offset - 32, behavior: 'smooth' });
}

function initPreviewInteractions() {
    const wrapper = document.getElementById('preview-wrapper');
    if (!wrapper) return;
    let ticking = false;
    wrapper.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => { ticking = false; updatePageIndicator(); });
    }, { passive: true });
    // Ctrl/⌘ + roda tetikus = perbesar/perkecil pratinjau (bukan seluruh halaman browser)
    wrapper.addEventListener('wheel', e => {
        if (!(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();
        adjustZoom(e.deltaY < 0 ? 0.1 : -0.1);
    }, { passive: false });
}

// ---------- Baris kosong yang ramah untuk tabel editor ----------
function emptyRowHTML(colspan, icon, title, hint, actionsHTML) {
    return `<tr><td colspan="${colspan}" class="p-0">
        <div class="empty-state-row">
            <span class="empty-icon"><i data-lucide="${icon}" class="w-5 h-5"></i></span>
            <div class="text-xs font-semibold text-slate-700">${title}</div>
            <div class="text-[11px] text-slate-500 max-w-[260px]">${hint}</div>
            ${actionsHTML ? `<div class="flex flex-wrap justify-center gap-1.5 mt-1">${actionsHTML}</div>` : ''}
        </div>
    </td></tr>`;
}

// ---------- Indikator "Menyiapkan dokumen…" untuk render yang lambat ----------
// Lapisan baru terlihat setelah ±150 ms (lihat .preview-loading di app.css),
// jadi dokumen yang cepat dirender tidak berkedip.
function withPreviewLoading(fn) {
    const el = document.getElementById('preview-loading');
    if (!el) { fn(); return; }
    el.classList.add('is-on');
    requestAnimationFrame(() => setTimeout(() => {
        try { fn(); } finally { el.classList.remove('is-on'); }
    }, 0));
}

function updateTabBadges() {
    let status;
    try { status = getTabStatus(); } catch (err) { return; }
    Object.entries(status).forEach(([tab, problems]) => {
        const btn = document.getElementById('tab-btn-' + tab);
        if (!btn) return;
        let badge = btn.querySelector('.tab-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'tab-badge';
            btn.appendChild(badge);
        }
        const ok = problems.length === 0;
        badge.classList.toggle('is-ok', ok);
        badge.classList.toggle('is-warn', !ok);
        badge.textContent = ok ? '✓' : '!';
        const name = btn.textContent.replace(/[✓!]/g, '').trim();
        badge.title = '';
        btn.title = ok ? `${name}: lengkap` : `${name}: perlu dilengkapi — ${problems.join(', ')}`;
    });
}

// ---------- Tema terang / gelap (hanya antarmuka; dokumen tetap putih) ----------
function toggleTheme() {
    const dark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('perangkat-theme', dark ? 'dark' : 'light'); } catch (err) {}
}

// ---------- Menu tarik-turun di header ----------
function toggleMenu(id, ev) {
    if (ev) ev.stopPropagation();
    const menu = document.getElementById(id);
    const willOpen = menu.classList.contains('hidden');
    closeMenus();
    if (!willOpen) return;
    menu.classList.remove('hidden');
    // Menu samping sidebar: posisikan fixed agar tidak terpotong overflow sidebar (desktop)
    if (menu.classList.contains('menu-side')) {
        if (window.matchMedia('(min-width: 1024px)').matches) {
            const btn = menu.parentElement.querySelector('button');
            const nav = document.getElementById('app-nav');
            const r = btn.getBoundingClientRect();
            const top = Math.max(8, Math.min(r.top, window.innerHeight - menu.offsetHeight - 8));
            Object.assign(menu.style, { position: 'fixed', top: top + 'px', left: (nav.getBoundingClientRect().right + 8) + 'px', bottom: 'auto' });
        } else {
            menu.style.cssText = '';
        }
    }
}

function closeMenus() {
    document.querySelectorAll('.menu-panel').forEach(m => m.classList.add('hidden'));
}

document.addEventListener('click', e => { if (!e.target.closest('[data-menu]')) closeMenus(); });
window.addEventListener('resize', closeMenus);
document.getElementById('app-nav')?.addEventListener('scroll', closeMenus);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenus(); toggleNavDrawer(false); } });

// ---------- Layar kecil: Pengaturan / Pratinjau ----------
function setMobileView(view) {
    document.body.dataset.mview = view;
    ['settings', 'preview'].forEach(v => {
        const b = document.getElementById('mview-' + v);
        if (b) b.classList.toggle('is-active', v === view);
    });
    if (view === 'preview') requestAnimationFrame(refreshZoom);
}

// ---------- Petunjuk di tab Mode yang bisa ditutup ----------
const INTRO_TIP_KEY = 'perangkat-intro-tip-hidden';
function dismissIntroTip() {
    const el = document.getElementById('intro-tip');
    if (el) el.classList.add('hidden');
    try { localStorage.setItem(INTRO_TIP_KEY, '1'); } catch (err) {}
}
function applyIntroTipState() {
    let hidden = false;
    try { hidden = localStorage.getItem(INTRO_TIP_KEY) === '1'; } catch (err) {}
    const el = document.getElementById('intro-tip');
    if (el && hidden) el.classList.add('hidden');
}

let toastTimer = null;
function showToast(msg, durationMs) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    document.getElementById('toast-msg').textContent = msg;
    toast.classList.remove('opacity-0');
    // Toast baru memperpanjang tampilan; timer toast sebelumnya tidak boleh menutupnya lebih awal.
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('opacity-0'), durationMs || 2800);
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.addEventListener('load', function () {
    let restored = loadSavedState();
    try {
        initApp();
    } catch (err) {
        if (!restored) throw err;
        // Data tersimpan tidak bisa ditampilkan: jangan biarkan aplikasi macet setiap dibuka.
        // Data lama TIDAK ditimpa sampai pengguna sempat mengunduhnya.
        console.error('Data tersimpan gagal ditampilkan:', err);
        restored = false;
        offerBrokenStateRecovery(safeStorageGet(STORAGE_KEY), err);
    }
    switchTab('identitas');
    initNavCollapsed();
    applyIntroTipState();
    initPreviewInteractions();
    setMobileView('settings');
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { if (zoomFitMode) refreshZoom(); }, 120);
    });
    if (restored) showToast("Data terakhir dipulihkan dari penyimpanan browser.");
    // Muat pustaka Excel di latar saat browser senggang, agar siap ketika tombol Excel ditekan
    const preload = () => ensureXLSX().catch(() => {});
    if ('requestIdleCallback' in window) requestIdleCallback(preload, { timeout: 3000 });
    else setTimeout(preload, 1500);
});

function offerBrokenStateRecovery(raw, err) {
    storagePaused = 'data-rusak';
    appState = createDefaultState();
    initApp();
    setAutosaveStatus('Simpan otomatis ditahan — data lama bermasalah', false);
    showChoiceDialog({
        title: 'Data tersimpan tidak dapat dibuka',
        html: 'Data di browser ini tidak bisa ditampilkan (' + escapeHtml(err && err.message || 'format tidak dikenal') + '). '
            + 'Aplikasi sementara memakai <b>data contoh</b> dan <b>belum menimpa</b> data lama.<br><br>'
            + 'Unduh data lama sebagai cadangan (.json) agar bisa diperiksa atau dimuat lagi lewat <i>Data &amp; Backup → Muat Backup</i>.',
        buttons: [
            { label: 'Unduh data lama lalu lanjut', value: 'unduh', primary: true },
            { label: 'Lanjut tanpa mengunduh', value: 'lanjut' }
        ]
    }).then(v => {
        if (v === null) { showToast('Simpan otomatis masih ditahan. Muat ulang halaman untuk memilih lagi.', 6000); return; }
        if (v === 'unduh' && raw) {
            const a = document.createElement('a');
            const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
            a.href = url;
            a.download = 'Data_Lama_Perangkat_Ajar.json';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
        storagePaused = null;
        setAutosaveStatus('Simpan otomatis aktif', true);
        saveStateNow();
    });
}

// Dialog pilihan sederhana (pengganti confirm() yang hanya punya 2 tombol).
// buttons: [{ label, value, primary }] — mengembalikan Promise berisi value tombol yang diklik.
function showChoiceDialog({ title, html, buttons }) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 text-sm text-slate-700">
                <h3 class="text-base font-bold text-slate-900 mb-2"></h3>
                <div class="max-h-[50vh] overflow-y-auto text-xs leading-relaxed">${html || ''}</div>
                <div class="mt-4 flex flex-wrap justify-end gap-2" data-buttons></div>
            </div>`;
        overlay.querySelector('h3').textContent = title || '';
        const close = value => {
            document.removeEventListener('keydown', onKey);
            overlay.remove();
            resolve(value);
        };
        const onKey = e => { if (e.key === 'Escape') close(null); };
        const bar = overlay.querySelector('[data-buttons]');
        (buttons || [{ label: 'OK', value: true, primary: true }]).forEach(b => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = b.label;
            btn.className = b.primary
                ? 'bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer';
            btn.onclick = () => close(b.value);
            bar.appendChild(btn);
        });
        overlay.addEventListener('click', e => { if (e.target === overlay) close(null); });
        document.addEventListener('keydown', onKey);
        document.body.appendChild(overlay);
        const primary = bar.querySelector('button');
        if (primary) primary.focus();
    });
}
