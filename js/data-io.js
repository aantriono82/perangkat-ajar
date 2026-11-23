// ============================================================================
// BACKUP & PULIHKAN (.json)
// ============================================================================
function saveConfigJSON() {
    flushPendingWork();
    const data = Object.assign({ _app: 'perangkat-pembelajaran', _versi: 1, _disimpan: new Date().toISOString() }, appState);
    const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safe = s => String(s || '').replace(/[\\/:*?"<>|\s]+/g, '_');
    a.href = url;
    a.download = `Backup_Perangkat_${safe(appState.identitas.mapel)}_${safe(appState.identitas.tapel)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Backup tersimpan. Simpan berkas ini di tempat aman.');
}

function loadConfigJSON(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { showToast('Berkas terlalu besar untuk backup aplikasi ini.'); return; }
    const reader = new FileReader();
    reader.onload = e => {
        const previous = JSON.stringify(appState);
        try {
            const raw = JSON.parse(e.target.result);
            if (raw && raw._app && raw._app !== 'perangkat-pembelajaran') throw new Error('Berkas ini backup dari aplikasi lain.');
            appState = sanitizeLoadedState(raw);
            initApp();
            // Memuat backup = pilihan sadar pengguna → simpan walau sebelumnya ditahan
            if (storagePaused) { storagePaused = null; setAutosaveStatus('Simpan otomatis aktif', true); }
            saveStateNow();
            showToast('Backup berhasil dimuat.');
        } catch (err) {
            appState = JSON.parse(previous);
            initApp();
            showToast('Backup ditolak: ' + (err.message || 'format tidak dikenal'), 6000);
        }
    };
    reader.readAsText(file);
}
