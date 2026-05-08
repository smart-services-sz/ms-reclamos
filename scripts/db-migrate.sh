#!/bin/sh
# Smart migration script for ms-reclamos.
#
# Checks whether the database has been initialized by counting tables in the
# public schema (excluding the Prisma migrations tracking table itself).
# - Empty database  → prisma migrate reset --force  (first-time init)
# - Existing tables → prisma migrate deploy          (normal incremental flow)
#
# This prevents the "No pending migrations to apply" false-positive that occurs
# when _prisma_migrations exists but is empty, while also ensuring subsequent
# deploys never destructively wipe live data.

set -e

echo "🔍 Checking database state..."

TABLE_COUNT=$(psql "$DATABASE_URL" -t -A -c \
  "SELECT COUNT(*) FROM information_schema.tables \
   WHERE table_schema = 'public' \
     AND table_name != '_prisma_migrations';")

echo "   Tables found in public schema (excluding _prisma_migrations): $TABLE_COUNT"

if [ "$TABLE_COUNT" -eq 0 ]; then
  echo "📦 Database is empty — running prisma migrate reset --force for first-time initialization..."
  npx prisma migrate reset --force
  echo "✅ Database initialized successfully."
else
  echo "🚀 Database already initialized — running prisma migrate deploy..."
  npx prisma migrate deploy
  echo "✅ Migrations applied successfully."
fi
