#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔧 Setting up development environment..."

echo "📦 Building @whatschat/aws-integration package..."
cd "$ROOT_DIR/packages/aws-integration"
pnpm build

echo "🗄️  Generating Prisma client..."
cd "$ROOT_DIR/apps/server"
pnpm db:generate

echo "✅ Setup complete! You can now run 'pnpm dev'"
