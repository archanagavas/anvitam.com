"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Sparkles, CheckCircle2, ArrowRight, Repeat2, ChevronRight, ChevronLeft } from "lucide-react";
import { FlowButton } from "./flow-button";
import { cn } from "@/lib/utils";

export interface MethodologyStep {
  n: string;
  title: string;
  subtitle: string;
  body: string;
  image: string;
  tags: string[];
  bgColor: string;
  accentColor: string;
  borderColor: string;
}

export const STEPS: MethodologyStep[] = [
  {
    n: "01",
    title: "Discover & Site Vision",
    subtitle: "Understanding your goals and land potential",
    body: "We listen deeply to understand your land, personal vision, project scope, budget, and long-term goals before drawing a single line on paper.",
    image: "/images/methodology/step1.jpg",
    tags: ["Site Vision", "Scope & Budget", "Zoning"],
    bgColor: "bg-[#162a23]",
    accentColor: "text-[#CCFF00]",
    borderColor: "border-[#CCFF00]/40",
  },
  {
    n: "02",
    title: "Read the Ecosystem",
    subtitle: "Sun, wind, water & soil analysis",
    body: "Before designing buildings, we decode the natural ecosystem — analyzing microclimate, sun movement, wind patterns, topography, water flow, and soil health.",
    image: "/images/methodology/step2.jpg",
    tags: ["Sun & Wind", "Waterflow", "Soil Health"],
    bgColor: "bg-[#23201b]",
    accentColor: "text-[#CCFF00]",
    borderColor: "border-[#CCFF00]/40",
  },
  {
    n: "03",
    title: "Build Living System",
    subtitle: "Regenerative master planning & layout",
    body: "We integrate living infrastructure into a cohesive masterplan — placing rainwater harvesting, food production, energy loops, and ecological buffers.",
    image: "/images/methodology/step3.jpg",
    tags: ["Rainwater", "Food Forest", "Eco Loops"],
    bgColor: "bg-[#1b2620]",
    accentColor: "text-[#CCFF00]",
    borderColor: "border-[#CCFF00]/40",
  },
  {
    n: "04",
    title: "Biophilic 3D Design",
    subtitle: "Natural architecture & 3D renders",
    body: "We translate the ecological masterplan into biophilic architecture, crafting passive solar spaces, natural material palettes, structural plans, and 3D visualisations.",
    image: "/images/methodology/step4.jpg",
    tags: ["Passive Solar", "3D Renders", "Local Earth"],
    bgColor: "bg-[#28211d]",
    accentColor: "text-[#CCFF00]",
    borderColor: "border-[#CCFF00]/40",
  },
  {
    n: "05",
    title: "On-Site Execution",
    subtitle: "Construction oversight & craftsman guidance",
    body: "We support execution through detailed construction drawings, craftsman onboarding, material sourcing, and hands-on site supervision.",
    image: "/images/methodology/step5.jpg",
    tags: ["Site Drawings", "Craftsmen", "Quality Check"],
    bgColor: "bg-[#111111]",
    accentColor: "text-[#CCFF00]",
    borderColor: "border-[#CCFF00]/50",
  },
];

export function DeckCardsMethodologySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Track active card index based on scroll position
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const stepIndex = Math.min(
        STEPS.length - 1,
        Math.floor(latest * STEPS.length)
      );
      setActiveIndex(stepIndex);
      // Auto flip ONLY the current top card when scrolled onto
      setFlippedCards({ [stepIndex]: true });
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const toggleFlip = (idx: number) => {
    if (idx === activeIndex) {
      setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
    }
  };

  return (
    <section className="bg-[#FAF9F5] py-16 px-4 sm:px-6 md:px-12 border-t border-gray-200" id="method">
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
          Five disciplined steps stacked into a deck. Scroll down to peel through the cards.
        </p>
      </div>

      {/* Sticky Deck Container */}
      <div ref={containerRef} className="h-[220vh] relative max-w-md mx-auto">
        <div className="sticky top-24 flex flex-col items-center justify-center pt-4">
          
          {/* Deck Status Bar */}
          <div className="flex items-center justify-between w-full max-w-[340px] mb-3 px-2 text-xs font-bold text-stone-900">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-stone-900 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#8bc34a] animate-ping" />
              Card {activeIndex + 1} of {STEPS.length}
            </span>
            <div className="flex items-center gap-1">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const el = containerRef.current;
                    if (el) {
                      const top = el.offsetTop + (i / STEPS.length) * el.offsetHeight;
                      window.scrollTo({ top, behavior: 'smooth' });
                    }
                  }}
                  className={cn(
                    "w-6 h-1.5 rounded-full transition-all duration-300",
                    i === activeIndex ? "bg-gray-900 w-8" : "bg-gray-300 hover:bg-gray-400"
                  )}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Physical Deck Stack */}
          <div className="relative w-[340px] aspect-square">
            {STEPS.map((step, index) => {
              const isCurrent = index === activeIndex;
              const isFlipped = isCurrent && !!flippedCards[index];
              const isPast = index < activeIndex;
              const isFuture = index > activeIndex;

              // Stack physics math:
              // Past cards slide off to the top with a tilt
              // Current card sits in focus on top of deck
              // Future cards sit underneath with slight scaling and offset
              const offsetFromCurrent = index - activeIndex;

              return (
                <motion.div
                  key={step.n}
                  onClick={() => toggleFlip(index)}
                  onMouseEnter={() => isCurrent && setFlippedCards({ [index]: true })}
                  onMouseLeave={() => isCurrent && setFlippedCards({ [index]: false })}
                  initial={false}
                  animate={{
                    y: isPast ? -380 : isCurrent ? 0 : offsetFromCurrent * 12,
                    scale: isPast ? 0.9 : isCurrent ? 1 : 1 - offsetFromCurrent * 0.04,
                    rotate: isPast ? -8 : isCurrent ? 0 : offsetFromCurrent * 2,
                    opacity: isPast ? 0 : offsetFromCurrent > 3 ? 0 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 25,
                  }}
                  style={{
                    zIndex: STEPS.length - index,
                  }}
                  className="absolute inset-0 w-full h-full cursor-pointer [perspective:2000px]"
                >
                  <div
                    className={cn(
                      "relative h-full w-full rounded-2xl shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)]",
                      "[transform-style:preserve-3d]",
                      isFlipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
                    )}
                  >
                    {/* FRONT OF CARD (Crisp Photo & Square Layout) */}
                    <div
                      className={cn(
                        "absolute inset-0 h-full w-full",
                        "[backface-visibility:hidden] [transform:rotateY(0deg)]",
                        "overflow-hidden rounded-2xl border flex flex-col justify-between p-5 text-white shadow-2xl",
                        step.bgColor,
                        step.borderColor
                      )}
                    >
                      {/* Top Badge */}
                      <div className="flex items-center justify-between z-10">
                        <span className="w-9 h-9 rounded-full bg-[#CCFF00] text-black font-black text-xs flex items-center justify-center shadow-md">
                          {step.n}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#CCFF00] border border-white/20">
                          Phase {index + 1} of {STEPS.length}
                        </span>
                      </div>

                      {/* Sharp Unblurred Background Image */}
                      <div className="absolute inset-0 overflow-hidden">
                        <img
                          src={step.image}
                          alt={step.title}
                          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                      </div>

                      {/* Front Bottom Info */}
                      <div className="relative z-10 space-y-1 mt-auto">
                        <h3 className="text-xl font-bold text-white tracking-tight leading-tight drop-shadow-md">
                          {step.title}
                        </h3>
                        <p className="text-xs text-white/90 font-medium line-clamp-1 drop-shadow-sm">
                          {step.subtitle}
                        </p>
                        <div className="pt-2 flex items-center justify-between border-t border-white/20 text-[10px] font-bold text-[#CCFF00] uppercase tracking-wider">
                          <span>Tap or Scroll to Flip</span>
                          <Repeat2 className="size-3.5 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* BACK OF CARD (Detailed Explanation & CTA) */}
                    <div
                      className={cn(
                        "absolute inset-0 h-full w-full",
                        "[backface-visibility:hidden] [transform:rotateY(180deg)]",
                        "overflow-hidden rounded-2xl border p-5 flex flex-col justify-between text-white shadow-2xl",
                        step.bgColor,
                        step.borderColor
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="w-7 h-7 rounded-full bg-[#CCFF00] text-black font-black text-xs flex items-center justify-center">
                            {step.n}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#CCFF00]">
                            Methodology
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1 leading-snug">
                          {step.title}
                        </h3>
                        <p className="text-[11px] text-white/85 line-clamp-3 leading-relaxed">
                          {step.body}
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex flex-wrap gap-1 border-t border-white/15 pt-2">
                          {step.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/90 flex items-center gap-1"
                            >
                              <CheckCircle2 size={9} className="text-[#CCFF00]" />
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
                          className="w-full flex items-center justify-between rounded-xl bg-white/10 hover:bg-[#CCFF00] hover:text-black p-2.5 text-[11px] font-bold transition-all border border-white/15 group/btn"
                          type="button"
                        >
                          <span>Explore Step {step.n}</span>
                          <ArrowRight className="size-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Deck Controls */}
          <div className="flex items-center justify-between w-full max-w-[340px] mt-6 px-2">
            <button
              disabled={activeIndex === 0}
              onClick={() => {
                const el = containerRef.current;
                if (el) {
                  const targetIdx = Math.max(0, activeIndex - 1);
                  const top = el.offsetTop + (targetIdx / STEPS.length) * el.offsetHeight;
                  window.scrollTo({ top, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-gray-300 text-xs font-bold text-gray-800 disabled:opacity-40 hover:bg-gray-100 shadow-xs transition-all"
            >
              <ChevronLeft size={14} /> Prev Step
            </button>
            <span className="text-[11px] font-semibold text-gray-500">
              Scroll down to peel cards
            </span>
            <button
              disabled={activeIndex === STEPS.length - 1}
              onClick={() => {
                const el = containerRef.current;
                if (el) {
                  const targetIdx = Math.min(STEPS.length - 1, activeIndex + 1);
                  const top = el.offsetTop + (targetIdx / STEPS.length) * el.offsetHeight;
                  window.scrollTo({ top, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold disabled:opacity-40 hover:bg-black shadow-xs transition-all"
            >
              Next Step <ChevronRight size={14} />
            </button>
          </div>

        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12">
        <FlowButton
          text="Estimate Your Project Cost"
          onClick={() => window.dispatchEvent(new CustomEvent("open-estimator", { detail: { serviceId: "farm-retreat" } }))}
        />
      </div>
    </section>
  );
}

export default DeckCardsMethodologySection;
