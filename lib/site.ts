// lib/site.ts — Single source of truth for site identity.
// Used by llms.txt, llms-full.txt, ai.txt, markdown pages, JSON-LD and robots comments.
// Facts here must match the Organization JSON-LD in api/ssr-seo.ts / index.html.
export const SITE = {
  name: 'Anvitam',
  legalName: 'Anvitam — Architecture & Ecological Design Studio',
  url: 'https://www.anvitam.com',
  description:
    'Anvitam is a sustainable architecture and ecological design studio based in Vadodara and Nadiad, Gujarat, India, consulting worldwide. Led by principal architect Ar. Archana Gavas, the studio designs eco resorts, farm retreats, weekend villas, homestays, wellness retreats, food forests and permaculture masterplans using natural materials, passive solar design and rainwater harvesting.',
  shortDescription:
    'Sustainable architecture & ecological design studio: eco resorts, farm retreats, food forests and permaculture masterplanning.',
  email: 'anvitamarchitects@gmail.com',
  contactEmail: 'ar.archanagavas@gmail.com',
  phone: '+917990657190',
  founder: 'Ar. Archana Gavas',
  founderTitle: 'Principal Architect & Founder',
  locality: 'Vadodara / Nadiad, Gujarat, India',
  logo: 'https://www.anvitam.com/logo.png',
  socials: {
    linkedin: 'https://www.linkedin.com/in/archana-gavas/',
    instagram: 'https://www.instagram.com/anvitam_archit/',
    youtube: 'https://www.youtube.com/@designbyarchana',
    medium: 'https://medium.com/@archanagavas',
    topmate: 'https://topmate.io/archanagavas',
  },
} as const;

export const absUrl = (path: string): string =>
  `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`;
