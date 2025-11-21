#!/bin/bash

# This script runs migrations with access to Replit environment variables
# It sources the environment and then runs the migration

# Export environment variables
export DATABASE_URL="${DATABASE_URL}"
export PGHOST="${PGHOST}"
export PGUSER="${PGUSER}"
export PGPASSWORD="${PGPASSWORD}"
export PGDATABASE="${PGDATABASE}"
export PGPORT="${PGPORT}"

# Run the migration script
tsx scripts/migrate-cancelled-orders.ts
