import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedLoadingStateProps {
  state: 'loading' | 'error' | 'retry' | 'offline';
  onRetry?: () => void;
  className?: string;
  showText?: boolean;
  reducedMotion?: boolean;
}

const EnhancedLoadingState = ({
  state,
  onRetry,
  className,
  showText = false,
  reducedMotion = false,
}: EnhancedLoadingStateProps) => {
  const getContent = () => {
    switch (state) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2
              className={cn('h-6 w-6 text-muted-foreground', !reducedMotion && 'animate-spin')}
              aria-hidden="true"
            />
            {showText && (
              <span className="text-sm text-muted-foreground" aria-live="polite">
                Loading content...
              </span>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-destructive" aria-hidden="true">
              ⚠️
            </div>
            {showText && (
              <>
                <span className="text-sm text-destructive text-center" role="alert">
                  Failed to load content
                </span>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="text-xs text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    aria-label="Retry loading content"
                  >
                    Try again
                  </button>
                )}
              </>
            )}
          </div>
        );

      case 'retry':
        return (
          <div className="flex flex-col items-center justify-center space-y-2">
            <RefreshCw
              className={cn('h-6 w-6 text-blue-500', !reducedMotion && 'animate-spin')}
              aria-hidden="true"
            />
            {showText && (
              <span className="text-sm text-blue-600" aria-live="polite">
                Retrying...
              </span>
            )}
          </div>
        );

      case 'offline':
        return (
          <div className="flex flex-col items-center justify-center space-y-2">
            <WifiOff className="h-6 w-6 text-orange-500" aria-hidden="true" />
            {showText && (
              <span className="text-sm text-orange-600 text-center" role="alert">
                No internet connection
              </span>
            )}
          </div>
        );

      default:
        return <Skeleton className="w-full h-full" />;
    }
  };

  return (
    <div
      className={cn('flex items-center justify-center min-h-[100px] p-4', className)}
      role={state === 'loading' ? 'status' : undefined}
      aria-label={state === 'loading' ? 'Content is loading' : undefined}
    >
      {getContent()}
    </div>
  );
};

export default EnhancedLoadingState;
