// Find correct Supabase pooler URL by testing all regions
import postgres from 'postgres';

const PASSWORD = 'Archie%407990657190';
const PROJECT_REF = 'oibkunielhdurdljjrwx';

// Test all possible pooler regions
const poolerHosts = [
  `aws-0-ap-south-1.pooler.supabase.com`,
  `aws-0-ap-southeast-1.pooler.supabase.com`,
  `aws-0-us-east-1.pooler.supabase.com`,
  `aws-0-eu-central-1.pooler.supabase.com`,
];

async function test(host) {
  const url = `postgresql://postgres.${PROJECT_REF}:${PASSWORD}@${host}:6543/postgres`;
  const sql = postgres(url, { ssl: 'require', prepare: false, max: 1, connect_timeout: 5 });
  try {
    const r = await sql`SELECT 1 as ok`;
    console.log('✅ WORKS:', host);
    await sql.end();
    return true;
  } catch (err) {
    console.log('❌', host, '-', err.message.substring(0, 60));
    await sql.end().catch(() => {});
    return false;
  }
}

// Also test session pooler (port 5432) - uses original username
async function testSession(host) {
  const url = `postgresql://postgres:${PASSWORD}@${host}:5432/postgres`;
  const sql = postgres(url, { ssl: 'require', prepare: false, max: 1, connect_timeout: 5 });
  try {
    const r = await sql`SELECT 1 as ok`;
    console.log('✅ SESSION POOLER WORKS:', host);
    await sql.end();
    return true;
  } catch (err) {
    console.log('❌ session', host, '-', err.message.substring(0, 60));
    await sql.end().catch(() => {});
    return false;
  }
}

console.log('Testing transaction pooler (port 6543) across regions...');
for (const host of poolerHosts) {
  await test(host);
}

// Direct is working - check if it also works with ?pgbouncer=true
console.log('\nTesting direct with pgbouncer flag...');
const directUrl = `postgresql://postgres:${PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres?pgbouncer=true`;
const sqlD = postgres(directUrl, { ssl: 'require', prepare: false, max: 1, connect_timeout: 5 });
try {
  await sqlD`SELECT 1`;
  console.log('✅ Direct + pgbouncer=true works');
} catch(e) {
  console.log('❌ Direct + pgbouncer:', e.message.substring(0, 80));
}
await sqlD.end().catch(() => {});

process.exit(0);
