/**
 * constants/catalogData.ts
 * 
 * Pre-loaded Curated Product Catalog for AI Home Design Shoppable Recommendation Layer.
 * Supports India, USA, and Brazil regional pricing, categories, element types, and affiliate link redirects.
 */

export interface CatalogCategory {
  id: string;
  name: string;
  element_types: string[];
}

export interface CatalogProduct {
  id: string;
  category_id: string;
  name: string;
  element_type: string; // sofa, rug, wall_paint, flooring, lighting_fixture, curtains, wall_art, decor_accent, etc.
  region: 'India' | 'USA' | 'Brazil' | 'Global';
  style_tags: string[];
  price: string;
  image_url: string;
  affiliate_link: string;
  source: 'manual' | 'skimlinks' | 'amazon_in' | 'mercadolivre' | 'paapi';
  active: boolean;
  room_types?: string[];
}

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  { id: 'cat_furniture', name: 'Furniture', element_types: ['sofa', 'chair', 'dining_table', 'bed', 'coffee_table', 'cabinet'] },
  { id: 'cat_lighting', name: 'Lighting', element_types: ['lighting_fixture', 'pendant_light', 'floor_lamp', 'table_lamp', 'chandelier'] },
  { id: 'cat_textiles', name: 'Textiles & Rugs', element_types: ['rug', 'curtains', 'cushions', 'throws', 'bedding'] },
  { id: 'cat_walls', name: 'Wall & Surface', element_types: ['wall_paint', 'wallpaper', 'wall_art', 'wall_panel'] },
  { id: 'cat_flooring', name: 'Flooring', element_types: ['hardwood', 'flooring', 'tile', 'polished_concrete', 'laminate'] },
  { id: 'cat_decor', name: 'Decor & Accessories', element_types: ['decor_accent', 'mirror', 'indoor_plant', 'vase', 'clock'] },
];

export const INITIAL_CATALOG_PRODUCTS: CatalogProduct[] = [
  // --- INDIA PRODUCTS ---
  {
    id: 'in_sofa_01',
    category_id: 'cat_furniture',
    name: 'Urban Ladder Modular 3-Seater Velvet Sofa',
    element_type: 'sofa',
    region: 'India',
    style_tags: ['Modern', 'Minimalist', 'Contemporary', 'Luxury'],
    price: '₹34,999',
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
    affiliate_link: 'https://amazon.in/dp/B08X123456?tag=anvitam-21',
    source: 'amazon_in',
    active: true,
    room_types: ['Living Room', 'Lounge', 'Office']
  },
  {
    id: 'in_rug_01',
    category_id: 'cat_textiles',
    name: 'Jaipur Rugs Handwoven Jute & Cotton Area Carpet',
    element_type: 'rug',
    region: 'India',
    style_tags: ['Bohemian', 'Rustic', 'Modern', 'Japandi', 'Biophilic'],
    price: '₹8,499',
    image_url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=800&auto=format&fit=crop',
    affiliate_link: 'https://amazon.in/dp/B08X654321?tag=anvitam-21',
    source: 'amazon_in',
    active: true,
    room_types: ['Living Room', 'Bedroom', 'Dining Room']
  },
  {
    id: 'in_lamp_01',
    category_id: 'cat_lighting',
    name: 'Pepperfry Nordic Wooden Tripod Floor Lamp',
    element_type: 'floor_lamp',
    region: 'India',
    style_tags: ['Modern', 'Nordic', 'Minimalist', 'Scandi'],
    price: '₹3,299',
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop',
    affiliate_link: 'https://amazon.in/dp/B09A111222?tag=anvitam-21',
    source: 'amazon_in',
    active: true,
    room_types: ['Living Room', 'Bedroom', 'Study']
  },
  {
    id: 'in_paint_01',
    category_id: 'cat_walls',
    name: 'Asian Paints Royale Luxury Emulsion (Sage Green Matte)',
    element_type: 'wall_paint',
    region: 'India',
    style_tags: ['Modern', 'Biophilic', 'Japandi', 'Minimalist'],
    price: '₹2,100 / 4L',
    image_url: 'https://images.unsplash.com/photo-1562184552-997c461abbe6?q=80&w=800&auto=format&fit=crop',
    affiliate_link: 'https://amazon.in/dp/B09B333444?tag=anvitam-21',
    source: 'amazon_in',
    active: true,
    room_types: ['Living Room', 'Bedroom', 'Kitchen']
  },
  {
    id: 'in_chair_01',
    category_id: 'cat_furniture',
    name: 'Teak Wood Rattan Cane Dining Chair',
    element_type: 'chair',
    region: 'India',
    style_tags: ['Rustic', 'Tropical', 'Bohemian', 'Heritage'],
    price: '₹6,750',
    image_url: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?q=80&w=800&auto=format&fit=crop',
    affiliate_link: 'https://amazon.in/dp/B09C555666?tag=anvitam-21',
    source: 'amazon_in',
    active: true,
    room_types: ['Dining Room', 'Balcony', 'Study']
  },

  // --- USA PRODUCTS ---
  {
    id: 'us_sofa_01',
    category_id: 'cat_furniture',
    name: 'Rove Concepts Milo Sectional Sofa',
    element_type: 'sofa',
    region: 'USA',
    style_tags: ['Modern', 'Contemporary', 'Luxury', 'Minimalist'],
    price: '$1,899',
    image_url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800&auto=format&fit=crop',
    affiliate_link: 'https://www.wayfair.com/furniture/pdp/rove-sofa-w0012345.html',
    source: 'skimlinks',
    active: true,
    room_types: ['Living Room', 'Lounge']
  },
  {
    id: 'us_lamp_01',
    category_id: 'cat_lighting',
    name: 'West Elm Sculptural Glass Pendant Light',
    element_type: 'pendant_light',
    region: 'USA',
    style_tags: ['Modern', 'Mid-Century', 'Minimalist'],
    price: '$249',
    image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800&auto=format&fit=crop',
    affiliate_link: 'https://www.westelm.com/products/sculptural-glass-pendant',
    source: 'skimlinks',
    active: true,
    room_types: ['Kitchen', 'Dining Room', 'Entryway']
  },
  {
    id: 'us_rug_01',
    category_id: 'cat_textiles',
    name: 'Ruggable Washable Distressed Vintage Area Rug',
    element_type: 'rug',
    region: 'USA',
    style_tags: ['Traditional', 'Vintage', 'Farmhouse', 'Rustic'],
    price: '$319',
    image_url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=800&auto=format&fit=crop',
    affiliate_link: 'https://ruggable.com/products/vintage-carpet',
    source: 'skimlinks',
    active: true,
    room_types: ['Living Room', 'Bedroom']
  },

  // --- BRAZIL PRODUCTS ---
  {
    id: 'br_sofa_01',
    category_id: 'cat_furniture',
    name: 'Sofá Modulado Retrátil Tok&Stok Linho Cru',
    element_type: 'sofa',
    region: 'Brazil',
    style_tags: ['Modern', 'Tropical', 'Minimalist'],
    price: 'R$ 3.499',
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
    affiliate_link: 'https://www.mercadolivre.com.br/sofa-tokstok',
    source: 'mercadolivre',
    active: true,
    room_types: ['Living Room']
  },
  {
    id: 'br_chair_01',
    category_id: 'cat_furniture',
    name: 'Poltrona Charles Eames Madeira Maciça Nogueira',
    element_type: 'chair',
    region: 'Brazil',
    style_tags: ['Mid-Century', 'Modern', 'Luxury'],
    price: 'R$ 1.890',
    image_url: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?q=80&w=800&auto=format&fit=crop',
    affiliate_link: 'https://www.mercadolivre.com.br/poltrona-eames',
    source: 'mercadolivre',
    active: true,
    room_types: ['Living Room', 'Office']
  }
];
