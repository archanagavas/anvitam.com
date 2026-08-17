// components/tools/TrialBanner.tsx
import React from 'react';

interface Props {
  daysRemaining: number;
  onUpgrade: () => void;
}

export const TrialBanner: React.FC<Props> = ({ daysRemaining, onUpgrade }) => {
  if (daysRemaining <= 0) return null;

  const isUrgent = daysRemaining <= 3;

  return (
    <div className="w-full bg-[#111111] text-white py-2.5 px-4 flex items-center justify-center gap-3 text-xs border-b border-[#CCFF00]/40 shadow-xs">
      <span className="text-sm">{isUrgent ? '⚠️' : '🎉'}</span>
      <span className="font-medium text-gray-200">
        {isUrgent
          ? `Your free trial ends in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`
          : `${daysRemaining} days left in your free trial.`}
      </span>
      <button
        onClick={onUpgrade}
        className="bg-[#CCFF00] text-black font-bold px-3 py-1 rounded-full text-xs hover:bg-white transition cursor-pointer"
      >
        Upgrade from $5/mo →
      </button>
    </div>
  );
};
