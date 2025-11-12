import React from 'react';
import { CompatibilityMatch } from '@/types/compatibility';
import { Progress } from '@/components/ui/progress';
import LazyMatchCard from './LazyMatchCard';
import { useDeferredCompatibility } from '@/hooks/compatibility/useDeferredCompatibility';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LazyMatchListProps {
  matches: CompatibilityMatch[];
  batchSize?: number;
  delay?: number;
}

const LazyMatchList = ({ matches, batchSize = 10, delay = 100 }: LazyMatchListProps) => {
  const {
    elementRef,
    visibleMatches,
    isProcessing,
    hasMore,
    progress,
    totalMatches,
    processedCount,
  } = useDeferredCompatibility({
    matches,
    batchSize,
    delay,
  });

  if (matches.length === 0) {
    return <p className="text-gray-500 italic">No matches found</p>;
  }

  return (
    <div ref={elementRef} className="space-y-4">
      {/* Progress indicator */}
      {hasMore && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">
                Loading matches ({processedCount}/{totalMatches})
              </span>
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Render visible matches */}
      {visibleMatches.map((match) => (
        <LazyMatchCard key={match.userId} match={match} />
      ))}

      {/* Loading placeholder for remaining matches */}
      {hasMore && (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">
            {isProcessing ? 'Processing more matches...' : 'Scroll to load more matches'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LazyMatchList;
