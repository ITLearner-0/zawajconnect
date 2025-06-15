
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface SectionTransitionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  delay?: number;
}

const SectionTransition = ({ children, id, className = "", delay = 0 }: SectionTransitionProps) => {
  const { ref, hasIntersected } = useIntersectionObserver({ 
    threshold: 0.1, 
    rootMargin: '50px' 
  });

  return (
    <section 
      ref={ref}
      id={id}
      className={`scroll-mt-20 transition-all duration-700 ease-in-out ${
        hasIntersected 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ 
        transitionDelay: hasIntersected ? `${delay}ms` : '0ms'
      }}
    >
      {children}
    </section>
  );
};

export default SectionTransition;
