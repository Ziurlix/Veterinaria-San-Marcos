#!/usr/bin/env bash
set -euo pipefail

if ! command -v google-chrome >/dev/null 2>&1 && ! command -v chromium >/dev/null 2>&1 && ! command -v chromium-browser >/dev/null 2>&1; then
  echo "No se encontró Chrome/Chromium. Ejecuta primero: bash scripts/install-aws-chrome.sh"
  exit 1
fi

if command -v google-chrome >/dev/null 2>&1; then
  export CHROME_BIN="$(command -v google-chrome)"
elif command -v chromium >/dev/null 2>&1; then
  export CHROME_BIN="$(command -v chromium)"
else
  export CHROME_BIN="$(command -v chromium-browser)"
fi

npm test
echo ""
echo "Informe HTML: coverage/html/index.html"
