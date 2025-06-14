import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CompatibilityMatch } from "@/types/compatibility";
import { Check, Shield, Mail, Phone, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import MatchQualityDisplay from "./MatchQualityDisplay";
import { EnhancedCompatibilityMatch } from "@/hooks/compatibility/utils/enhancedCompatibilityScoring";
import { useAccessibleLazyLoading } from "@/hooks/useLazyLoading/useAccessibleLazyLoading";
import LazyImage from "@/components/ui/LazyImage";
import { cn } from "@/lib/utils";

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

  const enhancedMatch = match as EnhancedCompatibilityMatch;
  const hasQualityMetrics = enhancedMatch.qualityMetrics !== undefined;

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

  const profileImageSrc = match.profileData?.profile_picture;
  const fallbackImageSrc = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=48&h=48&fit=crop&crop=face";

  return (
    <Card 
      ref={elementRef} 
      key={match.userId} 
      className="overflow-hidden"
      role="article"
      aria-label={`Match profile for ${match.profileData?.first_name || 'User'}`}
    >
      <div 
        className={cn(
          "p-4 bg-white rounded-lg flex justify-between items-center cursor-pointer",
          !reducedMotion && "transition-colors hover:bg-gray-50"
        )}
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={`match-details-${match.userId}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        <div className="text-left flex-1 flex items-center gap-3">
          {/* Profile Picture */}
          {profileImageSrc && (
            <div className="flex-shrink-0">
              <LazyImage
                src={profileImageSrc}
                alt={`${match.profileData?.first_name || 'User'}'s profile picture`}
                className="w-12 h-12 rounded-full object-cover"
                fallbackSrc={fallbackImageSrc}
                enableProgressiveLoading={true}
                enableRetry={true}
                maxRetries={2}
              />
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {match.profileData ? 
                  `${match.profileData.first_name} ${match.profileData.last_name?.charAt(0) || ""}` : 
                  `Match #${match.userId.slice(0, 4)}`}
              </span>
              
              {/* Verification Badges */}
              {match.profileData && (
                <div className="flex gap-1">
                  {match.profileData.email_verified && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="h-5 px-1 bg-green-50 text-green-700 border-green-200">
                            <Mail className="h-3 w-3 mr-1" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Email Verified</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {match.profileData.phone_verified && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="h-5 px-1 bg-green-50 text-green-700 border-green-200">
                            <Phone className="h-3 w-3 mr-1" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Phone Verified</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {match.profileData.id_verified && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="h-5 px-1 bg-blue-50 text-blue-700 border-blue-200">
                            <Shield className="h-3 w-3 mr-1" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>ID Verified</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {/* Quality Indicator */}
                  {hasQualityMetrics && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge 
                            variant="outline" 
                            className="h-5 px-1 bg-purple-50 text-purple-700 border-purple-200 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowQuality(!showQuality);
                            }}
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {enhancedMatch.qualityMetrics!.confidenceScore}%
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Match Confidence Score</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </div>
            
            {match.profileData && (
              <p className="text-sm text-gray-500">
                {[
                  match.profileData.age ? `${match.profileData.age} years` : null,
                  match.profileData.location,
                  match.profileData.religious_practice_level
                ].filter(Boolean).join(" • ")}
              </p>
            )}

            {/* Compact Quality Display */}
            {hasQualityMetrics && !showQuality && (
              <div className="mt-2">
                <MatchQualityDisplay metrics={enhancedMatch.qualityMetrics!} compact={true} />
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right ml-4" role="group" aria-label="Compatibility score">
          <div className="flex items-center">
            <Progress 
              value={match.score} 
              className="w-24 h-2 mr-2" 
              indicatorClassName={
                match.score >= 80 ? "bg-green-500" : 
                match.score >= 60 ? "bg-blue-500" :
                match.score >= 40 ? "bg-yellow-500" : "bg-red-500"
              }
              aria-label={`Compatibility score: ${match.score} percent`}
            />
            <span className={`font-semibold ${
              match.score >= 80 ? "text-green-600" : 
              match.score >= 60 ? "text-blue-600" :
              match.score >= 40 ? "text-yellow-600" : "text-red-600"
            }`}>
              {match.score}%
            </span>
          </div>
        </div>
      </div>
      
      {expanded && (
        <CardContent 
          id={`match-details-${match.userId}`}
          className={cn(
            "pt-4 pb-4 bg-gray-50",
            !reducedMotion && "animate-accordion-down"
          )}
          role="region"
          aria-label="Match details"
        >
          {/* Quality Metrics Display */}
          {hasQualityMetrics && showQuality && (
            <div className="mb-4">
              <MatchQualityDisplay metrics={enhancedMatch.qualityMetrics!} />
            </div>
          )}

          {/* Match Details */}
          {match.matchDetails && (
            <MatchDetails details={match.matchDetails} />
          )}
        </CardContent>
      )}
    </Card>
  );
};

interface MatchDetailsProps {
  details: {
    strengths: string[];
    differences: string[];
    dealbreakers?: string[];
  };
}

const MatchDetails = ({ details }: MatchDetailsProps) => {
  return (
    <div className="space-y-3 text-left">
      {details.dealbreakers && details.dealbreakers.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-600">Dealbreakers</h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {details.dealbreakers.map(item => (
              <Badge key={item} variant="destructive">{item}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {details.strengths.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-600">Strengths</h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {details.strengths.map(item => (
              <Badge key={item} variant="outline" className="bg-green-50 text-green-700 border-green-200">{item}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {details.differences.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-amber-600">Differences</h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {details.differences.map(item => (
              <Badge key={item} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{item}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyMatchCard;
