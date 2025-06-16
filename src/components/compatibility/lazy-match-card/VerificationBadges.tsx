
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Shield, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CompatibilityMatch } from "@/types/compatibility";
import { EnhancedCompatibilityMatch } from "@/hooks/compatibility/utils/enhancedCompatibilityScoring";

interface VerificationBadgesProps {
  profileData?: CompatibilityMatch['profileData'];
  match: CompatibilityMatch | EnhancedCompatibilityMatch;
  showQuality: boolean;
  onQualityToggle: (e: React.MouseEvent) => void;
}

const VerificationBadges = ({ profileData, match, showQuality, onQualityToggle }: VerificationBadgesProps) => {
  const enhancedMatch = match as EnhancedCompatibilityMatch;
  const hasQualityMetrics = enhancedMatch.qualityMetrics !== undefined;

  if (!profileData && !hasQualityMetrics) return null;

  return (
    <div className="flex gap-1">
      {profileData?.email_verified && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="h-5 px-1 bg-green-50 text-green-700 border-green-200">
                <Mail className="h-3 w-3 mr-1" />
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Email Vérifié</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {profileData?.phone_verified && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="h-5 px-1 bg-green-50 text-green-700 border-green-200">
                <Phone className="h-3 w-3 mr-1" />
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Téléphone Vérifié</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {profileData?.id_verified && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="h-5 px-1 bg-blue-50 text-blue-700 border-blue-200">
                <Shield className="h-3 w-3 mr-1" />
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Identité Vérifiée</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {hasQualityMetrics && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className="h-5 px-1 bg-purple-50 text-purple-700 border-purple-200 cursor-pointer"
                onClick={onQualityToggle}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {enhancedMatch.qualityMetrics!.confidenceScore}%
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Score de Confiance du Match</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default VerificationBadges;
