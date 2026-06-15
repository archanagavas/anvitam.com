import React from 'react';

const LeavesAnimation: React.FC = () => {
  // Generate random properties for leaves to create a natural effect
  const leaves = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 15}s`,
    animationDuration: `${15 + Math.random() * 15}s`,
    scale: 0.5 + Math.random() * 1, // varied sizes
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="leaf"
          style={{
            left: leaf.left,
            animationDelay: leaf.animationDelay,
            animationDuration: leaf.animationDuration,
            transform: `scale(${leaf.scale})`,
          }}
        />
      ))}
    </div>
  );
};

export default LeavesAnimation;