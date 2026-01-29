#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_NAME="kintone-partial-search-plugin.zip"
OUTPUT_PATH="${ROOT_DIR}/${OUTPUT_NAME}"

cd "${ROOT_DIR}"

zip -r "${OUTPUT_PATH}" \
  manifest.json \
  desktop.js desktop.css \
  config.html config.js config.css

echo "Created: ${OUTPUT_PATH}"
