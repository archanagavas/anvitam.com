export interface GalleryItem {
  url: string;
  caption: string;
}

export interface StorySection {
  title: string;
  content: string;
  image?: string;
}

export interface Project {
  id: string;
  title: string;
  slug?: string; // URL-safe slug, e.g. "my-project-slug"
  category: string;
  location: string;
  year: string;
  image: string;
  heroImage?: string; // Large banner image
  description: string;
  fullDescription?: string;
  gallery?: GalleryItem[]; // Changed from string[] to GalleryItem[]
  videos?: { url: string; caption: string }[]; // YouTube / Instagram embed links
  specs?: { label: string; value: string }[];
  isFeatured?: boolean;
  story?: StorySection[]; // New: Detailed start-to-finish story
  tags?: string[]; // Tag list
  faqs?: { question: string; answer: string }[]; // FAQ Schema builder items
  status?: 'ongoing' | 'delivered'; // New: Project status
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaRobots?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;          // URL-safe slug, e.g. "my-post-title"
  date: string;
  excerpt: string;
  content: string;       // HTML/Rich text (from Quill)
  image: string;
  author: string;
  metaDescription?: string; // SEO meta description (≤160 chars)
  metaTitle?: string;       // SEO meta title (≤60 chars)
  coverImageAlt?: string;   // SEO alt text for cover image
  faqs?: { question: string; answer: string }[]; // FAQ Schema builder items
  tags?: string[];           // Category / tag chips
  status: 'published' | 'draft';
  toc?: string[];        // Table of contents headers
  authorBio?: string;    // Optional custom biography for the author
  authorImage?: string;  // Optional custom avatar/image URL or base64 for the author
  metaKeywords?: string;
  metaRobots?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  linkedin?: string;
}

export interface Award {
  id: string;
  title: string;
  year: string;
}

export interface Testimonial {
  id: string;
  text: string;
  author: string;
  role: string;
  image: string;
}

export enum PageState {
  VIEW = 'VIEW',
  LOADING = 'LOADING',
  ERROR = 'ERROR'
}

export interface ProcessStep {
  id: string;
  title: string;
  number: string;
  items: string[];
  description: string;
  image: string;
}

export interface ServiceProcess {
  title: string;
  description: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  valueProps: string[]; // Deliverables
  icon: string; 
  // New fields for detailed page
  heroImage?: string;
  whatItIs?: string[]; // Paragraphs
  whoItsFor?: string[]; // Bullet points
  caseStudyId?: string; // ID of a related project
  process?: ServiceProcess[];
  pricing?: string;
  faq?: ServiceFAQ[];
  bookingLink?: string;
  gallery?: GalleryItem[];
  caseStudyIds?: string[];
  videos?: { url: string; caption: string }[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaRobots?: string;
}

export interface DigitalProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  link: string;
  image: string;
  tags: string[];
  category?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaRobots?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
}