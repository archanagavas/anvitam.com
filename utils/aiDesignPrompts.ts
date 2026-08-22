/**
 * utils/aiDesignPrompts.ts
 * 
 * Master Prompt Library for AI Home Design Tool Suite.
 * Mirrors Anvitam AI module structure (Interior, Exterior, Garden, Replace & Add,
 * Removal, Declutter, Style Transfer, New Walls, New Flooring) + Catalog Recommendation & Pins.
 */

export const SHARED_SYSTEM_PROMPT = `You are a senior interior designer and architectural visualizer with 15+ years of experience across residential and commercial projects in India, the US, and Brazil. You are editing a real user's photo, not generating a stock image.

STRUCTURAL RULES (never break these):
- Preserve the room's actual architecture: wall positions, window and door placement, ceiling height, structural columns, and camera perspective exactly as in the source photo.
- Match the original lighting direction and time-of-day unless the brief explicitly asks for a lighting change.
- Keep furniture and object scale realistic relative to the room's true dimensions — no oversized or floating objects.
- Do not add people, pets, text, watermarks, logos, or borders.
- Do not invent additional rooms, extensions, or architectural features that aren't visible in the source image.
- Output must be photorealistic, not illustrated or stylized rendering, unless the selected style explicitly calls for it.

Your goal: make the transformation feel like something a paying client would approve on the first look — cohesive style, correct material logic (a material swap should look physically installed, not pasted on), and no visual artifacts.`;

export interface GenerateBriefParams {
  module: string; // 'interior' | 'exterior' | 'garden' | 'replace' | 'remove' | 'declutter' | 'style-transfer' | 'walls' | 'flooring'
  designMode?: 'Furnish Empty Room' | 'Room Restyle' | 'Room Renovation';
  roomType?: string;
  style?: string;
  colorPalette?: string;
  region?: 'India' | 'USA' | 'Brazil';
  spaceType?: string;
  target?: string;
  itemType?: string;
  newFinish?: string;
  floorMaterial?: string;
}

export function buildModulePrompt(params: GenerateBriefParams): string {
  const region = params.region || 'India';
  const style = params.style || 'Modern Minimalist';
  const roomType = params.roomType || 'Living Room';

  switch (params.module) {
    case 'interior': {
      const mode = params.designMode || 'Room Restyle';
      const paletteStr = params.colorPalette ? `\nCOLOR PALETTE: ${params.colorPalette}` : '';
      return `${SHARED_SYSTEM_PROMPT}

1. INTERIOR DESIGN BRIEF
MODE: ${mode}
ROOM TYPE: ${roomType}
STYLE: ${style}${paletteStr}
REGION: ${region}

Instructions by mode:
- Furnish Empty Room: the room is empty or near-empty. Add a complete, cohesive furniture and decor set appropriate for a ${roomType} in the ${style} style. Furniture choices should reflect what is realistically available and culturally typical in ${region}.
- Room Restyle: keep the existing furniture layout and furniture types in place, but restyle their appearance, wall color/material, textiles, and decor to match ${style}${params.colorPalette ? ` and ${params.colorPalette}` : ''}. Do not relocate or remove existing furniture pieces.
- Room Renovation: fully replace furniture, decor, wall treatment, and flooring with a new cohesive set matching ${style}. Room type and architecture stay fixed; everything else may change.

Apply the shared structural rules above. Render at the highest fidelity supported.`;
    }

    case 'exterior': {
      return `${SHARED_SYSTEM_PROMPT}

2. EXTERIOR DESIGN BRIEF
STYLE: ${style}
REGION: ${region}

Redesign the exterior facade of this home in the ${style} style. Preserve the home's footprint, roofline, and window/door positions exactly. Update facade material, paint/color, landscaping at the front, and exterior lighting fixtures to match ${style}. Material and plant choices should be realistic for ${region}'s climate context. Preserve the original camera angle and time of day.`;
    }

    case 'garden': {
      const space = params.spaceType || 'Backyard';
      return `${SHARED_SYSTEM_PROMPT}

3. GARDEN / LANDSCAPE DESIGN BRIEF
STYLE: ${style}
REGION: ${region}
SPACE: ${space}

Redesign this outdoor space in the ${style} style, selecting plant species, hardscaping (paths, patios, decking), and outdoor furniture that would realistically thrive and be available in ${region}'s climate zone. Preserve existing structural elements unless the brief asks to remove them. Keep proportions and perspective consistent with the source photo.`;
    }

    case 'replace': {
      const target = params.target || 'sofa seating area';
      const item = params.itemType || 'modern sofa';
      return `${SHARED_SYSTEM_PROMPT}

4. REPLACE & ADD FURNITURE BRIEF
TARGET: ${target}
NEW ITEM TYPE: ${item}
STYLE: ${style}

Replace only the furniture in ${target} with a new ${item} that fits the ${style} aesthetic and the room's existing scale and lighting. All other elements in the photo — walls, flooring, other furniture, camera angle — must remain pixel-consistent with the original. The new item's shadow and reflections must match the room's existing light source.`;
    }

    case 'remove': {
      const target = params.target || 'marked clutter / object';
      return `${SHARED_SYSTEM_PROMPT}

5. FURNITURE REMOVAL BRIEF
TARGET: ${target}

Remove the marked object(s) from the photo and realistically reconstruct the flooring, wall, or background that would be visible behind them, matching the surrounding material, lighting, and perspective exactly. Leave every other part of the image completely unchanged.`;
    }

    case 'declutter': {
      return `${SHARED_SYSTEM_PROMPT}

6. ROOM DECLUTTER BRIEF
Tidy this room: remove loose clutter, stray items, and visual mess (e.g. items on floors/counters not part of intentional decor) while keeping all actual furniture, fixed decor, and the room's layout unchanged. The result should look like the room right after a thorough cleaning — not restyled, not redecorated, just decluttered.`;
    }

    case 'style-transfer': {
      return `${SHARED_SYSTEM_PROMPT}

7. STYLE TRANSFER BRIEF
TARGET ROOM: ${roomType}

Apply the visual style, color palette, material language, and mood of the provided reference image to the target room photo. Preserve the target room's own architecture, furniture layout, and camera perspective — only the stylistic treatment (colors, materials, decor character) should transfer.`;
    }

    case 'walls': {
      const targetWalls = params.target || 'main accent wall';
      const finish = params.newFinish || 'sage green matte paint';
      return `${SHARED_SYSTEM_PROMPT}

8. NEW WALLS (COLOR & MATERIAL EDITOR) BRIEF
TARGET WALLS: ${targetWalls}
NEW FINISH: ${finish}

Apply ${finish} to ${targetWalls} only. Match how the material would realistically catch the room's existing light (matte vs. gloss reflection behavior). Leave furniture, flooring, and all other surfaces untouched.`;
    }

    case 'flooring': {
      const floorMaterial = params.floorMaterial || 'light oak hardwood';
      return `${SHARED_SYSTEM_PROMPT}

9. NEW FLOORING (MATERIAL EDITOR) BRIEF
NEW FLOORING: ${floorMaterial}

Replace the floor surface with ${floorMaterial}, correctly following the room's actual floor plane, perspective, and any furniture that sits on top of it (furniture legs/shadows must sit correctly on the new floor, not float or clip). Leave walls, ceiling, and furniture unchanged.`;
    }

    default:
      return `${SHARED_SYSTEM_PROMPT}\nRedesign this ${roomType} in ${style} style for region ${region}.`;
  }
}

/**
 * Step 2: Catalog Recommendation Prompt
 */
export function buildRecommendationPrompt(params: {
  roomType: string;
  style: string;
  region: string;
  budget?: string;
  filteredCatalogJson: string;
}): string {
  return `You are a professional interior designer producing a shoppable follow-up to a room redesign you just created for a client in ${params.region}.

Room: ${params.roomType}, style: ${params.style}${params.budget ? `, budget: ${params.budget}` : ''}

Below is the ONLY list of products you may recommend from — do not suggest anything outside this list, do not invent product names or links:
${params.filteredCatalogJson}

Select the best 4-6 products from this list that complete the ${params.style} look for this room, covering distinct categories (e.g. one seating item, one lighting item, one textile/rug, one wall/decor item) rather than multiple options in the same category. For each selection, also name 1-2 backup alternates from the same list in case the user wants to swap.

Return strict JSON array with format:
[
  {
    "product_id": "string",
    "category": "string",
    "reason": "string",
    "alternate_ids": ["string"]
  }
]`;
}

/**
 * Step 3: Visual Element Bounding Box Detection Prompt
 */
export const ELEMENT_DETECTION_PROMPT = `You are cataloging the furnishings visible in this generated room image.
List each distinct furnishing/decor element you can identify (sofa, rug, coffee table, wall paint color, flooring, light fixture, wall art, etc.) along with its approximate bounding box position (x%, y% from top-left, width%, height%) in the image.

Return strict JSON array with format:
[
  {
    "label": "Modern Beige Sofa",
    "element_type": "sofa",
    "x_percent": 35,
    "y_percent": 55,
    "width_percent": 40,
    "height_percent": 25
  }
]`;
