#!/bin/sh
set -eu

app_dir="${APP_DIR:-/app}"
: "${PARALAB_API_BASE:?PARALAB_API_BASE must be set to the public HTTPS API gateway origin}"

case "$PARALAB_API_BASE" in
  https://*) ;;
  *)
    echo "PARALAB_API_BASE must start with https://" >&2
    exit 64
    ;;
esac

# Vite serializes VITE_* values at build time. Replace the dedicated literal
# token at startup so PWS can keep its API hostname in a runtime environment
# variable rather than source control.
escaped_api_base=$(printf '%s' "$PARALAB_API_BASE" | sed 's/[\\&|]/\\&/g')
find "$app_dir/.output" -type f \( -name '*.js' -o -name '*.mjs' \) -exec \
  sed -i "s|__PARALAB_API_BASE__|${escaped_api_base}|g" {} +

exec node "$app_dir/.output/server/index.mjs" --host 0.0.0.0 --port "${PORT:-80}"
