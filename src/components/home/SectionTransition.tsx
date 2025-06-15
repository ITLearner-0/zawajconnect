
import React from 'react';

interface SectionTransitionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  delay?: number;
}

const SectionTransition = ({ children, id, className = "", delay = 0 }: SectionTransitionProps) => {
  return (
    <section 
      id={id}
      className={`scroll-mt-20 transition-all duration-700 ease-in-out ${className}`}
      style={{ 
        animationDelay: `${delay}ms`,
        animation: 'fadeIn 0.8s ease-out forwards'
      }}
    >
      {children}
    </section>
  );
};

export default SectionTransition;
