// ============================================================================
// TATA LETAK DOKUMEN: PEMBAGIAN HALAMAN OTOMATIS, JUDUL, IDENTITAS, TANDA TANGAN
// ----------------------------------------------------------------------------
// Setiap dokumen dirangkai dari "segmen" (satu segmen = satu orientasi kertas,
// selalu dimulai di halaman baru). Segmen berisi blok:
//   { html, keep }             blok utuh (keep: tetap bersama blok sesudahnya)
//   { table: {open, cols, head, rows[], foot} }   tabel yang boleh terpotong per baris;
//                              kepala tabel diulang di halaman berikutnya
//   { pageBreak: true }        paksa halaman baru
// Blok ditempatkan satu per satu ke lembar berukuran tetap; begitu meluap, blok
// dipindah ke lembar baru. Pengukuran dilakukan di wadah tersembunyi sehingga
// tetap benar walaupun pratinjau sedang disembunyikan (tampilan HP).
// ============================================================================
const SHEET_PADDING = {
    portrait: { t: 1.6, r: 1.6, b: 1.5, l: 2.0 },
    landscape: { t: 1.3, r: 1.4, b: 1.2, l: 1.5 }
};

function sheetSize(orientation) {
    const p = PAPER_SIZES[appState.setting.paper] || PAPER_SIZES.A4;
    return orientation === 'landscape' ? { w: p.h, h: p.w } : { w: p.w, h: p.h };
}

function getMeasureHost() {
    let host = document.getElementById('measure-host');
    if (!host) {
        host = document.createElement('div');
        host.id = 'measure-host';
        host.setAttribute('aria-hidden', 'true');
        document.body.appendChild(host);
    }
    return host;
}

function htmlToBlock(html) {
    const div = document.createElement('div');
    div.className = 'blk';
    div.innerHTML = html;
    return div;
}

function paginateSegments(segments) {
    const host = getMeasureHost();
    host.innerHTML = '';
    const sheets = [];
    let body = null, lastKeep = null;

    const fits = () => body.scrollHeight <= body.clientHeight + 1;

    segments.forEach(seg => {
        const orient = seg.orientation === 'landscape' ? 'landscape' : 'portrait';
        const { w, h } = sheetSize(orient);
        const pad = SHEET_PADDING[orient];
        const newSheet = () => {
            const s = document.createElement('div');
            s.className = 'print-sheet doc-sheet font-serif-formal bg-white shadow-xl relative box-border';
            s.dataset.orient = orient;
            s.style.width = w + 'cm';
            s.style.height = h + 'cm';
            s.style.padding = seg.cover ? '0' : `${pad.t}cm ${pad.r}cm ${pad.b}cm ${pad.l}cm`;
            if (seg.label) s.dataset.label = seg.label;
            body = document.createElement('div');
            body.className = 'sheet-body';
            s.appendChild(body);
            host.appendChild(s);
            sheets.push(s);
            lastKeep = null;
        };
        // Pindahkan blok "keep" terakhir (mis. judul tabel) ke lembar baru bersama blok berikutnya
        const breakWithKeep = () => {
            const carry = lastKeep && lastKeep.parentNode === body && body.children.length > 1 ? lastKeep : null;
            if (carry) carry.remove();
            newSheet();
            if (carry) body.appendChild(carry);
        };

        newSheet();
        if (seg.cover) { body.innerHTML = seg.cover; body.classList.add('sheet-cover'); return; }

        (seg.blocks || []).forEach(b => {
            if (!b) return;
            if (b.pageBreak) { if (body.children.length) newSheet(); return; }
            if (b.table) { placeTable(b.table); return; }
            const el = htmlToBlock(b.html);
            body.appendChild(el);
            if (!fits() && body.children.length > 1) {
                el.remove();
                breakWithKeep();
                body.appendChild(el);
            }
            lastKeep = b.keep ? el : null;
        });

        function placeTable(t) {
            const make = () => htmlToBlock(`${t.open}${t.cols || ''}<thead>${t.head || ''}</thead><tbody></tbody></table>`);
            let wrap = make();
            body.appendChild(wrap);
            let tbody = wrap.querySelector('tbody');
            let placedRows = 0;
            const groups = (t.rows || []).concat(t.foot ? [t.foot] : []);
            if (!groups.length && !fits() && body.children.length > 1) { wrap.remove(); breakWithKeep(); body.appendChild(wrap); }
            groups.forEach(rowHtml => {
                const tmp = document.createElement('tbody');
                tmp.innerHTML = rowHtml;
                const trs = [...tmp.children];
                trs.forEach(tr => tbody.appendChild(tr));
                if (fits()) { placedRows += trs.length; return; }
                trs.forEach(tr => tr.remove());
                if (placedRows === 0) {
                    // Tabel belum punya baris di lembar ini: pindahkan seluruhnya (beserta judulnya)
                    if (body.children.length > 1) { wrap.remove(); breakWithKeep(); body.appendChild(wrap); }
                } else {
                    newSheet();
                    wrap = make();
                    body.appendChild(wrap);
                    tbody = wrap.querySelector('tbody');
                    placedRows = 0;
                }
                trs.forEach(tr => tbody.appendChild(tr));
                placedRows += trs.length;
            });
            lastKeep = null;
        }
    });
    return sheets;
}

// ---------------------------------------------------------------------------
// Potongan HTML yang dipakai banyak dokumen
// ---------------------------------------------------------------------------
const esc = s => escapeHtml(s);
function theme() { return DOC_THEMES[appState.setting.theme] || DOC_THEMES.navy; }
function toTitleCase(str) { return String(str || '').toLowerCase().replace(/(^|[\s(/-])(\p{L})/gu, (m, p, c) => p + c.toUpperCase()).replace(/\bSmp\b/g, 'SMP').replace(/\bSd\b/g, 'SD').replace(/\bSma\b/g, 'SMA').replace(/\bSmk\b/g, 'SMK').replace(/\bUptd\b/g, 'UPTD'); }

function diampuList() { return TINGKAT.filter(t => appState.kelas[t] && appState.kelas[t].diampu); }

// Isi tanda {kunci} pada teks bebas (kata pengantar, landasan, catatan)
function fillPlaceholders(text, extra) {
    const id = appState.identitas;
    const diampu = diampuList();
    const rombelText = diampu.map(t => appState.kelas[t].rombel).filter(Boolean);
    const join = list => list.length <= 1 ? (list[0] || '') : list.slice(0, -1).join(', ') + ' dan ' + list[list.length - 1];
    const map = Object.assign({
        sekolah: id.sekolah, sekolahTitle: toTitleCase(id.sekolah), namaResmi: id.namaResmi, mapel: id.mapel,
        tapel: id.tapel, kepsek: id.kepsek, pengawas: id.pengawas, mgmp: id.mgmp, email: id.email, guru: id.guru,
        rombel: join(rombelText), tingkat: join(diampu), kelasAngka: join(diampu.map(t => TINGKAT_ANGKA[t])),
        menit: appState.setting.menitJp, kabupaten: id.kabupaten, fase: id.fase
    }, extra || {});
    return String(text || '').replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m));
}

function docTitleHTML(title, sub, opts) {
    const o = opts || {};
    return `<div class="doc-title" style="text-align:center;margin:${o.top || 0}cm 0 ${o.bottom == null ? 0.45 : o.bottom}cm;color:${o.color || '#000'}">
        <div style="font-size:${o.size || 13}pt;font-weight:700;text-transform:uppercase;letter-spacing:.2px">${esc(title)}</div>
        ${sub ? `<div style="font-size:${(o.size || 13) - 1}pt;font-weight:700;text-transform:uppercase">${esc(sub)}</div>` : ''}
    </div>`;
}

// Identitas dua kolom: kiri & kanan berupa [label, nilai]
function identityHTML(left, right, fontPt) {
    const rows = Math.max(left.length, right.length);
    const cell = (pair, w) => pair ? `<td style="width:${w}%;padding:1px 0;white-space:nowrap">${esc(pair[0])}</td><td style="width:2%;padding:1px 0">:</td><td style="padding:1px 6px 1px 2px;font-weight:600">${esc(pair[1])}</td>` : '<td></td><td></td><td></td>';
    let html = `<table style="width:100%;border-collapse:collapse;font-size:${fontPt || 10}pt;margin-bottom:.35cm"><colgroup><col style="width:17%"><col style="width:2%"><col style="width:37%"><col style="width:17%"><col style="width:2%"><col></colgroup>`;
    for (let i = 0; i < rows; i++) html += `<tr>${cell(left[i], 17)}${cell(right[i], 17)}</tr>`;
    return html + '</table>';
}

function stdIdentity(tingkat, sem, extraRight) {
    const id = appState.identitas;
    const left = [['NAMA SEKOLAH', id.sekolah], ['MATA PELAJARAN', id.mapel.toUpperCase()], ['KURIKULUM', id.kurikulum.toUpperCase()]];
    const right = [];
    if (tingkat) right.push(['KELAS', (appState.kelas[tingkat] || {}).rombel || tingkat]);
    if (sem) right.push(['SEMESTER', sem === 1 ? '1 (GANJIL)' : '2 (GENAP)']);
    right.push(['TAHUN PELAJARAN', id.tapel]);
    (extraRight || []).forEach(p => right.push(p));
    return identityHTML(left, right);
}

// Tanda tangan: Mengetahui Kepala Sekolah (kiri) & Guru Mata Pelajaran (kanan)
function signatureHTML(opts) {
    const o = opts || {};
    const id = appState.identitas;
    const col = (lines, name, nip) => `<td style="width:50%;vertical-align:top;padding:0 .4cm">
        ${lines.map(l => `<div>${esc(l)}</div>`).join('')}
        <div style="height:1.7cm"></div>
        <div style="font-weight:700;text-decoration:underline">${esc(name)}</div>
        <div>NIP ${esc(nip)}</div></td>`;
    return `<table style="width:100%;border-collapse:collapse;font-size:${o.fontPt || 10.5}pt;margin-top:${o.top == null ? 0.6 : o.top}cm;line-height:1.25"><tr>
        ${col(['Mengetahui,', id.jabatanKepsek || 'Kepala Sekolah'], id.kepsek, id.nipKepsek)}
        ${col([`${id.tempat}, ${o.tanggal || id.tanggal}`, o.jabatanGuru || 'Guru Mata Pelajaran'], id.guru, id.nipGuru)}
    </tr></table>`;
}

// Gaya sel tabel
const B = 'border:1px solid #000;';
function th(content, extra, attrs) {
    const t = theme();
    return `<th ${attrs || ''} style="${B}background:${t.head};color:${t.headText};padding:3px 4px;font-weight:700;text-align:center;vertical-align:middle;${extra || ''}">${content}</th>`;
}
function td(content, extra, attrs) { return `<td ${attrs || ''} style="${B}padding:3px 5px;vertical-align:top;${extra || ''}">${content}</td>`; }
function tableOpen(fontPt, extra) { return `<table style="width:100%;border-collapse:collapse;table-layout:fixed;font-size:${fontPt || 10}pt;line-height:1.25;${extra || ''}">`; }
function colsHTML(widths) { return '<colgroup>' + widths.map(w => w ? `<col style="width:${w}">` : '<col>').join('') + '</colgroup>'; }

// Teks multi-baris → paragraf
function paragraphs(text, style) {
    return String(text || '').split(/\n+/).map(s => s.trim()).filter(Boolean)
        .map(s => `<p style="margin:0 0 .25cm;text-align:justify;${style || ''}">${esc(s)}</p>`).join('');
}
function bulletLines(text) {
    const lines = String(text || '').split(/\n+/).map(s => s.trim()).filter(Boolean);
    if (!lines.length) return '<span style="color:#64748b">–</span>';
    if (lines.length === 1) return esc(lines[0]);
    return `<ul style="margin:0;padding-left:.5cm">${lines.map(l => `<li style="margin:0 0 1px">${esc(l.replace(/^[-•]\s*/, ''))}</li>`).join('')}</ul>`;
}
function numberedList(items, opts) {
    const o = opts || {};
    return `<table style="width:100%;border-collapse:collapse;font-size:${o.fontPt || 11}pt;line-height:1.35">${items.map((it, i) =>
        `<tr><td style="width:${o.numW || 0.8}cm;vertical-align:top;padding:0 0 .12cm ${o.indent || 0}cm">${o.letters ? String.fromCharCode(97 + i) + '.' : (i + 1) + '.'}</td><td style="vertical-align:top;text-align:justify;padding:0 0 .12cm">${esc(it)}</td></tr>`).join('')}</table>`;
}
