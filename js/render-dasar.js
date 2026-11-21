// ============================================================================
// DOKUMEN A–B: SAMPUL, KATA PENGANTAR, LANDASAN, CP, TP, ATP, KALENDER
// Setiap fungsi mengembalikan larik segmen (lihat layout.js).
// ============================================================================

function kelasLabelSampul() {
    const list = diampuList().map(t => TINGKAT_ANGKA[t]);
    if (!list.length) return 'FASE ' + appState.identitas.fase;
    return 'KELAS ' + (list.length === 1 ? list[0] : list.slice(0, -1).join(', ') + ' & ' + list[list.length - 1]);
}

function coverArtSVG(color) {
    // Ornamen matematika generik (bukan gambar berhak cipta)
    return `<svg viewBox="0 0 600 420" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#ffffff" stroke-opacity=".9" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="60" y="150" width="150" height="190" rx="14" fill="#ffffff" fill-opacity=".14"/>
        <path d="M90 200h90M90 240h90M90 280h55"/>
        <path d="M95 197l10 10 18-20" stroke="#fde047"/><path d="M95 237l10 10 18-20" stroke="#fde047"/>
        <circle cx="430" cy="150" r="70" fill="#ffffff" fill-opacity=".12"/>
        <path d="M430 150L480 101M430 150h70"/>
        <path d="M300 340l90-160 90 160z" fill="#ffffff" fill-opacity=".12"/>
        <path d="M372 340v-18h18"/>
        <path d="M250 90l40 0M270 70v40" stroke="#fde047"/>
        <path d="M520 300l30 30M550 300l-30 30"/>
        <path d="M240 210c20-40 40 40 60 0s40 40 60 0" stroke="#fde047"/>
      </g>
      <g fill="#ffffff" font-family="Tinos, 'Times New Roman', serif" font-weight="700" fill-opacity=".9">
        <text x="230" y="300" font-size="64">π</text>
        <text x="505" y="250" font-size="46">√x</text>
        <text x="40" y="110" font-size="50" fill="#fde047">∑</text>
        <text x="520" y="400" font-size="40">%</text>
      </g>
    </svg>`;
}

function renderSampul() {
    const id = appState.identitas;
    const t = theme();
    const main = appState.setting.theme === 'hitam' ? '#334155' : t.head;
    const cover = `
    <div style="height:100%;display:flex;flex-direction:column;background:${main};color:#fff;font-family:Inter,Arial,sans-serif">
        <div style="background:#fff;color:#0f172a;display:flex;align-items:center;gap:.5cm;padding:.8cm 1.2cm .7cm">
            <img src="${imgUrl(id.logo)}" style="width:2.2cm;height:2.2cm;object-fit:contain">
            <div style="flex:1;line-height:1.15">
                <div style="font-size:17pt;font-weight:800">${esc(id.sekolah)}</div>
                <div style="font-size:12pt;font-weight:700;text-transform:uppercase;color:#334155">${esc(id.kabupaten)}</div>
            </div>
            <div style="border:2px solid ${main};color:${main};border-radius:999px;padding:.15cm .45cm;font-size:9.5pt;font-weight:700;white-space:nowrap">TAHUN PELAJARAN ${esc(id.tapel)}</div>
        </div>
        <div style="height:.35cm;background:#fde047"></div>
        <div style="padding:1.6cm 1.2cm 0;text-align:center">
            <div style="font-size:26pt;font-weight:800;letter-spacing:1px;line-height:1.1">${esc(id.judulSampul)}</div>
            <div style="font-size:40pt;font-weight:800;letter-spacing:2px;line-height:1.15;margin-top:.2cm;text-transform:uppercase">${esc(id.mapel)}</div>
            <div style="display:inline-block;margin-top:.55cm;background:#fff;color:${main};border-radius:.3cm;padding:.2cm .9cm;font-size:20pt;font-weight:800">${esc(kelasLabelSampul())}</div>
            <div style="margin-top:.35cm;font-size:12pt;font-weight:600;opacity:.9">Kurikulum ${esc(id.kurikulum)} • Fase ${esc(id.fase)}</div>
        </div>
        <div style="flex:1;min-height:0;padding:.6cm 1.4cm">${coverArtSVG(main)}</div>
        <div style="margin:0 1.6cm 1.6cm;background:#fff;color:#0f172a;border-radius:.4cm;padding:.6cm .9cm;font-size:15pt;line-height:1.9">
            <div style="display:flex;gap:.3cm"><span style="width:2.2cm;color:${main};font-weight:700">Nama</span><span>:</span><span style="flex:1;border-bottom:1.5px solid #94a3b8;font-weight:700">${esc(id.guru)}</span></div>
            <div style="display:flex;gap:.3cm"><span style="width:2.2cm;color:${main};font-weight:700">NIP</span><span>:</span><span style="flex:1;border-bottom:1.5px solid #94a3b8;font-weight:700">${esc(id.nipGuru)}</span></div>
        </div>
    </div>`;
    return [{ orientation: 'portrait', cover, label: 'Sampul' }];
}

function renderPengantar() {
    const id = appState.identitas;
    const text = fillPlaceholders(appState.pengantar);
    const blocks = [{ html: docTitleHTML('KATA PENGANTAR', null, { bottom: 0.7 }) }];
    // Paragraf biasa; baris yang diawali "-" menjadi daftar bernomor
    let list = [];
    const flush = () => { if (list.length) { blocks.push({ html: numberedList(list, { indent: 0.4 }) }); list = []; } };
    text.split('\n').map(s => s.trim()).filter(Boolean).forEach(line => {
        if (/^[-•]\s+/.test(line)) { list.push(line.replace(/^[-•]\s+/, '')); return; }
        flush();
        blocks.push({ html: `<p style="margin:0 0 .3cm;text-align:justify;line-height:1.45;font-size:11pt">${esc(line)}</p>` });
    });
    flush();
    blocks.push({ html: `<div style="margin-top:.8cm;margin-left:55%;font-size:11pt;line-height:1.35">
        <div>${esc(id.tempat)}, ${esc(id.tanggal)}</div><div>Penulis,</div><div style="height:1.6cm"></div>
        <div style="font-weight:700;text-decoration:underline">${esc(id.guru)}</div><div>NIP ${esc(id.nipGuru)}</div></div>` });
    return [{ orientation: 'portrait', blocks, label: 'Kata Pengantar' }];
}

function renderLandasan() {
    const id = appState.identitas;
    const items = appState.landasan.map(s => fillPlaceholders(s)).filter(s => s.trim());
    const intro = `Perangkat Kegiatan Belajar Mengajar (KBM) Mata Pelajaran ${id.mapel} Kelas ${fillPlaceholders('{kelasAngka}')} Tahun Pelajaran ${id.tapel} saya susun dengan mempertimbangkan:`;
    const blocks = [
        { html: docTitleHTML('LANDASAN PENYUSUNAN', null, { bottom: 0.6 }) },
        { html: `<p style="margin:0 0 .3cm;text-align:justify;font-size:11pt;line-height:1.4">${esc(intro)}</p>` }
    ];
    items.forEach((it, i) => blocks.push({ html: `<table style="width:100%;border-collapse:collapse;font-size:11pt;line-height:1.4"><tr><td style="width:.9cm;vertical-align:top;padding-bottom:.15cm">${i + 1}.</td><td style="text-align:justify;padding-bottom:.15cm">${esc(it)}</td></tr></table>` }));
    return [{ orientation: 'portrait', blocks, label: 'Landasan' }];
}

function renderCP() {
    const cp = appState.cp;
    const id = appState.identitas;
    const h = (txt) => ({ html: `<div style="font-weight:700;font-size:11pt;margin:.35cm 0 .15cm">${esc(txt)}</div>`, keep: true });
    const p = (txt, indent) => ({ html: `<p style="margin:0 0 .2cm ${indent || 0.5}cm;text-align:justify;font-size:11pt;line-height:1.4">${esc(txt)}</p>` });
    const blocks = [
        { html: docTitleHTML('CAPAIAN PEMBELAJARAN', `MATA PELAJARAN ${id.mapel} FASE ${id.fase}`, { bottom: 0.4 }) },
        { html: `<div style="border:1px solid #000;padding:.2cm .3cm;font-size:10pt;margin-bottom:.3cm"><b>Isi sesuai dengan:</b><br>${esc(cp.dasar)}</div>` },
        h(`A. RASIONAL MATA PELAJARAN ${id.mapel.toUpperCase()}`)
    ];
    cp.rasional.forEach(t => blocks.push(p(t)));
    blocks.push(h(`B. TUJUAN MATA PELAJARAN ${id.mapel.toUpperCase()}`));
    blocks.push(p(`Mata pelajaran ${id.mapel} bertujuan untuk membekali murid agar dapat:`));
    cp.tujuan.forEach((t, i) => blocks.push({ html: `<table style="width:100%;border-collapse:collapse;font-size:11pt;line-height:1.4"><tr><td style="width:1.2cm;vertical-align:top;padding:0 0 .12cm .5cm">${i + 1}.</td><td style="text-align:justify;padding-bottom:.12cm">${esc(t)}</td></tr></table>` }));
    blocks.push(h(`C. KARAKTERISTIK MATA PELAJARAN ${id.mapel.toUpperCase()}`));
    blocks.push(p(cp.karakteristikPengantar));
    blocks.push(p('1. ' + cp.kontenPengantar));
    blocks.push({ table: {
        open: tableOpen(10, 'margin:0 0 .3cm .5cm;width:calc(100% - .5cm)'), cols: colsHTML(['26%', '']),
        head: `<tr>${th('Elemen')}${th('Deskripsi')}</tr>`,
        rows: cp.elemenKonten.map(e => `<tr>${td(esc(e.elemen), 'font-weight:600')}${td(esc(e.deskripsi), 'text-align:justify')}</tr>`)
    } });
    blocks.push(p('2. ' + cp.prosesPengantar));
    blocks.push({ table: {
        open: tableOpen(10, 'margin:0 0 .3cm .5cm;width:calc(100% - .5cm)'), cols: colsHTML(['7%', '25%', '']),
        head: `<tr>${th('No')}${th('Elemen')}${th('Deskripsi')}</tr>`,
        rows: cp.elemenProses.map((e, i) => `<tr>${td(i + 1, 'text-align:center')}${td(esc(e.elemen), 'font-weight:600')}${td(esc(e.deskripsi), 'text-align:justify')}</tr>`)
    } });
    blocks.push(h(`D. CAPAIAN PEMBELAJARAN FASE ${id.fase}`));
    blocks.push(p(cp.fasePengantar));
    ELEMEN.forEach((e, i) => {
        const c = cp.capaian[e.kode];
        if (!c) return;
        blocks.push({ html: `<div style="font-weight:700;font-size:11pt;margin:.1cm 0 .08cm .5cm">${i + 1}. ${esc(e.nama)}</div>`, keep: true });
        String(c.teks || '').split('\n').filter(s => s.trim()).forEach(par => blocks.push(p(par, 1.1)));
    });
    return [{ orientation: 'portrait', blocks, label: 'Capaian Pembelajaran' }];
}

function renderTP() {
    const id = appState.identitas;
    const cp = appState.cp;
    const blocks = [
        { html: docTitleHTML('TUJUAN PEMBELAJARAN FASE ' + id.fase, `(TP FASE ${id.fase})`, { bottom: 0.3 }) },
        { html: identityHTML([['NAMA SEKOLAH', id.sekolah], ['MATA PELAJARAN', id.mapel.toUpperCase()]], [['PENYUSUN', id.guru], ['TAHUN PELAJARAN', id.tapel]]) }
    ];
    ELEMEN.forEach(e => {
        const list = appState.tp.filter(x => x.elemen === e.kode);
        const c = cp.capaian[e.kode] || {};
        if (!list.length && !c.teks) return;
        blocks.push({ html: `${tableOpen(9.5, 'margin-top:.25cm')}${colsHTML(['16%', ''])}<tr>${th('ELEMEN')}${th('CAPAIAN PEMBELAJARAN')}</tr>
            <tr>${td(esc(e.nama), 'font-weight:700')}${td(String(c.teks || '').split('\n').map(esc).join('<br>'), 'text-align:justify')}</tr></table>`, keep: true });
        if (c.konsep) blocks.push({ html: `<div style="font-size:9.5pt;margin:.15cm 0"><b>Konten/Konsep Utama:</b> ${esc(c.konsep)}</div>`, keep: true });
        blocks.push({ table: {
            open: tableOpen(9.5), cols: colsHTML(['5%', '', '20%', '7%', '8%']),
            head: `<tr>${th('NO')}${th('TUJUAN PEMBELAJARAN')}${th('MATERI')}${th('KODE TP')}${th('ALOKASI WAKTU')}</tr>
                   <tr>${['(1)', '(2)', '(3)', '(4)', '(5)'].map(x => th(x, `background:${theme().sub};color:#000;font-weight:400;font-size:8pt;padding:1px`)).join('')}</tr>`,
            rows: list.map((x, i) => `<tr>${td(i + 1, 'text-align:center')}${td(esc(x.tujuan), 'text-align:justify')}${td(esc(x.materi), 'text-align:center')}${td(esc(x.kode), 'text-align:center')}${td(esc(x.jp) + ' JP', 'text-align:center;white-space:nowrap')}</tr>`)
        } });
    });
    const notes = appState.tpCatatan.map(s => fillPlaceholders(s)).filter(s => s.trim());
    if (notes.length) blocks.push({ html: `<div style="font-size:9pt;margin-top:.35cm"><b>Catatan:</b><ul style="margin:.05cm 0 0;padding-left:.6cm">${notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul></div>` });
    blocks.push({ html: signatureHTML({ fontPt: 10 }) });
    return [{ orientation: 'landscape', blocks, label: 'Tujuan Pembelajaran' }];
}

function renderATPTingkat(t) {
    const id = appState.identitas;
    const blocks = [
        { html: docTitleHTML(`ALUR TUJUAN PEMBELAJARAN (ATP) KELAS ${TINGKAT_ANGKA[t]}`, null, { bottom: 0.35 }) },
        { html: identityHTML([['NAMA SEKOLAH', id.sekolah], ['MATA PELAJARAN', id.mapel.toUpperCase()]], [['KURIKULUM', id.kurikulum.toUpperCase()], ['FASE', id.fase]]) }
    ];
    [1, 2].forEach(s => {
        const babs = appState.atp[t][s] || [];
        const total = babs.reduce((a, b) => a + babJp(b), 0);
        blocks.push({ html: `<div style="font-weight:700;font-size:10.5pt;margin:.3cm 0 .12cm">Semester ${s}</div>`, keep: true });
        blocks.push({ table: {
            open: tableOpen(10), cols: colsHTML(['7%', '', '22%', '14%', '17%']),
            head: `<tr>${th('No')}${th('Materi Pokok')}${th('Kode Tujuan Pembelajaran')}${th('Alokasi Waktu')}${th('Keterangan')}</tr>`,
            rows: babs.map((b, i) => `<tr>${td(i + 1, 'text-align:center')}${td(esc(b.materi))}${td(esc(b.kodeTp), 'text-align:center')}${td(babJp(b) + ' JP', 'text-align:center')}${td('')}</tr>`),
            foot: `<tr>${td('', 'border-right:0')}${td('<b>Jumlah</b>', 'border-left:0')}${td('')}${td(`<b>${total} JP</b>`, 'text-align:center')}${td(`1 JP = ${appState.setting.menitJp} menit`, 'text-align:center;font-size:9pt')}</tr>`
        } });
    });
    blocks.push({ html: signatureHTML() });
    return { orientation: 'portrait', blocks, label: 'ATP Kelas ' + TINGKAT_ANGKA[t] };
}

function renderATP() {
    const list = TINGKAT.filter(t => ['1', '2'].some(s => (appState.atp[t][s] || []).length));
    return (list.length ? list : TINGKAT).map(renderATPTingkat);
}

// ---------- Kalender pendidikan (satu halaman per semester) ----------
function kalenderMonthRows(y, m) {
    const t = theme();
    const first = Date.UTC(y, m, 1) / DAY_MS;
    const last = Date.UTC(y, m + 1, 0) / DAY_MS;
    const startCol = dayOfWeek(first);
    const nCols = Math.ceil((startCol + (last - first + 1)) / 7);
    const schoolDays = schoolDayNumbers();
    const monthAgenda = (appState.agenda || []).filter(a => a.mulai && isoToDay(a.mulai) <= last && isoToDay(a.selesai || a.mulai) >= first)
        .sort((a, b) => a.mulai.localeCompare(b.mulai));
    const ketLines = monthAgenda.map(a => {
        const s = Math.max(isoToDay(a.mulai), first), e = Math.min(isoToDay(a.selesai || a.mulai), last);
        const ds = dayParts(s).d, de = dayParts(e).d;
        const kelasTxt = a.kelas && a.kelas.length && a.kelas.length < 3 ? ` (kelas ${a.kelas.join(', ')})` : '';
        return `<div style="display:flex;gap:4px"><span style="min-width:1.1cm;font-weight:700;color:${JENIS_AGENDA[a.jenis] ? JENIS_AGENDA[a.jenis].ink : '#000'}">${ds === de ? ds : ds + '–' + de}</span><span>: ${esc(a.nama)}${esc(kelasTxt)}</span></div>`;
    }).join('');
    let rows = '';
    for (let dw = 0; dw < 7; dw++) {
        let cells = '';
        for (let c = 0; c < 6; c++) {
            const n = first + c * 7 + dw - startCol;
            let content = '', style = 'text-align:center;padding:0 2px;';
            if (c < nCols && n >= first && n <= last) {
                content = dayParts(n).d;
                const ag = agendaOnDay(n, null);
                const blocking = ag.find(isBlocking);
                if (dw === 0) style += 'color:#c00000;font-weight:700;';
                else if (!schoolDays.includes(dw)) style += 'color:#64748b;';
                if (blocking) style += `background:${JENIS_AGENDA[blocking.jenis].color};`;
                else if (ag.length) style += `background:${JENIS_AGENDA.info.color};`;
            }
            cells += `<td style="${B}${style}">${content}</td>`;
        }
        rows += `<tr>${dw === 0 ? `<td rowspan="7" style="${B}text-align:center;vertical-align:middle;font-weight:700;background:${t.sub}">${NAMA_BULAN[m].slice(0, 3)}<br>${y}</td>` : ''}
            <td style="${B}padding:0 4px;${dw === 0 ? 'color:#c00000;' : ''}">${NAMA_HARI[dw]}</td>${cells}
            ${dw === 0 ? `<td rowspan="7" style="${B}vertical-align:top;padding:2px 5px;font-size:8pt;line-height:1.25">${ketLines}</td>` : ''}</tr>`;
    }
    return rows;
}

function renderKalender() {
    const id = appState.identitas;
    const t = theme();
    const legend = `<div style="display:flex;flex-wrap:wrap;gap:.45cm;font-size:8.5pt;margin-top:.2cm">
        ${Object.values(JENIS_AGENDA).map(j => `<span style="display:inline-flex;align-items:center;gap:4px"><span style="display:inline-block;width:.45cm;height:.3cm;background:${j.color};border:1px solid #000"></span>${esc(j.label)}</span>`).join('')}
        <span style="display:inline-flex;align-items:center;gap:4px"><span style="color:#c00000;font-weight:700">Merah</span> = hari Minggu</span>
        <span>Hari sekolah: ${appState.setting.hariSekolah} hari/minggu</span></div>`;
    return [1, 2].map(s => {
        const months = semesterMonths(s);
        return {
            orientation: 'portrait', label: 'Kalender Semester ' + s,
            blocks: [
                { html: docTitleHTML('KALENDER PENDIDIKAN SEMESTER ' + s, null, { bottom: 0.3 }) },
                { html: identityHTML([['NAMA SEKOLAH', id.sekolah], ['MATA PELAJARAN', id.mapel.toUpperCase()], ['KURIKULUM', id.kurikulum.toUpperCase()]],
                    [['KELAS', 'VII-VIII-IX'], ['SEMESTER', s === 1 ? '1 (GANJIL)' : '2 (GENAP)'], ['TAHUN PELAJARAN', id.tapel]]) },
                { table: {
                    open: tableOpen(8.5, 'line-height:1.15'), cols: colsHTML(['9%', '9%', '5.5%', '5.5%', '5.5%', '5.5%', '5.5%', '5.5%', '']),
                    head: `<tr>${th('Bulan')}${th('Hari')}${th('Tanggal', '', 'colspan="6"')}${th('Keterangan')}</tr>`,
                    rows: months.map(({ y, m }) => kalenderMonthRows(y, m))
                } },
                { html: legend },
                { html: signatureHTML({ fontPt: 10, top: 0.4 }) }
            ]
        };
    });
}
