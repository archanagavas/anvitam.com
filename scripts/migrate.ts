import './load-env';
import { initDatabase } from '../lib/db';

async function run() {
  console.log('Running database migrations...');
  try {
    const result = await initDatabase();
    console.log('Migration result:', result);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
  process.exit(0);
}
run();
