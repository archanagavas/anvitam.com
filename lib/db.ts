/**
 * lib/db.ts
 * Neon Serverless database client — used by all /api/* routes.
 * The DATABASE_URL must be set in Vercel Dashboard → Project → Settings → Environment Variables.
 */
import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL || 'postgresql://placeholder_for_startup_validation@localhost/db';
if (!process.env.DATABASE_URL) {
  console.warn('[db] DATABASE_URL is not set in environment. Database connection will fail when queried.');
}

export const sql = neon(dbUrl);

/**
 * Run once on first deploy (or via /api/db-init) to create all tables.
 */
export async function initDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      category    TEXT NOT NULL DEFAULT '',
      location    TEXT NOT NULL DEFAULT '',
      year        TEXT NOT NULL DEFAULT '',
      image       TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      full_description TEXT,
      gallery     JSONB,
      specs       JSONB,
      story       JSONB,
      is_featured BOOLEAN DEFAULT false,
      created_at  TIMESTAMPTZ DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS blogs (
      id               TEXT PRIMARY KEY,
      title            TEXT NOT NULL,
      slug             TEXT NOT NULL UNIQUE,
      date             TEXT NOT NULL,
      excerpt          TEXT NOT NULL DEFAULT '',
      content          TEXT NOT NULL DEFAULT '',
      image            TEXT NOT NULL DEFAULT '',
      author           TEXT NOT NULL DEFAULT 'Anvitam Team',
      meta_description TEXT,
      meta_title       TEXT,
      cover_image_alt  TEXT,
      faqs             JSONB DEFAULT '[]',
      tags             JSONB DEFAULT '[]',
      status           TEXT NOT NULL DEFAULT 'draft',
      toc              JSONB DEFAULT '[]',
      author_bio       TEXT,
      author_image     TEXT,
      created_at       TIMESTAMPTZ DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS services (
      id            TEXT PRIMARY KEY,
      title         TEXT NOT NULL,
      description   TEXT NOT NULL DEFAULT '',
      icon          TEXT NOT NULL DEFAULT 'PenTool',
      value_props   JSONB DEFAULT '[]',
      hero_image    TEXT,
      what_it_is    JSONB DEFAULT '[]',
      who_its_for   JSONB DEFAULT '[]',
      case_study_id TEXT,
      process       JSONB DEFAULT '[]',
      pricing       TEXT,
      faq           JSONB DEFAULT '[]',
      booking_link  TEXT,
      gallery       JSONB DEFAULT '[]',
      case_study_ids JSONB DEFAULT '[]',
      videos        JSONB DEFAULT '[]',
      created_at    TIMESTAMPTZ DEFAULT now()
    );
  `;

  // Migrations for existing databases
  await sql`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_title TEXT;`;
  await sql`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS cover_image_alt TEXT;`;
  await sql`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]';`;
  await sql`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author_bio TEXT;`;
  await sql`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author_image TEXT;`;

  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug TEXT;`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS hero_image TEXT;`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]';`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]';`;
  await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]';`;
  await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS case_study_ids JSONB DEFAULT '[]';`;
  await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]';`;

  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      message    TEXT NOT NULL,
      date       TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS digital_products (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price       TEXT NOT NULL DEFAULT '',
      link        TEXT NOT NULL DEFAULT '',
      image       TEXT NOT NULL DEFAULT '',
      tags        JSONB DEFAULT '[]',
      category    TEXT NOT NULL DEFAULT 'E-Books',
      created_at  TIMESTAMPTZ DEFAULT now()
    );
  `;

  // Seed initial online courses if none exist
  const existingCourses = await sql`SELECT id FROM digital_products WHERE category = 'Online Courses' LIMIT 1`;
  if (existingCourses.length === 0) {
    const defaultCourses = [
      {
        id: 'c1',
        title: 'Farm Retreat Design Masterclass',
        description: 'A comprehensive online course covering site analysis, bioclimatic design, permaculture zoning, and how to create profitable eco-retreat experiences from scratch.',
        price: '₹3,999',
        link: 'https://topmate.io/ar_archana_gavas',
        image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop',
        tags: ['Architecture', 'Permaculture', 'Business'],
        category: 'Online Courses'
      },
      {
        id: 'c2',
        title: 'Food Forest Design Blueprint',
        description: 'Design productive food forests and edible gardens for farm stays, community spaces, and personal properties using proven permaculture techniques.',
        price: '₹2,499',
        link: 'https://topmate.io/ar_archana_gavas',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop',
        tags: ['Food Forest', 'Landscape', 'Sustainability'],
        category: 'Online Courses'
      },
      {
        id: 'c3',
        title: 'Airbnb & Homestay Design for Revenue',
        description: 'Learn how to design, style, and position your Airbnb or homestay for maximum occupancy, guest satisfaction, and profitable returns.',
        price: '₹1,999',
        link: 'https://topmate.io/ar_archana_gavas',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
        tags: ['Airbnb', 'Interior', 'Hospitality'],
        category: 'Online Courses'
      }
    ];
    for (const c of defaultCourses) {
      await sql`
        INSERT INTO digital_products (id, title, description, price, link, image, tags, category)
        VALUES (${c.id}, ${c.title}, ${c.description}, ${c.price}, ${c.link}, ${c.image}, ${JSON.stringify(c.tags)}, ${c.category})
        ON CONFLICT (id) DO NOTHING
      `;
    }
  }

  return { success: true, message: 'Database tables created or already exist.' };
}
