import React, { useEffect, useState } from 'react';

interface TypingAnimationProps {
  children?: string;
  text?: string;
  className?: string;
  duration?: number;
  delay?: number;
  as?: React.ElementType;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  children,
  text,
  className = '',
  duration = 80,
  delay = 300,
  as: Component = 'span',
}) => {
  const fullText = text || children || '';
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let currentIndex = 0;
    
    const startDelayTimer = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayedText(fullText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, duration);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startDelayTimer);
  }, [fullText, duration, delay]);

  return <Component className={className}>{displayedText}</Component>;
};

export default TypingAnimation;
