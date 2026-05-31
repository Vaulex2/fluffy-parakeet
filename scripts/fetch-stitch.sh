#!/usr/bin/env bash
# Downloads a Stitch asset URL (handles redirects + Google auth handshake)
set -euo pipefail
URL="$1"
OUT="$2"
curl -L --fail --silent --show-error \
  -H "User-Agent: Mozilla/5.0 (compatible; SushiGO-Build/1.0)" \
  "$URL" -o "$OUT"
echo "Saved: $OUT"
