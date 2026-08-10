/**
 * scripts/import-firebase.mjs
 * Run AFTER export-neon.mjs has created scripts/neon-export/*.json
 *
 * Reads the JSON files and bulk-imports into Firestore using the Admin SDK.
 *
 * Usage:
 *   Set FIREBASE_SERVICE_ACCOUNT_PATH to your downloaded service account JSON path.
 *   node scripts/import-firebase.mjs
 *
 * OR set env vars directly:
 *   $env:FIREBASE_SERVICE_ACCOUNT_PATH="C:\path\to\serviceAccount.json"
 *   node scripts/import-firebase.mjs
 */

import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── 1. Load service account credentials ─────────────────────────────────────
const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!saPath || !existsSync(saPath)) {
  console.error('\n❌  FIREBASE_SERVICE_ACCOUNT_PATH not set or file not found.\n');
  console.error('1. Go to: Firebase Console → Project Settings → Service Accounts');
  console.error('2. Click "Generate new private key"');
  console.error('3. Save the JSON file somewhere safe');
  console.error('4. Run:\n');
  console.error('   $env:FIREBASE_SERVICE_ACCOUNT_PATH="C:\\path\\to\\serviceAccount.json"; node scripts/import-firebase.mjs\n');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(saPath, 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ── 2. Table → Firestore collection mapping ──────────────────────────────────
const TABLE_TO_COLLECTION = {
  projects: 'projects',
  blogs: 'blogs',
  services: 'services',
  messages: 'messages',
  digital_products: 'digital_products',
  testimonials: 'testimonials',
  partners: 'partners',
  workshops: 'workshops',
  estimator_services: 'estimator_services',
};

// ── 3. Import helper (batched for Firestore 500 doc limit) ───────────────────
async function importCollection(collectionName, rows) {
  if (!rows || rows.length === 0) {
    console.log(`   ⏭️  ${collectionName}: 0 rows, skipping`);
    return;
  }

  const colRef = db.collection(collectionName);
  let batch = db.batch();
  let count = 0;
  let batchCount = 0;

  for (const row of rows) {
    const docId = String(row.id || `doc-${Date.now()}-${count}`);
    const docRef = colRef.doc(docId);

    // Convert JSONB strings to proper JS objects for Firestore
    const data = {};
    for (const [key, val] of Object.entries(row)) {
      if (val === null || val === undefined) {
        data[key] = null;
      } else if (typeof val === 'string') {
        // Try to parse JSON strings (JSONB columns come as strings from Neon)
        if (val.startsWith('[') || val.startsWith('{')) {
          try {
            data[key] = JSON.parse(val);
          } catch {
            data[key] = val;
          }
        } else {
          data[key] = val;
        }
      } else {
        data[key] = val;
      }
    }

    // Add importedAt timestamp
    data._importedAt = admin.firestore.FieldValue.serverTimestamp();

    batch.set(docRef, data, { merge: true });
    count++;

    // Firestore batch limit is 500
    if (count % 400 === 0) {
      await batch.commit();
      batchCount++;
      batch = db.batch();
      console.log(`   📦  ${collectionName}: committed batch ${batchCount} (${count} docs so far)`);
    }
  }

  // Commit remaining
  if (count % 400 !== 0) {
    await batch.commit();
  }

  console.log(`✅  ${collectionName}: ${count} documents imported`);
}

// ── 4. Run the import ────────────────────────────────────────────────────────
const exportDir = join(__dirname, 'neon-export');
let totalImported = 0;

for (const [tableName, collectionName] of Object.entries(TABLE_TO_COLLECTION)) {
  const filePath = join(exportDir, `${tableName}.json`);
  if (!existsSync(filePath)) {
    console.warn(`⚠️   ${tableName}.json not found — skipping`);
    continue;
  }
  const rows = JSON.parse(readFileSync(filePath, 'utf-8'));
  await importCollection(collectionName, rows);
  totalImported += rows.length;
}

console.log(`\n── Import Summary ──────────────────────────────`);
console.log(`   TOTAL IMPORTED: ${totalImported} documents`);
console.log(`\n✅  Firebase import complete! Check your Firestore console.`);
process.exit(0);
