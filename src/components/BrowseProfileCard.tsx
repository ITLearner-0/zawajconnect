import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MapPin, GraduationCap, Briefcase, User, Eye, Heart, Star } from 'lucide-react';
import VerificationBadge from '@/components/VerificationBadge';

interface BrowseProfileCardProps {
  profile: {
    user_id: string;
    age: number;
    city_only: string;
    education_level: string;
    profession_category: string;
    avatar_url: string;
    verification_score: number;
  };
  selectionMode?: boolean;
  isSelected?: boolean;
  isFavorite?: boolean;
  onToggleSelection?: (userId: string) => void;
  onToggleFavorite?: (userId: string) => void;
  onViewDetails?: (userId: string) => void;
  onLike?: (userId: string) => void;
}

export const BrowseProfileCard = ({
  profile,
  selectionMode,
  isSelected,
  isFavorite,
  onToggleSelection,
  onToggleFavorite,
  onViewDetails,
  onLike
}: BrowseProfileCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar with Selection */}
          <div className="relative flex-shrink-0">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Photo de profil" 
                className="h-20 w-20 rounded-lg object-cover border"
              />
            ) : (
              <div className="h-20 w-20 rounded-lg border bg-muted flex items-center justify-center">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            
            {/* Favorite Star */}
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(profile.user_id)}
                className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow border"
              >
                <Star
                  className={`h-3 w-3 ${
                    isFavorite
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-400'
                  }`}
                />
              </button>
            )}

            {/* Selection Checkbox */}
            {selectionMode && onToggleSelection && (
              <div className="absolute -bottom-1 -left-1 bg-white rounded-full p-1 shadow border">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelection(profile.user_id)}
                  className="h-4 w-4"
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base">Profil Anonyme</h3>
                <p className="text-sm text-muted-foreground">
                  {profile.age} ans
                </p>
              </div>
              <VerificationBadge verificationScore={profile.verification_score} />
            </div>

            {/* Details */}
            <div className="space-y-1 mb-3">
              {profile.city_only && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{profile.city_only}</span>
                </div>
              )}
              
              {profile.education_level && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <GraduationCap className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{profile.education_level}</span>
                </div>
              )}
              
              {profile.profession_category && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Briefcase className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{profile.profession_category}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {onViewDetails && (
                <Button
                  size="sm"
                  onClick={() => onViewDetails(profile.user_id)}
                  variant="outline"
                  className="flex-1"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Détails
                </Button>
              )}
              {onLike && (
                <Button
                  size="sm"
                  onClick={() => onLike(profile.user_id)}
                  className="flex-1"
                >
                  <Heart className="h-3 w-3 mr-1" />
                  J'aime
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
