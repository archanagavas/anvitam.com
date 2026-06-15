import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

// 1. Read .env.local to get DATABASE_URL
const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local not found. Cannot proceed.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlLine = envContent.split('\n').find(line => line.startsWith('DATABASE_URL='));
if (!dbUrlLine) {
  console.error('❌ DATABASE_URL not found in .env.local.');
  process.exit(1);
}

const databaseUrl = dbUrlLine.split('DATABASE_URL=')[1].trim();
console.log('🔗 Connecting to database...');
const sql = neon(databaseUrl);

// 2. Initial courses data
const courses = [
  {
    id: 'c1',
    title: 'Farm Retreat Design Masterclass',
    description: 'A comprehensive online course covering site analysis, bioclimatic design, permaculture zoning, and how to create profitable eco-retreat experiences from scratch.',
    price: '₹3,999',
    link: 'https://topmate.io/ar_archana_gavas',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop',
    tags: ['Architecture', 'Permaculture', 'Business'],
    category: 'Online Courses',
  },
  {
    id: 'c2',
    title: 'Food Forest Design Blueprint',
    description: 'Design productive food forests and edible gardens for farm stays, community spaces, and personal properties using proven permaculture techniques.',
    price: '₹2,499',
    link: 'https://topmate.io/ar_archana_gavas',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop',
    tags: ['Food Forest', 'Landscape', 'Sustainability'],
    category: 'Online Courses',
  },
  {
    id: 'c3',
    title: 'Airbnb & Homestay Design for Revenue',
    description: 'Learn how to design, style, and position your Airbnb or homestay for maximum occupancy, guest satisfaction, and profitable returns.',
    price: '₹1,999',
    link: 'https://topmate.io/ar_archana_gavas',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
    tags: ['Airbnb', 'Interior', 'Hospitality'],
    category: 'Online Courses',
  },
];

async function seed() {
  try {
    console.log('🌱 Seeding courses into digital_products table...');
    for (const c of courses) {
      await sql`
        INSERT INTO digital_products (id, title, description, price, link, image, tags, category)
        VALUES (${c.id}, ${c.title}, ${c.description}, ${c.price}, ${c.link}, ${c.image}, ${JSON.stringify(c.tags)}, ${c.category})
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          link = EXCLUDED.link,
          image = EXCLUDED.image,
          tags = EXCLUDED.tags,
          category = EXCLUDED.category
      `;
      console.log(`✅ Seeded/Updated course: "${c.title}"`);
    }
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seed();
