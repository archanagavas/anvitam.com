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
    <nav className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center justify-between p-1">
        {items.map(({ name, path }, index, array) => {
          const isActive = isActiveLink(path);
          const isFirst = index === 0;
          const isLast = index === array.length - 1;
          const prevPath = index > 0 ? array[index - 1].path : null;
          const nextPath = index < array.length - 1 ? array[index + 1].path : null;

          const isPrevActive = prevPath ? isActiveLink(prevPath) : false;
          const isNextActive = nextPath ? isActiveLink(nextPath) : false;

          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center justify-center py-2 px-3.5 text-xs transition-all duration-300 font-medium ${
                isActive
                  ? 'mx-2 rounded-xl font-extrabold bg-[#111] text-white shadow-md scale-[1.03]'
                  : `bg-gray-100/90 text-gray-700 hover:text-black hover:bg-gray-200/90 ${
                      isPrevActive || isFirst ? 'rounded-l-xl' : ''
                    } ${
                      isNextActive || isLast ? 'rounded-r-xl' : ''
                    }`
              }`}
            >
              {name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MorphicNavbar;
