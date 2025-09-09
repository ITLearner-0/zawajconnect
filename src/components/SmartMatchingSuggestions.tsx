import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Brain, Heart, MapPin, GraduationCap, Briefcase, Star } from 'lucide-react';

interface MatchSuggestion {
  profile: {
    user_id: string;
    full_name: string;
    age: number;
    location: string;
    profession: string;
    education: string;
    bio: string;
    avatar_url: string;
    interests: string[];
  };
  compatibility_score: number;
  shared_interests: string[];
  compatibility_reasons: string[];
}

const SmartMatchingSuggestions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateSmartSuggestions();
    }
  }, [user]);

  const generateSmartSuggestions = async () => {
    if (!user) return;

    try {
      // Get user's profile and preferences
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: myPrefs } = await supabase
        .from('islamic_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!myProfile) {
        setLoading(false);
        return;
      }

      // Get potential matches (opposite gender, not already matched)
      const targetGender = myProfile.gender === 'male' ? 'female' : 'male';
      
      const { data: potentialMatches } = await supabase
        .from('profiles')
        .select(`
          *,
          islamic_preferences(*),
          user_verifications(verification_score)
        `)
        .eq('gender', targetGender)
        .neq('user_id', user.id);

      if (!potentialMatches || potentialMatches.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate compatibility for each potential match
      const scoredMatches = potentialMatches.map(match => {
        const sharedInterests = (myProfile.interests || []).filter(interest => 
          (match.interests || []).includes(interest)
        );

        let compatibilityScore = 0;
        const reasons: string[] = [];

        // Age compatibility (closer ages = higher score)
        const ageDiff = Math.abs(myProfile.age - match.age);
        if (ageDiff <= 3) {
          compatibilityScore += 20;
          reasons.push("Âges très compatibles");
        } else if (ageDiff <= 6) {
          compatibilityScore += 15;
          reasons.push("Âges compatibles");
        }

        // Location compatibility (same city/region)
        if (myProfile.location && match.location) {
          const myCity = myProfile.location.split(',')[0].trim();
          const theirCity = match.location.split(',')[0].trim();
          if (myCity.toLowerCase() === theirCity.toLowerCase()) {
            compatibilityScore += 15;
            reasons.push("Même ville");
          }
        }

        // Education level compatibility
        if (myProfile.education && match.education) {
          const educationLevels = ['Bac', 'Licence', 'Master', 'Doctorat'];
          const myLevel = educationLevels.findIndex(level => 
            myProfile.education.toLowerCase().includes(level.toLowerCase())
          );
          const theirLevel = educationLevels.findIndex(level => 
            match.education.toLowerCase().includes(level.toLowerCase())
          );
          
          if (myLevel !== -1 && theirLevel !== -1 && Math.abs(myLevel - theirLevel) <= 1) {
            compatibilityScore += 10;
            reasons.push("Niveaux d'éducation compatibles");
          }
        }

        // Shared interests
        compatibilityScore += sharedInterests.length * 5;
        if (sharedInterests.length > 0) {
          reasons.push(`${sharedInterests.length} centres d'intérêt communs`);
        }

        // Islamic preferences compatibility
        if (myPrefs && match.islamic_preferences && Array.isArray(match.islamic_preferences) && match.islamic_preferences.length > 0) {
          const prefs = match.islamic_preferences[0];
          
          if (myPrefs.sect === prefs.sect) {
            compatibilityScore += 15;
            reasons.push("Même école islamique");
          }
          
          if (myPrefs.prayer_frequency === prefs.prayer_frequency) {
            compatibilityScore += 10;
            reasons.push("Même fréquence de prière");
          }
          
          if (myPrefs.importance_of_religion === prefs.importance_of_religion) {
            compatibilityScore += 10;
            reasons.push("Même importance accordée à la religion");
          }
        }

        // Verification score bonus
        const verificationData = Array.isArray(match.user_verifications) ? match.user_verifications[0] : match.user_verifications;
        const verificationScore = verificationData?.verification_score || 0;
        if (verificationScore >= 70) {
          compatibilityScore += 5;
          reasons.push("Profil vérifié");
        }

        return {
          profile: {
            user_id: match.user_id,
            full_name: match.full_name,
            age: match.age,
            location: match.location,
            profession: match.profession,
            education: match.education,
            bio: match.bio,
            avatar_url: match.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.full_name)}&background=10b981&color=fff&size=200`,
            interests: match.interests || []
          },
          compatibility_score: Math.min(100, compatibilityScore),
          shared_interests: sharedInterests,
          compatibility_reasons: reasons
        };
      });

      // Sort by compatibility score and take top 3
      const topSuggestions = scoredMatches
        .filter(match => match.compatibility_score > 20)
        .sort((a, b) => b.compatibility_score - a.compatibility_score)
        .slice(0, 3);

      setSuggestions(topSuggestions);
    } catch (error) {
      console.error('Error generating smart suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleStartMatching = () => {
    navigate('/browse');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Suggestions Intelligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Aucune suggestion disponible pour le moment. Complétez votre profil pour de meilleures recommandations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Suggestions Intelligentes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Profils sélectionnés par notre IA selon vos préférences
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.profile.user_id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewProfile(suggestion.profile.user_id)}
            >
              <div className="flex items-start gap-4">
                <img
                  src={suggestion.profile.avatar_url}
                  alt={suggestion.profile.full_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">
                      {suggestion.profile.full_name}
                    </h3>
                    <Badge className="bg-emerald/10 text-emerald border-emerald/20">
                      <Star className="h-3 w-3 mr-1" />
                      {suggestion.compatibility_score}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span>{suggestion.profile.age} ans</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {suggestion.profile.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {suggestion.profile.profession}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {suggestion.profile.bio}
                  </p>

                  <div className="space-y-2">
                    {suggestion.shared_interests.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-emerald">Intérêts communs: </span>
                        <span className="text-xs text-muted-foreground">
                          {suggestion.shared_interests.join(', ')}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {suggestion.compatibility_reasons.slice(0, 3).map((reason, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button onClick={handleStartMatching} className="bg-emerald hover:bg-emerald-dark">
            <Heart className="h-4 w-4 mr-2" />
            Découvrir plus de profils
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartMatchingSuggestions;