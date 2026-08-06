import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { FlowButton } from './ui/flow-button';

type Step = {
  n: string;
  title: string;
  body: string;
  icon: string;
  tags?: string[];
};

type VerticalTimelineProps = {
  steps?: Step[];
};

const DEFAULT_STEPS: Step[] = [
  {
    n: '01',
    title: 'Discover',
    icon: '🔍',
    body: 'We listen deeply to understand your land, personal vision, project scope, budget, and long-term goals.',
    tags: ['Site Vision', 'Scope & Budget', 'Zoning & Constraints']
  },
  {
    n: '02',
    title: 'Read the Site',
    icon: '🗺️',
    body: 'Before designing buildings, we decode the natural ecosystem — analyzing microclimate, sun movement, wind patterns, topography, water flow, and soil health.',
    tags: ['Sun & Wind Study', 'Waterflow Analysis', 'Soil & Contour Mapping']
  },
  {
    n: '03',
    title: 'Build the System',
    icon: '🌿',
    body: 'We integrate living infrastructure into a cohesive masterplan — placing water harvesting, food production, energy loops, and ecological buffers.',
    tags: ['Rainwater Harvesting', 'Food Forest Layout', 'Eco Infrastructure']
  },
  {
    n: '04',
    title: 'Design',
    icon: '📐',
    body: 'We translate the ecological masterplan into biophilic architecture, crafting spaces, natural material palettes, structural plans, and 3D visualisations.',
    tags: ['Vernacular Architecture', '3D Visualisations', 'Material Selection']
  },
  {
    n: '05',
    title: 'Implement',
    icon: '🏗️',
    body: 'We support execution through detailed construction drawings, craftsman onboarding, material sourcing, and site supervision.',
    tags: ['Execution Drawings', 'On-Site Quality Check', 'Phased Handover']
  }
];

const VerticalTimeline: React.FC<VerticalTimelineProps> = ({ steps = DEFAULT_STEPS }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
      {/* ── LEFT COLUMN: Sticky Overview & CTA ── */}
      <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6">
        <div className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-700 bg-gray-50/80">
          <Sparkles size={12} className="text-gray-900" />
          <span>Our Methodology</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-[1.15]">
          From raw land to living system.
        </h2>

        <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
          Every project follows a disciplined 5-phase sequence. We don't force architecture onto land — we let the land guide the architecture.
        </p>

        {/* Value Bullet Points */}
        <div className="space-y-3 pt-2">
          {[
            'Ecosystem-first analysis before any building construction',
            'Integrated water, soil, & climate resilience plans',
            'Tailored biophilic architecture designed for long-term comfort'
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
              <CheckCircle2 size={18} className="text-gray-900 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="pt-4 flex flex-wrap gap-4 items-center">
          <FlowButton
            text="Estimate Your Project"
            onClick={() => window.dispatchEvent(new CustomEvent('open-estimator', { detail: { serviceId: 'farm-retreat' } }))}
          />
        </div>
      </div>

      {/* ── RIGHT COLUMN: Step Cards Timeline ── */}
      <div className="lg:col-span-7 relative">
        {/* Continuous Connecting Line behind icons */}
        <div className="absolute left-[27px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-gray-300 via-gray-300 to-transparent hidden sm:block z-0" />

        <div className="space-y-6 relative z-10">
          {steps.map(({ n, title, body, icon, tags }, index) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group relative bg-white border border-gray-200/90 hover:border-gray-900/40 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
                {/* Step badge */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gray-900 text-[#CCFF00] font-black text-sm flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    {n}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl sm:text-2xl">{icon}</span>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-gray-900 transition-colors">
                      {title}
                    </h3>
                  </div>

                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {body}
                  </p>

                  {/* Deliverable Tags */}
                  {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="inline-flex items-center text-[11px] font-semibold text-gray-700 bg-gray-100/80 group-hover:bg-gray-100 px-3 py-1 rounded-full border border-gray-200/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerticalTimeline;
