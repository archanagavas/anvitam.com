import React, { useEffect, useState, useRef } from 'react';

interface NumberCounterProps {
  end: number;
  start?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatComma?: boolean;
  className?: string;
}

export const NumberCounter: React.FC<NumberCounterProps> = ({
  end,
  start = 0,
  duration = 2000,
  prefix = '',
  suffix = '',
  formatComma = false,
  className = ''
}) => {
  const [count, setCount] = useState(start);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Easing function (easeOutQuad for smooth counting)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(start + (end - start) * easeProgress);

      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [end, start, duration]);

  const formattedNumber = formatComma ? count.toLocaleString('en-US') : count.toString();

  return (
    <span className={className}>
      {prefix}{formattedNumber}{suffix}
    </span>
  );
};

export default NumberCounter;
