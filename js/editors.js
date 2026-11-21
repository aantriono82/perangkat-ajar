// ============================================================================
// EDITOR PANEL PENGATURAN (dibangun ulang dari appState saat struktur berubah)
// Isian biasa memakai data-bind="jalur.data" (lihat ui.js); isian khusus memakai
// handler sendiri karena kuncinya mengandung titik (mis. kode TP "A.7").
// ============================================================================
const ea = s => escapeHtml(s == null ? '' : s);
function inp(path, o) {
    o = o || {};
    return `<input class="inp ${o.cls || ''}" ${o.type ? `type="${o.type}"` : ''} ${o.number ? 'data-type="number"' : ''} data-bind="${path}" ${o.rerender ? `data-rerender="${o.rerender}"` : ''} placeholder="${ea(o.ph || '')}" ${o.attrs || ''}>`;
}
function area(path, rows, o) {
    o = o || {};
    return `<textarea class="inp ${o.cls || ''}" rows="${rows}" data-bind="${path}" ${o.rerender ? `data-rerender="${o.rerender}"` : ''} placeholder="${ea(o.ph || '')}"></textarea>`;
}
function lbl(text, inner, cls) { return `<div class="${cls || ''}"><label class="field-label mb-1">${text}</label>${inner}</div>`; }
const icon = (n, c) => `<i data-lucide="${n}" class="${c || 'w-3.5 h-3.5'}"></i>`;

function mount(id, html) {
    const el = document.getElementById(id);
    if (!el) return null;
    el.innerHTML = html;
    syncBoundInputs(el);
    refreshIcons();
    return el;
}

function renderAllEditors() {
    renderKelasEditor();
    renderCPEditor();
    renderTPEditor();
    renderATPEditor();
    renderAgendaEditor();
    renderKalSummary();
    renderPromesEditor();
    renderModulEditor();
    renderKKTPEditor();
    renderJurnalEditor();
    renderNilaiEditor();
}

const EDITOR_REFRESH = {
    atpsum: () => { renderATPSummaries(); renderKalSummary(); renderPromesEditor(); },
    kalsum: () => { renderKalSummary(); renderATPSummaries(); renderPromesEditor(); },
    kalender: () => { renderKalSummary(); renderATPSummaries(); renderPromesEditor(); },
    kelas: () => { renderATPSummaries(); renderKalSummary(); renderPromesEditor(); },
    tp: () => { renderKKTPEditor(); renderNilaiEditor(); },
    nilai: () => renderNilaiEditor()
};

// ---------- Kelas diampu ----------
function renderKelasEditor() {
    mount('ed-kelas', `<table class="ed-table"><thead><tr><th>Kelas</th><th>Diampu</th><th>Rombel (tampil di dokumen)</th><th style="width:70px">JP/minggu</th></tr></thead><tbody>
        ${TINGKAT.map(t => `<tr><td class="font-bold">${t}</td><td style="text-align:center"><input type="checkbox" data-bind="kelas.${t}.diampu"></td>
        <td>${inp(`kelas.${t}.rombel`, { cls: 'inp-sm', ph: t + '.A, B' })}</td><td>${inp(`kelas.${t}.jp`, { cls: 'inp-sm inp-num', type: 'number', number: true, rerender: 'kelas', attrs: 'min="1" max="10"' })}</td></tr>`).join('')}
    </tbody></table>`);
}

// ---------- CP ----------
function renderCPEditor() {
    mount('ed-cp', `
        <details class="mb-2"><summary class="cursor-pointer text-xs font-semibold text-slate-700 py-1">Rasional & tujuan mata pelajaran</summary>
            <div class="space-y-2 mt-2">
                ${lbl('Dasar CP', area('cp.dasar', 3))}
                <div><label class="field-label mb-1">Rasional (pisahkan paragraf dengan baris kosong)</label><textarea class="inp" rows="10" data-bind-paras="cp.rasional"></textarea></div>
                <div><label class="field-label mb-1">Tujuan mata pelajaran (satu per baris)</label><textarea class="inp" rows="8" data-bind-lines="cp.tujuan"></textarea></div>
            </div>
        </details>
        ${ELEMEN.map(e => `<details class="border-t border-slate-100 py-1.5"><summary class="cursor-pointer text-xs font-semibold text-slate-700">${e.kode} — ${ea(e.nama)}</summary>
            <div class="space-y-2 mt-2">${lbl('Capaian pembelajaran', area(`cp.capaian.${e.kode}.teks`, 7))}${lbl('Konten/konsep utama', area(`cp.capaian.${e.kode}.konsep`, 2))}</div></details>`).join('')}`);
}

// ---------- TP ----------
function renderTPEditor() {
    const opts = ELEMEN.map(e => `<option value="${e.kode}">${e.kode} – ${ea(e.nama)}</option>`).join('');
    mount('ed-tp', appState.tp.length ? appState.tp.map((x, i) => `
        <div class="border border-slate-200 rounded-lg p-2 mb-2 space-y-1.5">
            <div class="flex gap-1.5 items-center">
                <div style="width:62px">${inp(`tp.${i}.kode`, { cls: 'inp-sm font-bold', rerender: 'tp' })}</div>
                <select class="inp inp-sm" style="width:118px" data-bind="tp.${i}.elemen">${opts}</select>
                <div class="flex-1">${inp(`tp.${i}.materi`, { cls: 'inp-sm', ph: 'Materi' })}</div>
                <div style="width:54px">${inp(`tp.${i}.jp`, { cls: 'inp-sm inp-num', type: 'number', number: true })}</div>
                <button class="btn-icon danger" title="Hapus TP" onclick="removeTP(${i})">${icon('trash-2')}</button>
            </div>
            ${area(`tp.${i}.tujuan`, 2, { cls: 'inp-sm' })}
        </div>`).join('') : '<p class="hint">Belum ada tujuan pembelajaran.</p>');
}
function addTP() {
    const el = 'A';
    const n = appState.tp.filter(x => x.elemen === el).length + 1;
    appState.tp.push({ id: uid('tp'), elemen: el, kode: `${el}.${n}`, tujuan: '', materi: '', jp: 10 });
    renderTPEditor(); renderAll();
}
function removeTP(i) {
    if (!confirm(`Hapus TP ${appState.tp[i].kode}?`)) return;
    appState.tp.splice(i, 1);
    renderTPEditor(); renderKKTPEditor(); renderAll();
}

// ---------- TP: template Excel & impor ----------
const TP_HEADER = ['No', 'Elemen', 'Kode TP', 'Tujuan Pembelajaran', 'Materi', 'JP'];
function downloadTPTemplate() {
    if (!ensureXLSX()) return;
    try {
        const name = buildTPTemplate();
        showToast(`Template diunduh: ${name} (lihat folder Unduhan/Downloads).`, 6000);
    } catch (err) {
        console.error(err);
        showToast('Template gagal dibuat: ' + (err && err.message || err), 8000);
    }
}
function buildTPTemplate() {
    const order = ELEMEN.map(e => e.kode);
    const list = appState.tp.slice().sort((a, b) => order.indexOf(a.elemen) - order.indexOf(b.elemen));
    const rows = [TP_HEADER].concat(list.length
        ? list.map((x, i) => [i + 1, x.elemen || '', x.kode || '', x.tujuan || '', x.materi || '', Number(x.jp) || 0])
        : [[1, 'B', 'B.1', 'Murid dapat ...', 'Nama materi', 10]]);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 5 }, { wch: 9 }, { wch: 9 }, { wch: 90 }, { wch: 32 }, { wch: 6 }];
    ws['!autofilter'] = { ref: `A1:F${rows.length}` };
    XLSX.utils.book_append_sheet(wb, ws, 'TP');

    const petunjuk = [
        ['PETUNJUK PENGISIAN TEMPLATE TUJUAN PEMBELAJARAN'],
        [],
        ['1.', 'Isi lembar "TP": satu baris = satu tujuan pembelajaran. Jangan mengubah baris judul (baris 1).'],
        ['2.', 'Kolom Elemen diisi kode elemen (lihat daftar di bawah). Boleh juga nama elemennya, mis. "Aljabar".'],
        ['3.', 'Kolom Kode TP, mis. A.7. Bila dikosongkan, kode dibuat otomatis (elemen + nomor urut).'],
        ['4.', 'Kolom JP diisi angka (jam pelajaran). Kolom No boleh dikosongkan.'],
        ['5.', 'Baris yang kolom Tujuan Pembelajaran-nya kosong diabaikan.'],
        ['6.', 'Simpan sebagai .xlsx, lalu di aplikasi: CP & TP → Impor Excel. Isi file MENGGANTI daftar TP di aplikasi.'],
        ['7.', 'Kode TP yang sama dengan sebelumnya tetap terhubung ke ATP, KKTP, dan Daftar Nilai.'],
        [],
        ['Kode', 'Elemen']
    ].concat(ELEMEN.map(e => [e.kode, e.nama]));
    const wsP = XLSX.utils.aoa_to_sheet(petunjuk);
    wsP['!cols'] = [{ wch: 6 }, { wch: 110 }];
    XLSX.utils.book_append_sheet(wb, wsP, 'Petunjuk');

    const cpRows = [['Kode', 'Elemen', 'Capaian Pembelajaran (acuan merumuskan TP)']]
        .concat(ELEMEN.map(e => [e.kode, e.nama, ((appState.cp.capaian || {})[e.kode] || {}).teks || '']));
    const wsC = XLSX.utils.aoa_to_sheet(cpRows);
    wsC['!cols'] = [{ wch: 6 }, { wch: 24 }, { wch: 120 }];
    XLSX.utils.book_append_sheet(wb, wsC, 'Acuan CP');

    const safe = s => String(s || '').replace(/[\\/:*?"<>|\s]+/g, '_');
    const name = `Template_TP_${safe(appState.identitas.mapel) || 'Mapel'}.xlsx`;
    XLSX.writeFile(wb, name);
    return name;
}

function tpElemenFrom(v) {
    const s = String(v || '').trim();
    if (!s) return '';
    const up = s.toUpperCase();
    const byKode = ELEMEN.find(e => e.kode === up || up.startsWith(e.kode + ' ') || up.startsWith(e.kode + '–') || up.startsWith(e.kode + '-'));
    if (byKode) return byKode.kode;
    const byNama = ELEMEN.find(e => e.nama.toLowerCase() === s.toLowerCase() || s.toLowerCase().includes(e.nama.toLowerCase()));
    return byNama ? byNama.kode : '';
}

// Ubah larik baris Excel (header di baris mana pun) menjadi daftar TP. Melempar Error bila format salah.
function parseTPRows(aoa) {
    const norm = c => String(c == null ? '' : c).trim().toLowerCase();
    const hi = aoa.findIndex(r => r.some(c => /^tujuan/.test(norm(c))));
    if (hi < 0) throw new Error('kolom "Tujuan Pembelajaran" tidak ditemukan');
    const h = aoa[hi].map(norm);
    const col = re => h.findIndex(c => re.test(c));
    const ci = { elemen: col(/^elemen/), kode: col(/^kode/), tujuan: col(/^tujuan/), materi: col(/^materi/), jp: col(/^(jp|jam|alokasi)/) };
    const get = (r, k) => ci[k] >= 0 ? String(r[ci[k]] == null ? '' : r[ci[k]]).trim() : '';
    const out = [], errors = [], seen = new Set();
    aoa.slice(hi + 1).forEach((r, idx) => {
        const tujuan = get(r, 'tujuan').replace(/\s*\n\s*/g, ' ');
        if (!tujuan) return;
        const line = hi + idx + 2;
        let kode = get(r, 'kode').toUpperCase().replace(/\s+/g, '');
        const elemen = tpElemenFrom(get(r, 'elemen')) || tpElemenFrom(kode.split('.')[0]);
        if (!elemen) { errors.push(`baris ${line}: elemen tidak dikenal`); return; }
        if (!kode) {
            let n = out.filter(x => x.elemen === elemen).length + 1;
            while (seen.has(`${elemen}.${n}`)) n++;
            kode = `${elemen}.${n}`;
        }
        if (seen.has(kode)) { errors.push(`baris ${line}: kode ${kode} ganda`); return; }
        seen.add(kode);
        const jp = Number(String(get(r, 'jp')).replace(',', '.').replace(/[^\d.]/g, ''));
        out.push({ elemen, kode, tujuan, materi: get(r, 'materi'), jp: Number.isFinite(jp) ? jp : 0 });
    });
    if (errors.length) throw new Error(errors.slice(0, 5).join('; ') + (errors.length > 5 ? ` (+${errors.length - 5} lagi)` : ''));
    if (!out.length) throw new Error('tidak ada TP yang terisi');
    return out;
}

function importTPExcel(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file || !ensureXLSX()) return;
    const reader = new FileReader();
    reader.onload = e => {
        let list;
        try {
            const wb = XLSX.read(e.target.result, { type: 'array' });
            const name = wb.SheetNames.find(n => /^tp$/i.test(n.trim())) || wb.SheetNames[0];
            list = parseTPRows(XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' }));
        } catch (err) { console.error(err); showToast('Impor TP gagal: ' + (err.message || 'berkas tidak terbaca'), 7000); return; }
        const old = new Map(appState.tp.map(x => [x.kode, x]));
        const baru = list.filter(x => !old.has(x.kode)).length;
        const hapus = appState.tp.filter(x => !list.some(y => y.kode === x.kode)).length;
        const msg = `File berisi ${list.length} TP (${list.length - baru} diperbarui, ${baru} baru` +
            (hapus ? `, ${hapus} TP lama yang tidak ada di file akan DIHAPUS` : '') + `).\n\nGanti daftar TP dengan isi file?`;
        if (!confirm(msg)) return;
        appState.tp = list.map(x => Object.assign({ id: (old.get(x.kode) || {}).id || uid('tp') }, x));
        renderTPEditor(); renderKKTPEditor(); renderNilaiEditor(); renderAll();
        showToast(`${list.length} tujuan pembelajaran diimpor.`);
    };
    reader.readAsArrayBuffer(file);
}

// ---------- ATP & Prota ----------
function atpSummaryHTML(t, s) {
    const r = rencanaSemester(t, s);
    const me = mingguEfektif(t, s);
    const diff = me.totalJp - r.total;
    return `<div class="stat-row">
        <div class="stat"><b>${r.total} JP</b><span>Direncanakan</span></div>
        <div class="stat"><b>${me.totalJp} JP</b><span>Jam efektif (${me.efektif} mg × ${me.jp})</span></div>
        <div class="stat ${diff === 0 ? 'ok' : 'warn'}"><b>${diff === 0 ? 'Pas' : (diff > 0 ? '+' + diff : diff) + ' JP'}</b><span>${diff === 0 ? 'Sesuai' : diff > 0 ? 'Sisa (tambah materi/cadangan)' : 'Kurangi JP'}</span></div>
    </div>`;
}
function renderATPSummaries() {
    [1, 2].forEach(s => { const el = document.getElementById('atp-sum-' + s); if (el) el.innerHTML = atpSummaryHTML(appState.tingkat, s); });
}
function renderATPEditor() {
    const t = appState.tingkat;
    const html = [1, 2].map(s => {
        const babs = appState.atp[t][s] || [];
        const base = `atp.${t}.${s}`;
        return `<div class="card space-y-2.5">
            <div class="flex items-center justify-between"><div class="card-title">${icon('calendar-range', 'w-4 h-4 accent-text')} Kelas ${t} • Semester ${s}</div>
                <button class="btn btn-primary" onclick="addBab('${s}')">${icon('plus')} Bab</button></div>
            <div id="atp-sum-${s}">${atpSummaryHTML(t, s)}</div>
            <div class="grid grid-cols-2 gap-2">
                ${lbl('Remidi/Pengayaan (JP)', inp(`alokasi.${t}.${s}.remidi`, { type: 'number', number: true, rerender: 'atpsum', cls: 'inp-sm' }))}
                ${lbl('Cadangan (JP)', inp(`alokasi.${t}.${s}.cadangan`, { type: 'number', number: true, rerender: 'atpsum', cls: 'inp-sm' }))}
            </div>
            ${babs.map((b, i) => `<div class="bab-card space-y-1.5">
                <div class="flex items-center gap-1.5">
                    <span class="bab-num">${babNumber(t, s, i)}</span>
                    <div class="flex-1">${inp(`${base}.${i}.materi`, { cls: 'inp-sm font-semibold', ph: 'Materi pokok / judul bab' })}</div>
                    <button class="btn-icon" title="Naik" onclick="moveBab('${s}',${i},-1)">${icon('arrow-up')}</button>
                    <button class="btn-icon" title="Turun" onclick="moveBab('${s}',${i},1)">${icon('arrow-down')}</button>
                    <button class="btn-icon danger" title="Hapus bab" onclick="removeBab('${s}',${i})">${icon('trash-2')}</button>
                </div>
                <div class="grid grid-cols-3 gap-1.5">
                    ${lbl('Kode TP', inp(`${base}.${i}.kodeTp`, { cls: 'inp-sm', ph: 'A.7, G.5', rerender: 'tp' }), 'col-span-2')}
                    ${lbl('Asesmen harian (JP)', inp(`${base}.${i}.ash`, { cls: 'inp-sm inp-num', type: 'number', number: true, rerender: 'atpsum' }))}
                </div>
                <table class="ed-table"><thead><tr><th>Sub-bab</th><th style="width:58px">JP</th><th style="width:28px"></th></tr></thead><tbody>
                    ${(b.subbab || []).map((x, j) => `<tr><td>${inp(`${base}.${i}.subbab.${j}.nama`, { cls: 'inp-sm' })}</td><td>${inp(`${base}.${i}.subbab.${j}.jp`, { cls: 'inp-sm inp-num', type: 'number', number: true, rerender: 'atpsum' })}</td>
                        <td><button class="btn-icon danger" title="Hapus" onclick="removeSubbab('${s}',${i},${j})">${icon('x')}</button></td></tr>`).join('')}
                </tbody></table>
                <div class="flex justify-between items-center"><button class="btn" onclick="addSubbab('${s}',${i})">${icon('plus')} Sub-bab</button><span class="hint">Total bab: <b>${babJp(b)} JP</b></span></div>
            </div>`).join('') || '<p class="hint">Belum ada bab. Tekan "+ Bab".</p>'}
        </div>`;
    }).join('');
    mount('ed-atp', `<p class="hint px-1">Urutan bab = urutan ATP, Prota, dan Program Semester. JP bab = jumlah JP sub-bab. Untuk kelas lain, pilih VII/VIII/IX di menu kiri.</p>` + html);
}
function atpList(s) { return appState.atp[appState.tingkat][s]; }
function afterAtpChange() { renderATPEditor(); renderPromesEditor(); renderKalSummary(); renderKKTPEditor(); renderModulEditor(); renderAll(); }
function addBab(s) { atpList(s).push({ id: uid('bab'), materi: 'Bab baru', kodeTp: '', ash: 2, subbab: [{ nama: 'Sub-bab 1', jp: 5 }] }); afterAtpChange(); }
function removeBab(s, i) { if (!confirm(`Hapus bab "${atpList(s)[i].materi}"?`)) return; atpList(s).splice(i, 1); afterAtpChange(); }
function moveBab(s, i, d) { const l = atpList(s); const j = i + d; if (j < 0 || j >= l.length) return; [l[i], l[j]] = [l[j], l[i]]; afterAtpChange(); }
function addSubbab(s, i) { atpList(s)[i].subbab.push({ nama: '', jp: 5 }); afterAtpChange(); }
function removeSubbab(s, i, j) { atpList(s)[i].subbab.splice(j, 1); afterAtpChange(); }

// ---------- Kalender ----------
function renderKalSummary() {
    const t = appState.tingkat;
    mount('kal-summary', [1, 2].map(s => {
        const me = mingguEfektif(t, s);
        return `<div class="mt-2"><div class="text-xs font-bold text-slate-700 mb-1">Kelas ${t} • Semester ${s}</div>
            <div class="stat-row mb-1.5"><div class="stat"><b>${me.efektif}/${me.total}</b><span>minggu efektif</span></div><div class="stat"><b>${me.totalJp} JP</b><span>jam efektif</span></div><div class="stat"><b>${me.tidak}</b><span>minggu tidak efektif</span></div></div>
            <table class="ed-table kal-table"><colgroup><col style="width:5.4rem"><col style="width:3.9rem"><col style="width:3.9rem"><col></colgroup><thead><tr><th>Bulan</th><th>Mgg</th><th>Efektif</th><th>Keterangan</th></tr></thead><tbody>
            ${me.bulan.map(b => `<tr><td>${b.nama}</td>
                <td class="${b.manualTotal ? 'ovr' : ''}"><input class="inp inp-sm kal-ef" type="number" min="0" max="6" value="${b.total}" title="Otomatis dari kalender: ${b.autoTotal} minggu. Ubah bila perlu; kosongkan untuk kembali otomatis." onchange="setMingguOverride(${s},${b.m},'total',this.value)"></td>
                <td class="${b.manualEfektif ? 'ovr' : ''}"><input class="inp inp-sm kal-ef" type="number" min="0" max="${b.total}" value="${b.efektif}" title="Otomatis: ${b.autoEfektif} minggu efektif. Ubah bila perlu; kosongkan untuk kembali otomatis." onchange="setMingguOverride(${s},${b.m},'efektif',this.value)"></td>
                <td class="${b.manualKet ? 'ovr' : ''}"><textarea class="inp inp-sm kal-ket" rows="1" placeholder="${ea(b.autoKeterangan || '—')}" title="Kosongkan untuk memakai keterangan otomatis dari agenda" onchange="setMingguOverride(${s},${b.m},'ket',this.value)">${b.manualKet ? ea(b.keterangan) : ''}</textarea></td></tr>`).join('')}</tbody></table>
            <div class="flex items-center justify-between gap-2 mt-1"><span class="hint">Angka &amp; keterangan bisa diubah manual (kuning = koreksi). Kosongkan untuk kembali ke hitungan otomatis.</span>
            ${(appState.mingguOverride || {})[mingguOverrideKey(t, s)] ? `<button class="btn" onclick="resetMingguOverride(${s})">${icon('rotate-ccw')} Otomatis</button>` : ''}</div></div>`;
    }).join(''));
}
function setMingguOverride(s, m, field, raw) {
    const key = mingguOverrideKey(appState.tingkat, s);
    const all = appState.mingguOverride || (appState.mingguOverride = {});
    const ov = all[key] || (all[key] = {});
    const o = ov[m] || (ov[m] = {});
    const val = String(raw).trim();
    if (field === 'total') {
        const b = mingguEfektif(appState.tingkat, s).bulan.find(x => x.m === m);
        const n = val === '' ? null : Math.max(0, Math.min(6, parseInt(val, 10) || 0));
        if (n === null || (b && n === b.autoTotal)) delete o.total; else o.total = n;
        if (hasNum(o.efektif) && n !== null && o.efektif > n) o.efektif = n;
    } else if (field === 'efektif') {
        const b = mingguEfektif(appState.tingkat, s).bulan.find(x => x.m === m);
        const n = val === '' ? null : Math.max(0, Math.min(b ? b.total : 6, parseInt(val, 10) || 0));
        if (n === null || (b && n === b.autoEfektif)) delete o.efektif; else o.efektif = n;
    } else {
        if (val === '') delete o.ket; else o.ket = val;
    }
    if (!Object.keys(o).length) delete ov[m];
    if (!Object.keys(ov).length) delete all[key];
    EDITOR_REFRESH.kalsum(); renderAll();
}
function resetMingguOverride(s) {
    delete (appState.mingguOverride || {})[mingguOverrideKey(appState.tingkat, s)];
    EDITOR_REFRESH.kalsum(); renderAll();
}
function renderAgendaEditor() {
    appState.agenda.sort((a, b) => String(a.mulai).localeCompare(String(b.mulai)) || String(a.selesai).localeCompare(String(b.selesai)));
    const jenisOpts = Object.entries(JENIS_AGENDA).map(([k, v]) => `<option value="${k}">${ea(v.label)}</option>`).join('');
    mount('ed-agenda', appState.agenda.map((a, i) => `
        <div class="border border-slate-200 rounded-lg p-2 mb-1.5 space-y-1.5" style="border-left:4px solid ${(JENIS_AGENDA[a.jenis] || JENIS_AGENDA.info).ink}">
            <div class="flex gap-1.5 items-center">
                <input type="date" class="inp inp-sm" style="width:135px" data-bind="agenda.${i}.mulai" data-rerender="kalsum">
                <span class="text-slate-400">–</span>
                <input type="date" class="inp inp-sm" style="width:135px" data-bind="agenda.${i}.selesai" data-rerender="kalsum">
                <select class="inp inp-sm flex-1" data-bind="agenda.${i}.jenis" data-rerender="kalsum">${jenisOpts}</select>
                <button class="btn-icon danger" title="Hapus" onclick="removeAgenda(${i})">${icon('trash-2')}</button>
            </div>
            ${inp(`agenda.${i}.nama`, { cls: 'inp-sm', ph: 'Nama agenda' })}
            <div class="flex gap-1.5 items-center"><span class="hint">Berlaku:</span>${TINGKAT.map(t => `<label class="chip"><input type="checkbox" ${(a.kelas || []).includes(t) ? 'checked' : ''} onchange="toggleAgendaKelas(${i},'${t}',this.checked)"> ${t}</label>`).join('')}</div>
        </div>`).join('') || '<p class="hint">Belum ada agenda.</p>');
}
function addAgenda() {
    const [y1] = tapelYears();
    const last = appState.agenda[appState.agenda.length - 1];
    const d = last ? last.selesai || last.mulai : `${y1}-07-13`;
    appState.agenda.push({ id: uid('ag'), mulai: d, selesai: d, nama: 'Agenda baru', jenis: 'kegiatan', kelas: TINGKAT.slice() });
    renderAgendaEditor(); EDITOR_REFRESH.kalsum(); renderAll();
}
function removeAgenda(i) { appState.agenda.splice(i, 1); renderAgendaEditor(); EDITOR_REFRESH.kalsum(); renderAll(); }
function toggleAgendaKelas(i, t, on) {
    const a = appState.agenda[i];
    a.kelas = TINGKAT.filter(x => x === t ? on : (a.kelas || []).includes(x));
    EDITOR_REFRESH.kalsum(); renderSoon();
}

// ---------- Agenda kalender: template Excel & impor ----------
const AGENDA_HEADER = ['No', 'Tanggal Mulai', 'Tanggal Selesai', 'Nama Agenda', 'Jenis', 'Berlaku Kelas'];
const JENIS_LABEL_XLS = { libur: 'Libur', kegiatan: 'Kegiatan', info: 'Keterangan' };
const EXCEL_EPOCH_DAY = 25569; // serial Excel untuk 1970-01-01

function downloadAgendaTemplate() {
    if (!ensureXLSX()) return;
    try {
        const name = buildAgendaTemplate();
        showToast(`Template diunduh: ${name} (lihat folder Unduhan/Downloads).`, 6000);
    } catch (err) {
        console.error(err);
        showToast('Template gagal dibuat: ' + (err && err.message || err), 8000);
    }
}
function buildAgendaTemplate() {
    const list = appState.agenda.slice().sort((a, b) => String(a.mulai).localeCompare(String(b.mulai)));
    const kelasTxt = a => !Array.isArray(a.kelas) || !a.kelas.length || a.kelas.length === TINGKAT.length ? 'Semua' : a.kelas.join(', ');
    const [y1] = tapelYears();
    const rows = [AGENDA_HEADER].concat(list.length
        ? list.map((a, i) => [i + 1, a.mulai, a.selesai || a.mulai, a.nama || '', JENIS_LABEL_XLS[a.jenis] || 'Libur', kelasTxt(a)])
        : [[1, `${y1}-07-13`, `${y1}-07-17`, 'Masa Pengenalan Lingkungan Sekolah (MPLS)', 'Kegiatan', 'VII']]);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    // Tanggal ditulis sebagai tanggal Excel (dd/mm/yyyy) agar mudah diubah
    for (let r = 1; r < rows.length; r++) {
        [1, 2].forEach(c => {
            const ref = XLSX.utils.encode_cell({ r, c });
            const iso = rows[r][c];
            if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) ws[ref] = { t: 'n', v: isoToDay(iso) + EXCEL_EPOCH_DAY, z: 'dd/mm/yyyy' };
        });
    }
    ws['!cols'] = [{ wch: 5 }, { wch: 14 }, { wch: 14 }, { wch: 60 }, { wch: 12 }, { wch: 16 }];
    ws['!autofilter'] = { ref: `A1:F${rows.length}` };
    XLSX.utils.book_append_sheet(wb, ws, 'Agenda');

    const [ya, yb] = tapelYears();
    const petunjuk = [
        ['PETUNJUK PENGISIAN TEMPLATE AGENDA KALENDER PENDIDIKAN'],
        [],
        ['1.', 'Isi lembar "Agenda": satu baris = satu agenda. Jangan mengubah baris judul (baris 1).'],
        ['2.', `Tanggal ditulis dd/mm/yyyy, mis. 13/07/${ya}. Tahun pelajaran saat ini ${appState.identitas.tapel || ya + '/' + yb}: Juli–Desember ${ya} dan Januari–Juni ${yb}.`],
        ['3.', 'Tanggal Selesai boleh dikosongkan untuk agenda satu hari.'],
        ['4.', 'Jenis: Libur atau Kegiatan (mengurangi hari efektif), Keterangan (hanya dicatat, KBM tetap jalan).'],
        ['5.', 'Berlaku Kelas: Semua, atau sebutkan kelasnya, mis. "VII" atau "VII, VIII". Boleh juga 7, 8, 9.'],
        ['6.', 'Baris yang Nama Agenda atau Tanggal Mulai-nya kosong diabaikan. Kolom No boleh dikosongkan.'],
        ['7.', 'Simpan sebagai .xlsx, lalu di aplikasi: Kalender & Minggu Efektif → Impor Excel. Isi file MENGGANTI daftar agenda di aplikasi.'],
        [],
        ['Jenis', 'Keterangan'],
        ['Libur', 'Libur nasional, cuti bersama, libur semester (merah di kalender)'],
        ['Kegiatan', 'MPLS, asesmen, pengolahan rapor, dll. — tidak ada KBM (kuning)'],
        ['Keterangan', 'Hari pertama masuk, peringatan, dll. — KBM tetap jalan (biru)']
    ];
    const wsP = XLSX.utils.aoa_to_sheet(petunjuk);
    wsP['!cols'] = [{ wch: 12 }, { wch: 110 }];
    XLSX.utils.book_append_sheet(wb, wsP, 'Petunjuk');

    const safe = s => String(s || '').replace(/[\\/:*?"<>|\s]+/g, '_');
    const name = `Template_Agenda_Kalender_${safe(appState.identitas.tapel) || ya}.xlsx`;
    XLSX.writeFile(wb, name);
    return name;
}

// Tanggal dari sel Excel: serial tanggal, "dd/mm/yyyy", "dd-mm-yyyy", "yyyy-mm-dd", atau "13 Juli 2026"
function agendaDateFrom(v) {
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'number' && Number.isFinite(v)) return v > 20000 && v < 80000 ? dayToIso(Math.floor(v) - EXCEL_EPOCH_DAY) : null;
    const s = String(v).trim();
    if (!s) return '';
    const ok = (y, m, d) => {
        y = Number(y); m = Number(m); d = Number(d);
        if (y < 100) y += 2000;
        if (!(m >= 1 && m <= 12 && d >= 1 && d <= 31)) return null;
        const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        return dayToIso(isoToDay(iso)) === iso ? iso : null;
    };
    let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (m) return ok(m[1], m[2], m[3]);
    m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
    if (m) return ok(m[3], m[2], m[1]);
    m = s.match(/^(\d{1,2})\s+([a-z]+)\.?\s+(\d{4})$/i);
    if (m) {
        const bi = NAMA_BULAN.findIndex(b => b.toLowerCase().startsWith(m[2].toLowerCase().slice(0, 3)));
        if (bi >= 0) return ok(m[3], bi + 1, m[1]);
    }
    return null;
}
function agendaJenisFrom(v) {
    const s = String(v || '').trim().toLowerCase();
    if (!s || /^lib/.test(s)) return 'libur';
    if (/^keg/.test(s)) return 'kegiatan';
    if (/^(ket|info)/.test(s)) return 'info';
    return null;
}
function agendaKelasFrom(v) {
    const s = String(v || '').trim().toUpperCase();
    if (!s || /SEMUA|ALL/.test(s)) return TINGKAT.slice();
    const map = { '7': 'VII', '8': 'VIII', '9': 'IX', VII: 'VII', VIII: 'VIII', IX: 'IX' };
    const found = (s.match(/\b(VIII|VII|IX|7|8|9)\b/g) || []).map(x => map[x]);
    const list = TINGKAT.filter(t => found.includes(t));
    return list.length ? list : null;
}

// Ubah larik baris Excel menjadi daftar agenda. Melempar Error bila format salah.
function parseAgendaRows(aoa) {
    const norm = c => String(c == null ? '' : c).trim().toLowerCase();
    const hi = aoa.findIndex(r => r.some(c => /^(nama|agenda|kegiatan)/.test(norm(c))) && r.some(c => /mulai|^tanggal/.test(norm(c))));
    if (hi < 0) throw new Error('kolom "Tanggal Mulai" dan "Nama Agenda" tidak ditemukan');
    const h = aoa[hi].map(norm);
    const col = re => h.findIndex(c => re.test(c));
    const ci = { mulai: col(/mulai|^tanggal$/), selesai: col(/selesai|sampai|akhir/), nama: col(/^(nama|agenda|kegiatan)/), jenis: col(/^jenis/), kelas: col(/kelas|berlaku/) };
    const get = (r, k) => ci[k] >= 0 ? r[ci[k]] : '';
    const out = [], errors = [];
    aoa.slice(hi + 1).forEach((r, idx) => {
        const nama = String(get(r, 'nama') == null ? '' : get(r, 'nama')).trim().replace(/\s*\n\s*/g, ' ');
        const rawMulai = get(r, 'mulai');
        if (!nama && (rawMulai === '' || rawMulai == null)) return;
        const line = hi + idx + 2;
        if (!nama) { errors.push(`baris ${line}: nama agenda kosong`); return; }
        const mulai = agendaDateFrom(rawMulai);
        if (!mulai) { errors.push(`baris ${line}: tanggal mulai ${mulai === '' ? 'kosong' : 'tidak terbaca'}`); return; }
        let selesai = agendaDateFrom(get(r, 'selesai'));
        if (selesai === null) { errors.push(`baris ${line}: tanggal selesai tidak terbaca`); return; }
        if (!selesai) selesai = mulai;
        if (selesai < mulai) { errors.push(`baris ${line}: tanggal selesai sebelum tanggal mulai`); return; }
        const jenis = agendaJenisFrom(get(r, 'jenis'));
        if (!jenis) { errors.push(`baris ${line}: jenis "${get(r, 'jenis')}" tidak dikenal (Libur/Kegiatan/Keterangan)`); return; }
        const kelas = agendaKelasFrom(get(r, 'kelas'));
        if (!kelas) { errors.push(`baris ${line}: kelas "${get(r, 'kelas')}" tidak dikenal`); return; }
        out.push({ mulai, selesai, nama, jenis, kelas });
    });
    if (errors.length) throw new Error(errors.slice(0, 5).join('; ') + (errors.length > 5 ? ` (+${errors.length - 5} lagi)` : ''));
    if (!out.length) throw new Error('tidak ada agenda yang terisi');
    return out;
}

function importAgendaExcel(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file || !ensureXLSX()) return;
    const reader = new FileReader();
    reader.onload = e => {
        let list;
        try {
            const wb = XLSX.read(e.target.result, { type: 'array' });
            const name = wb.SheetNames.find(n => /^agenda$/i.test(n.trim())) || wb.SheetNames[0];
            list = parseAgendaRows(XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '', raw: true }));
        } catch (err) { console.error(err); showToast('Impor agenda gagal: ' + (err.message || 'berkas tidak terbaca'), 8000); return; }
        const [y1, y2] = tapelYears();
        const awal = `${y1}-07-01`, akhir = `${y2}-06-30`;
        const luar = list.filter(a => a.selesai < awal || a.mulai > akhir).length;
        const msg = `File berisi ${list.length} agenda` +
            (luar ? `.\n\nPERHATIAN: ${luar} agenda di luar tahun pelajaran ${appState.identitas.tapel} (1 Juli ${y1} – 30 Juni ${y2}) dan tidak akan terhitung.` : '.') +
            `\n\nGanti ${appState.agenda.length} agenda di aplikasi dengan isi file?`;
        if (!confirm(msg)) return;
        appState.agenda = list.map(a => Object.assign({ id: uid('ag') }, a));
        renderAgendaEditor(); EDITOR_REFRESH.kalsum(); renderAll();
        showToast(`${list.length} agenda kalender diimpor.`);
    };
    reader.readAsArrayBuffer(file);
}

// ---------- Program Semester ----------
function renderPromesEditor() {
    const t = appState.tingkat, s = appState.semester;
    const mx = promesMatrix(t, s);
    const months = semesterMonths(s).map(({ y, m }) => ({ m, weeks: mx.weeks.filter(w => w.y === y && w.m === m) }));
    const ov = appState.promesOverride[promesKey(t, s)] || {};
    const planned = mx.rows.reduce((a, r) => a + r.jp, 0);
    const html = `
        <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="card-title">${icon('table-2', 'w-4 h-4 accent-text')} Kelas ${t} • Semester ${s}</div>
            <div class="seg"><button class="${s === 1 ? 'is-active' : ''}" onclick="setSemester(1)">Smt 1</button><button class="${s === 2 ? 'is-active' : ''}" onclick="setSemester(2)">Smt 2</button></div>
        </div>
        <div class="stat-row">
            <div class="stat"><b>${planned} JP</b><span>Rencana (ATP)</span></div>
            <div class="stat"><b>${mx.me.totalJp} JP</b><span>Kapasitas minggu efektif</span></div>
            <div class="stat ${mx.overflow ? 'warn' : 'ok'}"><b>${mx.overflow ? mx.overflow + ' JP' : 'Muat'}</b><span>${mx.overflow ? 'Tidak muat — kurangi JP' : 'Semua materi terjadwal'}</span></div>
        </div>
        <p class="hint">Angka diisi otomatis berurutan ke minggu efektif (${mx.jp} JP/minggu). Ketik untuk mengoreksi — sel kuning = koreksi manual. Minggu berarsir = tidak efektif.</p>
        <div class="flex gap-1.5"><button class="btn" onclick="resetPromes()" ${mx.hasOverride ? '' : 'disabled style="opacity:.5"'}>${icon('rotate-ccw')} Kembalikan ke otomatis</button></div>
        <div class="grid-scroll"><table class="pm-grid" id="pm-grid">
            <thead><tr><th class="pm-label" rowspan="2">Materi / Kegiatan</th><th rowspan="2">JP</th>${months.map(mo => `<th colspan="${mo.weeks.length || 1}">${NAMA_BULAN[mo.m].slice(0, 3)}</th>`).join('')}</tr>
            <tr>${months.map(mo => mo.weeks.map(w => `<th title="${w.tambahan ? 'Minggu tambahan (koreksi manual)' : 'Senin ' + formatTanggalIndo(w.key)}${w.efektif ? '' : ' — tidak efektif: ' + ea(w.primary ? w.primary.nama : '')}">${w.mingguKe}</th>`).join('')).join('')}</tr></thead>
            <tbody>${mx.rows.map(r => `<tr><td class="pm-label" title="${ea(r.label)}">${ea(r.label.length > 26 ? r.label.slice(0, 25) + '…' : r.label)}</td><td class="sum" data-rowsum="${r.id}">${mx.rowTotals[r.id]}/${r.jp}</td>
                ${mx.weeks.map(w => { const k = r.id + '|' + w.key; const has = Object.prototype.hasOwnProperty.call(ov, k);
                    return `<td class="${w.efektif ? '' : 'off'} ${has ? 'ovr' : ''}"><input inputmode="numeric" value="${mx.cells[r.id][w.key] || ''}" placeholder="${mx.auto[r.id][w.key] || ''}" data-row="${r.id}" data-week="${w.key}" oninput="setPromesCell(this)"></td>`; }).join('')}</tr>`).join('')}
            <tr><td class="pm-label">Jumlah / minggu</td><td class="sum"></td>${mx.weeks.map(w => `<td class="sum ${(mx.weekTotals[w.key] || 0) > mx.jp ? 'bad' : ''}" data-weeksum="${w.key}">${mx.weekTotals[w.key] || ''}</td>`).join('')}</tr>
            </tbody></table></div>`;
    mount('ed-promes', html);
}
function setPromesCell(el) {
    const t = appState.tingkat, s = appState.semester;
    const key = promesKey(t, s);
    const ov = appState.promesOverride[key] || (appState.promesOverride[key] = {});
    const k = el.dataset.row + '|' + el.dataset.week;
    const autoVal = Number(el.placeholder) || 0;
    const v = el.value.trim() === '' ? 0 : Math.max(0, Math.min(40, parseInt(el.value, 10) || 0));
    if (v === autoVal) delete ov[k]; else ov[k] = v;
    if (!Object.keys(ov).length) delete appState.promesOverride[key];
    el.parentElement.classList.toggle('ovr', Object.prototype.hasOwnProperty.call(ov, k));
    // perbarui jumlah tanpa membangun ulang tabel (agar kursor tidak hilang)
    const mx = promesMatrix(t, s);
    document.querySelectorAll('#pm-grid [data-weeksum]').forEach(c => { const v2 = mx.weekTotals[c.dataset.weeksum] || 0; c.textContent = v2 || ''; c.classList.toggle('bad', v2 > mx.jp); });
    document.querySelectorAll('#pm-grid [data-rowsum]').forEach(c => { const r = mx.rows.find(x => x.id === c.dataset.rowsum); c.textContent = `${mx.rowTotals[c.dataset.rowsum]}/${r ? r.jp : ''}`; });
    renderSoon();
}
function resetPromes() {
    delete appState.promesOverride[promesKey(appState.tingkat, appState.semester)];
    renderPromesEditor(); renderAll();
}

// ---------- Modul Ajar ----------
function renderModulEditor() {
    const t = appState.tingkat;
    const list = appState.modul.map((m, i) => ({ m, i })).filter(x => x.m.tingkat === t);
    let act = list.find(x => x.m.id === appState.modulAktif) || list[0];
    if (act) appState.modulAktif = act.m.id;
    const babOpts = [1, 2].map(s => (appState.atp[t][s] || []).map(b => `<option value="${b.id}">Smt ${s} — ${ea(b.materi)}</option>`).join('')).join('');
    let html = `<div class="card space-y-2">
        <div class="flex items-center justify-between gap-2"><div class="card-title">${icon('notebook-pen', 'w-4 h-4 accent-text')} Modul ajar kelas ${t}</div>
            <div class="flex gap-1"><button class="btn btn-primary" onclick="addModul()">${icon('plus')} Baru</button>${act ? `<button class="btn" onclick="duplicateModul()">${icon('copy')} Duplikat</button><button class="btn btn-danger" onclick="removeModul()">${icon('trash-2')}</button>` : ''}</div></div>
        ${list.length ? `<select class="inp" onchange="selectModul(this.value)">${list.map(x => `<option value="${x.m.id}" ${x.m.id === appState.modulAktif ? 'selected' : ''}>${ea(x.m.judul || '(tanpa judul)')}${x.m.pertemuanKe ? ' — pertemuan ' + ea(x.m.pertemuanKe) : ''}</option>`).join('')}</select>` : '<p class="hint">Belum ada modul untuk kelas ini. Tekan "Baru" — isian awal diambil dari ATP.</p>'}
    </div>`;
    if (act) {
        const p = `modul.${act.i}`;
        const m = act.m;
        html += `
        <div class="card space-y-2"><div class="card-title">A. Identitas</div>
            ${lbl('Bab (dari ATP)', `<select class="inp" onchange="pickModulBab(${act.i}, this.value)"><option value="">— pilih —</option>${babOpts}</select>`)}
            ${lbl('Judul / topik modul', inp(`${p}.judul`))}
            <div class="grid grid-cols-3 gap-2">${lbl('Kode TP', inp(`${p}.kodeTp`))}${lbl('Alokasi waktu', inp(`${p}.alokasi`), 'col-span-2')}</div>
            <div class="grid grid-cols-2 gap-2">${lbl('Semester', `<select class="inp" data-bind="${p}.semester" data-type="number"><option value="1">1 (Ganjil)</option><option value="2">2 (Genap)</option></select>`)}${lbl('Pertemuan ke-', inp(`${p}.pertemuanKe`, { ph: '1' }))}</div>
        </div>
        <div class="card space-y-2"><div class="card-title">B. Identifikasi</div>
            ${lbl('Murid (kesiapan, minat, kebutuhan)', area(`${p}.identifikasiMurid`, 3))}
            ${lbl('Materi pelajaran (jenis pengetahuan, relevansi)', area(`${p}.identifikasiMateri`, 3))}
            <div><label class="field-label mb-1">Dimensi profil lulusan</label><div class="flex flex-wrap gap-1.5">${DIMENSI_PROFIL.map(d => `<label class="chip"><input type="checkbox" ${(m.dimensi || []).includes(d) ? 'checked' : ''} onchange="toggleDimensi(${act.i}, this.dataset.d, this.checked)" data-d="${ea(d)}"> ${ea(d)}</label>`).join('')}</div></div>
        </div>
        <div class="card space-y-2"><div class="card-title">C. Desain Pembelajaran</div>
            <p class="hint">Capaian pembelajaran diambil otomatis dari elemen kode TP.</p>
            ${lbl('Lintas disiplin ilmu', area(`${p}.lintasDisiplin`, 2))}
            <div><div class="flex justify-between items-end"><label class="field-label mb-1">Tujuan pembelajaran</label><button class="btn mb-1" onclick="fillModulTujuan(${act.i})">${icon('download')} Ambil dari TP</button></div>${area(`${p}.tujuan`, 3)}</div>
            ${lbl('Topik pembelajaran', area(`${p}.topik`, 2))}
            ${lbl('Praktik pedagogis (model, strategi, metode)', area(`${p}.praktikPedagogis`, 2))}
            ${lbl('Kemitraan pembelajaran', area(`${p}.kemitraan`, 2))}
            ${lbl('Lingkungan pembelajaran', area(`${p}.lingkungan`, 2))}
            ${lbl('Pemanfaatan digital', area(`${p}.digital`, 2))}
        </div>
        <div class="card space-y-2"><div class="flex justify-between items-center"><div class="card-title">D. Pengalaman Belajar</div><button class="btn" onclick="addPertemuan(${act.i})">${icon('plus')} Pertemuan</button></div>
            <p class="hint">Satu kegiatan per baris. Prinsip: berkesadaran, bermakna, menggembirakan.</p>
            ${(m.pertemuan || []).map((q, j) => `<div class="bab-card space-y-1.5">
                <div class="flex gap-1.5 items-center"><div class="flex-1">${inp(`${p}.pertemuan.${j}.judul`, { cls: 'inp-sm font-semibold' })}</div><button class="btn-icon danger" onclick="removePertemuan(${act.i},${j})">${icon('trash-2')}</button></div>
                ${lbl('Kegiatan awal', area(`${p}.pertemuan.${j}.awal`, 3))}
                ${lbl('Inti — Memahami', area(`${p}.pertemuan.${j}.memahami`, 3))}
                ${lbl('Inti — Mengaplikasi', area(`${p}.pertemuan.${j}.mengaplikasi`, 3))}
                ${lbl('Inti — Merefleksi', area(`${p}.pertemuan.${j}.merefleksi`, 2))}
                ${lbl('Kegiatan penutup', area(`${p}.pertemuan.${j}.penutup`, 3))}
            </div>`).join('')}
        </div>
        <div class="card space-y-2"><div class="card-title">E. Asesmen & F. Lampiran</div>
            ${lbl('Asesmen awal', area(`${p}.asesmenAwal`, 2))}${lbl('Asesmen proses', area(`${p}.asesmenProses`, 2))}${lbl('Asesmen akhir', area(`${p}.asesmenAkhir`, 2))}${lbl('Lampiran', area(`${p}.lampiran`, 2))}
        </div>`;
    }
    const el = mount('ed-modul', html);
    if (el && act) { const sel = el.querySelector('select[onchange^="pickModulBab"]'); if (sel) sel.value = act.m.babId || ''; }
}
function selectModul(id) { appState.modulAktif = id; renderModulEditor(); if (appState.docMode !== 'modul') setDocMode('modul'); else renderAll(); }
function newModulFromBab(t, s, b) {
    return { id: uid('mod'), tingkat: t, semester: s, babId: b ? b.id : '', judul: b ? b.materi : 'Modul baru', kodeTp: b ? b.kodeTp : '',
        alokasi: `${jpPerMinggu(t)} × ${appState.setting.menitJp} menit (1 pertemuan)`, pertemuanKe: '1', identifikasiMurid: '', identifikasiMateri: '', dimensi: ['Penalaran Kritis'],
        lintasDisiplin: '', tujuan: b ? splitKode(b.kodeTp).map(k => (tpByKode(k) || {}).tujuan).filter(Boolean).join('\n') : '', topik: '', praktikPedagogis: '', kemitraan: '', lingkungan: '', digital: '',
        pertemuan: [{ judul: 'Pertemuan 1', awal: '', memahami: '', mengaplikasi: '', merefleksi: '', penutup: '' }], asesmenAwal: '', asesmenProses: '', asesmenAkhir: '', lampiran: '' };
}
function addModul() {
    const t = appState.tingkat, s = appState.semester;
    const b = (appState.atp[t][s] || [])[0];
    const m = newModulFromBab(t, s, b);
    appState.modul.push(m); appState.modulAktif = m.id;
    renderModulEditor(); setDocMode('modul');
}
function duplicateModul() {
    const m = appState.modul.find(x => x.id === appState.modulAktif); if (!m) return;
    const c = JSON.parse(JSON.stringify(m)); c.id = uid('mod'); c.pertemuanKe = String((parseInt(m.pertemuanKe, 10) || 1) + 1);
    appState.modul.push(c); appState.modulAktif = c.id; renderModulEditor(); renderAll();
}
function removeModul() {
    const i = appState.modul.findIndex(x => x.id === appState.modulAktif); if (i < 0) return;
    if (!confirm('Hapus modul ini?')) return;
    appState.modul.splice(i, 1); appState.modulAktif = ''; renderModulEditor(); renderAll();
}
function pickModulBab(i, babId) {
    const m = appState.modul[i]; if (!m) return;
    const t = m.tingkat;
    [1, 2].forEach(s => { const b = (appState.atp[t][s] || []).find(x => x.id === babId); if (b) { m.babId = b.id; m.semester = s; m.judul = b.materi; m.kodeTp = b.kodeTp; } });
    renderModulEditor(); renderAll();
}
function fillModulTujuan(i) {
    const m = appState.modul[i];
    m.tujuan = splitKode(m.kodeTp).map(k => (tpByKode(k) || {}).tujuan).filter(Boolean).join('\n');
    renderModulEditor(); renderAll();
}
function toggleDimensi(i, d, on) {
    const m = appState.modul[i];
    m.dimensi = DIMENSI_PROFIL.filter(x => x === d ? on : (m.dimensi || []).includes(x));
    renderSoon();
}
function addPertemuan(i) { const m = appState.modul[i]; m.pertemuan.push({ judul: 'Pertemuan ' + (m.pertemuan.length + 1), awal: '', memahami: '', mengaplikasi: '', merefleksi: '', penutup: '' }); renderModulEditor(); renderAll(); }
function removePertemuan(i, j) { appState.modul[i].pertemuan.splice(j, 1); renderModulEditor(); renderAll(); }

// ---------- KKTP ----------
function renderKKTPEditor() {
    const t = appState.tingkat;
    const k = appState.kktp;
    const list = tpForTingkat(t);
    mount('ed-kktp', `
        <div class="card space-y-2"><div class="card-title">${icon('gauge', 'w-4 h-4 accent-text')} Interval nilai</div>
            ${lbl('Batas tuntas (nilai ≥)', inp('kktp.batas', { type: 'number', number: true, cls: 'inp-sm', attrs: 'style="width:90px"' }))}
            <table class="ed-table"><thead><tr><th style="width:56px">Min</th><th style="width:56px">Maks</th><th>Keterangan / tindak lanjut</th><th style="width:28px"></th></tr></thead><tbody>
            ${k.interval.map((iv, i) => `<tr><td>${inp(`kktp.interval.${i}.min`, { cls: 'inp-sm inp-num', type: 'number', number: true })}</td><td>${inp(`kktp.interval.${i}.max`, { cls: 'inp-sm inp-num', type: 'number', number: true })}</td><td>${inp(`kktp.interval.${i}.keterangan`, { cls: 'inp-sm' })}</td><td><button class="btn-icon danger" onclick="removeInterval(${i})">${icon('x')}</button></td></tr>`).join('')}
            </tbody></table><button class="btn" onclick="addInterval()">${icon('plus')} Interval</button>
        </div>
        <div class="card space-y-2"><div class="card-title">Indikator per TP — kelas ${t}</div>
            <p class="hint">Daftar TP mengikuti kode TP di ATP kelas ${t}. Satu indikator per baris; bila kosong, dokumen memakai rumusan TP.</p>
            ${list.map(x => `<div class="border-t border-slate-100 pt-2"><div class="text-xs font-bold">${ea(x.kode)} <span class="font-normal text-slate-500">— Smt ${x.semester}: ${ea(String(x.tujuan).slice(0, 110))}${String(x.tujuan).length > 110 ? '…' : ''}</span></div>
                <textarea class="inp mt-1" rows="3" data-kode="${ea(x.kode)}" oninput="setIndikator(this.dataset.kode, this.value)">${ea(k.indikator[x.kode] || '')}</textarea></div>`).join('') || '<p class="hint">Isi kode TP pada ATP terlebih dahulu.</p>'}
        </div>`);
}
function setIndikator(kode, v) { appState.kktp.indikator[kode] = v; renderSoon(); }
function addInterval() { appState.kktp.interval.push({ min: 0, max: 0, keterangan: '' }); renderKKTPEditor(); renderAll(); }
function removeInterval(i) { appState.kktp.interval.splice(i, 1); renderKKTPEditor(); renderAll(); }

// ---------- Jurnal ----------
function renderJurnalEditor() {
    const t = appState.tingkat, s = appState.semester;
    const rombels = appState.rombel.filter(r => r.tingkat === t).map(r => r.nama);
    const idx = appState.jurnal.map((j, i) => ({ j, i })).filter(x => x.j.tingkat === t && Number(x.j.semester) === s)
        .sort((a, b) => String(a.j.tanggal).localeCompare(String(b.j.tanggal)));
    mount('ed-jurnal', `
        <div class="card space-y-2">
            <div class="flex items-center justify-between gap-2 flex-wrap"><div class="card-title">${icon('notebook-tabs', 'w-4 h-4 accent-text')} Kelas ${t} • Semester ${s} (${idx.length} catatan)</div>
                <div class="seg"><button class="${s === 1 ? 'is-active' : ''}" onclick="setSemester(1)">Smt 1</button><button class="${s === 2 ? 'is-active' : ''}" onclick="setSemester(2)">Smt 2</button></div></div>
            <div class="flex flex-wrap gap-1.5">
                <button class="btn btn-primary" onclick="addJurnal()">${icon('plus')} Catatan</button>
                <button class="btn" onclick="generateJurnal()" title="Satu baris per minggu efektif berisi materi dari Program Semester">${icon('wand-sparkles')} Isi dari Program Semester</button>
                ${idx.length ? `<button class="btn btn-danger" onclick="clearJurnal()">${icon('trash-2')} Kosongkan</button>` : ''}
            </div>
            <div class="flex items-center gap-2"><label class="field-label">Baris kosong tambahan di dokumen</label>${inp('jurnalKosong', { type: 'number', number: true, cls: 'inp-sm', attrs: 'style="width:70px" min="0" max="60"' })}</div>
            <datalist id="dl-rombel">${rombels.map(r => `<option value="${ea(r)}">`).join('')}</datalist>
        </div>
        ${idx.map(({ i }) => `<div class="bab-card space-y-1.5">
            <div class="flex gap-1.5 items-center">
                <input type="date" class="inp inp-sm" style="width:140px" data-bind="jurnal.${i}.tanggal">
                <div style="width:80px">${inp(`jurnal.${i}.rombel`, { cls: 'inp-sm', ph: 'Kelas', attrs: 'list="dl-rombel"' })}</div>
                <div style="width:64px">${inp(`jurnal.${i}.jamKe`, { cls: 'inp-sm', ph: 'Jam' })}</div>
                <div style="width:64px">${inp(`jurnal.${i}.kodeTp`, { cls: 'inp-sm', ph: 'TP' })}</div>
                <button class="btn-icon danger ml-auto" onclick="removeJurnal(${i})">${icon('trash-2')}</button>
            </div>
            ${inp(`jurnal.${i}.materi`, { cls: 'inp-sm', ph: 'Materi' })}
            ${area(`jurnal.${i}.kegiatan`, 2, { cls: 'inp-sm', ph: 'Kegiatan pembelajaran (satu per baris)' })}
            <div class="grid grid-cols-3 gap-1.5">${inp(`jurnal.${i}.hadir`, { cls: 'inp-sm', ph: 'Jumlah hadir' })}${inp(`jurnal.${i}.absen`, { cls: 'inp-sm', ph: 'Tidak hadir' })}${inp(`jurnal.${i}.catatan`, { cls: 'inp-sm', ph: 'Catatan/tindak lanjut' })}</div>
        </div>`).join('')}`);
}
function defaultRombelName(t) { const r = appState.rombel.find(x => x.tingkat === t); return r ? r.nama : (appState.kelas[t] || {}).rombel || t; }
function addJurnal() {
    const t = appState.tingkat;
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    appState.jurnal.push({ id: uid('j'), tingkat: t, semester: appState.semester, tanggal: iso, rombel: defaultRombelName(t), jamKe: '', kodeTp: '', materi: '', kegiatan: '', hadir: '', absen: '', catatan: '' });
    renderJurnalEditor(); if (appState.docMode !== 'jurnal') setDocMode('jurnal'); else renderAll();
}
function generateJurnal() {
    const t = appState.tingkat, s = appState.semester;
    const mx = promesMatrix(t, s);
    const have = new Set(appState.jurnal.filter(j => j.tingkat === t && Number(j.semester) === s).flatMap(j => [j.tanggal, j.minggu]).filter(Boolean));
    const babByRow = {};
    (appState.atp[t][s] || []).forEach(b => { babByRow[b.id + ':m'] = b; babByRow[b.id + ':a'] = b; });
    let added = 0;
    mx.weeks.filter(w => w.efektif).forEach(w => {
        if (have.has(w.key)) return;
        const rows = promesMateriOnWeek(mx, w.key);
        if (!rows.length) return;
        appState.jurnal.push({ id: uid('j'), tingkat: t, semester: s, tanggal: w.tambahan ? '' : w.key, ...(w.tambahan ? { minggu: w.key } : {}), rombel: defaultRombelName(t), jamKe: '',
            kodeTp: [...new Set(rows.map(r => (babByRow[r.id] || {}).kodeTp).filter(Boolean))].join(', '),
            materi: rows.map(r => r.type === 'ash' ? `Asesmen Sumatif Harian (${(babByRow[r.id] || {}).materi || ''})` : r.label).join('; '),
            kegiatan: '', hadir: '', absen: '', catatan: '' });
        added++;
    });
    renderJurnalEditor(); setDocMode('jurnal');
    showToast(added ? `${added} catatan jurnal ditambahkan dari Program Semester.` : 'Semua minggu efektif sudah punya catatan.');
}
function removeJurnal(i) { appState.jurnal.splice(i, 1); renderJurnalEditor(); renderAll(); }
function clearJurnal() {
    const t = appState.tingkat, s = appState.semester;
    if (!confirm(`Hapus semua catatan jurnal kelas ${t} semester ${s}?`)) return;
    appState.jurnal = appState.jurnal.filter(j => !(j.tingkat === t && Number(j.semester) === s));
    renderJurnalEditor(); renderAll();
}

// ---------- Daftar Nilai ----------
function rombelAktif() {
    const t = appState.tingkat;
    let rb = appState.rombel.find(r => r.id === appState.rombelAktif && r.tingkat === t);
    if (!rb) { rb = appState.rombel.find(r => r.tingkat === t); if (rb) appState.rombelAktif = rb.id; }
    return rb || null;
}
function renderNilaiEditor() {
    const t = appState.tingkat, s = appState.semester;
    const list = appState.rombel.filter(r => r.tingkat === t);
    const rb = rombelAktif();
    const ri = rb ? appState.rombel.indexOf(rb) : -1;
    let html = `<div class="card space-y-2">
        <div class="flex items-center justify-between gap-2 flex-wrap"><div class="card-title">${icon('users', 'w-4 h-4 accent-text')} Rombel kelas ${t}</div>
            <div class="seg"><button class="${s === 1 ? 'is-active' : ''}" onclick="setSemester(1)">Smt 1</button><button class="${s === 2 ? 'is-active' : ''}" onclick="setSemester(2)">Smt 2</button></div></div>
        <div class="flex gap-1.5">${list.length ? `<select class="inp flex-1" onchange="appState.rombelAktif=this.value;renderNilaiEditor();renderAll()">${list.map(r => `<option value="${r.id}" ${rb && r.id === rb.id ? 'selected' : ''}>${ea(r.nama)} (${r.murid.length} murid)</option>`).join('')}</select>` : '<span class="hint flex-1">Belum ada rombel.</span>'}
            <button class="btn btn-primary" onclick="addRombel()">${icon('plus')} Rombel</button>${rb ? `<button class="btn btn-danger" onclick="removeRombel()">${icon('trash-2')}</button>` : ''}</div>
        ${rb ? lbl('Nama rombel', inp(`rombel.${ri}.nama`, { cls: 'inp-sm' })) : ''}
    </div>`;
    if (rb) {
        const kodes = tpForTingkat(t, s).map(x => x.kode);
        const res = hitungNilai(rb, s, kodes);
        const data = appState.nilai[nilaiKey(rb.id, s)] || {};
        html += `<div class="card space-y-2"><div class="card-title">Daftar murid</div>
            <p class="hint">Tempel dari Excel/teks: satu murid per baris, format <b>NIS ; Nama ; L/P</b> (pemisah titik koma, koma, atau Tab). Nilai murid yang namanya sama tetap tersimpan.</p>
            <textarea class="inp" rows="5" id="murid-paste">${ea(rb.murid.map(m => [m.nis, m.nama, m.lp].join('; ')).join('\n'))}</textarea>
            <div class="flex flex-wrap gap-1.5"><button class="btn btn-primary" onclick="applyMuridPaste()">${icon('check')} Terapkan daftar</button>
                <label class="btn">${icon('file-up')} Impor Excel<input type="file" class="hidden" accept=".xlsx,.xls,.csv" onchange="importMuridExcel(event)"></label>
                <button class="btn" onclick="downloadNilaiTemplate()">${icon('file-down')} Template Excel</button></div>
        </div>
        <div class="card space-y-2"><div class="card-title">Bobot nilai akhir (%)</div>
            <div class="grid grid-cols-3 gap-2">${lbl('Rata-rata TP', inp('bobot.tp', { type: 'number', number: true, cls: 'inp-sm', rerender: 'nilai' }))}${lbl('ASTS', inp('bobot.sts', { type: 'number', number: true, cls: 'inp-sm', rerender: 'nilai' }))}${lbl('ASAS/ASAT', inp('bobot.sas', { type: 'number', number: true, cls: 'inp-sm', rerender: 'nilai' }))}</div>
        </div>
        <div class="card space-y-2"><div class="card-title">Isi nilai — ${ea(rb.nama)}, semester ${s}</div>
            <p class="hint">Kolom TP mengikuti kode TP di ATP semester ini (${kodes.join(', ') || '–'}).</p>
            <div class="grid-scroll"><table class="pm-grid" id="nilai-grid"><thead><tr><th class="pm-label">Nama</th>${kodes.map(k => `<th>${ea(k)}</th>`).join('')}<th>ASTS</th><th>ASAS</th><th>NA</th></tr></thead><tbody>
            ${res.map(r => `<tr><td class="pm-label" title="${ea(r.m.nama)}">${ea(r.m.nama.length > 22 ? r.m.nama.slice(0, 21) + '…' : r.m.nama)}</td>
                ${kodes.concat(['sts', 'sas']).map(k => `<td><input inputmode="numeric" value="${ea((data[r.m.id] || {})[k] ?? '')}" data-m="${r.m.id}" data-k="${ea(k)}" oninput="setNilai(this)"></td>`).join('')}
                <td class="sum ${r.na !== null && !r.tuntas ? 'bad' : ''}" data-na="${r.m.id}">${r.na ?? ''}</td></tr>`).join('')}
            </tbody></table></div></div>`;
    }
    mount('ed-nilai', html);
}
function setNilai(el) {
    const rb = rombelAktif(); if (!rb) return;
    const s = appState.semester;
    const key = nilaiKey(rb.id, s);
    const box = appState.nilai[key] || (appState.nilai[key] = {});
    const row = box[el.dataset.m] || (box[el.dataset.m] = {});
    const v = el.value.trim().replace(',', '.');
    if (v === '') delete row[el.dataset.k]; else row[el.dataset.k] = Math.max(0, Math.min(100, Number(v) || 0));
    const kodes = tpForTingkat(appState.tingkat, s).map(x => x.kode);
    const r = hitungNilai(rb, s, kodes).find(x => x.m.id === el.dataset.m);
    const cell = document.querySelector(`#nilai-grid [data-na="${el.dataset.m}"]`);
    if (cell && r) { cell.textContent = r.na ?? ''; cell.classList.toggle('bad', r.na !== null && !r.tuntas); }
    renderSoon();
}
function addRombel() {
    const t = appState.tingkat;
    const nama = prompt('Nama rombel (mis. IX.F):', t + '.');
    if (!nama) return;
    const rb = { id: uid('rb'), nama: nama.trim(), tingkat: t, murid: [] };
    appState.rombel.push(rb); appState.rombelAktif = rb.id;
    renderNilaiEditor(); renderAll();
}
function removeRombel() {
    const rb = rombelAktif(); if (!rb) return;
    if (!confirm(`Hapus rombel ${rb.nama} beserta nilainya?`)) return;
    appState.rombel = appState.rombel.filter(r => r !== rb);
    Object.keys(appState.nilai).forEach(k => { if (k.startsWith(rb.id + '|')) delete appState.nilai[k]; });
    renderNilaiEditor(); renderAll();
}
function parseMuridRows(rows) {
    return rows.map(cols => cols.map(c => String(c == null ? '' : c).trim())).filter(cols => cols.some(Boolean)).map(cols => {
        let [nis, nama, lp] = cols;
        if (cols.length === 1) { nama = cols[0]; nis = ''; }
        if (nama && /^(nama|nama murid|nama siswa)$/i.test(nama)) return null;
        lp = /^p/i.test(lp || '') ? 'P' : (/^l/i.test(lp || '') ? 'L' : '');
        return nama ? { nis, nama, lp } : null;
    }).filter(Boolean);
}
function setMuridList(rb, rows) {
    const old = rb.murid;
    rb.murid = rows.map(r => {
        const prev = old.find(m => m.nama.toLowerCase() === r.nama.toLowerCase() || (r.nis && m.nis === r.nis));
        return { id: prev ? prev.id : uid('m'), nis: r.nis, nama: r.nama, lp: r.lp };
    });
}
function applyMuridPaste() {
    const rb = rombelAktif(); if (!rb) return;
    const text = document.getElementById('murid-paste').value;
    const rows = parseMuridRows(text.split('\n').map(line => line.split(/\t|;|,(?=\s*\S)/)));
    setMuridList(rb, rows);
    renderNilaiEditor(); renderAll();
    showToast(`${rb.murid.length} murid tersimpan di ${rb.nama}.`);
}
function importMuridExcel(event) {
    const file = event.target.files[0];
    event.target.value = '';
    const rb = rombelAktif();
    if (!file || !rb || !ensureXLSX()) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const wb = XLSX.read(e.target.result, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
            // Cari baris judul yang memuat "Nama"
            const hi = aoa.findIndex(r => r.some(c => /^nama/i.test(String(c).trim())));
            let rows;
            if (hi >= 0) {
                const h = aoa[hi].map(c => String(c).trim().toLowerCase());
                const ci = { nis: h.findIndex(c => /^(nis|nisn|no\.? ?induk)/.test(c)), nama: h.findIndex(c => /^nama/.test(c)), lp: h.findIndex(c => /^(l\/p|jk|jenis)/.test(c)) };
                rows = aoa.slice(hi + 1).map(r => [ci.nis >= 0 ? r[ci.nis] : '', r[ci.nama], ci.lp >= 0 ? r[ci.lp] : '']);
            } else rows = aoa;
            const list = parseMuridRows(rows);
            if (!list.length) { showToast('Tidak ada nama murid yang terbaca.'); return; }
            setMuridList(rb, list);
            renderNilaiEditor(); renderAll();
            showToast(`${list.length} murid diimpor ke ${rb.nama}.`);
        } catch (err) { console.error(err); showToast('Berkas Excel gagal dibaca.'); }
    };
    reader.readAsArrayBuffer(file);
}
function downloadNilaiTemplate() {
    if (!ensureXLSX()) return;
    const rb = rombelAktif();
    const rows = [['NIS', 'Nama', 'L/P']].concat(rb && rb.murid.length ? rb.murid.map(m => [m.nis, m.nama, m.lp]) : [['2425101', 'Nama Murid', 'L']]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Murid');
    XLSX.writeFile(wb, `Template_Murid_${rb ? rb.nama : 'Rombel'}.xlsx`);
}
