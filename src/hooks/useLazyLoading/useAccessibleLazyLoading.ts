
import { useEffect, useState } from 'react';
import { useEnhancedLazyLoading } from './useEnhancedLazyLoading';

interface UseAccessibleLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  respectReducedMotion?: boolean;
  announceLoading?: boolean;
  configType?: 'image' | 'matchList' | 'compatibility';
}

export const useAccessibleLazyLoading = <T extends HTMLElement = HTMLDivElement>(
  options: UseAccessibleLazyLoadingOptions = {}
) => {
  const {
    respectReducedMotion = true,
    announceLoading = true,
    ...lazyOptions
  } = options;

  const [reducedMotion, setReducedMotion] = useState(false);
  const [announcement, setAnnouncement] = useState<string>('');

  const { elementRef, isIntersecting, shouldLoad, config } = useEnhancedLazyLoading<T>(lazyOptions);

  // Check for reduced motion preference
  useEffect(() => {
    if (!respectReducedMotion) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [respectReducedMotion]);

  // Announce loading states for screen readers
  useEffect(() => {
    if (!announceLoading) return undefined;

    if (isIntersecting && shouldLoad) {
      setAnnouncement('Loading content');
      
      // Clear announcement after a delay
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, 1000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isIntersecting, shouldLoad, announceLoading]);

  return {
    elementRef,
    isIntersecting,
    shouldLoad,
    reducedMotion,
    announcement,
    config,
  };
};
