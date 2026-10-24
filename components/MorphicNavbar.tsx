import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface NavItem {
  name: string;
  path: string;
}

interface MorphicNavbarProps {
  items: NavItem[];
  className?: string;
}

export const MorphicNavbar: React.FC<MorphicNavbarProps> = ({ items, className = '' }) => {
  const location = useLocation();

  const isActiveLink = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center justify-center gap-1 p-1 bg-gray-100/80 rounded-full border border-gray-200/60 shadow-inner">
        {items.map(({ name, path }) => {
          const isActive = isActiveLink(path);

          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center justify-center py-1.5 px-3.5 text-xs rounded-full transition-all duration-200 select-none ${
                isActive
                  ? 'bg-[#111] text-white font-bold shadow-sm'
                  : 'text-gray-700 hover:text-black hover:bg-white/80 font-medium'
              }`}
            >
              {name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MorphicNavbar;
