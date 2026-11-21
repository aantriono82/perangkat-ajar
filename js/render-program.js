// ============================================================================
// DOKUMEN C: PERHITUNGAN MINGGU EFEKTIF, PROGRAM TAHUNAN, PROGRAM SEMESTER
// (dihitung dari kalender + ATP; satu set per tingkat kelas)
// ============================================================================

function yellowTh(content, extra, attrs) {
    const t = theme();
    return `<th ${attrs || ''} style="${B}background:${t.accent};color:${t.accentText};padding:3px 4px;font-weight:700;text-align:center;vertical-align:middle;${extra || ''}">${content}</th>`;
}

function renderMingguEfektifSemester(t, s) {
    const me = mingguEfektif(t, s);
    const r = rencanaSemester(t, s);
    const jp = me.jp;
    const wk = v => fmtNum(v / jp);
    const theme_ = theme();
    const blocks = [];
    blocks.push({ html: docTitleHTML('PERHITUNGAN MINGGU EFEKTIF BELAJAR', null, { bottom: 0.3, color: theme_.title }) });
    blocks.push({ html: stdIdentity(t, s) });
    blocks.push({ table: {
        open: tableOpen(9, 'line-height:1.15'), cols: colsHTML(['6%', '15%', '11%', '11%', '11%', '']),
        head: `<tr>${yellowTh('NO')}${yellowTh('BULAN')}${yellowTh('BANYAK MINGGU')}${yellowTh('MINGGU EFEKTIF')}${yellowTh('MINGGU TIDAK EFEKTIF')}${yellowTh('KETERANGAN TENTANG MINGGU TIDAK EFEKTIF BELAJAR')}</tr>
               <tr><td colspan="6" style="${B}background:${theme_.sub};font-weight:700;padding:2px 5px">SEMESTER ${s}</td></tr>`,
        rows: me.bulan.map((b, i) => `<tr>${td(i + 1, 'text-align:center')}${td(esc(b.nama))}${td(b.total, 'text-align:center')}${td(b.efektif, 'text-align:center')}${td(b.tidak, 'text-align:center')}${td(esc(b.keterangan), 'font-size:8.5pt')}</tr>`),
        foot: `<tr style="font-weight:700">${td('')}${td('Jumlah')}${td(me.total, 'text-align:center')}${td(me.efektif, 'text-align:center')}${td(me.tidak, 'text-align:center')}${td(`Total Jam Efektif = ${me.efektif} × ${jp} = ${me.totalJp} JP`)}</tr>`
    } });

    // Penggunaan minggu efektif (rencana dari ATP & alokasi)
    const used = [
        ['Kegiatan Tatap Muka', r.tatapMuka], ['Asesmen Sumatif Harian', r.ash],
        ['Remidi dan Pengayaan', r.remidi], ['Cadangan', r.cadangan]
    ];
    const selisih = me.totalJp - r.total;
    blocks.push({ html: `<div style="font-weight:700;font-size:10pt;margin:.3cm 0 .1cm">PENGGUNAAN MINGGU EFEKTIF</div>`, keep: true });
    blocks.push({ table: {
        open: tableOpen(9, 'line-height:1.15'), cols: colsHTML(['6%', '', '15%', '13%', '30%']),
        head: `<tr>${yellowTh('NO')}${yellowTh('KEGIATAN')}${yellowTh('JUMLAH MINGGU')}${yellowTh('JUMLAH JP')}${yellowTh('KETERANGAN')}</tr>`,
        rows: used.map(([k, v], i) => `<tr>${td(i + 1, 'text-align:center')}${td(esc(k))}${td(wk(v), 'text-align:center')}${td(v, 'text-align:center')}${td('')}</tr>`),
        foot: `<tr style="font-weight:700">${td('')}${td('Jumlah')}${td(wk(r.total), 'text-align:center')}${td(r.total, 'text-align:center')}${td(selisih === 0 ? 'Sesuai jam efektif' : (selisih > 0 ? `Sisa ${selisih} JP belum direncanakan` : `Melebihi jam efektif ${-selisih} JP`), selisih === 0 ? '' : 'color:#b91c1c')}</tr>`
    } });

    blocks.push({ html: `<div style="font-weight:700;font-size:10pt;margin:.3cm 0 .1cm">PENGGUNAAN MINGGU TIDAK EFEKTIF</div>`, keep: true });
    const tidak = me.tidakEfektif;
    blocks.push({ table: {
        open: tableOpen(9, 'line-height:1.15'), cols: colsHTML(['6%', '', '12%', '11%', '30%']),
        head: `<tr>${yellowTh('NO')}${yellowTh('KEGIATAN')}${yellowTh('JUMLAH MINGGU')}${yellowTh('JUMLAH JP')}${yellowTh('KETERANGAN')}</tr>`,
        rows: tidak.length ? tidak.map((g, i) => `<tr>${td(i + 1, 'text-align:center')}${td(esc(g.nama))}${td(g.minggu, 'text-align:center')}${td(g.jp, 'text-align:center')}${td(esc(g.keterangan), 'font-size:8.5pt')}</tr>`)
            : [`<tr>${td('–', 'text-align:center')}${td('Tidak ada minggu tidak efektif')}${td('0', 'text-align:center')}${td('0', 'text-align:center')}${td('')}</tr>`],
        foot: `<tr style="font-weight:700">${td('')}${td('Jumlah')}${td(me.tidak, 'text-align:center')}${td(me.tidak * jp, 'text-align:center')}${td('')}</tr>`
    } });
    blocks.push({ html: signatureHTML({ fontPt: 10, top: 0.4 }) });
    return { orientation: 'portrait', blocks, label: `Minggu Efektif Kelas ${t} Smt ${s}` };
}

function renderMingguEfektif(t) {
    return [1, 2].map(s => renderMingguEfektifSemester(t, s));
}

function renderProta(t) {
    const rows = [];
    const tdc = (c, extra) => td(c, 'text-align:center;' + (extra || ''));
    [1, 2].forEach(s => {
        const r = rencanaSemester(t, s);
        const me = mingguEfektif(t, s);
        const jp = me.jp;
        rows.push(`<tr><td colspan="4" style="${B}text-align:center;font-weight:700;background:${theme().sub};padding:2px">Semester ${s}</td></tr>`);
        let no = 0;
        r.babs.forEach((b, i) => {
            no++;
            const sub = b.subbab || [];
            const nRows = 1 + sub.length;
            const babNo = babNumber(t, s, i);
            let g = `<tr>${td(no, 'text-align:center', `rowspan="${nRows}"`)}${td(`<b>Bab ${babNo}. ${esc(b.materi)}</b>`)}${td('')}${tdc(fmtNum(babJp(b) / jp) + ' Minggu')}</tr>`;
            sub.forEach((x, j) => { g += `<tr>${td(`${babNo}.${j + 1}. ${esc(x.nama)}`, 'padding-left:.5cm')}${tdc((Number(x.jp) || 0) + ' JP')}${td('')}</tr>`; });
            rows.push(g);
        });
        const simple = (label, v) => { no++; rows.push(`<tr>${tdc(no)}${td(esc(label))}${tdc(v + ' JP')}${tdc(fmtNum(v / jp) + ' Minggu')}</tr>`); };
        if (r.ash) simple('Asesmen Sumatif Harian', r.ash);
        if (r.remidi) simple('Remidi/Pengayaan', r.remidi);
        if (r.cadangan) simple('Cadangan', r.cadangan);
        rows.push(`<tr style="font-weight:700">${td('')}${td('Jumlah', 'text-align:right')}${tdc(r.total + ' JP')}${tdc(fmtNum(r.total / jp) + ' Minggu')}</tr>`);
        me.tidakEfektif.forEach(g => { no++; rows.push(`<tr>${tdc(no)}${td(esc(g.nama))}${tdc(g.jp + ' JP')}${tdc(g.minggu + ' Minggu')}</tr>`); });
        if (me.tidakEfektif.length) rows.push(`<tr style="font-weight:700">${td('')}${td('Jumlah', 'text-align:right')}${tdc(me.tidak * jp + ' JP')}${tdc(me.tidak + ' Minggu')}</tr>`);
    });
    const blocks = [
        { html: docTitleHTML('PROGRAM TAHUNAN', null, { bottom: 0.3 }) },
        { html: stdIdentity(t, null) },
        { table: {
            open: tableOpen(10), cols: colsHTML(['7%', '', '13%', '15%']),
            head: `<tr>${th('No')}${th('MATERI POKOK DAN KEGIATAN SEKOLAH')}${th('WAKTU (JP)')}${th('KET.')}</tr>`,
            rows
        } },
        { html: signatureHTML() }
    ];
    return [{ orientation: 'portrait', blocks, label: 'Program Tahunan Kelas ' + t }];
}

function renderPromesSemester(t, s) {
    const mx = promesMatrix(t, s);
    const th_ = theme();
    const months = semesterMonths(s).map(({ y, m }) => ({ y, m, weeks: mx.weeks.filter(w => w.y === y && w.m === m) }));
    const nWeeks = mx.weeks.length;
    const weekW = `${(56 / Math.max(1, nWeeks)).toFixed(2)}%`;
    const cols = colsHTML(['3.5%', '26%', '4%'].concat(mx.weeks.map(() => weekW)));
    const headCell = (c, attrs, extra) => th(c, 'font-size:8pt;padding:1px;' + (extra || ''), attrs);
    const head = `<tr>${headCell('NO', 'rowspan="3"')}${headCell('TUJUAN PEMBELAJARAN/MATERI POKOK', 'rowspan="3"')}${headCell('JP', 'rowspan="3"')}${headCell('BULAN', `colspan="${nWeeks}"`)}</tr>
        <tr>${months.map(mo => headCell(NAMA_BULAN[mo.m].toUpperCase(), `colspan="${mo.weeks.length || 1}"`)).join('')}</tr>
        <tr>${months.map(mo => mo.weeks.map(w => headCell(w.mingguKe, '', `background:${th_.sub};color:#000`)).join('')).join('')}</tr>`;
    const weekCell = (w, content, rowType) => {
        let style = 'text-align:center;padding:1px;font-size:8.5pt;';
        if (!w.efektif) style += 'background:repeating-linear-gradient(135deg,#e2e8f0 0 3px,#f8fafc 3px 6px);';
        if (rowType === 'event' && content === '■') return `<td style="${B}${style}background:${th_.head};"></td>`;
        return `<td style="${B}${style}">${content}</td>`;
    };
    let no = 0;
    const rows = mx.rows.map(r => {
        no++;
        const label = r.type === 'materi' ? `<b>${esc(r.label)}</b>${r.kodeTp ? ` <span style="font-size:8pt;color:#475569">(${esc(r.kodeTp)})</span>` : ''}` : esc(r.label);
        return `<tr>${td(no, 'text-align:center;font-size:9pt;padding:1px')}${td(label, 'font-size:9pt;padding:2px 4px')}${td(mx.rowTotals[r.id], 'text-align:center;font-size:9pt;padding:1px')}${mx.weeks.map(w => weekCell(w, mx.cells[r.id][w.key] || '', r.type)).join('')}</tr>`;
    });
    mx.eventRows.forEach(ev => {
        no++;
        rows.push(`<tr>${td(no, 'text-align:center;font-size:9pt;padding:1px')}${td(esc(ev.label), 'font-size:9pt;padding:2px 4px;font-style:italic')}${td('', 'padding:1px')}${mx.weeks.map(w => weekCell(w, ev.weeks.includes(w.key) ? '■' : '', 'event')).join('')}</tr>`);
    });
    const totalJp = Object.values(mx.rowTotals).reduce((a, b) => a + b, 0);
    const foot = `<tr style="font-weight:700">${td('', 'padding:1px')}${td('Jumlah', 'font-size:9pt')}${td(totalJp, 'text-align:center;font-size:9pt;padding:1px')}${mx.weeks.map(w => weekCell(w, mx.weekTotals[w.key] || '', 'sum')).join('')}</tr>`;
    const blocks = [
        { html: docTitleHTML('PROGRAM SEMESTER ' + s, null, { bottom: 0.25 }) },
        { html: stdIdentity(t, s) },
        { table: { open: tableOpen(9, 'line-height:1.15'), cols, head, rows, foot } },
        { html: `<div style="font-size:8.5pt;margin-top:.15cm;display:flex;gap:.5cm;flex-wrap:wrap">
            <span><span style="display:inline-block;width:.5cm;height:.3cm;border:1px solid #000;background:repeating-linear-gradient(135deg,#e2e8f0 0 3px,#f8fafc 3px 6px);vertical-align:middle"></span> Minggu tidak efektif</span>
            <span><span style="display:inline-block;width:.5cm;height:.3cm;border:1px solid #000;background:${th_.head};vertical-align:middle"></span> Pelaksanaan kegiatan/libur</span>
            <span>Angka = jumlah JP pada minggu tersebut (1 JP = ${appState.setting.menitJp} menit)</span></div>` },
        { html: signatureHTML({ fontPt: 10, top: 0.35 }) }
    ];
    return { orientation: 'landscape', blocks, label: `Promes Kelas ${t} Smt ${s}` };
}

function renderPromes(t) {
    return [1, 2].map(s => renderPromesSemester(t, s));
}
