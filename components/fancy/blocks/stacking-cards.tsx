"use client";

import React, { createContext, useContext, useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

interface StackingCardsContextType {
  scrollYProgress: MotionValue<number>;
  totalCards: number;
}

const StackingCardsContext = createContext<StackingCardsContextType | null>(null);

export interface StackingCardsProps {
  children: React.ReactNode;
  totalCards: number;
  className?: string;
  scrollOptions?: {
    container?: React.RefObject<HTMLElement | null>;
  };
}

export function StackingCards({
  children,
  totalCards,
  className,
  scrollOptions,
}: StackingCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: scrollOptions?.container || containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <StackingCardsContext.Provider value={{ scrollYProgress, totalCards }}>
      <div ref={containerRef} className={cn("relative w-full", className)}>
        {children}
      </div>
    </StackingCardsContext.Provider>
  );
}

export interface StackingCardItemProps {
  key?: React.Key;
  children: React.ReactNode;
  index: number;
  className?: string;
  topOffset?: number;
}

export function StackingCardItem({
  children,
  index,
  className,
  topOffset = 36,
}: StackingCardItemProps) {
  const context = useContext(StackingCardsContext);
  const totalCards = context?.totalCards || 5;

  const targetScale = 1 - (totalCards - index) * 0.015;
  const range: [number, number] = [index * (1 / totalCards), 1];

  const scale = useTransform(
    context?.scrollYProgress || new MotionValue(0),
    range,
    [1, targetScale]
  );

  return (
    <div
      className={cn("sticky flex items-center justify-center w-full my-1", className)}
      style={{
        top: `calc(70px + ${index * topOffset}px)`,
        zIndex: index + 1,
      }}
    >
      <motion.div
        style={{
          scale,
        }}
        className="w-full origin-top shadow-xl transition-shadow duration-300"
      >
        {children}
      </motion.div>
    </div>
  );
}

export default StackingCards;
