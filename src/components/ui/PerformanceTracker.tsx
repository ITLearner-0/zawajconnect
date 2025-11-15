import React, { useEffect, useRef } from 'react';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';

interface PerformanceTrackerProps {
  componentName: string;
  children: React.ReactNode;
  trackInteractions?: boolean;
}

const PerformanceTracker: React.FC<PerformanceTrackerProps> = ({
  componentName,
  children,
  trackInteractions = false,
}) => {
  const { trackComponentRender, startInteraction, endInteraction } = usePerformanceMetrics();
  const renderStartTime = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track component render time
  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    trackComponentRender(componentName, renderTime);
  });

  // Track user interactions if enabled
  useEffect(() => {
    if (!trackInteractions || !containerRef.current) return;

    const container = containerRef.current;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const elementName =
        target.tagName.toLowerCase() +
        (target.className ? `.${target.className.split(' ')[0]}` : '') +
        (target.id ? `#${target.id}` : '');

      startInteraction();
      setTimeout(() => endInteraction('click', elementName), 0);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      startInteraction();
      setTimeout(() => endInteraction('keydown', e.key), 0);
    };

    container.addEventListener('click', handleClick);
    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('click', handleClick);
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [trackInteractions, startInteraction, endInteraction]);

  return (
    <div ref={containerRef} data-performance-tracker={componentName}>
      {children}
    </div>
  );
};

export default PerformanceTracker;
