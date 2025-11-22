import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Brain, Heart, MapPin, GraduationCap, Briefcase, Star, Sparkles } from 'lucide-react';
import {
  calculateIslamicCompatibility,
  calculateCulturalCompatibility,
  calculatePersonalityCompatibility,
  calculateOverallCompatibility,
  generateCompatibilityExplanation,
} from '@/utils/matchingAlgorithm';
import { logger } from '@/utils/logger';

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

      const { data: myPersonality } = await supabase
        .from('personality_questionnaire')
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
        .select('*')
        .eq('gender', targetGender)
        .neq('user_id', user.id);

      if (!potentialMatches || potentialMatches.length === 0) {
        setLoading(false);
        return;
      }

      // Get Islamic preferences and verifications for these users
      const userIds = potentialMatches.map((p) => p.user_id);

      const { data: islamicPrefs } = await supabase
        .from('islamic_preferences')
        .select('*')
        .in('user_id', userIds);

      const { data: verifications } = await supabase
        .from('user_verifications')
        .select('user_id, verification_score')
        .in('user_id', userIds);

      const { data: personalityData } = await supabase
        .from('personality_questionnaire')
        .select('*')
        .in('user_id', userIds);

      // Combine the data
      const enrichedMatches = potentialMatches.map((match) => ({
        ...match,
        islamic_preferences: islamicPrefs?.filter((p) => p.user_id === match.user_id) || [],
        user_verifications: verifications?.find((v) => v.user_id === match.user_id) || null,
        personality_questionnaire: personalityData?.find((p) => p.user_id === match.user_id) || null,
      }));

      // Calculate compatibility for each potential match using enhanced fuzzy matching
      const scoredMatches = enrichedMatches.map((match) => {
        const sharedInterests = (myProfile.interests || []).filter((interest) =>
          (match.interests || []).includes(interest)
        );

        // Get Islamic preferences for this match
        const matchIslamicPrefs =
          match.islamic_preferences && Array.isArray(match.islamic_preferences)
            ? match.islamic_preferences[0]
            : null;

        // Calculate Islamic compatibility using fuzzy matching
        let islamicScore = 30; // Low score for incomplete profiles
        let hasIslamicPreferences = false;
        if (myPrefs && matchIslamicPrefs) {
          hasIslamicPreferences = true;
          islamicScore = calculateIslamicCompatibility(
            {
              ...myPrefs,
              smoking: typeof myPrefs.smoking === 'string' ? false : (myPrefs.smoking ?? null),
            } as any,
            matchIslamicPrefs
          );
        }

        // Calculate Cultural compatibility using fuzzy matching
        const culturalPrefs = {
          location: myProfile.location ?? '',
          education_level: myProfile.education ?? '',
          interests: myProfile.interests ?? [],
        };

        const matchCulturalPrefs = {
          location: match.location || '',
          education_level: match.education || '',
          interests: match.interests || [],
        };

        const culturalScore = calculateCulturalCompatibility(culturalPrefs, matchCulturalPrefs);

        // Calculate personality score using real questionnaire data
        const matchPersonality = match.personality_questionnaire || null;
        const personalityScore = calculatePersonalityCompatibility(
          myPersonality,
          matchPersonality
        );

        // Calculate overall compatibility with weighted scoring
        // Weights adjusted based on whether personality data is available
        const weights = myPersonality && matchPersonality
          ? { islamic: 0.4, cultural: 0.3, personality: 0.3 } // Balanced when all data available
          : { islamic: 0.5, cultural: 0.4, personality: 0.1 }; // Reduced personality weight when data missing

        const compatibilityScore = calculateOverallCompatibility(
          islamicScore,
          culturalScore,
          personalityScore,
          weights
        );

        // Generate explanation with strengths and concerns
        const explanation = generateCompatibilityExplanation(
          islamicScore,
          culturalScore,
          personalityScore
        );

        // Build reasons array from explanation
        const reasons: string[] = [
          ...explanation.strengths,
          ...sharedInterests.map((interest) => `Intérêt commun: ${interest}`),
        ];

        // Add verification bonus
        const verificationScore = match.user_verifications?.verification_score || 0;
        if (verificationScore >= 70) {
          reasons.push('Profil vérifié');
        }

        // Flag incomplete profiles
        if (!hasIslamicPreferences) {
          reasons.push('⚠️ Préférences islamiques non renseignées');
        }

        logger.log('Match suggestion calculated', {
          matchId: match.user_id,
          islamicScore,
          culturalScore,
          personalityScore,
          overallScore: compatibilityScore,
        });

        return {
          profile: {
            user_id: match.user_id,
            full_name: match.full_name,
            age: match.age,
            location: match.location,
            profession: match.profession,
            education: match.education,
            bio: match.bio,
            avatar_url:
              match.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(match.full_name)}&background=10b981&color=fff&size=200`,
            interests: match.interests || [],
          },
          compatibility_score: compatibilityScore,
          shared_interests: sharedInterests,
          compatibility_reasons: reasons,
        };
      });

      // Sort by compatibility score and take top 3
      const topSuggestions = scoredMatches
        .filter((match) => match.compatibility_score > 20)
        .sort((a, b) => b.compatibility_score - a.compatibility_score)
        .slice(0, 3)
        .map((match) => ({
          ...match,
          profile: {
            ...match.profile,
            full_name: match.profile.full_name ?? 'Utilisateur',
            age: match.profile.age ?? 0,
            location: match.profile.location ?? '',
            profession: match.profile.profession ?? '',
            education: match.profile.education ?? '',
            bio: match.profile.bio ?? '',
          },
        }));

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
            Aucune suggestion disponible pour le moment. Complétez votre profil pour de meilleures
            recommandations.
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
            <button
              key={suggestion.profile.user_id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer text-left w-full"
              onClick={() => handleViewProfile(suggestion.profile.user_id)}
              aria-label={`Voir le profil de ${suggestion.profile.full_name}, compatibilité ${suggestion.compatibility_score}%`}
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
            </button>
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
