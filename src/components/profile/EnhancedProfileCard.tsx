
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Heart, MessageCircle, Shield, Star } from 'lucide-react';
import { DatabaseProfile } from '@/types/profile';
import VerificationBadge from '@/components/VerificationBadge';

interface EnhancedProfileCardProps {
  profile: DatabaseProfile;
  compatibilityScore?: number;
  onMessage?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
}

const EnhancedProfileCard: React.FC<EnhancedProfileCardProps> = ({
  profile,
  compatibilityScore,
  onMessage,
  onLike,
  isLiked = false
}) => {
  const age = profile.birth_date ? 
    new Date().getFullYear() - new Date(profile.birth_date).getFullYear() : null;

  const getCompatibilityColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-600';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="relative p-0">
        {/* Profile Picture */}
        <div className="aspect-square bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
          {profile.profile_picture ? (
            <img 
              src={profile.profile_picture} 
              alt={`${profile.first_name} ${profile.last_name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl text-rose-300">
              {profile.first_name?.charAt(0)}
            </div>
          )}
        </div>
        
        {/* Compatibility Score */}
        {compatibilityScore && (
          <div className="absolute top-3 right-3">
            <Badge className={`${getCompatibilityColor(compatibilityScore)} font-bold`}>
              <Star className="w-3 h-3 mr-1" />
              {compatibilityScore}%
            </Badge>
          </div>
        )}

        {/* Like Button */}
        <div className="absolute top-3 left-3">
          <Button
            size="sm"
            variant="ghost"
            className={`rounded-full w-10 h-10 p-0 ${isLiked ? 'text-red-500' : 'text-gray-500'} bg-white/80 hover:bg-white`}
            onClick={onLike}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Basic Info */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-rose-800">
            {profile.first_name} {profile.last_name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            {age && <span>{age} ans</span>}
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Verification Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          <VerificationBadge type="email" verified={profile.email_verified} />
          <VerificationBadge type="phone" verified={profile.phone_verified} />
          <VerificationBadge type="id" verified={profile.id_verified} />
          {profile.wali_verified && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Shield className="w-3 h-3 mr-1" />
              Wali Verified
            </Badge>
          )}
        </div>

        {/* Religious Info */}
        <div className="mb-3 text-sm">
          <div className="text-gray-600">
            <span className="font-medium">Pratique:</span> {profile.religious_practice_level || 'Non spécifié'}
          </div>
          {profile.prayer_frequency && (
            <div className="text-gray-600">
              <span className="font-medium">Prière:</span> {profile.prayer_frequency}
            </div>
          )}
        </div>

        {/* Career Info */}
        {(profile.occupation || profile.education_level) && (
          <div className="mb-3 text-sm">
            {profile.occupation && (
              <div className="text-gray-600">
                <span className="font-medium">Profession:</span> {profile.occupation}
              </div>
            )}
            {profile.education_level && (
              <div className="text-gray-600">
                <span className="font-medium">Éducation:</span> {profile.education_level}
              </div>
            )}
          </div>
        )}

        {/* About Me Preview */}
        {profile.about_me && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 line-clamp-2">
              {profile.about_me}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onMessage}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
          >
            Voir Profil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProfileCard;
