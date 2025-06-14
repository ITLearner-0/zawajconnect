
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CompatibilityMatch } from "@/types/compatibility";
import { EnhancedCompatibilityMatch } from "@/hooks/compatibility/utils/enhancedCompatibilityScoring";
import { useAccessibleLazyLoading } from "@/hooks/useLazyLoading/useAccessibleLazyLoading";
import LazyLoadingErrorBoundary from "@/components/ui/LazyLoadingErrorBoundary";
import MatchCardHeader from "./lazy-match-card/MatchCardHeader";
import MatchCardContent from "./lazy-match-card/MatchCardContent";

interface LazyMatchCardProps {
  match: CompatibilityMatch | EnhancedCompatibilityMatch;
}

const LazyMatchCard = ({ match }: LazyMatchCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  
  const { elementRef, shouldLoad, reducedMotion } = useAccessibleLazyLoading<HTMLDivElement>({
    threshold: 0.1,
    triggerOnce: true,
    configType: 'matchList',
    respectReducedMotion: true,
    announceLoading: true,
  });

  if (!shouldLoad) {
    return (
      <Card ref={elementRef} className="overflow-hidden" role="article" aria-label="Loading match profile">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-center">
              <Skeleton className="h-2 w-24 mr-2" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const handleToggle = () => setExpanded(!expanded);
  
  const handleQualityToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuality(!showQuality);
  };

  return (
    <LazyLoadingErrorBoundary showRetry={true}>
      <Card 
        ref={elementRef} 
        key={match.userId} 
        className="overflow-hidden"
        role="article"
        aria-label={`Match profile for ${match.profileData?.first_name || 'User'}`}
      >
        <MatchCardHeader
          match={match}
          expanded={expanded}
          showQuality={showQuality}
          reducedMotion={reducedMotion}
          onToggle={handleToggle}
          onQualityToggle={handleQualityToggle}
        />
        
        <MatchCardContent
          match={match}
          expanded={expanded}
          showQuality={showQuality}
          reducedMotion={reducedMotion}
        />
      </Card>
    </LazyLoadingErrorBoundary>
  );
};

export default LazyMatchCard;
