import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_KzaE9MTihP0g@ep-small-mud-aopx0eza.ap-southeast-1.neon.tech/neondb?sslmode=require';
const sql = neon(dbUrl);

async function check() {
  try {
    const blogs = await sql`SELECT id, title, slug, status, date FROM blogs`;
    console.log('--- DB BLOGS ---');
    console.log(blogs);

    const projects = await sql`SELECT id, title, slug, status FROM projects`;
    console.log('--- DB PROJECTS ---');
    console.log(projects);
  } catch (err) {
    console.error('Error querying database:', err);
  }
}

check();
