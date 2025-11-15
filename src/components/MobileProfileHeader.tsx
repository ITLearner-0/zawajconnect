import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Settings,
  Bell,
  Crown,
  Star,
  MapPin,
  Calendar,
  Shield,
  Heart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VerificationBadge from '@/components/VerificationBadge';

interface UserProfile {
  full_name: string;
  age: number;
  location: string;
  profession: string;
  verification_score: number;
  avatar_url?: string;
  premium_status: boolean;
  last_seen: string;
}

const MobileProfileHeader = ({ profile }: { profile?: UserProfile }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [notifications] = useState(2);

  const defaultProfile: UserProfile = {
    full_name: 'Utilisateur',
    age: 25,
    location: 'Non spécifié',
    profession: 'Non spécifié',
    verification_score: 45,
    premium_status: false,
    last_seen: 'Maintenant',
  };

  const userProfile = profile || defaultProfile;

  return (
    <div className="md:hidden">
      <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald/5 to-gold/5">
        <CardContent className="p-4">
          {/* Main Profile Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name} />
                  <AvatarFallback className="bg-emerald/10 text-emerald">
                    {userProfile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>

                {/* Online Status */}
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald rounded-full border-2 border-background flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-foreground truncate">
                    {userProfile.full_name}
                  </h2>
                  <VerificationBadge
                    verificationScore={userProfile.verification_score}
                    className="text-xs"
                  />
                  {userProfile.premium_status && (
                    <Badge className="bg-gradient-to-r from-gold to-gold-light text-white text-xs px-1.5 py-0.5">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{userProfile.location}</span>
                  <span>•</span>
                  <span>{userProfile.age} ans</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notifications')}
                className="relative p-2"
              >
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500 text-white flex items-center justify-center">
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* Settings */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings')}
                className="p-2"
              >
                <Settings className="h-4 w-4" />
              </Button>

              {/* Expand Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="p-2"
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Expanded Content */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
              {/* Profile Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Heart className="h-4 w-4 text-emerald mr-1" />
                  </div>
                  <div className="text-lg font-bold text-emerald">24</div>
                  <div className="text-xs text-muted-foreground">Matches</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="h-4 w-4 text-gold mr-1" />
                  </div>
                  <div className="text-lg font-bold text-gold">
                    {userProfile.verification_score}%
                  </div>
                  <div className="text-xs text-muted-foreground">Vérifié</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Shield className="h-4 w-4 text-sage mr-1" />
                  </div>
                  <div className="text-lg font-bold text-sage">4.8</div>
                  <div className="text-xs text-muted-foreground">Note</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/profile/edit')}
                  className="justify-start"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Modifier le profil
                </Button>

                {!userProfile.premium_status && (
                  <Button
                    size="sm"
                    onClick={() => navigate('/settings?tab=premium')}
                    className="bg-gradient-to-r from-gold to-gold-light hover:from-gold-dark hover:to-gold text-primary-foreground justify-start"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Passer Premium
                  </Button>
                )}
              </div>

              {/* Status Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Dernière connexion: {userProfile.last_seen}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-emerald rounded-full animate-pulse"></div>
                  <span>En ligne</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileProfileHeader;
