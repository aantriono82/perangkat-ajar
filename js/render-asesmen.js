// ============================================================================
// DOKUMEN D: MODUL AJAR (PEMBELAJARAN MENDALAM), KKTP, JURNAL MENGAJAR, DAFTAR NILAI
// ============================================================================

function tpByKode(kode) { return appState.tp.find(x => x.kode.replace(/\.$/, '') === String(kode).trim().replace(/\.$/, '')); }
function splitKode(s) { return String(s || '').split(/[,;]+/).map(x => x.trim().replace(/\.$/, '')).filter(Boolean); }

// TP yang dipakai suatu tingkat (urut ATP), dengan semester kemunculannya
function tpForTingkat(t, onlySem) {
    const out = [];
    [1, 2].forEach(s => {
        if (onlySem && onlySem !== s) return;
        (appState.atp[t][s] || []).forEach(b => splitKode(b.kodeTp).forEach(k => {
            if (!out.some(o => o.kode === k)) {
                const tp = tpByKode(k);
                out.push({ kode: k, semester: s, tujuan: tp ? tp.tujuan : '', materi: tp ? tp.materi : b.materi });
            }
        }));
    });
    return out;
}

// ---------- Modul Ajar ----------
function modulRow(label, content, opts) {
    const o = opts || {};
    return `<tr>${td(esc(label), 'font-weight:700;background:#f8fafc;' + (o.labelStyle || ''))}${td(content, 'text-align:justify')}</tr>`;
}
function sectionHead(letter, title) {
    return { html: `<div style="font-weight:700;font-size:11pt;margin:.35cm 0 .12cm;padding:2px 6px;background:${theme().head};color:${theme().headText}">${letter}. ${esc(title)}</div>`, keep: true };
}

function renderModulSatu(mod) {
    const id = appState.identitas;
    const t = mod.tingkat;
    const kodes = splitKode(mod.kodeTp);
    const elemenKode = (kodes[0] || 'A').charAt(0);
    const cp = (appState.cp.capaian[elemenKode] || {}).teks || '';
    const bab = (appState.atp[t][mod.semester] || []).find(b => b.id === mod.babId);
    const tbl = rows => ({ table: { open: tableOpen(10), cols: colsHTML(['27%', '']), head: '', rows } });
    const blocks = [
        { html: docTitleHTML('MODUL AJAR', 'PEMBELAJARAN MENDALAM', { bottom: 0.15 }) },
        { html: `<div style="text-align:center;font-size:11.5pt;font-weight:700;margin-bottom:.35cm">${esc(mod.judul || (bab && bab.materi) || '')}</div>` },
        sectionHead('A', 'IDENTITAS MODUL'),
        tbl([
            modulRow('Satuan Pendidikan', esc(id.sekolah)),
            modulRow('Mata Pelajaran', esc(id.mapel)),
            modulRow('Kelas / Semester', `${esc(t)} / ${mod.semester === 1 ? '1 (Ganjil)' : '2 (Genap)'}`),
            modulRow('Materi Pokok', esc(bab ? bab.materi : mod.judul)),
            modulRow('Kode TP', esc(mod.kodeTp)),
            modulRow('Alokasi Waktu', esc(mod.alokasi) + (mod.pertemuanKe ? ` — Pertemuan ke-${esc(mod.pertemuanKe)}` : '')),
            modulRow('Penyusun', esc(id.guru)),
            modulRow('Tahun Pelajaran', esc(id.tapel))
        ]),
        sectionHead('B', 'IDENTIFIKASI'),
        tbl([
            modulRow('Murid', bulletLines(mod.identifikasiMurid)),
            modulRow('Materi Pelajaran', bulletLines(mod.identifikasiMateri)),
            modulRow('Dimensi Profil Lulusan', `<table style="width:100%;border-collapse:collapse;font-size:9.5pt">${[0, 2, 4, 6].map(i => `<tr>${[i, i + 1].map(j => `<td style="padding:0 4px 1px 0;width:50%">${(mod.dimensi || []).includes(DIMENSI_PROFIL[j]) ? '☑' : '☐'} ${esc(DIMENSI_PROFIL[j])}</td>`).join('')}</tr>`).join('')}</table>`)
        ]),
        sectionHead('C', 'DESAIN PEMBELAJARAN'),
        tbl([
            modulRow('Capaian Pembelajaran', String(cp).split('\n').map(esc).join('<br>')),
            modulRow('Lintas Disiplin Ilmu', bulletLines(mod.lintasDisiplin)),
            modulRow('Tujuan Pembelajaran', bulletLines(mod.tujuan || kodes.map(k => (tpByKode(k) || {}).tujuan).filter(Boolean).join('\n'))),
            modulRow('Topik Pembelajaran', bulletLines(mod.topik)),
            modulRow('Praktik Pedagogis', bulletLines(mod.praktikPedagogis)),
            modulRow('Kemitraan Pembelajaran', bulletLines(mod.kemitraan)),
            modulRow('Lingkungan Pembelajaran', bulletLines(mod.lingkungan)),
            modulRow('Pemanfaatan Digital', bulletLines(mod.digital))
        ]),
        sectionHead('D', 'PENGALAMAN BELAJAR')
    ];
    (mod.pertemuan || []).forEach((p, i) => {
        blocks.push({ html: `<div style="font-weight:700;font-size:10.5pt;margin:.15cm 0 .1cm">${esc(p.judul || 'Pertemuan ' + (i + 1))}</div>`, keep: true });
        blocks.push({ table: {
            open: tableOpen(10), cols: colsHTML(['27%', '']),
            head: `<tr>${th('Tahap')}${th('Kegiatan Pembelajaran')}</tr>`,
            rows: [
                modulRow('Kegiatan Awal', bulletLines(p.awal), { labelStyle: 'font-weight:700' }) ,
                `<tr><td colspan="2" style="${B}padding:2px 5px;font-weight:700;background:${theme().sub}">Kegiatan Inti</td></tr>`,
                modulRow('Memahami', bulletLines(p.memahami)),
                modulRow('Mengaplikasi', bulletLines(p.mengaplikasi)),
                modulRow('Merefleksi', bulletLines(p.merefleksi)),
                modulRow('Kegiatan Penutup', bulletLines(p.penutup))
            ]
        } });
    });
    blocks.push({ html: `<div style="font-size:8.5pt;color:#334155;margin-top:.1cm">Prinsip pembelajaran mendalam: <i>berkesadaran</i>, <i>bermakna</i>, dan <i>menggembirakan</i>.</div>` });
    blocks.push(sectionHead('E', 'ASESMEN PEMBELAJARAN'));
    blocks.push(tbl([
        modulRow('Asesmen Awal', bulletLines(mod.asesmenAwal)),
        modulRow('Asesmen Proses', bulletLines(mod.asesmenProses)),
        modulRow('Asesmen Akhir', bulletLines(mod.asesmenAkhir))
    ]));
    if (String(mod.lampiran || '').trim()) {
        blocks.push(sectionHead('F', 'LAMPIRAN'));
        blocks.push({ html: `<div style="font-size:10pt;padding:0 .2cm">${bulletLines(mod.lampiran)}</div>` });
    }
    blocks.push({ html: signatureHTML() });
    return { orientation: 'portrait', blocks, label: 'Modul Ajar ' + (mod.judul || '') };
}

function modulUntuk(t) { return appState.modul.filter(m => m.tingkat === t); }

function renderModul(t, onlyActive) {
    let list = modulUntuk(t);
    if (onlyActive) {
        const act = list.find(m => m.id === appState.modulAktif);
        if (act) list = [act];
    }
    if (!list.length) return [emptySegment('Belum ada modul ajar untuk kelas ' + t, 'Tambahkan modul di menu Modul Ajar.')];
    return list.map(renderModulSatu);
}

function emptySegment(title, hint) {
    return { orientation: 'portrait', blocks: [{ html: `<div style="margin-top:6cm;text-align:center;font-family:Inter,Arial,sans-serif;color:#475569"><div style="font-size:14pt;font-weight:700;color:#0f172a">${esc(title)}</div><div style="font-size:10pt;margin-top:.2cm">${esc(hint)}</div></div>` }] };
}

// ---------- KKTP ----------
function renderKKTP(t) {
    const k = appState.kktp;
    const list = tpForTingkat(t);
    const blocks = [
        { html: docTitleHTML('KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN', '(KKTP)', { bottom: 0.3 }) },
        { html: stdIdentity(t, null) },
        { html: `<div style="font-weight:700;font-size:10.5pt;margin:.2cm 0 .1cm">A. Interval Nilai dan Tindak Lanjut</div>`, keep: true },
        { table: {
            open: tableOpen(10), cols: colsHTML(['7%', '22%', '']),
            head: `<tr>${th('No')}${th('Interval Nilai')}${th('Keterangan / Tindak Lanjut')}</tr>`,
            rows: k.interval.map((iv, i) => `<tr>${td(i + 1, 'text-align:center')}${td(`${esc(iv.min)} – ${esc(iv.max)}`, 'text-align:center')}${td(esc(iv.keterangan))}</tr>`)
        } },
        { html: `<div style="font-size:10pt;margin:.15cm 0 .1cm">Batas ketercapaian (tuntas): nilai ≥ <b>${esc(k.batas)}</b>.</div>` },
        { html: `<div style="font-weight:700;font-size:10.5pt;margin:.3cm 0 .1cm">B. Kriteria Ketercapaian per Tujuan Pembelajaran</div>`, keep: true },
        { table: {
            open: tableOpen(9.5), cols: colsHTML(['5%', '8%', '36%', '', '7%']),
            head: `<tr>${th('No')}${th('Kode TP')}${th('Tujuan Pembelajaran')}${th('Kriteria Ketercapaian (Indikator)')}${th('Smt')}</tr>`,
            rows: list.map((x, i) => {
                const ind = k.indikator[x.kode] || `Murid mampu ${String(x.tujuan || x.materi).replace(/^./, c => c.toLowerCase())}`;
                return `<tr>${td(i + 1, 'text-align:center')}${td(esc(x.kode), 'text-align:center')}${td(esc(x.tujuan), 'text-align:justify')}${td(bulletLines(ind))}${td(x.semester, 'text-align:center')}</tr>`;
            })
        } },
        { html: signatureHTML() }
    ];
    return [{ orientation: 'portrait', blocks, label: 'KKTP Kelas ' + t }];
}

// ---------- Jurnal Mengajar ----------
function jurnalUntuk(t, s) {
    return appState.jurnal.filter(j => j.tingkat === t && Number(j.semester) === s).sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)));
}
function hariTanggal(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return esc(iso || '');
    return `${NAMA_HARI[dayOfWeek(isoToDay(iso))]}, ${esc(formatTanggalIndo(iso))}`;
}

function renderJurnal(t) {
    const s = appState.semester;
    const list = jurnalUntuk(t, s);
    const kosong = Math.max(0, Math.min(60, Number(appState.jurnalKosong) || 0));
    const c = (v, x) => td(v, 'font-size:9pt;' + (x || ''));
    const rows = list.map((j, i) => `<tr>${c(i + 1, 'text-align:center')}${c(hariTanggal(j.tanggal))}${c(esc(j.rombel), 'text-align:center')}${c(esc(j.jamKe), 'text-align:center')}${c(esc(j.kodeTp), 'text-align:center')}${c(esc(j.materi))}${c(bulletLines(j.kegiatan))}${c(esc(j.hadir), 'text-align:center')}${c(esc(j.absen))}${c(esc(j.catatan))}${c('')}</tr>`);
    for (let i = 0; i < kosong; i++) rows.push(`<tr style="height:.9cm">${c(list.length + i + 1, 'text-align:center')}${Array(10).fill(c('&nbsp;')).join('')}</tr>`);
    const blocks = [
        { html: docTitleHTML('JURNAL MENGAJAR GURU', null, { bottom: 0.25 }) },
        { html: stdIdentity(t, s, [['GURU', appState.identitas.guru]]) },
        { table: {
            open: tableOpen(9), cols: colsHTML(['3.5%', '11%', '6%', '5%', '5.5%', '13%', '', '6%', '10%', '12%', '5%']),
            head: `<tr>${['No', 'Hari / Tanggal', 'Kelas', 'Jam ke-', 'Kode TP', 'Materi', 'Kegiatan Pembelajaran', 'Jumlah Hadir', 'Tidak Hadir (Nama/Ket.)', 'Catatan / Tindak Lanjut', 'Paraf'].map(x => th(x, 'font-size:8.5pt')).join('')}</tr>`,
            rows: rows.length ? rows : [`<tr>${td('Belum ada catatan jurnal.', 'text-align:center;color:#64748b', 'colspan="11"')}</tr>`]
        } },
        { html: signatureHTML({ fontPt: 10 }) }
    ];
    return [{ orientation: 'landscape', blocks, label: 'Jurnal Kelas ' + t }];
}

// ---------- Daftar Nilai ----------
function nilaiKey(rbId, s) { return rbId + '|' + s; }
function hitungNilai(rb, s, kodes) {
    const data = appState.nilai[nilaiKey(rb.id, s)] || {};
    const bw = appState.bobot;
    return rb.murid.map(m => {
        const v = data[m.id] || {};
        const tpVals = kodes.map(k => v[k]).filter(x => x !== '' && x != null && !isNaN(Number(x))).map(Number);
        const avgTp = tpVals.length ? tpVals.reduce((a, b) => a + b, 0) / tpVals.length : null;
        const parts = [[avgTp, Number(bw.tp) || 0], [v.sts === '' || v.sts == null ? null : Number(v.sts), Number(bw.sts) || 0], [v.sas === '' || v.sas == null ? null : Number(v.sas), Number(bw.sas) || 0]]
            .filter(([val, w]) => val !== null && !isNaN(val) && w > 0);
        const wSum = parts.reduce((a, [, w]) => a + w, 0);
        const na = wSum ? Math.round(parts.reduce((a, [val, w]) => a + val * w, 0) / wSum) : null;
        return { m, v, avgTp, na, tuntas: na !== null && na >= Number(appState.kktp.batas) };
    });
}

function renderNilai(t) {
    const s = appState.semester;
    const rombels = appState.rombel.filter(r => r.tingkat === t);
    if (!rombels.length) return [emptySegment('Belum ada rombel kelas ' + t, 'Tambahkan rombel & murid di menu Daftar Nilai.')];
    const kodes = tpForTingkat(t, s).map(x => x.kode);
    return rombels.map(rb => {
        const res = hitungNilai(rb, s, kodes);
        const c = (v, x) => td(v, 'text-align:center;font-size:9pt;padding:2px;' + (x || ''));
        const fmt = v => v === null || v === undefined || v === '' ? '' : (Math.round(Number(v) * 10) / 10).toString().replace('.', ',');
        const rows = res.map((r, i) => `<tr>${c(i + 1)}${c(esc(r.m.nis))}${td(esc(r.m.nama), 'font-size:9pt;padding:2px 4px')}${c(esc(r.m.lp))}${kodes.map(k => c(fmt(r.v[k]))).join('')}${c(fmt(r.avgTp), 'background:#f8fafc')}${c(fmt(r.v.sts))}${c(fmt(r.v.sas))}${c(r.na === null ? '' : r.na, 'font-weight:700')}${c(r.na === null ? '' : (r.tuntas ? 'Tuntas' : 'Belum'), r.tuntas ? '' : 'color:#b91c1c')}</tr>`);
        const stat = (label, fn) => {
            const col = arr => { const xs = arr.filter(x => x !== null && x !== '' && x != null && !isNaN(Number(x))).map(Number); return xs.length ? fn(xs) : ''; };
            return `<tr style="font-weight:700">${td(label, 'font-size:9pt;text-align:right', 'colspan="4"')}${kodes.map(k => c(fmt(col(res.map(r => r.v[k]))))).join('')}${c(fmt(col(res.map(r => r.avgTp))))}${c(fmt(col(res.map(r => r.v.sts))))}${c(fmt(col(res.map(r => r.v.sas))))}${c(fmt(col(res.map(r => r.na))))}${c('')}</tr>`;
        };
        const tuntas = res.filter(r => r.tuntas).length;
        const nWidth = Math.max(4, Math.min(7, 48 / Math.max(1, kodes.length + 5)));
        const blocks = [
            { html: docTitleHTML('DAFTAR NILAI MURID', null, { bottom: 0.25 }) },
            { html: identityHTML([['NAMA SEKOLAH', appState.identitas.sekolah], ['MATA PELAJARAN', appState.identitas.mapel.toUpperCase()], ['KELAS', rb.nama]],
                [['SEMESTER', s === 1 ? '1 (GANJIL)' : '2 (GENAP)'], ['TAHUN PELAJARAN', appState.identitas.tapel], ['KKTP', `≥ ${appState.kktp.batas}`]]) },
            { table: {
                open: tableOpen(9), cols: colsHTML(['4%', '9%', '', '4%'].concat(kodes.map(() => nWidth + '%'), [nWidth + '%', nWidth + '%', nWidth + '%', nWidth + '%', '7%'])),
                head: `<tr>${th('No', '', 'rowspan="2"')}${th('NIS', '', 'rowspan="2"')}${th('Nama Murid', '', 'rowspan="2"')}${th('L/P', '', 'rowspan="2"')}${kodes.length ? th('Nilai Tujuan Pembelajaran (Sumatif Lingkup Materi)', 'font-size:8.5pt', `colspan="${kodes.length + 1}"`) : ''}${th('ASTS', '', 'rowspan="2"')}${th('ASAS/ ASAT', 'font-size:8.5pt', 'rowspan="2"')}${th('Nilai Akhir', 'font-size:8.5pt', 'rowspan="2"')}${th('Ket.', '', 'rowspan="2"')}</tr>
                       <tr>${kodes.map(k => th(esc(k), `background:${theme().sub};color:#000;font-size:8.5pt`)).join('')}${kodes.length ? th('Rata-rata', `background:${theme().sub};color:#000;font-size:8pt`) : ''}</tr>`,
                rows: rows.length ? rows : [`<tr>${td('Belum ada murid.', 'text-align:center;color:#64748b', `colspan="${kodes.length + 9}"`)}</tr>`],
                foot: res.length ? stat('Rata-rata kelas', xs => xs.reduce((a, b) => a + b, 0) / xs.length) + stat('Nilai tertinggi', xs => Math.max(...xs)) + stat('Nilai terendah', xs => Math.min(...xs)) : ''
            } },
            { html: `<div style="font-size:9pt;margin-top:.15cm">Nilai akhir = (${appState.bobot.tp}% × rata-rata TP) + (${appState.bobot.sts}% × ASTS) + (${appState.bobot.sas}% × ASAS/ASAT). Ketuntasan: <b>${tuntas}</b> dari ${res.length} murid (${res.length ? Math.round(tuntas / res.length * 100) : 0}%).</div>` },
            { html: signatureHTML({ fontPt: 10 }) }
        ];
        return { orientation: 'landscape', blocks, label: 'Daftar Nilai ' + rb.nama };
    });
}
