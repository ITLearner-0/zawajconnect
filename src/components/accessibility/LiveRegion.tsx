/**
 * LiveRegion Component
 *
 * A React component for ARIA live regions
 * Announces dynamic content changes to screen readers
 *
 * WCAG 2.1 Success Criterion 4.1.3 (Level AA)
 */

import React, { useEffect, useRef } from 'react';

interface LiveRegionProps {
  /** Message to announce */
  message: string;
  /** ARIA live priority: 'polite' or 'assertive' */
  priority?: 'polite' | 'assertive';
  /** Whether the entire region should be announced */
  atomic?: boolean;
  /** Whether to show the message visually (default: false) */
  visible?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  priority = 'polite',
  atomic = true,
  visible = false,
  className = '',
}) => {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear the message after announcement to allow re-announcement of the same message
    if (message && regionRef.current) {
      const timeoutId = setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = '';
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [message]);

  const visuallyHiddenStyles = !visible
    ? {
        position: 'absolute' as const,
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }
    : {};

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      style={visuallyHiddenStyles}
      className={className}
    >
      {message}
    </div>
  );
};

/**
 * Hook for using live region announcements
 */
export const useLiveRegion = () => {
  const [message, setMessage] = React.useState('');
  const [priority, setPriority] = React.useState<'polite' | 'assertive'>('polite');

  const announce = React.useCallback(
    (text: string, announcementPriority: 'polite' | 'assertive' = 'polite') => {
      setMessage(text);
      setPriority(announcementPriority);
    },
    []
  );

  const LiveRegionComponent = React.useMemo(
    () => <LiveRegion message={message} priority={priority} />,
    [message, priority]
  );

  return { announce, LiveRegionComponent };
};

/**
 * Example usage:
 *
 * ```tsx
 * // Using the hook
 * function MyComponent() {
 *   const { announce, LiveRegionComponent } = useLiveRegion();
 *
 *   const handleSave = () => {
 *     // Save logic...
 *     announce('Profile saved successfully');
 *   };
 *
 *   return (
 *     <>
 *       {LiveRegionComponent}
 *       <button onClick={handleSave}>Save Profile</button>
 *     </>
 *   );
 * }
 *
 * // Or using the component directly
 * function AnotherComponent() {
 *   const [message, setMessage] = useState('');
 *
 *   return (
 *     <>
 *       <LiveRegion message={message} priority="polite" />
 *       <button onClick={() => setMessage('Action completed')}>
 *         Do Something
 *       </button>
 *     </>
 *   );
 * }
 * ```
 */
