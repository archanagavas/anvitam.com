/**
 * lib/db.ts
 * Database client for all /api/* routes.
 *
 * For Supabase: use the TRANSACTION POOLER URL (port 6543, region ap-northeast-2).
 * This is required for Vercel serverless — direct connections (port 5432) cause ENOTFOUND.
 * Pooler URL format: postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
 *
 * DATABASE_URL must be set in Vercel → Project → Settings → Environment Variables.
 */
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
import { INITIAL_PROJECTS, INITIAL_BLOGS, SERVICES, INITIAL_TESTIMONIALS, INITIAL_PARTNERS } from '../constants.js';

let dbClient: any;
let isDbConfigured = false;

try {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
    isDbConfigured = true;
    if (dbUrl.includes('supabase')) {
      // Supabase: MUST use Transaction Pooler URL (port 6543) with postgres TCP driver.
      // If someone accidentally sets the direct URL (port 5432), auto-rewrite to pooler.
      // Pooler host: aws-0-ap-northeast-2.pooler.supabase.com:6543
      // Username format for pooler: postgres.PROJECT_REF (not just postgres)
      let poolerUrl = dbUrl;
      // Rewrite direct host to pooler host if needed
      if (dbUrl.includes('db.') && dbUrl.includes('.supabase.co')) {
        // Extract project ref from db.PROJECT_REF.supabase.co
        const match = dbUrl.match(/db\.([a-z0-9]+)\.supabase\.co/);
        if (match) {
          const ref = match[1];
          // Rewrite: replace username 'postgres' with 'postgres.REF', replace host/port
          poolerUrl = dbUrl
            .replace(/\/\/postgres:/, `//postgres.${ref}:`)
            .replace(`db.${ref}.supabase.co:5432`, `aws-0-ap-northeast-2.pooler.supabase.com:6543`)
            .replace(`db.${ref}.supabase.co`, `aws-0-ap-northeast-2.pooler.supabase.com:6543`);
          console.log('[db] Auto-rewrote direct URL to pooler URL for Supabase.');
        }
      }
      dbClient = postgres(poolerUrl, { ssl: 'require', prepare: false, max: 1 });
      console.log('[db] Using postgres driver with Supabase Transaction Pooler (ap-northeast-2)');
    } else {
      // Neon or other postgres-compatible DB: use neon HTTP driver
      dbClient = neon(dbUrl);
      console.log('[db] Using neon HTTP driver');
    }
  } else {
    console.warn('[db] DATABASE_URL is not set or invalid. Falling back to static data.');
    dbClient = async () => {
      throw new Error('Database connection is not configured.');
    };
  }
} catch (err) {
  console.error('[db] Failed to initialize database client:', err);
  dbClient = async () => {
    throw new Error('Database client initialization failed.');
  };
}

let dbInitPromise: Promise<any> | null = null;
let isInitializing = false;
let dbInitFailed = false;
let lastDbInitError: string | null = null;
let lastDbInitTime = 0;
const DB_RETRY_COOLDOWN = 30000; // 30 second cooldown on failure (was 60s)

export async function ensureDbInitialized() {
  if (!isDbConfigured) return;
  // If initialized failed recently, skip retrying for the cooldown period
  if (dbInitFailed && (Date.now() - lastDbInitTime < DB_RETRY_COOLDOWN)) {
    return;
  }
  // After cooldown, reset so we retry
  if (dbInitFailed && (Date.now() - lastDbInitTime >= DB_RETRY_COOLDOWN)) {
    dbInitFailed = false;
    dbInitPromise = null;
    lastDbInitError = null;
  }
  if (isInitializing) return;

  if (!dbInitPromise) {
    isInitializing = true;
    dbInitPromise = (async () => {
      try {
        console.log('[db] Lazy database initialization started...');
        await initDatabaseInternal();
        dbInitFailed = false;
        lastDbInitError = null;
        console.log('[db] Lazy database initialization completed successfully.');
      } catch (err: any) {
        dbInitFailed = true;
        lastDbInitTime = Date.now();
        lastDbInitError = err?.message || String(err);
        if (lastDbInitError.includes('402') || lastDbInitError.includes('quota')) {
          console.warn('[db] Neon database quota exceeded (HTTP 402). Serving static fallback data.');
        } else {
          console.warn('[db] Lazy database initialization failed:', lastDbInitError);
        }
      } finally {
        isInitializing = false;
      }
    })();
  }
  await dbInitPromise;
}

const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
  if (!isInitializing) {
    await ensureDbInitialized();
  }
  if (dbInitFailed) {
    throw new Error(lastDbInitError || 'Database unavailable. Using static fallback data.');
  }
  return dbClient(strings, ...values);
};

export { sql, isDbConfigured };

/**
 * Run once on first deploy (or via /api/db-init) to create all tables.
 */
export async function initDatabase() {
  await ensureDbInitialized();
  return { success: true, message: 'Database tables created or already exist.' };
}

async function initDatabaseInternal() {
  await dbClient`
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
      status      TEXT,
      created_at  TIMESTAMPTZ DEFAULT now()
    );
  `;

  await dbClient`
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

  await dbClient`
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

  await dbClient`
    CREATE TABLE IF NOT EXISTS messages (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      message    TEXT NOT NULL,
      date       TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;

  await dbClient`
    CREATE TABLE IF NOT EXISTS digital_products (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price       TEXT NOT NULL DEFAULT '',
      link        TEXT NOT NULL DEFAULT '',
      image       TEXT NOT NULL DEFAULT '',
      tags        JSONB DEFAULT '[]',
      category    TEXT NOT NULL DEFAULT 'E-Books',
      youtube_url TEXT DEFAULT '',
      videos      JSONB DEFAULT '[]',
      created_at  TIMESTAMPTZ DEFAULT now()
    );
  `;

  await dbClient`
    CREATE TABLE IF NOT EXISTS testimonials (
      id          TEXT PRIMARY KEY,
      author      TEXT NOT NULL,
      role        TEXT NOT NULL DEFAULT '',
      text        TEXT NOT NULL,
      image       TEXT NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ DEFAULT now()
    );
  `;

  await dbClient`
    CREATE TABLE IF NOT EXISTS partners (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      logo        TEXT NOT NULL DEFAULT '',
      icon        TEXT NOT NULL DEFAULT '',
      website     TEXT NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ DEFAULT now()
    );
  `;

  await dbClient`
    CREATE TABLE IF NOT EXISTS workshops (
      id              TEXT PRIMARY KEY,
      title           TEXT NOT NULL,
      organization    TEXT NOT NULL DEFAULT '',
      location        TEXT NOT NULL DEFAULT '',
      date            TEXT NOT NULL DEFAULT '',
      category        TEXT NOT NULL DEFAULT 'School',
      description     TEXT NOT NULL DEFAULT '',
      attendees_count TEXT DEFAULT '',
      offerings       JSONB DEFAULT '[]',
      images          JSONB DEFAULT '[]',
      status          TEXT NOT NULL DEFAULT 'published',
      created_at      TIMESTAMPTZ DEFAULT now()
    );
  `;

  // Seed initial partners if none exist, or update logos if missing
  const existingPartners = await dbClient`SELECT id FROM partners LIMIT 1`;
  if (existingPartners.length === 0) {
    for (const p of INITIAL_PARTNERS) {
      await dbClient`
        INSERT INTO partners (id, name, logo, icon, website)
        VALUES (${p.id}, ${p.name}, ${p.logo ?? ''}, ${p.icon ?? ''}, ${p.website ?? ''})
        ON CONFLICT (id) DO NOTHING
      `;
    }
  } else {
    for (const p of INITIAL_PARTNERS) {
      await dbClient`
        UPDATE partners SET logo = ${p.logo ?? ''}
        WHERE id = ${p.id} AND (logo IS NULL OR logo = '');
      `;
    }
  }

  // Migrations for existing databases
  await dbClient`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_title TEXT;`;
  await dbClient`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS cover_image_alt TEXT;`;
  await dbClient`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]';`;
  await dbClient`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author_bio TEXT;`;
  await dbClient`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author_image TEXT;`;
  await dbClient`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_keywords TEXT;`;
  await dbClient`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_robots TEXT;`;

  await dbClient`ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug TEXT;`;
  await dbClient`ALTER TABLE projects ADD COLUMN IF NOT EXISTS hero_image TEXT;`;
  await dbClient`ALTER TABLE projects ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';`;
  await dbClient`ALTER TABLE projects ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]';`;
  await dbClient`ALTER TABLE projects ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]';`;
  await dbClient`ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT;`;
  await dbClient`ALTER TABLE projects ADD COLUMN IF NOT EXISTS meta_title TEXT;`;
  await dbClient`ALTER TABLE projects ADD COLUMN IF NOT EXISTS meta_description TEXT;`;
  await dbClient`ALTER TABLE projects ADD COLUMN IF NOT EXISTS meta_keywords TEXT;`;
  await dbClient`ALTER TABLE projects ADD COLUMN IF NOT EXISTS meta_robots TEXT;`;

  await dbClient`ALTER TABLE services ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]';`;
  await dbClient`ALTER TABLE services ADD COLUMN IF NOT EXISTS case_study_ids JSONB DEFAULT '[]';`;
  await dbClient`ALTER TABLE services ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]';`;
  await dbClient`ALTER TABLE services ADD COLUMN IF NOT EXISTS meta_title TEXT;`;
  await dbClient`ALTER TABLE services ADD COLUMN IF NOT EXISTS meta_description TEXT;`;
  await dbClient`ALTER TABLE services ADD COLUMN IF NOT EXISTS meta_keywords TEXT;`;
  await dbClient`ALTER TABLE services ADD COLUMN IF NOT EXISTS meta_robots TEXT;`;

  await dbClient`ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS meta_title TEXT;`;
  await dbClient`ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS meta_description TEXT;`;
  await dbClient`ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS meta_keywords TEXT;`;
  await dbClient`ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS meta_robots TEXT;`;

  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '';`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS state TEXT DEFAULT '';`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS country TEXT DEFAULT '';`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS skills_outcomes TEXT DEFAULT '';`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS materials_used TEXT DEFAULT '';`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS impact TEXT DEFAULT '';`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS outcomes TEXT DEFAULT '';`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS gallery_details JSONB DEFAULT '[]';`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS related_project_ids JSONB DEFAULT '[]';`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS related_service_ids JSONB DEFAULT '[]';`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS related_article_ids JSONB DEFAULT '[]';`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS slug TEXT;`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS meta_title TEXT;`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS meta_description TEXT;`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS primary_keyword TEXT;`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS secondary_keywords TEXT;`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS canonical_url TEXT;`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS og_title TEXT;`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS og_description TEXT;`;
  await dbClient`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS og_image TEXT;`;
  await dbClient`ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS youtube_url TEXT;`;
  await dbClient`ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]';`;

  // Seed initial online courses if none exist
  const existingCourses = await dbClient`SELECT id FROM digital_products WHERE category = 'Online Courses' LIMIT 1`;
  if (existingCourses.length === 0) {
    const defaultCourses = [
      {
        id: 'c1',
        title: 'Farm Retreat Design Masterclass',
        description: 'A comprehensive online course covering site analysis, bioclimatic design, permaculture zoning, and how to create profitable eco-retreat experiences from scratch.',
        price: '₹3,999',
        link: 'https://topmate.io/archanagavas',
        image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop',
        tags: ['Architecture', 'Permaculture', 'Business'],
        category: 'Online Courses'
      },
      {
        id: 'c2',
        title: 'Food Forest Design Blueprint',
        description: 'Design productive food forests and edible gardens for farm stays, community spaces, and personal properties using proven permaculture techniques.',
        price: '₹2,499',
        link: 'https://topmate.io/archanagavas',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop',
        tags: ['Food Forest', 'Landscape', 'Sustainability'],
        category: 'Online Courses'
      },
      {
        id: 'c3',
        title: 'Airbnb & Homestay Design for Revenue',
        description: 'Learn how to design, style, and position your Airbnb or homestay for maximum occupancy, guest satisfaction, and profitable returns.',
        price: '₹1,999',
        link: 'https://topmate.io/archanagavas',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
        tags: ['Airbnb', 'Interior', 'Hospitality'],
        category: 'Online Courses'
      }
    ];
    for (const c of defaultCourses) {
      await dbClient`
        INSERT INTO digital_products (id, title, description, price, link, image, tags, category)
        VALUES (${c.id}, ${c.title}, ${c.description}, ${c.price}, ${c.link}, ${c.image}, ${JSON.stringify(c.tags)}, ${c.category})
        ON CONFLICT (id) DO NOTHING
      `;
    }
  }

  // Seed initial projects if none exist
  const existingProjects = await dbClient`SELECT id FROM projects LIMIT 1`;
  if (existingProjects.length === 0) {
    for (const p of INITIAL_PROJECTS) {
      await dbClient`
        INSERT INTO projects (id, title, category, location, year, image, description, full_description, is_featured, specs)
        VALUES (${p.id}, ${p.title}, ${p.category}, ${p.location}, ${p.year}, ${p.image}, ${p.description}, ${p.fullDescription}, ${p.isFeatured ?? false}, ${JSON.stringify(p.specs ?? [])})
        ON CONFLICT (id) DO NOTHING
      `;
    }
  }

  // Seed initial blogs if none exist
  const existingBlogs = await dbClient`SELECT id FROM blogs LIMIT 1`;
  if (existingBlogs.length === 0) {
    for (const b of INITIAL_BLOGS) {
      await dbClient`
        INSERT INTO blogs (id, slug, title, date, author, status, meta_description, tags, excerpt, image, toc, author_image, author_bio, content)
        VALUES (${b.id}, ${b.slug}, ${b.title}, ${b.date}, ${b.author}, ${b.status}, ${b.metaDescription ?? null}, ${JSON.stringify(b.tags ?? [])}, ${b.excerpt}, ${b.image}, ${JSON.stringify(b.toc ?? [])}, ${b.authorImage ?? null}, ${b.authorBio ?? null}, ${b.content})
        ON CONFLICT (id) DO NOTHING
      `;
    }
  }

  // Seed initial services if none exist
  const existingServices = await dbClient`SELECT id FROM services LIMIT 1`;
  if (existingServices.length === 0) {
    for (const s of SERVICES) {
      await dbClient`
        INSERT INTO services (id, title, description, icon, value_props, hero_image, what_it_is, who_its_for, case_study_id, process, pricing, faq, booking_link, gallery, case_study_ids, videos)
        VALUES (${s.id}, ${s.title}, ${s.description}, ${s.icon}, ${JSON.stringify(s.valueProps ?? [])}, ${s.heroImage ?? null}, ${JSON.stringify(s.whatItIs ?? [])}, ${JSON.stringify(s.whoItsFor ?? [])}, ${s.caseStudyId ?? null}, ${JSON.stringify(s.process ?? [])}, ${s.pricing ?? null}, ${JSON.stringify(s.faq ?? [])}, ${s.bookingLink ?? null}, '[]', '[]', '[]')
        ON CONFLICT (id) DO NOTHING
      `;
    }
  }

  // Seed initial testimonials if none exist
  const existingTestimonials = await dbClient`SELECT id FROM testimonials LIMIT 1`;
  if (existingTestimonials.length === 0) {
    for (const t of INITIAL_TESTIMONIALS) {
      await dbClient`
        INSERT INTO testimonials (id, author, role, text, image)
        VALUES (${t.id}, ${t.author}, ${t.role}, ${t.text}, ${t.image})
        ON CONFLICT (id) DO NOTHING
      `;
    }
  }
}
