
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Heart, CheckCircle } from 'lucide-react';
import LazyImage from '@/components/ui/LazyImage';

interface CompatibilityMatch {
  userId: string;
  score: number;
  profileData?: {
    id: string;
    first_name: string;
    last_name?: string;
    gender: string;
    location?: string;
    education_level?: string;
    religious_practice_level?: string;
    age?: number;
    profile_picture?: string;
  };
}

interface CompatibilityProfileListProps {
  matches: CompatibilityMatch[];
  onNavigateToProfile: (profileId: string) => void;
}

const CompatibilityProfileList = ({ matches, onNavigateToProfile }: CompatibilityProfileListProps) => {
  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No compatible matches found yet.</p>
        <p className="text-sm text-gray-400 mt-2">
          Complete your compatibility test to find better matches.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => {
        const profile = match.profileData;
        if (!profile) return null;

        const profileCompletion = Math.floor(Math.random() * 20) + 80; // Mock completion percentage
        const isNew = Math.random() > 0.7; // Mock "new" status

        return (
          <Card 
            key={match.userId}
            className="cursor-pointer hover:shadow-lg transition-shadow border-rose-200 hover:border-rose-300"
            onClick={() => onNavigateToProfile(match.userId)}
          >
            <CardContent className="p-4">
              {isNew && (
                <Badge variant="secondary" className="mb-2 bg-rose-100 text-rose-800">
                  Nouveau
                </Badge>
              )}
              
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {profile.profile_picture ? (
                    <LazyImage
                      src={profile.profile_picture}
                      alt={`${profile.first_name}'s profile picture`}
                      className="w-full h-full object-cover"
                      placeholderClassName="bg-rose-100 dark:bg-rose-800"
                      fallbackSrc="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=48&h=48&fit=crop&crop=face"
                    />
                  ) : (
                    <>
                      {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                    </>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-4 rounded-sm bg-gray-200 flex items-center justify-center text-xs">
                      🇫🇷
                    </span>
                    <span className="text-xs text-gray-500">Origine</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">📍 Nationalité</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {profile.location || 'Paris, France'}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">{profile.location?.split(',')[0] || 'France'}</div>
                  <div className="text-xs text-gray-500">France</div>
                </div>
              </div>

              <div className="mb-3">
                <h3 className="font-semibold text-lg">
                  {profile.first_name} | {profile.age || '25'}ans
                  <CheckCircle className="inline h-4 w-4 text-blue-500 ml-1" />
                </h3>
                <div className="text-sm text-green-600">
                  Profil rempli à {profileCompletion}%
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {profile.religious_practice_level === 'high' 
                  ? "Je suis une personne de nature calme, à l'écoute, généreuse, j'ai également un côté taquin tout en étant sérieuse, je suis..."
                  : "Je pense être quelqu'un à l'écoute et sincère. J'essaye constamment d'évoluer et j'aime apprendre. Mon entourage me décrit..."
                }
              </p>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {match.score}% compatible
                </Badge>
                <button className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                  👥 Voir le profil
                </button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CompatibilityProfileList;
