#!/bin/bash

# Setup script for development environment
# This script will:
# 1. Build aws-integration package
# 2. Generate Prisma client
# 3. Install dependencies if needed

set -e

echo "🔧 Setting up development environment..."

# Build aws-integration package
echo "📦 Building @whatschat/aws-integration package..."
cd packages/aws-integration
pnpm build
cd ../..

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
cd apps/server
pnpm db:generate
cd ../..

echo "✅ Setup complete! You can now run 'pnpm dev'"