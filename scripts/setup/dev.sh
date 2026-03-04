#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$ROOT_DIR/apps/server"
pnpm db:generate

echo "✅ Setup done. Starting..."
exec "$SCRIPT_DIR/../app/start.sh" dev
