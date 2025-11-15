import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Users, Heart, Globe, User, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useUnifiedCompatibility } from '@/hooks/useUnifiedCompatibility';
import { supabase } from '@/integrations/supabase/client';

interface ProfileComparatorProps {
  profileIds: string[];
  maxProfiles?: number;
}

interface ProfileData {
  id: string;
  full_name: string | null;
  age: number | null;
  location: string | null;
  profession: string | null;
  avatar_url?: string | null;
}

interface CompatibilityData {
  overall: number;
  islamic: number;
  cultural: number;
  personality: number;
  matchingReasons: string[];
  concerns: string[];
}

const ProfileComparator = ({ profileIds, maxProfiles = 3 }: ProfileComparatorProps) => {
  const { calculateDetailedCompatibility } = useUnifiedCompatibility();
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [compatibilityData, setCompatibilityData] = useState<Record<string, CompatibilityData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const limitedIds = profileIds.slice(0, maxProfiles);

        // Fetch profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, age, location, profession, avatar_url')
          .in('id', limitedIds);

        if (profilesError) throw profilesError;
        if (profilesData) setProfiles(profilesData);

        // Calculate compatibility for each profile
        const compatResults: Record<string, CompatibilityData> = {};
        for (const profileId of limitedIds) {
          const result = await calculateDetailedCompatibility(profileId);
          compatResults[profileId] = {
            overall: result.compatibility_score,
            islamic: result.islamic_score,
            cultural: result.cultural_score,
            personality: result.personality_score,
            matchingReasons: result.matching_reasons,
            concerns: result.potential_concerns,
          };
        }
        setCompatibilityData(compatResults);
      } catch (error) {
        console.error('Error fetching comparison data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profileIds.length > 0) {
      fetchData();
    }
  }, [profileIds, maxProfiles, calculateDetailedCompatibility]);

  const getRadarData = () => {
    const categories = [
      { category: 'Islamic', key: 'islamic' },
      { category: 'Cultural', key: 'cultural' },
      { category: 'Personality', key: 'personality' },
      { category: 'Overall', key: 'overall' },
    ];

    return categories.map((cat) => {
      const dataPoint: any = { category: cat.category };
      profiles.forEach((profile) => {
        const compat = compatibilityData[profile.id];
        if (compat && profile.full_name) {
          dataPoint[profile.full_name] = compat[cat.key as keyof CompatibilityData];
        }
      });
      return dataPoint;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald';
    if (score >= 60) return 'text-gold';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRecommendations = () => {
    const recommendations: {
      profile: string;
      message: string;
      type: 'success' | 'warning' | 'info';
    }[] = [];

    profiles.forEach((profile) => {
      const compat = compatibilityData[profile.id];
      if (!compat) return;

      if (compat.overall >= 80) {
        recommendations.push({
          profile: profile.full_name || 'Profil anonyme',
          message: 'Excellente compatibilité globale - Candidat prioritaire à considérer',
          type: 'success',
        });
      }

      if (compat.islamic >= 85) {
        recommendations.push({
          profile: profile.full_name || 'Profil anonyme',
          message: 'Très forte compatibilité sur les valeurs islamiques',
          type: 'success',
        });
      }

      if (compat.concerns.length > 3) {
        recommendations.push({
          profile: profile.full_name || 'Profil anonyme',
          message: `${compat.concerns.length} préoccupations identifiées - À discuter en détail`,
          type: 'warning',
        });
      }

      if (compat.cultural < 50) {
        recommendations.push({
          profile: profile.full_name || 'Profil anonyme',
          message: 'Différences culturelles importantes - Communication essentielle',
          type: 'info',
        });
      }
    });

    return recommendations;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la comparaison...</p>
        </CardContent>
      </Card>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun profil à comparer</p>
        </CardContent>
      </Card>
    );
  }

  const radarData = getRadarData();
  const recommendations = getRecommendations();
  const colors = ['hsl(var(--emerald))', 'hsl(var(--gold))', 'hsl(var(--chart-3))'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald" />
            Comparaison de {profiles.length} profils
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vue d'ensemble - Graphique Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              {profiles.map((profile, index) => (
                <Radar
                  key={profile.id}
                  name={profile.full_name || 'Profil anonyme'}
                  dataKey={profile.full_name || 'Profil anonyme'}
                  stroke={colors[index]}
                  fill={colors[index]}
                  fillOpacity={0.3}
                />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scores détaillés par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Catégorie</th>
                  {profiles.map((profile) => (
                    <th key={profile.id} className="text-center py-3 px-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold">{profile.full_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {profile.age} ans • {profile.location}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4 text-emerald" />
                    Compatibilité Globale
                  </td>
                  {profiles.map((profile) => {
                    const compat = compatibilityData[profile.id];
                    return (
                      <td key={profile.id} className="text-center py-3 px-4">
                        <div className="flex flex-col items-center gap-2">
                          <Badge className={`${getScoreColor(compat?.overall || 0)} font-bold`}>
                            {Math.round(compat?.overall || 0)}%
                          </Badge>
                          <Progress value={compat?.overall || 0} className="h-2 w-20" />
                        </div>
                      </td>
                    );
                  })}
                </tr>

                <tr className="border-b">
                  <td className="py-3 px-4 font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gold" />
                    Valeurs Islamiques
                  </td>
                  {profiles.map((profile) => {
                    const compat = compatibilityData[profile.id];
                    return (
                      <td key={profile.id} className="text-center py-3 px-4">
                        <div className="flex flex-col items-center gap-2">
                          <Badge className={`${getScoreColor(compat?.islamic || 0)}`}>
                            {Math.round(compat?.islamic || 0)}%
                          </Badge>
                          <Progress value={compat?.islamic || 0} className="h-2 w-20" />
                        </div>
                      </td>
                    );
                  })}
                </tr>

                <tr className="border-b">
                  <td className="py-3 px-4 font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-chart-3" />
                    Compatibilité Culturelle
                  </td>
                  {profiles.map((profile) => {
                    const compat = compatibilityData[profile.id];
                    return (
                      <td key={profile.id} className="text-center py-3 px-4">
                        <div className="flex flex-col items-center gap-2">
                          <Badge className={`${getScoreColor(compat?.cultural || 0)}`}>
                            {Math.round(compat?.cultural || 0)}%
                          </Badge>
                          <Progress value={compat?.cultural || 0} className="h-2 w-20" />
                        </div>
                      </td>
                    );
                  })}
                </tr>

                <tr className="border-b">
                  <td className="py-3 px-4 font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-chart-4" />
                    Personnalité
                  </td>
                  {profiles.map((profile) => {
                    const compat = compatibilityData[profile.id];
                    return (
                      <td key={profile.id} className="text-center py-3 px-4">
                        <div className="flex flex-col items-center gap-2">
                          <Badge className={`${getScoreColor(compat?.personality || 0)}`}>
                            {Math.round(compat?.personality || 0)}%
                          </Badge>
                          <Progress value={compat?.personality || 0} className="h-2 w-20" />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Matching Reasons & Concerns */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald" />
              Points Communs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profiles.map((profile) => {
              const compat = compatibilityData[profile.id];
              return (
                <div key={profile.id} className="space-y-2">
                  <h4 className="font-semibold text-sm">{profile.full_name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {compat?.matchingReasons.slice(0, 4).map((reason, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs bg-emerald/10 text-emerald-dark border-emerald/20"
                      >
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Points d'Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profiles.map((profile) => {
              const compat = compatibilityData[profile.id];
              return (
                <div key={profile.id} className="space-y-2">
                  <h4 className="font-semibold text-sm">{profile.full_name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {compat?.concerns.slice(0, 3).map((concern, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs bg-orange-100 text-orange-700 border-orange-200"
                      >
                        {concern}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gold" />
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                rec.type === 'success'
                  ? 'bg-emerald/10 border-emerald/20'
                  : rec.type === 'warning'
                    ? 'bg-orange-100 border-orange-200'
                    : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {rec.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald mt-0.5" />}
                {rec.type === 'warning' && (
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                )}
                {rec.type === 'info' && <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />}
                <div>
                  <p className="font-semibold text-sm">{rec.profile}</p>
                  <p className="text-sm text-muted-foreground mt-1">{rec.message}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileComparator;
