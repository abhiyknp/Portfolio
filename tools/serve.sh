#!/bin/sh
# Serves the site locally on http://localhost:${PORT:-8780}/ (static files, no build step).
cd "$(dirname "$0")/.." && exec python3 -m http.server "${PORT:-8780}"
