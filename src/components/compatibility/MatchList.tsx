import { useState } from 'react';
import { CompatibilityMatch } from '@/types/compatibility';
import { PaginationOptions } from '@/hooks/compatibility/types/paginationTypes';
import LazyMatchCard from './LazyMatchCard';
import LazyMatchList from './LazyMatchList';
import VirtualMatchList from './VirtualMatchList';
import CustomButton from '@/components/CustomButton';
import { useIsMobile } from '@/hooks/use-mobile';

interface MatchListProps {
  matches: CompatibilityMatch[];
  onLoadMore?: (options: PaginationOptions) => Promise<void>;
  hasMore?: boolean;
  loading?: boolean;
  useVirtualScroll?: boolean;
  useLazyLoading?: boolean;
}

const MatchList = ({
  matches,
  onLoadMore,
  hasMore = false,
  loading = false,
  useVirtualScroll = false,
  useLazyLoading = true,
}: MatchListProps) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isMobile = useIsMobile();

  if (matches.length === 0 && !loading) {
    return <p className="text-gray-500 italic">No matches found</p>;
  }

  const handleLoadMore = async () => {
    if (!onLoadMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const lastMatch = matches[matches.length - 1];
      await onLoadMore({
        cursor: lastMatch
          ? {
              score: lastMatch.score ?? lastMatch.compatibilityScore,
              userId: lastMatch.userId,
            }
          : undefined,
        limit: 20,
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Use lazy loading for better performance on large lists
  if (useLazyLoading && matches.length > 20) {
    return <LazyMatchList matches={matches} batchSize={10} delay={100} />;
  }

  // Use virtual scrolling for very large lists
  if (useVirtualScroll || matches.length > 50) {
    return (
      <VirtualMatchList
        matches={matches}
        config={{
          itemHeight: isMobile ? 280 : 320,
          containerHeight: isMobile ? 600 : 800,
          overscan: 3,
        }}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loading={isLoadingMore || loading}
      />
    );
  }

  // Regular list with load more button
  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <LazyMatchCard key={match.userId} match={match} />
      ))}

      {loading && matches.length === 0 && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-6">
          <CustomButton
            onClick={handleLoadMore}
            disabled={isLoadingMore || loading}
            variant="outline"
            className="min-w-[120px]"
          >
            {isLoadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </CustomButton>
        </div>
      )}
    </div>
  );
};

export default MatchList;
