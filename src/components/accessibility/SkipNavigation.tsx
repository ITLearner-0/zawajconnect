
import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipNavigationProps {
  links?: SkipLink[];
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Aller au contenu principal' },
  { href: '#main-navigation', label: 'Aller à la navigation principale' },
  { href: '#footer', label: 'Aller au pied de page' }
];

export const SkipNavigation: React.FC<SkipNavigationProps> = ({
  links = defaultLinks
}) => {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="fixed top-0 left-0 z-50 bg-white border border-gray-300 p-2 shadow-lg">
        <ul className="space-y-1">
          {links.map((link, index) => (
            <li key={index}>
              <a
                href={link.href}
                className={cn(
                  'block px-3 py-2 text-sm font-medium text-gray-900',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:bg-primary focus:text-white',
                  'hover:bg-gray-100 rounded'
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.querySelector(link.href);
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    (target as HTMLElement).focus();
                  }
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
