#!/bin/bash
# GeleConnect — one-command setup script
# Run: bash setup.sh

set -e

echo ""
echo "═══════════════════════════════════════════"
echo "   GeleConnect Setup"
echo "═══════════════════════════════════════════"
echo ""

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org (v18+)"
  exit 1
fi
NODE_VER=$(node -v)
echo "✅ Node.js $NODE_VER"

# Check npm
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# Prisma generate
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"

# DB Push
echo ""
echo "🗄️  Pushing database schema..."
echo "   (Make sure DATABASE_URL in .env.local is correct first!)"
echo ""
npx prisma db push
echo "✅ Database schema pushed"

# Seed
echo ""
echo "🌱 Seeding demo data..."
npx tsx prisma/seed-demo.ts
echo "✅ Demo data seeded"

echo ""
echo "═══════════════════════════════════════════"
echo "   ✅ Setup complete!"
echo "═══════════════════════════════════════════"
echo ""
echo "   Run:  npm run dev"
echo "   Open: http://localhost:3000"
echo ""
echo "   Demo login: vendor@geleconnect.demo"
echo "   Password:   demo1234!"
echo ""
