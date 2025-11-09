import { useState, useEffect } from 'react';

export type OrientationType = 'portrait' | 'landscape';

export interface OrientationState {
  orientation: OrientationType;
  isPortrait: boolean;
  isLandscape: boolean;
  angle: number;
}

/**
 * Hook to detect and track device orientation changes
 * Useful for adapting UI based on portrait/landscape mode
 */
export function useOrientation(): OrientationState {
  const [orientation, setOrientation] = useState<OrientationType>(() => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  });

  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const handleOrientationChange = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      setOrientation(newOrientation);

      // Try to get screen orientation angle if available
      if (screen.orientation) {
        setAngle(screen.orientation.angle);
      }
    };

    // Initial check
    handleOrientationChange();

    // Listen for resize events (works on all devices)
    window.addEventListener('resize', handleOrientationChange);

    // Listen for orientation change (works on mobile devices)
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    } else {
      // Fallback for older browsers
      window.addEventListener('orientationchange', handleOrientationChange);
    }

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      } else {
        window.removeEventListener('orientationchange', handleOrientationChange);
      }
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    angle
  };
}