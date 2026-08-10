"use client";

import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Sparkles, CheckCircle2, ArrowRight, Repeat2 } from "lucide-react";
import { FlowButton } from "./flow-button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export interface MethodologyStep {
  n: string;
  title: string;
  subtitle: string;
  body: string;
  image: string;
  tags: string[];
  cardBg: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
}

export const STEPS: MethodologyStep[] = [
  {
    n: "01",
    title: "Discover & Site Vision",
    subtitle: "Understanding your land's true potential and project scope",
    body: "We listen deeply to understand your land, personal vision, project scope, budget, and long-term goals before drawing a single line on paper.",
    image: "/images/methodology/m_step1_vision.jpg?v=v3",
    tags: ["Site Vision", "Scope & Budget", "Zoning"],
    cardBg: "bg-[#FFFDF7]",
    borderColor: "border-stone-300/70",
    badgeBg: "bg-[#162a23]",
    badgeText: "text-[#CCFF00]",
  },
  {
    n: "02",
    title: "Read the Ecosystem",
    subtitle: "Sun, wind, water & soil microclimate analysis",
    body: "Before designing buildings, we decode the natural ecosystem — analyzing microclimate, sun movement, wind patterns, topography, water flow, and soil health.",
    image: "/images/methodology/m_step2_ecosystem.jpg?v=v3",
    tags: ["Sun & Wind", "Waterflow", "Soil Health"],
    cardBg: "bg-[#FBF8EF]",
    borderColor: "border-stone-300/70",
    badgeBg: "bg-[#162a23]",
    badgeText: "text-[#CCFF00]",
  },
  {
    n: "03",
    title: "Build Living System",
    subtitle: "Regenerative master planning & ecological infrastructure",
    body: "We integrate living infrastructure into a cohesive masterplan — placing rainwater harvesting, food production, energy loops, and ecological buffers.",
    image: "/images/methodology/m_step3_masterplan.jpg?v=v3",
    tags: ["Rainwater", "Food Forest", "Eco Loops"],
    cardBg: "bg-[#F5F2E7]",
    borderColor: "border-stone-300/70",
    badgeBg: "bg-[#162a23]",
    badgeText: "text-[#CCFF00]",
  },
  {
    n: "04",
    title: "Biophilic 3D Design",
    subtitle: "Natural architecture, passive solar & 3D renders",
    body: "We translate the ecological masterplan into biophilic architecture, crafting passive solar spaces, natural material palettes, structural plans, and 3D visualisations.",
    image: "/images/methodology/m_step4_3ddesign.jpg?v=v3",
    tags: ["Passive Solar", "3D Renders", "Local Earth"],
    cardBg: "bg-[#F2EFE2]",
    borderColor: "border-stone-300/70",
    badgeBg: "bg-[#162a23]",
    badgeText: "text-[#CCFF00]",
  },
  {
    n: "05",
    title: "On-Site Execution",
    subtitle: "Construction oversight & craftsman guidance",
    body: "We support execution through detailed construction drawings, craftsman onboarding, material sourcing, and hands-on site supervision.",
    image: "/images/methodology/m_step5_execution.jpg?v=v3",
    tags: ["Site Drawings", "Craftsmen", "Quality Check"],
    cardBg: "bg-[#ECE7D9]",
    borderColor: "border-stone-400/70",
    badgeBg: "bg-[#162a23]",
    badgeText: "text-[#CCFF00]",
  },
];

interface StackingFlipCardItemProps {
  key?: React.Key;
  step: MethodologyStep;
  index: number;
  totalCards: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function StackingFlipCardItem({
  step,
  index,
  totalCards,
  containerRef,
}: StackingFlipCardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Calculate target scaling as cards stack behind newer ones
  const targetScale = 1 - (totalCards - index) * 0.02;
  const startRange = index / totalCards;
  const scale = useTransform(scrollYProgress, [startRange, 1], [1, targetScale]);

  return (
    <div
      className="sticky w-full max-w-4xl mx-auto flex items-center justify-center my-3"
      style={{
        top: `calc(90px + ${index * 14}px)`,
        zIndex: (index + 1) * 10,
      }}
    >
      <motion.div
        style={{ scale }}
        className="w-full origin-top cursor-pointer [perspective:2000px]"
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
        onClick={() => setIsFlipped((prev) => !prev)}
      >
        <div
          className={cn(
            "relative h-[360px] sm:h-[400px] w-full rounded-3xl shadow-xl transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] border",
            step.borderColor,
            "[transform-style:preserve-3d]",
            isFlipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
          )}
        >
          {/* FRONT OF CARD - Bright Warm Luxury Cream */}
          <div
            className={cn(
              "absolute inset-0 h-full w-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-lg",
              "[backface-visibility:hidden] [transform:rotateY(0deg)]",
              step.cardBg
            )}
          >
            {/* Header Tab */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-[#CCFF00] text-black font-black text-xs flex items-center justify-center shadow-lg border border-black/20">
                  {step.n}
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 shadow-md">
                  Step {step.n} of {totalCards}
                </span>
              </div>
            </div>

            {/* Vibrant Background Photo with Soft Lighting Gradient */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={step.image}
                alt={step.title}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>

            {/* Front Content Footer */}
            <div className="relative z-10 space-y-1.5 mt-auto text-white">
              <h3 className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight drop-shadow-md">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-white/90 font-medium line-clamp-2 max-w-xl drop-shadow-sm">
                {step.subtitle}
              </p>
              <div className="pt-3 flex items-center justify-between border-t border-white/25 text-xs font-bold text-[#CCFF00] uppercase tracking-wider">
                <span>Scrolls to Stack • Hover or Tap to Flip</span>
                <Repeat2 className="size-4 animate-pulse" />
              </div>
            </div>
          </div>

          {/* BACK OF CARD - Bright Warm Luxury Porcelain */}
          <div
            className={cn(
              "absolute inset-0 h-full w-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl text-stone-900 border border-stone-300",
              "[backface-visibility:hidden] [transform:rotateY(180deg)]",
              step.cardBg
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#162a23] text-[#CCFF00] font-black text-xs flex items-center justify-center shadow-sm">
                    {step.n}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#162a23]">
                    Anvitam Methodology
                  </span>
                </div>
                <span className="text-xs font-bold text-stone-500">Phase {step.n}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-2xl font-medium">
                {step.body}
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="flex flex-wrap gap-2 border-t border-stone-200 pt-3">
                {step.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-[#162a23]/10 border border-[#162a23]/20 text-[#162a23] flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={12} className="text-[#162a23]" />
                    {tag}
                  </span>
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(
                    new CustomEvent("open-estimator", { detail: { serviceId: "farm-retreat" } })
                  );
                }}
                className="w-full flex items-center justify-between rounded-2xl bg-[#162a23] text-white hover:bg-[#CCFF00] hover:text-black p-3.5 text-xs sm:text-sm font-bold transition-all border border-stone-900/10 shadow-md group/btn"
                type="button"
              >
                <span>Estimate Costs for Step {step.n}</span>
                <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function ScrollFlipMethodologySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="bg-[#FAF9F5] py-16 px-4 sm:px-6 md:px-12 border-t border-gray-200" id="method">
      {/* Section Header */}
      <div className="max-w-screen-xl mx-auto mb-10 text-center">
        <div className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-800 bg-white shadow-xs mb-3">
          <Sparkles size={13} className="text-gray-900" />
          <span>OUR METHODOLOGY</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.15] mb-2">
          From raw land to a living system.
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed">
          Five disciplined steps. Scroll down to stack each card on top of the next.
        </p>
      </div>

      {/* Stacking Scroll Track Container */}
      <div ref={containerRef} className="relative w-full max-w-4xl mx-auto min-h-[220vh] pb-36">
        {STEPS.map((step, index) => (
          <StackingFlipCardItem
            key={step.n}
            step={step}
            index={index}
            totalCards={STEPS.length}
            containerRef={containerRef}
          />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12">
        <Link to="/contact">
          <FlowButton text="Tell Us About Your Project" />
        </Link>
      </div>
    </section>
  );
}

export default ScrollFlipMethodologySection;
