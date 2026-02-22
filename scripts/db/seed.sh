#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV=${1:-dev}

if [ "$ENV" = "dev" ]; then
  export DATABASE_URL="postgresql://whatschat:whatschat123@localhost:5433/whatschat?schema=public"
fi

cd "$ROOT_DIR"
pnpm --filter whatschat-server db:seed
