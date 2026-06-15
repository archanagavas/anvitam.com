import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db';
import { generateLlmsFullTxt } from '../utils/seoGenerator';
import { Project, BlogPost, Service } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Fetch blogs
    const blogRows = await sql`SELECT id, title, slug, excerpt, date, content, image, author, status FROM blogs WHERE status = 'published'`;
    const blogs: BlogPost[] = blogRows.map(r => ({
      id: r.id,
      title: r.title,
      slug: r.slug || '',
      excerpt: r.excerpt || '',
      date: r.date || '',
      content: r.content || '',
      image: r.image || '',
      author: r.author || '',
      status: r.status || 'published'
    }));

    // Fetch projects
    const projectRows = await sql`SELECT id, title, category, location, year, image, description, full_description, is_featured, tags FROM projects`;
    const projects: Project[] = projectRows.map(r => ({
      id: r.id,
      title: r.title,
      category: r.category || '',
      location: r.location || '',
      year: r.year || '',
      image: r.image || '',
      description: r.description || '',
      fullDescription: r.full_description || '',
      isFeatured: r.is_featured || false,
      tags: r.tags ?? []
    }));

    // Fetch services
    const serviceRows = await sql`SELECT id, title, description, icon, value_props, hero_image, what_it_is, who_its_for, case_study_id, process, pricing, faq, booking_link FROM services`;
    const services: Service[] = serviceRows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      icon: r.icon || 'PenTool',
      valueProps: r.value_props ?? [],
      heroImage: r.hero_image || '',
      whatItIs: r.what_it_is ?? [],
      whoItsFor: r.who_its_for ?? [],
      caseStudyId: r.case_study_id || '',
      process: r.process ?? [],
      pricing: r.pricing || '',
      faq: r.faq ?? [],
      bookingLink: r.booking_link || ''
    }));

    const text = generateLlmsFullTxt(blogs, projects, services);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    return res.status(200).send(text);
  } catch (error: any) {
    console.error('Error generating llms-full.txt:', error);
    return res.status(500).json({ error: 'Failed to generate llms-full.txt', details: error.message });
  }
}
