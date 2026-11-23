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
// Tiga pendekatan (Panduan Pembelajaran dan Asesmen Edisi Revisi 2025, hlm. 40–45):
// deskripsi kriteria, rubrik, interval nilai. Pendekatan umum bisa diganti per TP.
function kktpTp(kode) { const m = appState.kktp.tp || {}; return Object.prototype.hasOwnProperty.call(m, kode) && m[kode] ? m[kode] : {}; }
function kktpPendekatan(kode) {
    const p = kktpTp(kode).pendekatan;
    if (PENDEKATAN_KKTP[p]) return p;
    return PENDEKATAN_KKTP[appState.kktp.pendekatan] ? appState.kktp.pendekatan : 'interval';
}
const lcFirst = s => String(s || '').replace(/^./, c => c.toLowerCase());
function kktpKriteria(x) {
    const raw = appState.kktp.indikator[x.kode];
    const lines = String(raw || '').split(/\n+/).map(l => l.trim().replace(/^[-•]\s*/, '')).filter(Boolean);
    return lines.length ? lines : [`Murid mampu ${lcFirst(x.tujuan || x.materi)}`];
}
function kktpMinKriteria(kode, n) {
    const v = Math.round(Number(kktpTp(kode).minKriteria));
    return v >= 1 && v <= n ? v : Math.max(1, Math.ceil(n * 0.75));
}
function kktpLevels() { const l = (appState.kktp.level || []).map(x => String(x).trim()); return l.length >= 2 ? l : DEFAULT_LEVEL_RUBRIK.slice(); }
function kktpSkala() { const l = (appState.kktp.skala || []).map(x => String(x).trim()); return l.length >= 2 ? l : DEFAULT_SKALA.slice(); }
function kktpMinLevel(kode, a, nLevel) {
    const v = (kktpTp(kode).minLevel || [])[a];
    return Number.isInteger(v) && v >= 0 && v < nLevel ? v : Math.max(0, nLevel - 2);
}
// Deskripsi rubrik bawaan bila belum diisi guru
function rubrikDefault(aspek, l, n) {
    const a = lcFirst(String(aspek).replace(/[.;]\s*$/, ''));
    if (l === 0) return `Mulai mampu ${a}, tetapi masih memerlukan bantuan atau terdapat kesalahan.`;
    if (l === n - 1) return `Mampu ${a} dengan benar dan dapat menjelaskan alasannya atau menerapkannya pada masalah yang lebih kompleks.`;
    if (l === n - 2) return `Mampu ${a} dengan benar.`;
    return `Mampu ${a} dengan benar pada sebagian besar langkah.`;
}
function rubrikDesc(kode, aspek, a, l, n) {
    const r = ((kktpTp(kode).rubrik || [])[a] || [])[l];
    return r && String(r).trim() ? String(r).trim() : rubrikDefault(aspek, l, n);
}
// "aspek 1–3 minimal tahap Memahami, aspek 4 minimal tahap Mulai memahami"
function rubrikKesimpulan(kode, n, levels) {
    const mins = Array.from({ length: n }, (_, a) => kktpMinLevel(kode, a, levels.length));
    if (mins.every(m => m === mins[0])) return `${n > 1 ? 'semua aspek' : 'aspek tersebut'} mencapai minimal tahap <i>${esc(levels[mins[0]])}</i>`;
    const parts = [];
    let i = 0;
    while (i < n) {
        let j = i;
        while (j + 1 < n && mins[j + 1] === mins[i]) j++;
        parts.push(`aspek ${i === j ? i + 1 : `${i + 1}–${j + 1}`} minimal tahap <i>${esc(levels[mins[i]])}</i>`);
        i = j + 1;
    }
    return parts.slice(0, -1).join(', ') + ', dan ' + parts[parts.length - 1];
}
function kktpBatas() { const v = Number(appState.kktp.batas); return Number.isFinite(v) ? v : 61; }

function kktpBlocksForTp(x, no) {
    const p = kktpPendekatan(x.kode);
    const krit = kktpKriteria(x);
    const note = html => ({ html: `<div style="font-size:9.5pt;margin:.1cm 0 .3cm;text-align:justify;padding:3px 6px;background:#f8fafc;border-left:3px solid ${theme().head}"><b>Kesimpulan:</b> ${html}</div>` });
    const out = [{ html: `<div style="font-size:10pt;margin:.25cm 0 .1cm;text-align:justify"><b>${no}. ${esc(x.kode)}</b> — ${esc(x.tujuan || x.materi)} <span style="color:#475569">(Semester ${x.semester}; pendekatan: <b>${esc(PENDEKATAN_KKTP[p])}</b>)</span></div>`, keep: true }];
    if (p === 'deskripsi') {
        const min = kktpMinKriteria(x.kode, krit.length);
        out.push({ table: {
            open: tableOpen(9.5), cols: colsHTML(['6%', '', '15%', '15%']),
            head: `<tr>${th('No')}${th('Kriteria')}${th('Belum Tercapai')}${th('Tercapai')}</tr>`,
            rows: krit.map((k, i) => `<tr>${td(i + 1, 'text-align:center')}${td(esc(k), 'text-align:justify')}${td('')}${td('')}</tr>`)
        } });
        out.push(note(`Murid dianggap mencapai tujuan pembelajaran jika minimal <b>${min}</b> dari ${krit.length} kriteria tercapai. Bila belum, pendidik melakukan intervensi pembelajaran (remedial) pada kriteria yang belum tercapai.`));
    } else if (p === 'rubrik') {
        const levels = kktpLevels();
        const w = levels.length >= 5 ? 8.5 : 9.5;
        out.push({ table: {
            open: tableOpen(w), cols: colsHTML(['5%', '21%'].concat(levels.map(() => ''))),
            head: `<tr>${th('No')}${th('Aspek yang Dinilai')}${levels.map(l => th(esc(l))).join('')}</tr>`,
            rows: krit.map((k, a) => `<tr>${td(a + 1, 'text-align:center')}${td(esc(k), 'font-weight:600')}${levels.map((_, l) => td(esc(rubrikDesc(x.kode, k, a, l, levels.length)))).join('')}</tr>`)
        } });
        out.push(note(`Murid dianggap sudah mencapai tujuan pembelajaran jika ${rubrikKesimpulan(x.kode, krit.length, levels)}. Bila belum, dilakukan remedial pada aspek yang belum mencapai tahap minimal; murid yang mencapai tahap <i>${esc(levels[levels.length - 1])}</i> pada semua aspek dapat diberi pengayaan.`));
    } else {
        const sk = kktpSkala();
        const w = sk.length >= 6 ? 8 : 8.5;
        out.push({ table: {
            open: tableOpen(w), cols: colsHTML(['5%', '30%'].concat(sk.map(() => ''))),
            head: `<tr>${th('No', '', 'rowspan="2"')}${th('Kriteria Ketercapaian', '', 'rowspan="2"')}${th('Skala Pencapaian', '', `colspan="${sk.length}"`)}</tr>
                   <tr>${sk.map((l, i) => th(`${esc(l)}<br>(${i + 1})`, `background:${theme().sub};color:#000;font-weight:600;font-size:${w - 0.5}pt;overflow-wrap:anywhere`)).join('')}</tr>`,
            rows: krit.map((k, i) => `<tr style="height:.75cm">${td(i + 1, 'text-align:center')}${td(esc(k))}${sk.map(() => td('')).join('')}</tr>`)
        } });
        out.push(note(`Nilai = jumlah skor ÷ (${krit.length} kriteria × skor maksimum ${sk.length}) × 100. Murid dianggap sudah mencapai tujuan pembelajaran jika nilainya ≥ <b>${esc(kktpBatas())}</b>; tindak lanjut mengikuti interval nilai pada bagian C.`));
    }
    return out;
}

function renderKKTP(t) {
    const k = appState.kktp;
    const list = tpForTingkat(t);
    const dipakai = Object.keys(PENDEKATAN_KKTP).filter(p => list.some(x => kktpPendekatan(x.kode) === p));
    const uraian = {
        deskripsi: '<b>Deskripsi kriteria</b>: setiap kriteria dinilai <i>tercapai</i> atau <i>belum tercapai</i>; tujuan pembelajaran tercapai bila jumlah kriteria yang tercapai memenuhi batas minimal.',
        rubrik: `<b>Rubrik</b>: setiap aspek memiliki deskripsi performa pada tahap ${kktpLevels().map(l => '<i>' + esc(l) + '</i>').join(', ')}; tujuan pembelajaran tercapai bila setiap aspek mencapai tahap minimal yang ditetapkan.`,
        interval: `<b>Interval nilai</b>: setiap kriteria diberi skor 1–${kktpSkala().length}, skor diolah menjadi nilai 0–100, lalu ketercapaian dan tindak lanjut ditentukan berdasarkan interval nilai.`
    };
    const blocks = [
        { html: docTitleHTML('KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN', '(KKTP)', { bottom: 0.3 }) },
        { html: stdIdentity(t, null) },
        { html: `<div style="font-weight:700;font-size:10.5pt;margin:.2cm 0 .1cm">A. Pendekatan Penetapan KKTP</div>
            <div style="font-size:10pt;text-align:justify;margin-bottom:.1cm">Kriteria ketercapaian tujuan pembelajaran disusun mengacu pada Panduan Pembelajaran dan Asesmen Edisi Revisi Tahun 2025. Kriteria menjelaskan kompetensi yang perlu ditunjukkan murid sebagai bukti telah mencapai tujuan pembelajaran, dan ketercapaian ditentukan untuk setiap tujuan pembelajaran. Pendekatan yang digunakan:</div>
            <ul style="margin:0 0 .15cm;padding-left:.6cm;font-size:10pt;text-align:justify">${(dipakai.length ? dipakai : [kktpPendekatan('')]).map(p => `<li>${uraian[p]}</li>`).join('')}</ul>`, keep: true },
        { table: {
            open: tableOpen(9.5), cols: colsHTML(['6%', '9%', '', '17%', '7%']),
            head: `<tr>${th('No')}${th('Kode TP')}${th('Tujuan Pembelajaran')}${th('Pendekatan KKTP')}${th('Smt')}</tr>`,
            rows: list.length ? list.map((x, i) => `<tr>${td(i + 1, 'text-align:center')}${td(esc(x.kode), 'text-align:center')}${td(esc(x.tujuan), 'text-align:justify')}${td(esc(PENDEKATAN_KKTP[kktpPendekatan(x.kode)]), 'text-align:center')}${td(x.semester, 'text-align:center')}</tr>`)
                : [`<tr>${td('Belum ada TP pada ATP kelas ini.', 'text-align:center;color:#64748b', 'colspan="5"')}</tr>`]
        } },
        { html: `<div style="font-weight:700;font-size:10.5pt;margin:.35cm 0 .05cm">B. Kriteria Ketercapaian per Tujuan Pembelajaran</div>`, keep: true }
    ];
    list.forEach((x, i) => kktpBlocksForTp(x, i + 1).forEach(b => blocks.push(b)));
    blocks.push(
        { html: `<div style="font-weight:700;font-size:10.5pt;margin:.35cm 0 .05cm">C. Interval Nilai, Ketercapaian, dan Tindak Lanjut</div>
            <div style="font-size:10pt;text-align:justify;margin-bottom:.12cm">Nilai yang diperoleh (dari rubrik/skala maupun tes) digunakan untuk menentukan ketercapaian dan tindak lanjut sesuai intervalnya. Murid dinyatakan sudah mencapai tujuan pembelajaran bila nilainya ≥ <b>${esc(kktpBatas())}</b>.</div>`, keep: true },
        { table: {
            open: tableOpen(10), cols: colsHTML(['7%', '20%', '']),
            head: `<tr>${th('No')}${th('Interval Nilai')}${th('Ketercapaian dan Tindak Lanjut')}</tr>`,
            rows: k.interval.map((iv, i) => `<tr>${td(i + 1, 'text-align:center')}${td(`${esc(iv.min)} – ${esc(iv.max)}`, 'text-align:center')}${td(esc(iv.keterangan))}</tr>`)
        } },
        { html: signatureHTML() }
    );
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
        return { m, v, avgTp, na, tuntas: na !== null && na >= kktpBatas() };
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
        const tpBelum = v => v !== '' && v != null && !isNaN(Number(v)) && Number(v) < kktpBatas();
        const rows = res.map((r, i) => `<tr>${c(i + 1)}${c(esc(r.m.nis))}${td(esc(r.m.nama), 'font-size:9pt;padding:2px 4px')}${c(esc(r.m.lp))}${kodes.map(k => c(tpBelum(r.v[k]) ? fmt(r.v[k]) + '*' : fmt(r.v[k]), tpBelum(r.v[k]) ? 'color:#b91c1c' : '')).join('')}${c(fmt(r.avgTp), 'background:#f8fafc')}${c(fmt(r.v.sts))}${c(fmt(r.v.sas))}${c(r.na === null ? '' : r.na, 'font-weight:700')}${c(r.na === null ? '' : (r.tuntas ? 'Tuntas' : 'Belum'), r.tuntas ? '' : 'color:#b91c1c')}</tr>`);
        const stat = (label, fn) => {
            const col = arr => { const xs = arr.filter(x => x !== null && x !== '' && x != null && !isNaN(Number(x))).map(Number); return xs.length ? fn(xs) : ''; };
            return `<tr style="font-weight:700">${td(label, 'font-size:9pt;text-align:right', 'colspan="4"')}${kodes.map(k => c(fmt(col(res.map(r => r.v[k]))))).join('')}${c(fmt(col(res.map(r => r.avgTp))))}${c(fmt(col(res.map(r => r.v.sts))))}${c(fmt(col(res.map(r => r.v.sas))))}${c(fmt(col(res.map(r => r.na))))}${c('')}</tr>`;
        };
        const tuntas = res.filter(r => r.tuntas).length;
        const nWidth = Math.max(4, Math.min(7, 48 / Math.max(1, kodes.length + 5)));
        const blocks = [
            { html: docTitleHTML('DAFTAR NILAI MURID', null, { bottom: 0.25 }) },
            { html: identityHTML([['NAMA SEKOLAH', appState.identitas.sekolah], ['MATA PELAJARAN', appState.identitas.mapel.toUpperCase()], ['KELAS', rb.nama]],
                [['SEMESTER', s === 1 ? '1 (GANJIL)' : '2 (GENAP)'], ['TAHUN PELAJARAN', appState.identitas.tapel], ['KKTP', `≥ ${kktpBatas()}`]]) },
            { table: {
                open: tableOpen(9), cols: colsHTML(['4%', '9%', '', '4%'].concat(kodes.map(() => nWidth + '%'), [nWidth + '%', nWidth + '%', nWidth + '%', nWidth + '%', '7%'])),
                head: `<tr>${th('No', '', 'rowspan="2"')}${th('NIS', '', 'rowspan="2"')}${th('Nama Murid', '', 'rowspan="2"')}${th('L/P', '', 'rowspan="2"')}${kodes.length ? th('Nilai Tujuan Pembelajaran (Sumatif Lingkup Materi)', 'font-size:8.5pt', `colspan="${kodes.length + 1}"`) : ''}${th('ASTS', '', 'rowspan="2"')}${th('ASAS/ ASAT', 'font-size:8.5pt', 'rowspan="2"')}${th('Nilai Akhir', 'font-size:8.5pt', 'rowspan="2"')}${th('Ket.', '', 'rowspan="2"')}</tr>
                       <tr>${kodes.map(k => th(esc(k), `background:${theme().sub};color:#000;font-size:8.5pt`)).join('')}${kodes.length ? th('Rata-rata', `background:${theme().sub};color:#000;font-size:8pt`) : ''}</tr>`,
                rows: rows.length ? rows : [`<tr>${td('Belum ada murid.', 'text-align:center;color:#64748b', `colspan="${kodes.length + 9}"`)}</tr>`],
                foot: res.length ? stat('Rata-rata kelas', xs => xs.reduce((a, b) => a + b, 0) / xs.length) + stat('Nilai tertinggi', xs => Math.max(...xs)) + stat('Nilai terendah', xs => Math.min(...xs)) : ''
            } },
            { html: `<div style="font-size:9pt;margin-top:.15cm">Nilai akhir = (${appState.bobot.tp}% × rata-rata TP) + (${appState.bobot.sts}% × ASTS) + (${appState.bobot.sas}% × ASAS/ASAT). Ketuntasan: <b>${tuntas}</b> dari ${res.length} murid (${res.length ? Math.round(tuntas / res.length * 100) : 0}%). Tanda <b>*</b> = tujuan pembelajaran belum tercapai (nilai &lt; ${esc(kktpBatas())}).</div>` },
            { html: signatureHTML({ fontPt: 10 }) }
        ];
        return { orientation: 'landscape', blocks, label: 'Daftar Nilai ' + rb.nama };
    });
}
