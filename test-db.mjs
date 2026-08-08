import postgres from 'postgres';

const URL = 'postgresql://postgres.oibkunielhdurdljjrwx:Archie%407990657190@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres';
const sql = postgres(URL, { ssl: 'require', prepare: false, max: 1, connect_timeout: 10 });

try {
  const r = await sql`SELECT NOW() as now, current_database() as db`;
  console.log('✅ POOLER CONNECTED:', JSON.stringify(r[0]));
  
  // Check tables exist
  const tables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;
  console.log('📋 Tables:', tables.map(t => t.table_name).join(', ') || '(none)');
} catch (err) {
  console.error('❌ FAILED:', err.message);
} finally {
  await sql.end();
  process.exit(0);
}
