import { useState, useEffect, useRef, useCallback } from 'react';
import { CompatibilityMatch } from '@/types/compatibility';
import { VirtualScrollConfig } from '@/hooks/compatibility/types/paginationTypes';
import { PaginationService } from '@/hooks/compatibility/services/paginationService';
import MatchCard from './MatchCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VirtualMatchListProps {
  matches: CompatibilityMatch[];
  config: VirtualScrollConfig;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

const VirtualMatchList = ({
  matches,
  config,
  onLoadMore,
  hasMore = false,
  loading = false,
}: VirtualMatchListProps) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggered = useRef(false);

  const { itemHeight, containerHeight, overscan = 5 } = config;

  // Calculate visible items
  const { start, end } = PaginationService.calculateVisibleItems(
    itemHeight,
    containerHeight,
    scrollTop,
    matches.length,
    overscan
  );

  const visibleItems = matches.slice(start, end + 1);
  const totalHeight = matches.length * itemHeight;
  const offsetY = start * itemHeight;

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      setScrollTop(target.scrollTop);

      // Load more when near bottom
      if (hasMore && onLoadMore && !loading) {
        const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight;

        if (scrollPercentage > 0.8 && !loadMoreTriggered.current) {
          loadMoreTriggered.current = true;
          onLoadMore();
        }
      }
    },
    [hasMore, onLoadMore, loading]
  );

  // Reset load more trigger when loading changes
  useEffect(() => {
    if (!loading) {
      loadMoreTriggered.current = false;
    }
  }, [loading]);

  return (
    <div className="relative" style={{ height: containerHeight }}>
      <ScrollArea className="h-full w-full" ref={scrollElementRef} onScroll={handleScroll}>
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            {visibleItems.map((match, index) => (
              <div key={match.userId} style={{ height: itemHeight }} className="mb-4">
                <MatchCard match={match} />
              </div>
            ))}

            {loading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default VirtualMatchList;
