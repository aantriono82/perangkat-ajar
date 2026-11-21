#!/bin/sh
# Deploy aplikasi ke Cloudflare (Workers static assets) → https://perangkat-ajar.aantriono.com
#
#   npm run deploy:cf
#
# Butuh CLI Cloudflare: `npm install --global cf` lalu `cf auth login` (sekali saja).
# Hanya berkas aplikasi yang diunggah (tanpa node_modules, build, docs, dsb.). Konfigurasi
# Cloudflare (cloudflare.config.ts) dibuat di folder staging, bukan di akar repo: berkas itu
# butuh "type": "module" di package.json, dan itu merusak skrip build (CommonJS).
# Domain kustom dipasang lewat `domains` di konfigurasi tsb. setiap kali deploy
# (DNS & sertifikat dibuat otomatis oleh Cloudflare).
set -eu

ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"
WORKER=perangkat-ajar
DOMAIN=perangkat-ajar.aantriono.com
STAGE="$ROOT/.cf-deploy/$WORKER"

command -v cf >/dev/null 2>&1 || { echo "CLI 'cf' belum terpasang: npm install --global cf" >&2; exit 1; }
node build/build-sw.js --check >/dev/null || { echo "sw.js usang — jalankan 'npm run build' dulu." >&2; exit 1; }

rm -rf "$STAGE"
mkdir -p "$STAGE/public"
cp -r index.html manifest.webmanifest sw.js css js img vendor "$STAGE/public/"

# cloudflare.config.ts mengimpor "cf/config" → pakai paket cf yang terpasang global
CF_PKG=$(dirname "$(dirname "$(readlink -f "$(command -v cf)")")")
mkdir -p "$STAGE/node_modules"
ln -sfn "$CF_PKG" "$STAGE/node_modules/cf"
printf '{ "private": true, "type": "module" }\n' > "$STAGE/package.json"
cat > "$STAGE/cloudflare.config.ts" <<CONFIG
import { defineConfig } from "cf/config";

export default defineConfig({
    worker: {
        name: "$WORKER",
        compatibilityDate: "2026-11-01",
        domains: ["$DOMAIN"],
    },
});
CONFIG

VERSION=$(node -p "require('./package.json').version")
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo lokal)
cd "$STAGE"
cf deploy public --message "v$VERSION ($COMMIT)" --tag "v$VERSION"
