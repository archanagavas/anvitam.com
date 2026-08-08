"use client";

import React, { useRef } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { FlowButton } from "./flow-button";
import StackingCards, { StackingCardItem } from "../fancy/blocks/stacking-cards";
import { cn } from "@/lib/utils";

export interface MethodologyStep {
  n: string;
  title: string;
  subtitle: string;
  body: string;
  image: string;
  tags: string[];
  bgColor: string;
  tabColor: string;
  borderColor: string;
}

export const STEPS: MethodologyStep[] = [
  {
    n: "01",
    title: "Discover & Site Vision",
    subtitle: "Understanding your goals and land potential",
    body: "We listen deeply to understand your land, personal vision, project scope, budget, and long-term goals before drawing a single line on paper.",
    image: "/images/methodology/step1.jpg",
    tags: ["Site Vision", "Scope & Budget", "Zoning & Constraints"],
    bgColor: "bg-[#162a23]",
    tabColor: "bg-[#1f3b31]",
    borderColor: "border-[#CCFF00]/30",
  },
  {
    n: "02",
    title: "Read the Ecosystem",
    subtitle: "Sun, wind, water & soil analysis",
    body: "Before designing buildings, we decode the natural ecosystem — analyzing microclimate, sun movement, wind patterns, topography, water flow, and soil health.",
    image: "/images/methodology/step2.jpg",
    tags: ["Sun & Wind Study", "Waterflow Analysis", "Soil Mapping"],
    bgColor: "bg-[#23201b]",
    tabColor: "bg-[#332f28]",
    borderColor: "border-[#CCFF00]/30",
  },
  {
    n: "03",
    title: "Build the Living System",
    subtitle: "Regenerative master planning & layout",
    body: "We integrate living infrastructure into a cohesive masterplan — placing rainwater harvesting, food production, energy loops, and ecological buffers.",
    image: "/images/methodology/step3.jpg",
    tags: ["Rainwater Harvesting", "Food Forest Layout", "Eco Loops"],
    bgColor: "bg-[#1b2620]",
    tabColor: "bg-[#27382f]",
    borderColor: "border-[#CCFF00]/30",
  },
  {
    n: "04",
    title: "Biophilic Design & 3D",
    subtitle: "Natural architecture & 3D renders",
    body: "We translate the ecological masterplan into biophilic architecture, crafting passive solar spaces, natural material palettes, structural plans, and 3D visualisations.",
    image: "/images/methodology/step4.jpg",
    tags: ["Vernacular Architecture", "3D Visualisation", "Natural Materials"],
    bgColor: "bg-[#28211d]",
    tabColor: "bg-[#3b312b]",
    borderColor: "border-[#CCFF00]/30",
  },
  {
    n: "05",
    title: "Implement & Build On-Site",
    subtitle: "Construction oversight & craftsman guidance",
    body: "We support execution through detailed construction drawings, craftsman onboarding, material sourcing, and hands-on site supervision.",
    image: "/images/methodology/step5.jpg",
    tags: ["Execution Drawings", "On-Site Quality Check", "Phased Handover"],
    bgColor: "bg-[#111111]",
    tabColor: "bg-[#222222]",
    borderColor: "border-[#CCFF00]/40",
  },
];

export function StackingCardsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="bg-[#FAF9F5] py-14 px-4 sm:px-6 md:px-12 lg:px-20 border-t border-gray-200" id="method">
      {/* Section Header */}
      <div className="max-w-screen-xl mx-auto mb-8 text-center">
        <div className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-800 bg-white shadow-xs mb-3">
          <Sparkles size={12} className="text-gray-900" />
          <span>OUR METHODOLOGY</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight mb-2">
          From raw land to a living system.
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
          Five disciplined steps that let your land guide the architecture.
        </p>
      </div>

      {/* Compact Book-style Stacking Cards Container */}
      <div ref={containerRef} className="max-w-4xl mx-auto pb-16 min-h-[90vh]">
        <StackingCards totalCards={STEPS.length} scrollOptions={{ container: containerRef }}>
          <div className="relative w-full">
            {STEPS.map((step, index) => (
              <StackingCardItem key={step.n} index={index} topOffset={34}>
                <div
                  className={cn(
                    step.bgColor,
                    step.borderColor,
                    "w-full rounded-2xl border text-white shadow-xl overflow-hidden flex flex-col transition-all duration-300"
                  )}
                >
                  {/* Top Book Tab Header */}
                  <div className={cn(step.tabColor, "px-4 sm:px-6 py-2 border-b border-white/10 flex items-center justify-between")}>
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#CCFF00] text-black font-black text-[11px] flex items-center justify-center shadow-xs">
                        {step.n}
                      </span>
                      <span className="text-xs uppercase tracking-wider font-bold text-white/90">
                        {step.title}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-[#CCFF00] border border-white/15">
                      Phase {index + 1} of {STEPS.length}
                    </span>
                  </div>

                  {/* Main Card Body */}
                  <div className="p-4 sm:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6">
                    {/* Left Content */}
                    <div className="flex-1 flex flex-col justify-between h-full w-full">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold mb-1 tracking-tight text-white">
                          {step.title}
                        </h3>
                        <p className="text-xs font-semibold text-[#CCFF00] mb-2">
                          {step.subtitle}
                        </p>

                        <p className="text-white/85 text-xs leading-relaxed mb-4 line-clamp-3 sm:line-clamp-none">
                          {step.body}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                        {step.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/90 flex items-center gap-1"
                          >
                            <CheckCircle2 size={10} className="text-[#CCFF00]" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right Image */}
                    <div className="w-full md:w-5/12 aspect-[16/9] sm:h-44 md:h-48 rounded-xl overflow-hidden border border-white/20 shadow-lg relative shrink-0">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>
                  </div>
                </div>
              </StackingCardItem>
            ))}
          </div>
        </StackingCards>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-6 relative z-20">
        <FlowButton
          text="Estimate Your Project Cost"
          onClick={() => window.dispatchEvent(new CustomEvent('open-estimator', { detail: { serviceId: 'farm-retreat' } }))}
        />
      </div>
    </section>
  );
}

export { StackingCards, StackingCardItem };
export default StackingCardsSection;
