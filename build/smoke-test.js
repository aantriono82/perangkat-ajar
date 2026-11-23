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
    // Pustaka Excel sengaja dimuat di latar sesudah aplikasi siap (bukan di <head>)
    await page.waitForFunction(() => !!window.XLSX, null, { timeout: 10000 }).catch(() => {});
    ok(await page.evaluate(() => !!window.XLSX && !!window.lucide), 'Pustaka lokal termuat (Excel dimuat di latar)');

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

    console.log('5b. KKTP: tiga pendekatan (Panduan Pembelajaran dan Asesmen 2025)');
    const kk = await page.evaluate(() => {
        setTingkat('IX'); openSection('kktp'); setDocMode('kktp');
        const txt = () => document.getElementById('sheets-container').textContent;
        const r = {};
        r.contoh = kktpPendekatan('A.7') === 'rubrik' && kktpPendekatan('G.5') === 'deskripsi' && kktpPendekatan('P.1') === 'interval';
        r.dok = ['Belum Tercapai', 'Aspek yang Dinilai', 'Skala Pencapaian', 'minimal 2 dari 2 kriteria', 'aspek 1–3 minimal tahap Memahami, dan aspek 4 minimal tahap Mulai memahami', '81 – 100'].filter(s => !txt().includes(s));
        setKktpPendekatanTp('P.1', 'deskripsi');
        r.override = kktpPendekatan('P.1') === 'deskripsi' && !!document.querySelector('#ed-kktp input[oninput^="setKktpMin"][data-kode="P.1"]');
        setKktpPendekatanTp('P.1', '');
        setKktpPendekatanUmum('rubrik');
        r.umum = kktpPendekatan('P.1') === 'rubrik' && kktpPendekatan('G.5') === 'deskripsi';
        setKktpPendekatanUmum('interval');
        const lama = sanitizeLoadedState({ kktp: { batas: 70, interval: [{ min: 0, max: 69, keterangan: 'Belum' }, { min: 70, max: 100, keterangan: 'Tuntas' }], indikator: {} } });
        r.lama = lama.kktp.batas === 70 && Object.keys(lama.kktp.tp).length === 0 && lama.kktp.pendekatan === 'interval' && lama.kktp.level.length === 3;
        const rusak = sanitizeLoadedState({ kktp: { pendekatan: 'x', level: ['a'], tp: { 'A.7': { pendekatan: 'y', minKriteria: 'z', rubrik: 5 }, __proto__: { a: 1 } } } });
        r.rusak = rusak.kktp.pendekatan === 'interval' && rusak.kktp.level.length === 3 && JSON.stringify(rusak.kktp.tp['A.7']) === '{}';
        return r;
    });
    ok(kk.contoh, 'Contoh: A.7 rubrik, G.5 deskripsi kriteria, lainnya interval');
    ok(kk.dok.length === 0, 'Dokumen KKTP memuat tabel ketiga pendekatan', kk.dok.join(' | '));
    ok(kk.override && kk.umum, 'Pendekatan umum & per TP');
    ok(kk.lama, 'Data lama tetap memakai interval & batasnya');
    ok(kk.rusak, 'Data KKTP tidak sah dibersihkan');
    const bintang = await page.evaluate(() => {
        const rb = appState.rombel.find(r => r.tingkat === 'IX'); const m = rb.murid[0];
        const box = appState.nilai[nilaiKey(rb.id, 1)] || (appState.nilai[nilaiKey(rb.id, 1)] = {});
        const keep = JSON.stringify(box[m.id] || {});
        box[m.id] = Object.assign({}, box[m.id], { 'A.7': 50 });
        setSemester(1); setDocMode('nilai');
        const has = document.getElementById('sheets-container').textContent.includes('50*');
        box[m.id] = JSON.parse(keep); renderAll();
        return has;
    });
    ok(bintang, 'Daftar Nilai menandai (*) TP yang belum tercapai');

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

    console.log('9. Data tersimpan rusak & beberapa tab');
    {
        const ctx = await browser.newContext({ offline: true, acceptDownloads: true, viewport: { width: 1400, height: 900 } });
        const pg = await ctx.newPage();
        const errs = [];
        pg.on('pageerror', e => errs.push(e.message));
        await pg.goto(URL, { waitUntil: 'load' });
        await pg.waitForTimeout(500);
        // Butir rusak di larik (data lama / diedit manual) harus dirapikan, bukan membuat aplikasi macet
        await pg.evaluate(() => {
            const s = createDefaultState();
            s.identitas.guru = 'GURU UJI';
            s.rombel.push(null, 5, { nama: 'IX.Z', tingkat: 'IX' });
            s.tp.push(null, 'x');
            s.jurnal = [null, 3, { tingkat: 'IX', semester: 1 }];
            s.modul.push({ tingkat: 'IX', semester: 1, pertemuan: 'x', dimensi: null });
            s.agenda.push({ mulai: '2026-08-18', kelas: 'IX', jenis: 'aneh', nama: 'UJI RUSAK' }, null);
            s.atp.IX[1].push(null, { materi: 'x', subbab: [null, 2] });
            clearTimeout(saveTimer); saveTimer = null; window.saveStateNow = () => {};
            localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
        });
        await pg.reload({ waitUntil: 'load' });
        await pg.waitForTimeout(800);
        const san = await pg.evaluate(() => {
            const bad = [];
            for (const t of TINGKAT) for (const d of Object.keys(DOCS)) {
                try { setTingkat(t); setDocMode(d); } catch (e) { bad.push(t + '/' + d + ': ' + e.message); }
                if (document.querySelector('#sheets-container .empty-state .text-rose-700')) bad.push(t + '/' + d + ': gagal dibuat');
            }
            ['identitas', 'kurikulum', 'atp', 'kalender', 'promes', 'modul', 'kktp', 'jurnal', 'nilai'].forEach(x => { try { switchTab(x); } catch (e) { bad.push(x + ': ' + e.message); } });
            const ag = appState.agenda.find(a => a.nama === 'UJI RUSAK');
            return { bad, guru: appState.identitas.guru, rombel: appState.rombel.length, ag: ag.jenis + '/' + ag.kelas.join(',') };
        });
        ok(san.bad.length === 0 && errs.length === 0 && san.guru === 'GURU UJI' && san.rombel === 3 && san.ag === 'libur/IX',
            'Butir rusak di data tersimpan dirapikan', JSON.stringify([san.guru, san.rombel, san.ag]) + ' ' + [...san.bad, ...errs].slice(0, 3).join(' | '));

        // Bila tampilan tetap gagal: data lama tidak ditimpa dan bisa diunduh
        await pg.evaluate(() => {
            clearTimeout(saveTimer); saveTimer = null;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign(createDefaultState(), { identitas: { guru: 'DATA LAMA' } })));
        });
        await pg.addInitScript(() => { window.__breakOnce = !sessionStorage.getItem('broke'); sessionStorage.setItem('broke', '1'); });
        await pg.addInitScript(() => window.addEventListener('load', () => {
            if (!window.__breakOnce) return;
            const orig = window.renderAllEditors;
            window.renderAllEditors = function () { if (appState.identitas.guru === 'DATA LAMA') throw new Error('uji rusak'); return orig.apply(this, arguments); };
        }, { capture: true }));
        await pg.reload({ waitUntil: 'load' });
        await pg.waitForTimeout(600);
        const kept = await pg.evaluate(() => JSON.parse(localStorage.getItem(STORAGE_KEY)).identitas.guru === 'DATA LAMA' && storagePaused === 'data-rusak'
            && !!document.querySelector('[role="dialog"]'));
        const dl = pg.waitForEvent('download', { timeout: 10000 });
        await pg.click('[role="dialog"] button:has-text("Unduh data lama")');
        const d = await dl;
        await pg.waitForTimeout(200);
        const after = await pg.evaluate(() => storagePaused === null && JSON.parse(localStorage.getItem(STORAGE_KEY)).identitas.guru !== 'DATA LAMA');
        ok(kept && after && /Data_Lama/.test(d.suggestedFilename()), 'Data yang gagal ditampilkan tidak ditimpa & bisa diunduh');

        // Dua tab: tab yang tertinggal berhenti menyimpan, lalu bisa memuat data terbaru
        const pg2 = await ctx.newPage();
        await pg2.goto(URL, { waitUntil: 'load' });
        await pg2.waitForTimeout(600);
        await pg.evaluate(() => { flushPendingWork(); });
        await pg2.evaluate(() => { appState.identitas.guru = 'DARI TAB 2'; saveStateNow(); });
        await pg.waitForTimeout(300);
        const paused = await pg.evaluate(() => {
            appState.identitas.guru = 'TAB 1 BASI'; saveStateNow();
            return storagePaused === 'tab-lain' && JSON.parse(localStorage.getItem(STORAGE_KEY)).identitas.guru === 'DARI TAB 2';
        });
        await pg.click('[role="dialog"] button:has-text("Muat data terbaru")');
        await pg.waitForTimeout(300);
        const reloaded = await pg.evaluate(() => storagePaused === null && appState.identitas.guru === 'DARI TAB 2');
        ok(paused && reloaded, 'Dua tab tidak saling menimpa data');
        await ctx.close();
    }

    console.log('10. Service worker & mode offline (lewat http)');
    {
        const http = require('http');
        const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
            '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
        const server = http.createServer((req, res) => {
            const rel = decodeURIComponent(new globalThis.URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
            const file = path.join(ROOT, rel);
            if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
            res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
            fs.createReadStream(file).pipe(res);
        });
        await new Promise(r => server.listen(0, '127.0.0.1', r));
        const base = `http://127.0.0.1:${server.address().port}/`;
        const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
        const pg = await ctx.newPage();
        const errs = [];
        pg.on('pageerror', e => errs.push(e.message));
        await pg.goto(base, { waitUntil: 'load' });
        // Cache milik aplikasi lain (adm-ujian, prefiks lama yang sama) tidak boleh ikut terhapus
        await pg.evaluate(async () => { const c = await caches.open('asesmen-sumatif-lain'); await c.put('/ujian/js/render-peserta.js', new Response('x')); });
        await pg.evaluate(() => navigator.serviceWorker.ready);
        await pg.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 }).catch(() => {});
        const keys = await pg.evaluate(() => caches.keys());
        await ctx.setOffline(true);
        await pg.reload({ waitUntil: 'load' });
        await pg.waitForTimeout(800);
        const offlineOk = await pg.evaluate(() => document.querySelectorAll('#sheets-container .print-sheet').length > 0);
        const xlsxOffline = await pg.evaluate(() => ensureXLSX());
        ok(keys.some(k => /^perangkat-ajar-/.test(k)) && keys.includes('asesmen-sumatif-lain'), 'Cache SW khusus aplikasi ini', keys.join(', '));
        ok(offlineOk && xlsxOffline && errs.length === 0, 'Dibuka ulang tanpa internet lewat service worker', errs.slice(0, 3).join(' | '));
        await ctx.close();
        server.close();
    }

    await browser.close();
    console.log(failures ? `\n${failures} pemeriksaan GAGAL` : '\nSemua pemeriksaan lulus');
    process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
