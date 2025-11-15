import React from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ProviderErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  onReset?: () => void;
}

const ProviderErrorFallback: React.FC<{
  title: string;
  description: string;
  onReset?: () => void;
}> = ({ title, description, onReset }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">{description}</p>
        {onReset && (
          <Button onClick={onReset} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  </div>
);

export const ProviderErrorBoundary: React.FC<ProviderErrorBoundaryProps> = ({
  children,
  fallbackTitle = 'Application Error',
  fallbackDescription = 'Something went wrong. Please try refreshing the page.',
  onReset,
}) => {
  return (
    <ErrorBoundary
      fallback={
        <ProviderErrorFallback
          title={fallbackTitle}
          description={fallbackDescription}
          onReset={onReset}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
};
