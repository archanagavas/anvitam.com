import React, { memo, useState, useEffect } from 'react';
import { useMotionValue, animate, motion } from 'motion/react';
import useMeasure from 'react-use-measure';

type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  reverse?: boolean;
  className?: string;
};

export const InfiniteSlider = memo(function InfiniteSlider({
  children,
  gap = 40,
  duration = 30,
  durationOnHover,
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [ref, { width }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const contentSize = width + gap;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;

    let controls: { stop: () => void } | undefined;

    if (isTransitioning) {
      controls = animate(translation, [translation.get(), to], {
        ease: 'linear',
        duration: currentDuration * Math.abs((translation.get() - to) / contentSize),
        onComplete: () => {
          setIsTransitioning(false);
          setKey(prev => prev + 1);
        },
      }) as unknown as { stop: () => void };
    } else {
      controls = animate(translation, [from, to], {
        ease: 'linear',
        duration: currentDuration,
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: 0,
        onRepeat: () => translation.set(from),
      }) as unknown as { stop: () => void };
    }

    return () => controls?.stop();
  }, [key, translation, currentDuration, width, gap, isTransitioning, reverse]);

  const hoverProps = durationOnHover
    ? {
        onHoverStart: () => { setIsTransitioning(true); setCurrentDuration(durationOnHover); },
        onHoverEnd: () => { setIsTransitioning(true); setCurrentDuration(duration); },
      }
    : {};

  return (
    <div className={`overflow-hidden ${className || ''}`}>
      <motion.div
        ref={ref}
        className="flex w-max"
        style={{ x: translation, gap: `${gap}px` }}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
});

type InfiniteMarqueeProps = {
  items: string[];
  className?: string;
};

const InfiniteMarquee = memo(function InfiniteMarquee({ items, className }: InfiniteMarqueeProps) {
  return (
    <div
      className={`overflow-hidden py-4 ${className || ''}`}
      style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}
    >
      <InfiniteSlider gap={56} duration={40} durationOnHover={80}>
        {items.map((name, i) => (
          <span
            key={i}
            className="text-[#333] text-sm font-semibold opacity-40 hover:opacity-100 transition-opacity cursor-default whitespace-nowrap"
          >
            {name}
          </span>
        ))}
      </InfiniteSlider>
    </div>
  );
});

export default InfiniteMarquee;
