// ============================================================================
// INISIALISASI, NAVIGASI, PILIHAN KELAS/SEMESTER & PENGIKAT FORM
// ============================================================================
function initApp() {
    renderThemeSelector();
    syncBoundInputs(document);
    document.getElementById('preview-logo').src = appState.identitas.logo;
    renderAllEditors();
    updateSegUI();
    renderAll();
    updateDocGalleryButton();
    refreshIcons();
}

function renderThemeSelector() {
    const sel = document.getElementById('sel-theme');
    if (sel) sel.innerHTML = Object.entries(DOC_THEMES).map(([k, v]) => `<option value="${k}">${escapeHtml(v.name)}</option>`).join('');
}

// Isi semua input ber-data-bind di dalam root dari appState
function syncBoundInputs(root) {
    root.querySelectorAll('[data-bind]').forEach(el => {
        const v = getPath(appState, el.dataset.bind);
        if (el.type === 'checkbox') el.checked = !!v;
        else el.value = v == null ? '' : v;
    });
    root.querySelectorAll('[data-bind-lines]').forEach(el => {
        const v = getPath(appState, el.dataset.bindLines);
        el.value = Array.isArray(v) ? v.join('\n') : '';
    });
    root.querySelectorAll('[data-bind-paras]').forEach(el => {
        const v = getPath(appState, el.dataset.bindParas);
        el.value = Array.isArray(v) ? v.join('\n\n') : '';
    });
}

// Satu pendengar untuk semua isian: tulis ke appState lalu render ulang (digabung bila mengetik cepat)
document.addEventListener('input', e => {
    const el = e.target;
    if (!el || !el.dataset || !el.closest('#left-sidebar')) return;
    const d = el.dataset;
    if (!d.bind && !d.bindLines && !d.bindParas) return;
    if (d.bind) {
        let v;
        if (el.type === 'checkbox') v = el.checked;
        else if (d.type === 'number') v = el.value === '' ? '' : Number(el.value);
        else v = el.value;
        setPath(appState, d.bind, v);
    } else if (d.bindLines) {
        setPath(appState, d.bindLines, el.value.split('\n').map(s => s.trim()).filter(Boolean));
    } else {
        setPath(appState, d.bindParas, el.value.split(/\n\s*\n/).map(s => s.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean));
    }
    if (d.rerender) scheduleEditorRefresh(d.rerender.split(','));
    renderSoon();
});

// Beberapa panel menampilkan angka turunan (jumlah JP, minggu efektif) → perbarui sesudah mengetik
let editorRefreshTimer = null;
const pendingEditorRefresh = new Set();
function scheduleEditorRefresh(names) {
    names.forEach(n => pendingEditorRefresh.add(n.trim()));
    clearTimeout(editorRefreshTimer);
    editorRefreshTimer = setTimeout(() => {
        const list = [...pendingEditorRefresh];
        pendingEditorRefresh.clear();
        list.forEach(n => { const fn = EDITOR_REFRESH[n]; if (fn) fn(); });
    }, 350);
}

// ---------- Kelas & semester aktif ----------
function setTingkat(t) {
    if (!TINGKAT.includes(t)) return;
    appState.tingkat = t;
    updateSegUI();
    renderAllEditors();
    renderAll();
}
function setSemester(s) {
    appState.semester = s === 2 ? 2 : 1;
    updateSegUI();
    renderAllEditors();
    renderAll();
}
function updateSegUI() {
    document.body.dataset.tingkat = appState.tingkat;
    TINGKAT.forEach(t => document.getElementById('seg-t-' + t)?.classList.toggle('is-active', appState.tingkat === t));
    [1, 2].forEach(s => document.getElementById('seg-s-' + s)?.classList.toggle('is-active', appState.semester === s));
    const pill = document.getElementById('nav-mode-pill');
    if (pill) pill.textContent = `Kelas ${appState.tingkat} • Smt ${appState.semester}`;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = { VII: '#2563eb', VIII: '#059669', IX: '#7c3aed' }[appState.tingkat];
}
function updateKelasInfo() {
    const el = document.getElementById('panel-desc');
    const meta = SECTION_META[currentTab];
    if (el && meta) el.textContent = (meta.perKelas ? `Kelas ${appState.tingkat} • ` : '') + meta.desc;
}

// ---------- Bagian pengaturan ----------
const SECTION_META = {
    identitas: { icon: 'building-2', title: 'Identitas & Kelas', desc: 'Sekolah, guru, kepala sekolah, kelas yang diampu' },
    teks:      { icon: 'file-pen-line', title: 'Pengantar & Landasan', desc: 'Kata pengantar dan dasar hukum penyusunan' },
    kurikulum: { icon: 'target', title: 'CP & Tujuan Pembelajaran', desc: 'Capaian per elemen dan daftar TP Fase D' },
    atp:       { icon: 'git-branch', title: 'ATP & Program Tahunan', desc: 'Urutan materi, kode TP, sub-bab & JP', perKelas: true },
    kalender:  { icon: 'calendar-days', title: 'Kalender & Minggu Efektif', desc: 'Agenda libur/kegiatan & aturan minggu efektif', perKelas: true },
    promes:    { icon: 'table-2', title: 'Program Semester', desc: 'Sebaran JP per minggu (otomatis + koreksi)', perKelas: true },
    modul:     { icon: 'notebook-pen', title: 'Modul Ajar', desc: 'Format Pembelajaran Mendalam', perKelas: true },
    kktp:      { icon: 'gauge', title: 'KKTP', desc: 'Deskripsi kriteria, rubrik, atau interval nilai per TP', perKelas: true },
    jurnal:    { icon: 'notebook-tabs', title: 'Jurnal Mengajar', desc: 'Catatan pelaksanaan per pertemuan', perKelas: true },
    nilai:     { icon: 'sheet', title: 'Daftar Nilai', desc: 'Rombel, murid, nilai TP, ASTS, ASAS/ASAT', perKelas: true }
};
// Dokumen yang paling relevan saat membuka bagian pengaturan tertentu
const SECTION_DOC = { teks: 'pengantar', kurikulum: 'tp', atp: 'prota', kalender: 'minggu', promes: 'promes', modul: 'modul', kktp: 'kktp', jurnal: 'jurnal', nilai: 'nilai' };
let currentTab = 'identitas';

function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById('tab-' + tabName);
    if (target) target.classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const active = btn.id === 'tab-btn-' + tabName;
        btn.classList.toggle('is-active', active);
        if (active) btn.setAttribute('aria-current', 'page'); else btn.removeAttribute('aria-current');
    });
    const meta = SECTION_META[tabName];
    if (meta) {
        document.getElementById('panel-title').textContent = meta.title;
        document.getElementById('panel-icon').innerHTML = `<i data-lucide="${meta.icon}" class="w-4 h-4"></i>`;
        updateKelasInfo();
        refreshIcons();
    }
    const body = document.querySelector('.sidebar-body');
    if (body) body.scrollTop = 0;
}

function openSection(tabName) {
    switchTab(tabName);
    if (appState.sidebarHidden) toggleSidebar();
    toggleNavDrawer(false);
    setMobileView('settings');
    const doc = SECTION_DOC[tabName];
    if (doc && appState.docMode !== doc && appState.docMode !== 'bundel') withPreviewLoading(() => setDocMode(doc));
}

const NAV_COLLAPSED_KEY = 'perangkat-nav-collapsed';
function setNavCollapsed(collapsed, save) {
    document.body.classList.toggle('nav-collapsed', collapsed);
    if (save) { try { localStorage.setItem(NAV_COLLAPSED_KEY, collapsed ? '1' : '0'); } catch (err) {} }
    updateWorkspaceCompactButton();
    setTimeout(() => refreshZoom(), 220);
}
function isWorkspaceExpanded() { return !document.body.classList.contains('nav-collapsed') && !appState.sidebarHidden; }
function toggleWorkspaceCompact() {
    const compact = isWorkspaceExpanded();
    setNavCollapsed(compact, true);
    toggleSidebar(compact);
}
function updateWorkspaceCompactButton() {
    const btn = document.getElementById('btn-workspace-compact');
    if (!btn) return;
    const expanded = isWorkspaceExpanded();
    btn.title = expanded ? 'Ciutkan menu & panel (pratinjau lebih lebar)' : 'Lebarkan menu & tampilkan panel';
    btn.classList.toggle('is-compact', !expanded);
}
function initNavCollapsed() {
    let saved = null;
    try { saved = localStorage.getItem(NAV_COLLAPSED_KEY); } catch (err) {}
    setNavCollapsed(saved === null ? window.innerWidth < 1280 : saved === '1', false);
}
function toggleNavDrawer(open) { document.body.classList.toggle('nav-open', !!open); }

// ---------- Pemilih dokumen ----------
function setDocMode(mode) {
    if (!DOCS[mode]) return;
    appState.docMode = mode;
    const sel = document.getElementById('doc-mode-select');
    if (sel) sel.value = mode;
    renderAll();
    updateDocGalleryButton();
    const wrapper = document.getElementById('preview-wrapper');
    if (wrapper) wrapper.scrollTo(0, 0);
}
function parseDocLabel(text) {
    const m = text.match(/^(\d+)\.\s*(.*?)(?:\s*\(([^)]*)\))?$/);
    return m ? { no: m[1], title: m[2], sub: m[3] || '' } : { no: '', title: text, sub: '' };
}
function getDocGroups() {
    return [...document.querySelectorAll('#doc-mode-select optgroup')].map(g => ({
        label: g.label.replace(/^[A-Z]\.\s*/, ''),
        letter: (g.label.match(/^([A-Z])\./) || [])[1] || '',
        docs: [...g.querySelectorAll('option')].map(o => Object.assign({ value: o.value }, parseDocLabel(o.textContent.trim())))
    }));
}
function renderDocGallery() {
    const panel = document.getElementById('doc-gallery');
    if (!panel) return;
    panel.innerHTML = getDocGroups().map(g => `
        <div class="doc-group">
            <div class="doc-group-title"><span>${escapeHtml(g.letter)}</span>${escapeHtml(g.label)}</div>
            <div class="doc-grid">
                ${g.docs.map(d => `
                <button onclick="closeMenus(); withPreviewLoading(() => setDocMode('${d.value}'))" class="doc-item${d.value === appState.docMode ? ' is-active' : ''}">
                    <span class="doc-icon"><i data-lucide="${(DOCS[d.value] || {}).icon || 'file-text'}" class="w-4 h-4"></i></span>
                    <span class="min-w-0">
                        <span class="doc-item-title">${escapeHtml(d.no)}. ${escapeHtml(d.title)}</span>
                        ${d.sub ? `<span class="doc-item-sub">${escapeHtml(d.sub)}</span>` : ''}
                    </span>
                </button>`).join('')}
            </div>
        </div>`).join('');
    refreshIcons();
}
function toggleDocGallery(ev) {
    const panel = document.getElementById('doc-gallery');
    if (panel && panel.classList.contains('hidden')) {
        renderDocGallery();
        const narrow = window.innerWidth < 640;
        const btn = document.getElementById('doc-gallery-btn');
        panel.style.position = narrow ? 'fixed' : '';
        panel.style.left = narrow ? '.75rem' : '';
        panel.style.right = narrow ? '.75rem' : '';
        panel.style.width = narrow ? 'auto' : '';
        panel.style.top = narrow && btn ? (btn.getBoundingClientRect().bottom + 6) + 'px' : '';
    }
    toggleMenu('doc-gallery', ev);
}
function updateDocGalleryButton() {
    const opt = document.querySelector(`#doc-mode-select option[value="${appState.docMode}"]`);
    const label = document.getElementById('doc-current-label');
    const icon = document.getElementById('doc-current-icon');
    if (!opt || !label || !icon) return;
    const d = parseDocLabel(opt.textContent.trim());
    label.innerHTML = `<span class="text-slate-400 font-medium">${escapeHtml(d.no)}.</span> ${escapeHtml(d.title)}`;
    icon.innerHTML = `<i data-lucide="${(DOCS[appState.docMode] || {}).icon || 'file-text'}" class="w-3.5 h-3.5"></i>`;
    refreshIcons();
}
function stepDocMode(delta) {
    const values = [...document.querySelectorAll('#doc-mode-select option')].map(o => o.value);
    const idx = values.indexOf(appState.docMode);
    const next = values[(idx + delta + values.length) % values.length];
    if (next) setDocMode(next);
}

// ---------- Logo & teks bawaan ----------
async function handleLogoUpload(event) {
    const input = event.target;
    const file = input.files[0];
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) { showToast(problem); input.value = ''; return; }
    try {
        const dataUrl = await compressImageFile(file, 600);
        appState.identitas.logo = dataUrl;
        document.getElementById('preview-logo').src = dataUrl;
        renderAll();
        showToast('Logo diperbarui.');
    } catch (err) {
        showToast(err.message || 'Gambar gagal diproses.');
    } finally { input.value = ''; }
}
function resetLogo() {
    appState.identitas.logo = DEFAULT_LOGO_SEKOLAH;
    document.getElementById('preview-logo').src = DEFAULT_LOGO_SEKOLAH;
    renderAll();
}
function resetPengantar() {
    appState.pengantar = DEFAULT_PENGANTAR;
    syncBoundInputs(document.getElementById('tab-teks'));
    renderAll();
}

// ---------- Tanda kelengkapan di menu ----------
function getTabStatus() {
    const filled = v => String(v ?? '').trim() !== '';
    const id = appState.identitas;
    const t = appState.tingkat;
    const st = {};
    st.identitas = [['sekolah', id.sekolah], ['guru', id.guru], ['NIP guru', id.nipGuru], ['kepala sekolah', id.kepsek], ['NIP kepala sekolah', id.nipKepsek], ['tahun pelajaran', id.tapel]]
        .filter(([, v]) => !filled(v)).map(([k]) => k);
    if (!diampuList().length) st.identitas.push('belum ada kelas yang diampu');
    st.teks = filled(appState.pengantar) ? [] : ['kata pengantar kosong'];
    st.kurikulum = appState.tp.length ? [] : ['belum ada TP'];
    st.atp = [];
    st.kalender = [];
    [1, 2].forEach(s => {
        const r = rencanaSemester(t, s);
        const me = mingguEfektif(t, s);
        if (!r.babs.length) st.atp.push(`semester ${s} belum ada materi`);
        else if (r.total !== me.totalJp) st.atp.push(`semester ${s}: rencana ${r.total} JP ≠ jam efektif ${me.totalJp} JP`);
    });
    if (!appState.agenda.length) st.kalender.push('agenda kosong');
    st.promes = [];
    [1, 2].forEach(s => { const mx = promesMatrix(t, s); if (mx.overflow > 0) st.promes.push(`semester ${s}: ${mx.overflow} JP tidak muat`); });
    st.modul = modulUntuk(t).length ? [] : ['belum ada modul untuk kelas ' + t];
    st.kktp = [];
    st.jurnal = [];
    st.nilai = appState.rombel.some(r => r.tingkat === t) ? [] : ['belum ada rombel kelas ' + t];
    return st;
}
