import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingSpinnerProps {
  message?: string;
  variant?: 'default' | 'minimal' | 'skeleton';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Chargement...", 
  variant = 'default' 
}) => {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;