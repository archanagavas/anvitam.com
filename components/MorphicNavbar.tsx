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
      <div className="bg-gray-100/90 backdrop-blur-md p-1 flex items-center justify-between rounded-full border border-gray-200/80 shadow-xs">
        {items.map(({ name, path }, index) => {
          const isActive = isActiveLink(path);
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          const prevPath = index > 0 ? items[index - 1].path : null;
          const nextPath = index < items.length - 1 ? items[index + 1].path : null;

          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center justify-center px-3.5 py-1.5 text-xs font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-black text-white shadow-md rounded-full px-4 font-extrabold scale-[1.02]'
                  : `text-gray-700 hover:text-black hover:bg-gray-200/70 ${
                      isActiveLink(prevPath || '') || isFirst ? 'rounded-l-full' : ''
                    } ${
                      isActiveLink(nextPath || '') || isLast ? 'rounded-r-full' : ''
                    }`
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
