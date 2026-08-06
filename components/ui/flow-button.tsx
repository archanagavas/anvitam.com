'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface FlowButtonProps {
  text?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'light' | 'dark' | 'lime';
}

export function FlowButton({
  text = "Modern Button",
  onClick,
  className = "",
  children,
  type = "button",
  disabled = false,
  variant = 'light',
}: FlowButtonProps) {
  const content = children || text;

  let baseStyles = "border-[#333333]/30 text-[#111111] hover:text-white";
  let circleBg = "bg-[#111111]";
  let arrowStroke = "stroke-[#111111] group-hover:stroke-white";

  if (variant === 'dark') {
    baseStyles = "border-white/30 text-white hover:text-[#111111]";
    circleBg = "bg-[#CCFF00]";
    arrowStroke = "stroke-white group-hover:stroke-[#111111]";
  } else if (variant === 'lime') {
    baseStyles = "bg-[#CCFF00] border-transparent text-[#111111] hover:text-white";
    circleBg = "bg-[#111111]";
    arrowStroke = "stroke-[#111111] group-hover:stroke-white";
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group relative inline-flex items-center justify-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] px-8 py-3.5 text-sm font-semibold cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:rounded-[12px] active:scale-[0.95] ${baseStyles} ${className}`}
    >
      {/* Left arrow (arr-2) */}
      <ArrowRight 
        className={`absolute w-4 h-4 left-[-25%] fill-none z-[9] group-hover:left-4 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${arrowStroke}`} 
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out flex items-center gap-2">
        {content}
      </span>

      {/* Circle animation expand */}
      <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-[50%] opacity-0 group-hover:w-[300px] group-hover:h-[300px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${circleBg}`}></span>

      {/* Right arrow (arr-1) */}
      <ArrowRight 
        className={`absolute w-4 h-4 right-4 fill-none z-[9] group-hover:right-[-25%] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${arrowStroke}`} 
      />
    </button>
  );
}

export default FlowButton;
