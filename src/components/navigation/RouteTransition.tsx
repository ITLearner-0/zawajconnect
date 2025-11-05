// @ts-nocheck
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface RouteTransitionProps {
  children: React.ReactNode;
}

const RouteTransition = ({ children }: RouteTransitionProps) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsTransitioning(true);
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (isTransitioning) {
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 150);

      return () => clearTimeout(timeout);
    }
  }, [isTransitioning, location]);

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",
        isTransitioning 
          ? "opacity-0 translate-y-2" 
          : "opacity-100 translate-y-0"
      )}
    >
      {children}
    </div>
  );
};

export default RouteTransition;