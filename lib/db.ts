/**
 * lib/db.ts
 * ─────────────────────────────────────────────────────────────
 * Firebase Firestore database client for all /api/* routes.
 *
 * SETUP (one-time):
 *   1. Create a Firebase project at https://console.firebase.google.com
 *   2. Go to Project Settings → Service Accounts → Generate new private key
 *   3. Add these to Vercel environment variables (and .env.local):
 *      FIREBASE_PROJECT_ID=your-project-id
 *      FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
 *      FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 *
 * This replaces the previous Supabase/Neon postgres connection.
 * Firestore never pauses, never has connection limits, and has a generous free tier.
 * ─────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import {
  INITIAL_PROJECTS, INITIAL_BLOGS, SERVICES,
  INITIAL_TESTIMONIALS, INITIAL_PARTNERS, INITIAL_WORKSHOPS,
  DIGITAL_PRODUCTS, INITIAL_ESTIMATOR_SERVICES
} from '../constants.js';

// ── Utility ──────────────────────────────────────────────────────────────────
export function safeParseJSON(val: any, fallback: any = []) {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return fallback; }
  }
  return val ?? fallback;
}

// ── Firebase Admin Singleton ──────────────────────────────────────────────────
let _app: App | null = null;
let _db: Firestore | null = null;
export let isDbConfigured = false;

function getDb(): Firestore {
  if (_db) return _db;

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      '[db] Firebase credentials missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.'
    );
  }

  if (getApps().length === 0) {
    _app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    _app = getApps()[0];
  }

  _db = getFirestore(_app);
  _db.settings({ ignoreUndefinedProperties: true });
  return _db;
}

// Determine once at startup whether Firebase is configured
try {
  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY;
  isDbConfigured = !!(projectId && clientEmail && privateKey);
  if (isDbConfigured) {
    console.log('[db] Firebase Firestore credentials detected — database enabled.');
  } else {
    console.warn('[db] Firebase credentials not set. Falling back to static seed data.');
  }
} catch (_) {
  isDbConfigured = false;
}

// ── Collection Helpers ────────────────────────────────────────────────────────

/** Get all documents from a collection, sorted by created_at or date */
export async function getCollection(name: string, orderDir: 'asc' | 'desc' = 'desc'): Promise<any[]> {
  const db = getDb();
  try {
    const snap = await db.collection(name).get();
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.sort((a: any, b: any) => {
      if (typeof a.order === 'number' && typeof b.order === 'number') {
        return a.order - b.order;
      }
      const timeA = new Date(a.created_at || a.updated_at || a.date || 0).getTime();
      const timeB = new Date(b.created_at || b.updated_at || b.date || 0).getTime();
      return orderDir === 'desc' ? timeB - timeA : timeA - timeB;
    });
    return docs;
  } catch (err: any) {
    console.error(`[db] Failed to fetch collection ${name}:`, err);
    throw err;
  }
}

/** Get a single document by its Firestore document ID */
export async function getDoc(collection: string, id: string): Promise<any | null> {
  const db = getDb();
  const doc = await db.collection(collection).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

/** Find document(s) where a field equals a value */
export async function findWhere(collection: string, field: string, value: string): Promise<any[]> {
  const db = getDb();
  const snap = await db.collection(collection).where(field, '==', value).limit(5).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Get all documents from a collection as typed records.
 * Returns an empty array (not null) on any error so callers
 * can safely fall back to their in-memory seed data.
 */
export async function getAllDocs<T = any>(collection: string): Promise<T[]> {
  try {
    const db = getDb();
    const snap = await db.collection(collection).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
  } catch (err) {
    console.error(`[db] getAllDocs(${collection}) failed:`, err);
    return [];
  }
}

/** Upsert (create or update) a document by ID */
export async function upsertDoc(collection: string, id: string, data: Record<string, any>): Promise<void> {
  const db = getDb();
  // Always track timestamps
  const payload: Record<string, any> = {
    ...data,
    id,
    updated_at: new Date().toISOString(),
  };
  if (!data.created_at) {
    payload.created_at = new Date().toISOString();
  }

  await db.collection(collection).doc(id).set(payload, { merge: true });
}

/** Delete a document by ID */
export async function deleteDoc(collection: string, id: string): Promise<void> {
  const db = getDb();
  await db.collection(collection).doc(id).delete();
}

// ── Database Initialization (seeds default data if collections empty) ─────────
let dbInitialized = false;

export async function initDatabase(force: boolean = false): Promise<{ success: boolean; message: string }> {
  if (dbInitialized && !force) return { success: true, message: 'Already initialized.' };
  if (!isDbConfigured) return { success: false, message: 'Firebase not configured.' };

  const db = getDb();

  try {
    // Seed partners (only if empty to prevent overwriting admin-edited partners)
    const partnersSnap = await db.collection('partners').limit(1).get();
    if (partnersSnap.empty) {
      const batch = db.batch();
      for (const p of INITIAL_PARTNERS) {
        batch.set(db.collection('partners').doc(p.id), {
          ...p, created_at: new Date().toISOString()
        });
      }
      await batch.commit();
      console.log('[db] Seeded partners.');
    }

    // Seed testimonials
    const testimonialsSnap = await db.collection('testimonials').limit(1).get();
    if (testimonialsSnap.empty) {
      const batch = db.batch();
      for (const t of INITIAL_TESTIMONIALS) {
        batch.set(db.collection('testimonials').doc(t.id), {
          ...t, created_at: new Date().toISOString()
        });
      }
      await batch.commit();
      console.log('[db] Seeded testimonials.');
    }

    // Seed projects
    const projectsSnap = await db.collection('projects').limit(1).get();
    if (projectsSnap.empty) {
      const batch = db.batch();
      for (const p of INITIAL_PROJECTS) {
        batch.set(db.collection('projects').doc(p.id), {
          id: p.id, title: p.title, category: p.category, location: p.location,
          year: p.year, image: p.image, description: p.description,
          fullDescription: p.fullDescription || '',
          gallery: p.gallery || [], specs: p.specs || [], story: p.story || [],
          isFeatured: p.isFeatured ?? false, status: p.status || 'published',
          tags: [], faqs: [], videos: [], slug: p.id,
          created_at: new Date().toISOString()
        });
      }
      await batch.commit();
      console.log('[db] Seeded projects.');
    }

    // Seed blogs (Skipped - INITIAL_BLOGS is empty)
    // Blogs collection will remain empty until admin adds new posts.

    // Seed services (Preserve existing created_at on merge)
    const servicesSnap = await db.collection('services').limit(1).get();
    if (servicesSnap.empty || force) {
      const batch = db.batch();
      const now = new Date().toISOString();
      for (const s of SERVICES) {
        const docRef = db.collection('services').doc(s.id);
        const docSnap = await docRef.get();
        const existingData = docSnap.exists ? docSnap.data() : null;
        const createdAt = existingData?.created_at || now;

        batch.set(docRef, {
          id: s.id, title: s.title, description: s.description, icon: s.icon,
          category: s.category || '',
          order: s.order || 99,
          valueProps: s.valueProps || [], heroImage: s.heroImage || '',
          whatItIs: s.whatItIs || [], whoItsFor: s.whoItsFor || [],
          caseStudyId: s.caseStudyId || '', caseStudyIds: s.caseStudyIds || [],
          process: s.process || [], pricing: s.pricing || '',
          faq: s.faq || [], bookingLink: s.bookingLink || '',
          gallery: s.gallery || [], videos: s.videos || [],
          metaTitle: s.metaTitle || '', metaDescription: s.metaDescription || '',
          metaKeywords: s.metaKeywords || '', metaRobots: s.metaRobots || 'index, follow',
          created_at: createdAt,
          updated_at: now
        }, { merge: true });
      }
      await batch.commit();
      console.log('[db] Seeded/Updated services.');
    }

    // Seed workshops
    const workshopsSnap = await db.collection('workshops').limit(1).get();
    if (workshopsSnap.empty && INITIAL_WORKSHOPS && INITIAL_WORKSHOPS.length > 0) {
      const batch = db.batch();
      for (const w of INITIAL_WORKSHOPS) {
        batch.set(db.collection('workshops').doc(w.id), {
          ...w, created_at: new Date().toISOString()
        });
      }
      await batch.commit();
      console.log('[db] Seeded workshops.');
    }

    // Seed digital products
    const productsSnap = await db.collection('digital_products').limit(1).get();
    if (productsSnap.empty) {
      const defaultProducts = [
        ...DIGITAL_PRODUCTS,
        {
          id: 'c1', title: 'Farm Retreat Design Masterclass',
          description: 'A comprehensive online course covering site analysis, bioclimatic design, and permaculture zoning.',
          price: '₹3,999', link: 'https://topmate.io/archanagavas',
          image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop',
          tags: ['Architecture', 'Permaculture', 'Business'], category: 'Online Courses'
        },
        {
          id: 'c2', title: 'Food Forest Design Blueprint',
          description: 'Design productive food forests using proven permaculture techniques.',
          price: '₹2,499', link: 'https://topmate.io/archanagavas',
          image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop',
          tags: ['Food Forest', 'Landscape', 'Sustainability'], category: 'Online Courses'
        },
        {
          id: 'c3', title: 'Airbnb & Homestay Design for Revenue',
          description: 'Design your Airbnb for maximum occupancy and guest satisfaction.',
          price: '₹1,999', link: 'https://topmate.io/archanagavas',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
          tags: ['Airbnb', 'Interior', 'Hospitality'], category: 'Online Courses'
        },
      ];
      const batch = db.batch();
      for (const p of defaultProducts) {
        batch.set(db.collection('digital_products').doc(p.id), {
          ...p, created_at: new Date().toISOString()
        });
      }
      await batch.commit();
      console.log('[db] Seeded digital_products.');
    }

    // Seed estimator_services
    const estimatorSnap = await db.collection('estimator_services').limit(1).get();
    if (estimatorSnap.empty && INITIAL_ESTIMATOR_SERVICES && INITIAL_ESTIMATOR_SERVICES.length > 0) {
      const batch = db.batch();
      for (const e of INITIAL_ESTIMATOR_SERVICES) {
        batch.set(db.collection('estimator_services').doc(e.id), {
          ...e, created_at: new Date().toISOString()
        });
      }
      await batch.commit();
      console.log('[db] Seeded estimator_services.');
    }

    dbInitialized = true;
    return { success: true, message: 'Firebase Firestore initialized and seeded successfully.' };
  } catch (err: any) {
    console.error('[db] initDatabase error:', err);
    throw err;
  }
}
