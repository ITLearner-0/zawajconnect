import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Heart, Eye, MessageCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import VerificationBadge from '@/components/VerificationBadge';
import CompatibilityScore from '@/components/CompatibilityScore';

interface ProfileCardProps {
  profile: {
    user_id: string;
    full_name: string;
    age: number;
    location: string;
    profession: string;
    bio: string;
    avatar_url: string;
    interests?: string[];
  };
  verification?: {
    email_verified: boolean;
    phone_verified: boolean;
    id_verified: boolean;
  };
  showCompatibility?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

const ProfileCard = ({ 
  profile, 
  verification, 
  showCompatibility = true, 
  showActions = true,
  compact = false 
}: ProfileCardProps) => {
  
  return (
    <Card className={`hover:shadow-md transition-shadow ${compact ? 'p-0' : ''}`}>
      <CardHeader className={compact ? 'p-4 pb-2' : ''}>
        <div className="flex items-start gap-4">
          <Avatar className={compact ? 'h-12 w-12' : 'h-16 w-16'}>
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold text-foreground truncate ${compact ? 'text-base' : 'text-lg'}`}>
                {profile.full_name}
              </h3>
              {verification?.email_verified && (
                <VerificationBadge verified size="sm" />
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <span>{profile.age} ans</span>
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{profile.location}</span>
                </div>
              )}
            </div>
            
            {profile.profession && (
              <p className="text-sm text-muted-foreground mb-2">
                {profile.profession}
              </p>
            )}

            {/* Compatibility Score */}
            {showCompatibility && (
              <div className="mb-3">
                <CompatibilityScore 
                  otherUserId={profile.user_id} 
                  compact 
                />
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className={compact ? 'p-4 pt-0' : 'pt-0'}>
        {/* Bio */}
        {!compact && profile.bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {profile.bio}
          </p>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {profile.interests.slice(0, compact ? 3 : 5).map((interest, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > (compact ? 3 : 5) && (
                <Badge variant="outline" className="text-xs">
                  +{profile.interests.length - (compact ? 3 : 5)}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className={`flex gap-2 ${compact ? 'flex-col' : ''}`}>
            <Link to={`/profile/${profile.user_id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Voir profil
              </Button>
            </Link>
            
            <Button size="sm" className="flex-1 bg-emerald hover:bg-emerald-dark">
              <Heart className="h-4 w-4 mr-2" />
              {compact ? 'J\'aime' : 'Montrer intérêt'}
            </Button>
          </div>
        )}

        {/* Quick Actions for Matches */}
        {!showActions && (
          <div className="flex gap-2">
            <Link to={`/profile/${profile.user_id}`} className="flex-1">
              <Button variant="ghost" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-1" />
                Profil
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCard;