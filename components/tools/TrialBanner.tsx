// components/tools/TrialBanner.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  daysRemaining: number;
  onUpgrade: () => void;
}

export const TrialBanner: React.FC<Props> = ({ daysRemaining, onUpgrade }) => {
  if (daysRemaining <= 0) return null;

  const isUrgent = daysRemaining <= 3;

  return (
    <div className={`trial-banner ${isUrgent ? 'urgent' : ''}`}>
      <span className="trial-banner-icon">{isUrgent ? '⚠️' : '🎉'}</span>
      <span className="trial-banner-text">
        {isUrgent
          ? `Your free trial ends in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`
          : `${daysRemaining} days left in your free trial.`}
        {' '}
      </span>
      <button className="trial-banner-cta" onClick={onUpgrade}>
        Upgrade from $5/mo →
      </button>
    </div>
  );
};
