// Uji asap (smoke test) seluruh dokumen & fitur utama di Chrome headless, dalam mode OFFLINE.
// Jalankan: npm install && npm test   (ubah lokasi Chrome dengan CHROME_PATH)
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = path.join(__dirname, '..');
const URL = 'file://' + path.join(ROOT, 'index.html');
const OUT = path.join(ROOT, 'test-output');
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';

let failures = 0;
const ok = (cond, label, extra = '') => {
    console.log(`${cond ? '  ✔' : '  ✘'} ${label}${extra ? ' — ' + extra : ''}`);
    if (!cond) failures++;
};

async function download(page, trigger) {
    const dl = page.waitForEvent('download', { timeout: 60000 });
    await page.evaluate(trigger);
    const d = await dl;
    const file = path.join(OUT, d.suggestedFilename());
    await d.saveAs(file);
    return file;
}

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const browser = await chromium.launch({ executablePath: CHROME, headless: true });
    const context = await browser.newContext({ offline: true, acceptDownloads: true, viewport: { width: 1500, height: 950 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    page.on('requestfailed', r => errors.push('request gagal: ' + r.url()));
    page.on('dialog', d => d.accept());

    console.log('1. Memuat aplikasi tanpa internet');
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    await page.evaluate(() => { localStorage.clear(); appState = createDefaultState(); initApp(); resetZoom(); });
    await page.waitForTimeout(300);
    ok(await page.evaluate(() => !!window.XLSX && !!window.lucide), 'Pustaka lokal termuat');

    console.log('2. Semua dokumen untuk kelas VII, VIII, IX (zoom 100%, tanpa luapan)');
    const docs = await page.evaluate(() => Object.keys(DOCS));
    for (const t of ['VII', 'VIII', 'IX']) {
        for (const d of docs) {
            const r = await page.evaluate(([t, d]) => {
                setTingkat(t); setDocMode(d); resetZoom();
                const sh = [...document.querySelectorAll('#sheets-container .print-sheet')];
                const over = sh.filter(s => { const b = s.querySelector('.sheet-body'); return b.scrollHeight > b.clientHeight + 2; }).length;
                return { n: sh.length, over };
            }, [t, d]);
            if (r.n < 1 || r.over) ok(false, `${t} / ${d}`, `${r.n} halaman, ${r.over} meluap`);
        }
    }
    ok(true, `${docs.length} dokumen × 3 kelas dirender`);

    console.log('3. Perhitungan otomatis');
    const calc = await page.evaluate(() => TINGKAT.flatMap(t => [1, 2].map(s => {
        const r = rencanaSemester(t, s), m = mingguEfektif(t, s), mx = promesMatrix(t, s);
        return { t, s, plan: r.total, jp: m.totalJp, overflow: mx.overflow, sum: Object.values(mx.rowTotals).reduce((a, b) => a + b, 0) };
    })));
    calc.forEach(c => ok(c.plan === c.jp && c.overflow === 0 && c.sum === c.plan, `Kelas ${c.t} smt ${c.s}: rencana ${c.plan} JP = jam efektif ${c.jp} JP, promes ${c.sum} JP`));

    console.log('4. Pengikat form & koreksi Program Semester');
    await page.evaluate(() => openSection('identitas'));
    await page.fill('[data-bind="identitas.guru"]', 'GURU UJI, S.Pd.');
    await page.waitForTimeout(400);
    ok(await page.evaluate(() => { setDocMode('sampul'); return document.getElementById('sheets-container').textContent.includes('GURU UJI, S.Pd.'); }), 'Nama guru tampil di sampul');
    await page.evaluate(() => { setTingkat('IX'); setSemester(1); openSection('promes'); });
    const cell = await page.$('#pm-grid tbody tr:first-child td:nth-child(4) input');
    await cell.fill('4');
    await page.waitForTimeout(300);
    ok(await page.evaluate(() => Object.keys(appState.promesOverride['IX|1'] || {}).length === 1), 'Koreksi manual promes tersimpan');
    await page.evaluate(() => resetPromes());
    ok(await page.evaluate(() => !appState.promesOverride['IX|1']), 'Kembalikan ke otomatis');

    console.log('5. Jurnal, nilai, modul');
    const jn = await page.evaluate(() => { generateJurnal(); return jurnalUntuk('IX', 1).length; });
    ok(jn > 10, 'Jurnal terisi dari Program Semester', jn + ' catatan');
    await page.evaluate(() => openSection('nilai'));
    await page.fill('#nilai-grid tbody tr:first-child input', '90');
    await page.waitForTimeout(200);
    ok(await page.evaluate(() => document.querySelector('#nilai-grid [data-na]').textContent !== ''), 'Nilai akhir dihitung');
    const nm = await page.evaluate(() => { openSection('modul'); addModul(); return modulUntuk('IX').length; });
    ok(nm === 2, 'Modul baru dari ATP');

    console.log('6. Ekspor');
    await page.evaluate(() => setDocMode('tp'));
    const docx = await download(page, () => exportWord());
    ok(fs.statSync(docx).size > 5000, 'Word (.docx)', path.basename(docx));
    const xlsx = await download(page, () => exportExcelOutput());
    ok(fs.statSync(xlsx).size > 5000, 'Excel (.xlsx)', path.basename(xlsx));
    const json = await download(page, () => saveConfigJSON());
    ok(fs.statSync(json).size > 5000, 'Backup (.json)');
    const back = await page.evaluate(txt => { try { appState = sanitizeLoadedState(JSON.parse(txt)); initApp(); return appState.identitas.guru; } catch (e) { return 'ERR ' + e.message; } }, fs.readFileSync(json, 'utf8'));
    ok(back === 'GURU UJI, S.Pd.', 'Backup dimuat ulang');
    const bad = await page.evaluate(() => { try { sanitizeLoadedState([1, 2]); return 'diterima'; } catch (e) { return 'ditolak'; } });
    ok(bad === 'ditolak', 'Backup tidak sah ditolak');
    const tplTp = await download(page, () => downloadTPTemplate());
    ok(fs.statSync(tplTp).size > 3000, 'Template TP (.xlsx)', path.basename(tplTp));
    const tpRt = await page.evaluate(async b64 => {
        const before = appState.tp.map(x => x.id + x.kode + x.tujuan).join('|');
        const wb = XLSX.read(Uint8Array.from(atob(b64), c => c.charCodeAt(0)), { type: 'array' });
        const aoa = XLSX.utils.sheet_to_json(wb.Sheets.TP, { header: 1, defval: '' });
        const list = parseTPRows(aoa);
        const same = list.length === appState.tp.length && list.every(x => appState.tp.some(y => y.kode === x.kode && y.tujuan === x.tujuan && Number(y.jp) === x.jp));
        const auto = parseTPRows([['Elemen', 'Kode TP', 'Tujuan Pembelajaran', 'Materi', 'JP'], ['Aljabar', '', 'Murid dapat X', 'M', '8'], ['G', 'G.1', 'Murid dapat Y', '', ''], ['', '', '', '', '']]);
        let rejected = false; try { parseTPRows([['Elemen', 'Tujuan'], ['Z', 'abc']]); } catch (e) { rejected = true; }
        return { same, before: before.length > 0, auto: auto.length === 2 && auto[0].kode === 'A.1' && auto[0].jp === 8 && auto[1].elemen === 'G', rejected };
    }, fs.readFileSync(tplTp).toString('base64'));
    ok(tpRt.same && tpRt.auto && tpRt.rejected, 'Template TP dibaca ulang (kode otomatis, elemen salah ditolak)');
    const tplAg = await download(page, () => downloadAgendaTemplate());
    ok(fs.statSync(tplAg).size > 3000, 'Template Agenda (.xlsx)', path.basename(tplAg));
    const agRt = await page.evaluate(async b64 => {
        const wb = XLSX.read(Uint8Array.from(atob(b64), c => c.charCodeAt(0)), { type: 'array' });
        const list = parseAgendaRows(XLSX.utils.sheet_to_json(wb.Sheets.Agenda, { header: 1, defval: '', raw: true }));
        const same = list.length === appState.agenda.length && list.every(x => appState.agenda.some(y => y.mulai === x.mulai && (y.selesai || y.mulai) === x.selesai && y.nama === x.nama && y.jenis === x.jenis && y.kelas.join() === x.kelas.join()));
        const f = parseAgendaRows([['Tanggal Mulai', 'Tanggal Selesai', 'Nama Agenda', 'Jenis', 'Berlaku Kelas'], ['13/07/2026', '', 'MPLS', 'Kegiatan', '7'], ['5 Januari 2027', '2027-01-06', 'Libur', '', 'VIII, IX'], ['', '', '', '', '']]);
        const fmt = f.length === 2 && f[0].mulai === '2026-07-13' && f[0].selesai === '2026-07-13' && f[0].kelas.join() === 'VII' && f[1].mulai === '2027-01-05' && f[1].jenis === 'libur' && f[1].kelas.join() === 'VIII,IX';
        let rejected = false; try { parseAgendaRows([['Tanggal Mulai', 'Nama Agenda'], ['31/02/2027', 'X']]); } catch (e) { rejected = true; }
        return same && fmt && rejected;
    }, fs.readFileSync(tplAg).toString('base64'));
    ok(agRt, 'Template Agenda dibaca ulang (format tanggal, kelas, tanggal salah ditolak)');
    const mgOv = await page.evaluate(() => {
        const keep = JSON.stringify(appState.mingguOverride || {}), t = appState.tingkat;
        const base = mingguEfektif(t, 1);
        appState.mingguOverride = { [t + '|1']: { 7: { total: base.bulan[1].total - 1 }, 9: { total: base.bulan[3].total + 2, efektif: 1, ket: 'Uji' } } };
        const me = mingguEfektif(t, 1), mx = promesMatrix(t, 1);
        const okt = me.bulan[3];
        const res = me.total === base.total + 1 && me.bulan[1].total === base.bulan[1].total - 1 && okt.total === base.bulan[3].total + 2 &&
            okt.efektif === 1 && okt.keterangan === 'Uji' && mx.weeks.length === me.total && me.tidakEfektif.some(g => g.nama === 'Uji');
        appState.mingguOverride = JSON.parse(keep);
        return res;
    });
    ok(mgOv, 'Koreksi manual jumlah minggu & minggu efektif per bulan');

    console.log('7. PDF cetak bundel');
    await page.evaluate(() => { setDocMode('bundel'); resetZoom(); });
    const nb = await page.evaluate(() => document.querySelectorAll('#sheets-container .print-sheet').length);
    await page.emulateMedia({ media: 'print' });
    await page.pdf({ path: path.join(OUT, 'bundel.pdf'), preferCSSPageSize: true, printBackground: true });
    ok(fs.statSync(path.join(OUT, 'bundel.pdf')).size > 50000, 'Bundel lengkap dicetak', nb + ' halaman');
    await page.emulateMedia({ media: 'screen' });

    console.log('8. Tampilan HP');
    await page.setViewportSize({ width: 390, height: 820 });
    await page.evaluate(() => { setMobileView('preview'); setDocMode('promes'); });
    await page.waitForTimeout(300);
    ok(await page.evaluate(() => document.querySelectorAll('#sheets-container .print-sheet').length === 2), 'Pratinjau HP');

    ok(errors.length === 0, 'Tanpa galat konsol', errors.slice(0, 5).join(' | '));
    await browser.close();
    console.log(failures ? `\n${failures} pemeriksaan GAGAL` : '\nSemua pemeriksaan lulus');
    process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
