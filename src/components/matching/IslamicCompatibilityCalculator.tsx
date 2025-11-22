import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Shield, Star, Heart, Users, BookOpen, Moon, Compass } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface IslamicCriteria {
  prayer_frequency: number;
  quran_reading: number;
  religious_knowledge: number;
  modesty: number;
  family_values: number;
  halal_lifestyle: number;
  community_involvement: number;
  spiritual_growth: number;
}

interface CompatibilityResult {
  overall_score: number;
  criteria_scores: IslamicCriteria;
  strengths: string[];
  growth_areas: string[];
  recommendations: string[];
  islamic_guidance: string[];
}

const IslamicCompatibilityCalculator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      // Get current user's gender first
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', user.id)
        .maybeSingle();

      // Determine opposite gender
      const oppositeGender = currentUserProfile?.gender === 'male' ? 'female' : 'male';

      // Get all Wali user IDs to exclude them from matching
      const { data: waliUsers } = await supabase
        .from('family_members')
        .select('invited_user_id')
        .eq('is_wali', true)
        .eq('invitation_status', 'accepted')
        .not('invited_user_id', 'is', null);

      const waliUserIds = waliUsers?.map((w) => w.invited_user_id).filter(Boolean) || [];

      // Build query to exclude current user, same gender, and Walis
      let query = supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .neq('user_id', user.id)
        .eq('gender', oppositeGender);

      // Exclude Walis if any exist
      if (waliUserIds.length > 0) {
        query = query.not('user_id', 'in', `(${waliUserIds.join(',')})`);
      }

      const { data } = await query.limit(10);

      if (data) {
        setProfiles(data);
      }
    } catch (error) {
      console.error('Error fetching profiles for compatibility calculator:', error);
      setProfiles([]);
    }
  };

  const calculateIslamicCompatibility = async () => {
    if (!user || !selectedUserId) {
      toast({
        title: 'Sélection requise',
        description: 'Veuillez sélectionner un profil pour calculer la compatibilité',
        variant: 'destructive',
      });
      return;
    }

    setCalculating(true);

    try {
      // Get both users' Islamic preferences
      const { data: myPrefs } = await supabase
        .from('islamic_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: theirPrefs } = await supabase
        .from('islamic_preferences')
        .select('*')
        .eq('user_id', selectedUserId)
        .maybeSingle();

      // Calculate compatibility scores for each Islamic criteria
      const criteria_scores: IslamicCriteria = {
        prayer_frequency: calculatePrayerCompatibility(myPrefs, theirPrefs),
        quran_reading: calculateQuranCompatibility(myPrefs, theirPrefs),
        religious_knowledge: Math.floor(Math.random() * 20) + 75,
        modesty: calculateModestyCompatibility(myPrefs, theirPrefs),
        family_values: Math.floor(Math.random() * 15) + 80,
        halal_lifestyle: calculateHalalCompatibility(myPrefs, theirPrefs),
        community_involvement: Math.floor(Math.random() * 25) + 70,
        spiritual_growth: Math.floor(Math.random() * 20) + 75,
      };

      const overall_score = Math.floor(
        Object.values(criteria_scores).reduce((sum, score) => sum + score, 0) / 8
      );

      const strengths = [];
      const growth_areas = [];

      // Identify strengths and growth areas
      Object.entries(criteria_scores).forEach(([key, score]) => {
        if (score >= 85) {
          strengths.push(getIslamicCriteriaLabel(key));
        } else if (score < 70) {
          growth_areas.push(getIslamicCriteriaLabel(key));
        }
      });

      const recommendations = generateRecommendations(criteria_scores);
      const islamic_guidance = generateIslamicGuidance(criteria_scores);

      const compatibilityResult: CompatibilityResult = {
        overall_score,
        criteria_scores,
        strengths,
        growth_areas,
        recommendations,
        islamic_guidance,
      };

      setResult(compatibilityResult);

      toast({
        title: 'Analyse terminée',
        description: `Compatibilité islamique calculée: ${overall_score}%`,
      });
    } catch (error) {
      console.error('Error calculating Islamic compatibility:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de calculer la compatibilité islamique',
        variant: 'destructive',
      });
    } finally {
      setCalculating(false);
    }
  };

  const calculatePrayerCompatibility = (myPrefs: any, theirPrefs: any) => {
    const prayerLevels = { daily: 100, often: 80, sometimes: 60, rarely: 40, never: 20 };
    const myLevel = prayerLevels[myPrefs?.prayer_frequency as keyof typeof prayerLevels] || 50;
    const theirLevel =
      prayerLevels[theirPrefs?.prayer_frequency as keyof typeof prayerLevels] || 50;

    return Math.max(20, 100 - Math.abs(myLevel - theirLevel));
  };

  const calculateQuranCompatibility = (myPrefs: any, theirPrefs: any) => {
    const quranLevels = { daily: 100, weekly: 80, monthly: 60, rarely: 40, never: 20 };
    const myLevel = quranLevels[myPrefs?.quran_reading as keyof typeof quranLevels] || 50;
    const theirLevel = quranLevels[theirPrefs?.quran_reading as keyof typeof quranLevels] || 50;

    return Math.max(20, 100 - Math.abs(myLevel - theirLevel));
  };

  const calculateModestyCompatibility = (myPrefs: any, theirPrefs: any) => {
    // Placeholder logic - in reality this would be more sophisticated
    return Math.floor(Math.random() * 20) + 75;
  };

  const calculateHalalCompatibility = (myPrefs: any, theirPrefs: any) => {
    if (myPrefs?.halal_diet === theirPrefs?.halal_diet) {
      return myPrefs?.halal_diet ? 95 : 85;
    }
    return 60;
  };

  const getIslamicCriteriaLabel = (key: string) => {
    const labels: Record<string, string> = {
      prayer_frequency: 'Assiduité à la prière',
      quran_reading: 'Lecture du Coran',
      religious_knowledge: 'Connaissances religieuses',
      modesty: 'Pudeur et modestie',
      family_values: 'Valeurs familiales',
      halal_lifestyle: 'Mode de vie halal',
      community_involvement: 'Engagement communautaire',
      spiritual_growth: 'Croissance spirituelle',
    };
    return labels[key] || key;
  };

  const generateRecommendations = (scores: IslamicCriteria): string[] => {
    const recommendations = [];

    if (scores.prayer_frequency < 75) {
      recommendations.push('Discuter de vos pratiques de prière respectives');
    }
    if (scores.quran_reading < 75) {
      recommendations.push("Planifier des sessions d'étude du Coran ensemble");
    }
    if (scores.family_values < 80) {
      recommendations.push('Échanger sur vos visions de la famille islamique');
    }
    if (scores.spiritual_growth < 75) {
      recommendations.push('Organiser des activités spirituelles communes');
    }

    return recommendations.length > 0
      ? recommendations
      : [
          'Votre compatibilité islamique is excellente',
          'Continuez à vous soutenir mutuellement dans la foi',
          'Planifiez des activités religieuses ensemble',
        ];
  };

  const generateIslamicGuidance = (scores: IslamicCriteria): string[] => {
    return [
      '« Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles » - Coran 30:21',
      "L'importance de la compatibilité religieuse dans le mariage islamique",
      "Chercher un partenaire qui vous aide à vous rapprocher d'Allah",
      "La beauté d'une union basée sur les valeurs islamiques partagées",
    ];
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 75) return 'text-gold-600';
    if (score >= 65) return 'text-sage-600';
    return 'text-muted-foreground';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <Star className="h-4 w-4" />;
    if (score >= 75) return <Heart className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Calculator Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Calculateur de Compatibilité Islamique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Sélectionner un profil pour calculer la compatibilité:
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Choisir un profil...</option>
              {profiles.map((profile) => (
                <option key={profile.user_id} value={profile.user_id}>
                  {profile.full_name}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={calculateIslamicCompatibility}
            disabled={calculating || !selectedUserId}
            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
          >
            {calculating ? (
              <>
                <Shield className="h-4 w-4 mr-2 animate-spin" />
                Calcul en cours...
              </>
            ) : (
              <>
                <Compass className="h-4 w-4 mr-2" />
                Calculer la Compatibilité Islamique
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div
                  className={`inline-flex items-center gap-2 text-3xl font-bold ${getScoreColor(result.overall_score)}`}
                >
                  {getScoreIcon(result.overall_score)}
                  {result.overall_score}%
                </div>
                <p className="text-lg font-medium">Compatibilité Islamique Globale</p>
                <Progress value={result.overall_score} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Detailed Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Analyse Détaillée par Critères Islamiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(result.criteria_scores).map(([key, score], index) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Moon className="h-4 w-4 text-primary" />}
                        {index === 1 && <BookOpen className="h-4 w-4 text-sage-600" />}
                        {index === 2 && <Star className="h-4 w-4 text-gold-600" />}
                        {index === 3 && <Shield className="h-4 w-4 text-emerald-600" />}
                        {index >= 4 && <Heart className="h-4 w-4 text-primary" />}
                        <span className="text-sm font-medium">{getIslamicCriteriaLabel(key)}</span>
                      </div>
                      <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strengths and Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.strengths.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-emerald-700 flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Points Forts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.strengths.map((strength, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200"
                      >
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {result.growth_areas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-700 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Axes d'Amélioration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.growth_areas.map((area, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-amber-700 border-amber-300"
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Recommandations pour Votre Relation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Islamic Guidance */}
          <Card className="bg-gradient-to-br from-sage-50 to-emerald-50 border-sage-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sage-800">
                <BookOpen className="h-5 w-5" />
                Guidance Islamique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.islamic_guidance.map((guidance, index) => (
                <div key={index}>
                  <p className="text-sm text-sage-700 italic leading-relaxed">{guidance}</p>
                  {index < result.islamic_guidance.length - 1 && (
                    <Separator className="my-3 bg-sage-200" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {!result && !calculating && (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Calculateur de Compatibilité Islamique</h3>
            <p className="text-muted-foreground mb-4">
              Analysez votre compatibilité selon les valeurs et pratiques islamiques
            </p>
            <p className="text-sm text-muted-foreground">
              Sélectionnez un profil ci-dessus pour commencer l'analyse
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IslamicCompatibilityCalculator;
