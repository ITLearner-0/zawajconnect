import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { CompatibilityMatch } from '@/types/compatibility';
import { MatchingFilters } from '@/hooks/compatibility/types/matchingTypes';
import { PaginationOptions } from '@/hooks/compatibility/types/paginationTypes';
import { useEnhancedCompatibilityMatching } from '@/hooks/compatibility/useEnhancedCompatibilityMatching';
import MatchList from './MatchList';
import RealtimeNotifications from './RealtimeNotifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EnhancedMatchListProps {
  filters?: MatchingFilters;
  useVirtualScroll?: boolean;
}

const EnhancedMatchList = ({ filters, useVirtualScroll = false }: EnhancedMatchListProps) => {
  const {
    matches,
    loading,
    backgroundProcessing,
    hasMore,
    totalCount,
    findMatches,
    loadMoreMatches,
    refreshMatches,
    notifications,
    unreadCount,
    isConnected,
    activeChannels,
  } = useEnhancedCompatibilityMatching();

  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Initial load
  useEffect(() => {
    if (!initialLoadDone) {
      findMatches(filters, true, true).then(() => {
        setInitialLoadDone(true);
      });
    }
  }, [filters, initialLoadDone]);

  // Handle filter changes
  useEffect(() => {
    if (initialLoadDone) {
      findMatches(filters, false, false);
    }
  }, [filters, initialLoadDone]);

  const handleLoadMore = async (paginationOptions: PaginationOptions) => {
    await loadMoreMatches(paginationOptions, filters);
  };

  const handleRefresh = async () => {
    await refreshMatches();
    // Reload matches after refresh
    setTimeout(() => {
      findMatches(filters, false, false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header with stats and controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Correspondances compatibles</span>
            <div className="flex items-center gap-2">
              <RealtimeNotifications />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading || backgroundProcessing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${backgroundProcessing ? 'animate-spin' : ''}`}
                />
                Actualiser
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Total: {totalCount}</span>
              {hasMore && <Badge variant="outline">Plus disponibles</Badge>}
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span>{isConnected ? 'Temps réel actif' : 'Hors ligne'}</span>
            </div>

            {backgroundProcessing && (
              <Badge variant="secondary" className="animate-pulse">
                Calcul en cours...
              </Badge>
            )}

            {activeChannels > 0 && (
              <span className="text-xs">
                {activeChannels} canal{activeChannels > 1 ? 'aux' : ''} actif
                {activeChannels > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Match list */}
      <MatchList
        matches={matches}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loading={loading}
        useVirtualScroll={useVirtualScroll}
      />

      {/* Recent notifications summary */}
      {unreadCount > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="default">{unreadCount}</Badge>
              <span>
                notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedMatchList;
