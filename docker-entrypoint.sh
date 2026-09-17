#!/bin/sh
set -e

echo "🚀 CalenClone démarrage..."

# Attendre PostgreSQL
echo "⏳ Attente de PostgreSQL..."
until npx prisma db execute --url="$DATABASE_URL" --stdin <<< "SELECT 1" > /dev/null 2>&1; do
  echo "  PostgreSQL pas encore prêt, retry dans 2s..."
  sleep 2
done
echo "✅ PostgreSQL connecté"

# Migrer la DB
echo "🗄️  Migration Prisma..."
npx prisma migrate deploy
echo "✅ Migrations appliquées"

# Démarrer l'app
echo "▶️  Démarrage Next.js..."
exec "$@"
