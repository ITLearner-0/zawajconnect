/**
 * FocusVisible Component
 *
 * A wrapper component that adds enhanced focus indicators
 * Improves keyboard navigation visibility
 *
 * WCAG 2.1 Success Criterion 2.4.7 (Level AA)
 */

import React, { useEffect, useRef, useState } from 'react';

interface FocusVisibleProps {
  children: React.ReactNode;
  /** Custom focus ring color */
  focusRingColor?: string;
  /** Focus ring offset */
  offset?: number;
  /** Focus ring width */
  width?: number;
  /** Additional CSS classes */
  className?: string;
}

export const FocusVisible: React.FC<FocusVisibleProps> = ({
  children,
  focusRingColor = 'emerald',
  offset = 2,
  width = 2,
  className = '',
}) => {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [isMouseUser, setIsMouseUser] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = () => setIsMouseUser(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsMouseUser(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFocus = (e: FocusEvent) => {
      if (!isMouseUser && container.contains(e.target as Node)) {
        setIsFocusVisible(true);
      }
    };

    const handleBlur = (e: FocusEvent) => {
      if (container.contains(e.target as Node)) {
        setIsFocusVisible(false);
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, [isMouseUser]);

  const focusRingClasses = isFocusVisible
    ? `ring-${width} ring-${focusRingColor}-500 ring-offset-${offset}`
    : '';

  return (
    <div
      ref={containerRef}
      className={`${focusRingClasses} ${className} transition-all rounded-md`}
    >
      {children}
    </div>
  );
};

/**
 * Hook to detect if focus is visible
 */
export const useFocusVisible = () => {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [isMouseUser, setIsMouseUser] = useState(false);

  useEffect(() => {
    const handleMouseDown = () => {
      setIsMouseUser(true);
      setIsFocusVisible(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsMouseUser(false);
        setIsFocusVisible(true);
      }
    };

    const handleBlur = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return { isFocusVisible, isMouseUser };
};

/**
 * Example usage:
 *
 * ```tsx
 * // Using the component
 * <FocusVisible focusRingColor="blue" width={3}>
 *   <button>Click me</button>
 * </FocusVisible>
 *
 * // Using the hook
 * function MyComponent() {
 *   const { isFocusVisible } = useFocusVisible();
 *
 *   return (
 *     <button
 *       className={isFocusVisible ? 'ring-2 ring-blue-500' : ''}
 *     >
 *       Click me
 *     </button>
 *   );
 * }
 * ```
 */
