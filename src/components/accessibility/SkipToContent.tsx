/**
 * SkipToContent Component
 *
 * Provides a "Skip to main content" link for keyboard users
 * This helps users bypass repetitive navigation and jump directly to the main content
 *
 * WCAG 2.1 Success Criterion 2.4.1 (Level A)
 */

import React from 'react';

interface SkipToContentProps {
  /** ID of the main content container */
  targetId?: string;
  /** Custom label text */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

export const SkipToContent: React.FC<SkipToContentProps> = ({
  targetId = 'main-content',
  label = 'Skip to main content',
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);

    if (target) {
      // Move focus to target
      target.focus();

      // If target is not focusable, make it temporarily focusable
      if (target.tabIndex === -1) {
        target.setAttribute('tabindex', '-1');
      }

      // Scroll target into view
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={`
        skip-to-content
        absolute left-0 top-0 z-50
        bg-emerald-600 text-white
        px-4 py-2 rounded-br-md
        font-medium
        transition-transform duration-200
        -translate-y-full focus:translate-y-0
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
        ${className}
      `}
    >
      {label}
    </a>
  );
};

/**
 * Example usage:
 *
 * ```tsx
 * // In your App.tsx or main layout
 * <SkipToContent targetId="main-content" />
 *
 * // In your main content area
 * <main id="main-content" tabIndex={-1}>
 *   {children}
 * </main>
 * ```
 */
