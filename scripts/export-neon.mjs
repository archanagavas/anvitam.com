/**
 * scripts/export-neon.mjs
 * Run: node scripts/export-neon.mjs
 *
 * Exports all Anvitam tables from Neon PostgreSQL to JSON files
 * in scripts/neon-export/ so you can then import them to Firebase.
 *
 * Usage:
 *   NEON_URL="postgresql://..." node scripts/export-neon.mjs
 *   OR set NEON_URL in .env.local and run this script.
 */

import { neon } from '@neondatabase/serverless';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── 1. Read connection string ───────────────────────────────────────────────
// Try process.env first, then ask user to pass it
const NEON_URL = process.env.NEON_URL || process.env.DATABASE_URL;
if (!NEON_URL || !NEON_URL.startsWith('postgres')) {
  console.error('\n❌  No Neon DATABASE_URL found.\n');
  console.error('Please run:\n');
  console.error('  $env:NEON_URL="postgresql://USER:PASS@HOST/DB?sslmode=require"; node scripts/export-neon.mjs\n');
  process.exit(1);
}

const sql = neon(NEON_URL);

// ── 2. Tables to export ─────────────────────────────────────────────────────
const TABLES = [
  'projects',
  'blogs',
  'services',
  'messages',
  'digital_products',
  'testimonials',
  'partners',
  'workshops',
  'estimator_services',
];

// ── 3. Export ───────────────────────────────────────────────────────────────
const outDir = join(__dirname, 'neon-export');
mkdirSync(outDir, { recursive: true });

let totalRows = 0;
const summary = {};

for (const table of TABLES) {
  try {
    const rows = await sql`SELECT * FROM ${sql(table)} ORDER BY created_at ASC NULLS LAST`;
    const outPath = join(outDir, `${table}.json`);
    writeFileSync(outPath, JSON.stringify(rows, null, 2), 'utf-8');
    totalRows += rows.length;
    summary[table] = rows.length;
    console.log(`✅  ${table}: ${rows.length} rows → ${outPath}`);
  } catch (err) {
    console.warn(`⚠️   ${table}: skipped (table may not exist) — ${err.message}`);
    summary[table] = 0;
  }
}

console.log('\n── Export Summary ──────────────────────────────');
Object.entries(summary).forEach(([t, c]) => console.log(`   ${t}: ${c} rows`));
console.log(`   TOTAL: ${totalRows} rows`);
console.log(`   Output: ${outDir}`);
console.log('\n✅  Done! Now run: node scripts/import-firebase.mjs');
