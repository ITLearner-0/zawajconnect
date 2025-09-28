import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';

interface BaseLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children, className = '' }) => {
  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 ${className}`}>
        {children}
        <Toaster />
      </div>
    </ErrorBoundary>
  );
};

export default BaseLayout;