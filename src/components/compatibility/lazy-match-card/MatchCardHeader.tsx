import React from 'react';
import ProfilePicture from './ProfilePicture';
import VerificationBadges from './VerificationBadges';
import CompatibilityScore from './CompatibilityScore';
import MatchQualityDisplay from '../MatchQualityDisplay';
import { CompatibilityMatch } from '@/types/compatibility';
import { EnhancedCompatibilityMatch } from '@/hooks/compatibility/utils/enhancedCompatibilityScoring';
import { cn } from '@/lib/utils';

interface MatchCardHeaderProps {
  match: CompatibilityMatch | EnhancedCompatibilityMatch;
  expanded: boolean;
  showQuality: boolean;
  reducedMotion: boolean;
  onToggle: () => void;
  onQualityToggle: (e: React.MouseEvent) => void;
}

const MatchCardHeader = ({
  match,
  expanded,
  showQuality,
  reducedMotion,
  onToggle,
  onQualityToggle,
}: MatchCardHeaderProps) => {
  const enhancedMatch = match as EnhancedCompatibilityMatch;
  const hasQualityMetrics = enhancedMatch.qualityMetrics !== undefined;
  const profileImageSrc = match.profileData?.profile_picture;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      className={cn(
        'p-4 bg-white rounded-lg flex justify-between items-center cursor-pointer',
        !reducedMotion && 'transition-colors hover:bg-gray-50'
      )}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-controls={`match-details-${match.userId}`}
      onKeyDown={handleKeyDown}
    >
      <div className="text-left flex-1 flex items-center gap-3">
        <ProfilePicture
          profileImageSrc={profileImageSrc}
          firstName={match.profileData?.first_name}
        />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {match.profileData
                ? `${match.profileData.first_name} ${match.profileData.last_name?.charAt(0) || ''}`
                : `Match #${match.userId.slice(0, 4)}`}
            </span>

            <VerificationBadges
              profileData={match.profileData}
              match={match}
              showQuality={showQuality}
              onQualityToggle={onQualityToggle}
            />
          </div>

          {match.profileData && (
            <p className="text-sm text-gray-500">
              {[
                match.profileData.age ? `${match.profileData.age} years` : null,
                match.profileData.location,
                match.profileData.religious_practice_level,
              ]
                .filter(Boolean)
                .join(' • ')}
            </p>
          )}

          {hasQualityMetrics && !showQuality && (
            <div className="mt-2">
              <MatchQualityDisplay metrics={enhancedMatch.qualityMetrics!} compact={true} />
            </div>
          )}
        </div>
      </div>

      <CompatibilityScore score={match.score ?? match.compatibilityScore} />
    </div>
  );
};

export default MatchCardHeader;
