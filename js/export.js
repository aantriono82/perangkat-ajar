// ============================================================================
// CETAK / PDF & EKSPOR EXCEL
// ============================================================================
function printPDF() {
    flushPendingWork();
    const container = document.getElementById('sheets-container');
    const prevZoom = container.style.zoom;
    container.style.zoom = '1';
    setTimeout(() => {
        window.print();
        container.style.zoom = prevZoom;
    }, 150);
}

function exportExcelOutput() {
    if (!ensureXLSX()) return;
    flushPendingWork();
    const wb = XLSX.utils.book_new();
    const add = (name, rows, widths) => {
        const ws = XLSX.utils.aoa_to_sheet(rows);
        if (widths) ws['!cols'] = widths.map(w => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
    };

    add('TP', [['Elemen', 'Kode TP', 'Tujuan Pembelajaran', 'Materi', 'Alokasi (JP)']]
        .concat(appState.tp.map(x => [elemenNama(x.elemen), x.kode, x.tujuan, x.materi, Number(x.jp) || 0])), [22, 9, 90, 30, 12]);

    const atpRows = [['Kelas', 'Semester', 'Bab', 'Materi Pokok', 'Kode TP', 'Sub-bab', 'JP', 'Asesmen Harian (JP)']];
    TINGKAT.forEach(t => [1, 2].forEach(s => (appState.atp[t][s] || []).forEach((b, i) => {
        (b.subbab.length ? b.subbab : [{ nama: '', jp: 0 }]).forEach((x, j) => atpRows.push([t, s, babNumber(t, s, i), b.materi, b.kodeTp, x.nama, Number(x.jp) || 0, j === 0 ? Number(b.ash) || 0 : ''])); })));
    add('ATP_Prota', atpRows, [7, 9, 5, 40, 14, 45, 6, 12]);

    add('Kalender', [['Mulai', 'Selesai', 'Agenda', 'Jenis', 'Berlaku untuk kelas']]
        .concat(appState.agenda.map(a => [a.mulai, a.selesai || a.mulai, a.nama, (JENIS_AGENDA[a.jenis] || {}).label || a.jenis, (a.kelas || []).join(', ')])), [12, 12, 50, 22, 18]);

    const diampu = diampuList().length ? diampuList() : [appState.tingkat];
    diampu.forEach(t => {
        const me = [['Semester', 'Bulan', 'Banyak Minggu', 'Minggu Efektif', 'Minggu Tidak Efektif', 'Keterangan']];
        [1, 2].forEach(s => { const r = mingguEfektif(t, s); r.bulan.forEach(b => me.push([s, b.nama, b.total, b.efektif, b.tidak, b.keterangan])); me.push([s, 'Jumlah', r.total, r.efektif, r.tidak, `Jam efektif = ${r.totalJp} JP`]); });
        add(`Minggu_Efektif_${t}`, me, [9, 12, 12, 12, 16, 60]);
        [1, 2].forEach(s => {
            const mx = promesMatrix(t, s);
            const head1 = ['No', 'Materi / Kegiatan', 'JP'].concat(mx.weeks.map(w => NAMA_BULAN[w.m].slice(0, 3) + ' ' + w.mingguKe));
            const rows = [head1];
            mx.rows.forEach((r, i) => rows.push([i + 1, r.label, mx.rowTotals[r.id]].concat(mx.weeks.map(w => mx.cells[r.id][w.key] || ''))));
            mx.eventRows.forEach((ev, i) => rows.push([mx.rows.length + i + 1, ev.label, ''].concat(mx.weeks.map(w => ev.weeks.includes(w.key) ? '■' : ''))));
            rows.push(['', 'Jumlah', Object.values(mx.rowTotals).reduce((a, b) => a + b, 0)].concat(mx.weeks.map(w => mx.weekTotals[w.key] || '')));
            add(`Promes_${t}_Smt${s}`, rows, [5, 40, 6].concat(mx.weeks.map(() => 7)));
        });
    });

    appState.rombel.forEach(rb => [1, 2].forEach(s => {
        const kodes = tpForTingkat(rb.tingkat, s).map(x => x.kode);
        const res = hitungNilai(rb, s, kodes);
        if (!res.some(r => r.na !== null)) return;
        const rows = [['No', 'NIS', 'Nama', 'L/P'].concat(kodes, ['Rata-rata TP', 'ASTS', 'ASAS/ASAT', 'Nilai Akhir', 'Keterangan'])];
        res.forEach((r, i) => rows.push([i + 1, r.m.nis, r.m.nama, r.m.lp].concat(kodes.map(k => r.v[k] ?? ''), [r.avgTp === null ? '' : Math.round(r.avgTp * 10) / 10, r.v.sts ?? '', r.v.sas ?? '', r.na ?? '', r.na === null ? '' : (r.tuntas ? 'Tuntas' : 'Belum tuntas')])));
        add(`Nilai_${rb.nama}_S${s}`.replace(/[\\/?*[\]:]/g, '-'), rows, [5, 11, 28, 5].concat(kodes.map(() => 7), [11, 7, 10, 10, 13]));
    }));

    if (appState.jurnal.length) {
        add('Jurnal', [['Kelas', 'Semester', 'Tanggal', 'Rombel', 'Jam ke-', 'Kode TP', 'Materi', 'Kegiatan', 'Hadir', 'Tidak Hadir', 'Catatan']]
            .concat(appState.jurnal.slice().sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal))).map(j => [j.tingkat, j.semester, j.tanggal, j.rombel, j.jamKe, j.kodeTp, j.materi, j.kegiatan, j.hadir, j.absen, j.catatan])),
            [6, 9, 12, 9, 8, 10, 40, 50, 8, 20, 30]);
    }
    XLSX.writeFile(wb, `Perangkat_${appState.identitas.mapel}_${String(appState.identitas.tapel).replace(/\//g, '-')}.xlsx`);
    showToast('Data perangkat diunduh ke Excel (.xlsx).');
}
