import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

const MapleLeafCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 220, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    document.body.classList.add('hide-default-cursor');

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 12);
      cursorY.set(e.clientY - 12);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.classList.remove('hide-default-cursor');
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x: cursorXSpring,
        y: cursorYSpring,
        pointerEvents: 'none',
        zIndex: 99999,
      }}
      className="hidden md:block"
    >
      <svg
        viewBox="0 0 512 512"
        width="24"
        height="24"
        style={{ transform: 'rotate(-10deg)' }}
      >
        <defs>
          <filter id="cursorStroke">
            <feMorphology operator="dilate" radius="1" in="SourceAlpha" result="expand" />
            <feFlood floodColor="#111" floodOpacity="0.7" />
            <feComposite operator="in" in2="expand" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="cursorGlow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>
        <g filter="url(#cursorGlow)">
          <path
            d="M497.5 213.9l-25.2-9.6c-2.9-1.3-47.4-21.5-47.4-88.7l-.1-34.9-28 20.9c-10.3 7.7-38.9 26.1-61.8 30.5L255.9 0 176.6 132.1c-22.9-4.4-51.5-22.8-61.8-30.5L86.8 80.6v35c0 67.2-44.5 87.5-47.4 88.7l-24.9 9.4 88.4 88.4-64.7 64.7 24.6 9.9c50.9 20.4 72.3 61.2 72.5 61.5l10.9 21.7 92.2-92.2v-35l-64.8-64.8 24.7-24.7 40.1 40.1v-74.4h35v74.4l40.1-40.1 24.7 24.7-64.8 64.8v35l92.2 92.2 10.9-21.7c.2-.4 20.9-40.9 72.5-61.5l24.6-9.9-64.7-64.7 69.2-69.2L497.5 213.9zM255.9 350.2l-17.5 17.5V512h35V367.7z"
            fill="#e07a5f"
          />
        </g>
      </svg>
    </motion.div>
  );
};

export default MapleLeafCursor;
