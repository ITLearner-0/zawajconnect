
import React from 'react';
import { CardContent } from "@/components/ui/card";
import MatchQualityDisplay from "../MatchQualityDisplay";
import MatchDetails from "./MatchDetails";
import { EnhancedCompatibilityMatch } from "@/hooks/compatibility/utils/enhancedCompatibilityScoring";
import { CompatibilityMatch } from "@/types/compatibility";
import { cn } from "@/lib/utils";

interface MatchCardContentProps {
  match: CompatibilityMatch | EnhancedCompatibilityMatch;
  expanded: boolean;
  showQuality: boolean;
  reducedMotion: boolean;
}

const MatchCardContent = ({ match, expanded, showQuality, reducedMotion }: MatchCardContentProps) => {
  const enhancedMatch = match as EnhancedCompatibilityMatch;
  const hasQualityMetrics = enhancedMatch.qualityMetrics !== undefined;

  if (!expanded) return null;

  return (
    <CardContent 
      id={`match-details-${match.userId}`}
      className={cn(
        "pt-4 pb-4 bg-gray-50",
        !reducedMotion && "animate-accordion-down"
      )}
      role="region"
      aria-label="Match details"
    >
      {hasQualityMetrics && showQuality && (
        <div className="mb-4">
          <MatchQualityDisplay metrics={enhancedMatch.qualityMetrics!} />
        </div>
      )}

      {match.matchDetails ? (
        <MatchDetails details={match.matchDetails} />
      ) : (
        enhancedMatch.details && (
          <MatchDetails details={{
            strengths: [`${enhancedMatch.details.shared_values} valeurs communes`],
            differences: [`Différences dans ${enhancedMatch.details.key_differences}`],
            dealbreakers: []
          }} />
        )
      )}
    </CardContent>
  );
};

export default MatchCardContent;
