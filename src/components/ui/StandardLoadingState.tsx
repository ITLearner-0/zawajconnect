
import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { AlertTriangle, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface StandardLoadingStateProps {
  loading?: boolean;
  error?: string | null;
  retry?: () => void;
  offline?: boolean;
  className?: string;
  loadingText?: string;
  emptyState?: {
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  children?: React.ReactNode;
}

const StandardLoadingState: React.FC<StandardLoadingStateProps> = ({
  loading = false,
  error = null,
  retry,
  offline = false,
  className,
  loadingText = "Loading...",
  emptyState,
  children
}) => {
  // Loading state
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center min-h-[200px] p-4", className)}>
        <LoadingSpinner size="md" text={loadingText} />
      </div>
    );
  }

  // Offline state
  if (offline) {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-[200px] p-4 text-center", className)}>
        <WifiOff className="h-8 w-8 text-orange-500 mb-2" />
        <p className="text-sm text-orange-600">No internet connection</p>
        {retry && (
          <Button variant="outline" size="sm" onClick={retry} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-[200px] p-4 text-center", className)}>
        <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-sm text-destructive mb-2">{error}</p>
        {retry && (
          <Button variant="outline" size="sm" onClick={retry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (emptyState && !children) {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-[200px] p-4 text-center", className)}>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">{emptyState.title}</h3>
        {emptyState.description && (
          <p className="text-sm text-muted-foreground mb-4">{emptyState.description}</p>
        )}
        {emptyState.action && (
          <Button onClick={emptyState.action.onClick}>
            {emptyState.action.label}
          </Button>
        )}
      </div>
    );
  }

  // Content state
  return children || null;
};

export default StandardLoadingState;
