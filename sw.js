// Service worker: menyimpan seluruh berkas aplikasi agar bisa dibuka & dipasang tanpa internet.
// JANGAN edit CACHE_VERSION / PRECACHE manual — jalankan `npm run build:sw` setelah mengubah berkas apa pun.
const CACHE_VERSION = '9e1461deaad8';
const PRECACHE = [
    './',
    './index.html',
    './manifest.webmanifest',
    './css/app.css',
    './css/tailwind.css',
    './img/apple-touch-icon.png',
    './img/favicon-32.png',
    './img/favicon.svg',
    './img/icon-192.png',
    './img/icon-512.png',
    './img/icon-maskable-512.png',
    './js/assets.js',
    './js/config.js',
    './js/data-io.js',
    './js/editors.js',
    './js/export-word.js',
    './js/export.js',
    './js/image-tools.js',
    './js/kalender.js',
    './js/layout.js',
    './js/pwa.js',
    './js/render-asesmen.js',
    './js/render-dasar.js',
    './js/render-main.js',
    './js/render-program.js',
    './js/state.js',
    './js/ui.js',
    './js/utils.js',
    './vendor/docx/html.iife.js',
    './vendor/docx/index.iife.js',
    './vendor/docx/math.iife.js',
    './vendor/fonts/fonts.css',
    './vendor/fonts/inter-latin-400-normal.woff2',
    './vendor/fonts/inter-latin-500-normal.woff2',
    './vendor/fonts/inter-latin-600-normal.woff2',
    './vendor/fonts/inter-latin-700-normal.woff2',
    './vendor/fonts/inter-latin-800-normal.woff2',
    './vendor/fonts/tinos-latin-400-italic.woff2',
    './vendor/fonts/tinos-latin-400-normal.woff2',
    './vendor/fonts/tinos-latin-700-normal.woff2',
    './vendor/lucide.min.js',
    './vendor/xlsx.full.min.js'
];

// Prefiks khusus aplikasi ini. Dulu 'asesmen-sumatif-' (sama dengan aplikasi adm-ujian), sehingga bila
// kedua aplikasi dibuka di alamat yang sama (mis. localhost:8000) masing-masing menghapus cache yang lain.
const CACHE_PREFIX = 'perangkat-ajar-';
const LEGACY_PREFIX = 'asesmen-sumatif-';
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;

// Hosting seperti Cloudflare mengalihkan /index.html -> / (307). Respons hasil pengalihan
// (redirected = true) DITOLAK browser bila dipakai untuk membuka halaman, jadi simpan salinan bersih.
async function cleanResponse(res) {
    if (!res || !res.redirected) return res;
    return new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers });
}

async function precache() {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(PRECACHE.map(async url => {
        const res = await fetch(new Request(url, { cache: 'reload' }));
        if (!res.ok) throw new Error(`Gagal menyimpan ${url} (${res.status})`);
        await cache.put(url, await cleanResponse(res));
    }));
}

self.addEventListener('install', event => {
    event.waitUntil(precache());
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.map(async k => {
                if (k === CACHE_NAME) return;
                if (k.startsWith(CACHE_PREFIX)) return caches.delete(k);
                // Cache lama berprefiks bersama: hapus hanya bila milik aplikasi ini (berisi berkas khasnya)
                if (k.startsWith(LEGACY_PREFIX)) {
                    const cache = await caches.open(k);
                    if (await cache.match(new URL('js/kalender.js', self.registration.scope).href)) return caches.delete(k);
                }
            })))
            .then(() => self.clients.claim())
    );
});

// Dikirim halaman saat pengguna menekan "Muat ulang" pada pemberitahuan versi baru.
self.addEventListener('message', event => {
    if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

    // Halaman: selalu layani index.html dari cache (cepat & tetap jalan tanpa internet).
    if (req.mode === 'navigate') {
        event.respondWith(
            caches.match('./', { cacheName: CACHE_NAME })
                .then(res => res || caches.match('./index.html', { cacheName: CACHE_NAME }))
                .then(cleanResponse)
                .then(res => res || fetch(req))
        );
        return;
    }

    // Berkas lain: cache dulu, bila tidak ada ambil dari jaringan lalu simpan.
    event.respondWith(
        caches.match(req, { cacheName: CACHE_NAME, ignoreSearch: true }).then(cached => {
            if (cached) return cached;
            return fetch(req).then(res => {
                if (res.ok && res.type === 'basic') {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
                }
                return res;
            });
        })
    );
});
