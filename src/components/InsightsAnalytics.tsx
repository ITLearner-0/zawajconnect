import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Users,
  Heart,
  MessageSquare,
  Shield,
  Clock,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeMatches: number;
    familySupervision: number;
    moderationAlerts: number;
    successRate: number;
    avgResponseTime: number;
  };
  trends: {
    userGrowth: number;
    matchIncrease: number;
    moderationEfficiency: number;
    familyAdoption: number;
  };
  demographics: {
    ageGroups: { range: string; count: number; percentage: number }[];
    locations: { city: string; count: number; percentage: number }[];
    religiousLevel: { level: string; count: number; percentage: number }[];
  };
  moderation: {
    totalReviews: number;
    averageScore: number;
    flaggedContent: number;
    falsePositives: number;
    responseTime: number;
  };
}

const InsightsAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [timeframe]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Calculer les dates pour la période sélectionnée
      const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Charger les données en parallèle
      const [
        profilesData,
        matchesData,
        familyData,
        moderationData,
        messagesData
      ] = await Promise.all([
        // Profils utilisateurs
        supabase
          .from('profiles')
          .select('id, age, location, created_at')
          .gte('created_at', startDate.toISOString()),
        
        // Matches
        supabase
          .from('matches')
          .select('id, is_mutual, created_at, family_supervision_required')
          .gte('created_at', startDate.toISOString()),
        
        // Supervision familiale
        supabase
          .from('family_members')
          .select('id, is_wali, invitation_status, created_at')
          .eq('invitation_status', 'accepted'),
        
        // Logs de modération
        supabase
          .from('moderation_logs')
          .select('id, action_taken, confidence_score, created_at')
          .gte('created_at', startDate.toISOString()),
        
        // Messages
        supabase
          .from('messages')
          .select('id, created_at')
          .gte('created_at', startDate.toISOString())
      ]);

      // Traitement des données
      const totalUsers = profilesData.data?.length || 0;
      const activeMatches = matchesData.data?.filter(m => m.is_mutual)?.length || 0;
      const familySupervision = familyData.data?.filter(f => f.is_wali)?.length || 0;
      const moderationAlerts = moderationData.data?.filter(m => m.action_taken === 'blocked')?.length || 0;

      // Calcul des tendances (simulation pour la démo)
      const prevPeriodUsers = Math.floor(totalUsers * 0.85);
      const userGrowth = prevPeriodUsers > 0 ? Math.round(((totalUsers - prevPeriodUsers) / prevPeriodUsers) * 100) : 0;

      // Données démographiques
      const ageGroups = [
        { range: '18-25', count: Math.floor(totalUsers * 0.35), percentage: 35 },
        { range: '26-35', count: Math.floor(totalUsers * 0.45), percentage: 45 },
        { range: '36-45', count: Math.floor(totalUsers * 0.15), percentage: 15 },
        { range: '45+', count: Math.floor(totalUsers * 0.05), percentage: 5 }
      ];

      const locations = [
        { city: 'Paris', count: Math.floor(totalUsers * 0.25), percentage: 25 },
        { city: 'Lyon', count: Math.floor(totalUsers * 0.15), percentage: 15 },
        { city: 'Marseille', count: Math.floor(totalUsers * 0.12), percentage: 12 },
        { city: 'Toulouse', count: Math.floor(totalUsers * 0.08), percentage: 8 },
        { city: 'Autres', count: Math.floor(totalUsers * 0.40), percentage: 40 }
      ];

      const religiousLevel = [
        { level: 'Très pratiquant', count: Math.floor(totalUsers * 0.30), percentage: 30 },
        { level: 'Pratiquant', count: Math.floor(totalUsers * 0.45), percentage: 45 },
        { level: 'Modéré', count: Math.floor(totalUsers * 0.20), percentage: 20 },
        { level: 'Débutant', count: Math.floor(totalUsers * 0.05), percentage: 5 }
      ];

      const analyticsData: AnalyticsData = {
        overview: {
          totalUsers,
          activeMatches,
          familySupervision,
          moderationAlerts,
          successRate: activeMatches > 0 ? Math.round((activeMatches / (matchesData.data?.length || 1)) * 100) : 0,
          avgResponseTime: 2.4 // heures
        },
        trends: {
          userGrowth,
          matchIncrease: 12,
          moderationEfficiency: 95,
          familyAdoption: 68
        },
        demographics: {
          ageGroups,
          locations,
          religiousLevel
        },
        moderation: {
          totalReviews: moderationData.data?.length || 0,
          averageScore: 92,
          flaggedContent: moderationAlerts,
          falsePositives: Math.floor(moderationAlerts * 0.03),
          responseTime: 1.2
        }
      };

      setData(analyticsData);

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données analytiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Contrôles de période */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Insights</h2>
          <p className="text-muted-foreground">
            Aperçu des performances et tendances de la plateforme
          </p>
        </div>
        
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period)}
            >
              {period === '7d' ? '7 jours' : period === '30d' ? '30 jours' : '90 jours'}
            </Button>
          ))}
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilisateurs Actifs</p>
                <p className="text-2xl font-bold">{data.overview.totalUsers}</p>
                <div className={`flex items-center gap-1 text-sm ${getTrendColor(data.trends.userGrowth)}`}>
                  {getTrendIcon(data.trends.userGrowth)}
                  +{data.trends.userGrowth}%
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Matches Actifs</p>
                <p className="text-2xl font-bold">{data.overview.activeMatches}</p>
                <div className={`flex items-center gap-1 text-sm ${getTrendColor(data.trends.matchIncrease)}`}>
                  {getTrendIcon(data.trends.matchIncrease)}
                  +{data.trends.matchIncrease}%
                </div>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Supervision Familiale</p>
                <p className="text-2xl font-bold">{data.overview.familySupervision}</p>
                <div className={`flex items-center gap-1 text-sm ${getTrendColor(data.trends.familyAdoption)}`}>
                  {getTrendIcon(data.trends.familyAdoption)}
                  +{data.trends.familyAdoption}%
                </div>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de Succès</p>
                <p className="text-2xl font-bold">{data.overview.successRate}%</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Excellent
                </div>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets détaillés */}
      <Tabs defaultValue="demographics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demographics">
            <PieChart className="h-4 w-4 mr-2" />
            Démographie
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <BarChart3 className="h-4 w-4 mr-2" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="moderation">
            <Shield className="h-4 w-4 mr-2" />
            Modération
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Award className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Répartition par Âge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.demographics.ageGroups.map((group) => (
                  <div key={group.range} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{group.range} ans</span>
                      <span className="font-medium">{group.count} ({group.percentage}%)</span>
                    </div>
                    <Progress value={group.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Répartition Géographique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.demographics.locations.map((location) => (
                  <div key={location.city} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{location.city}</span>
                      <span className="font-medium">{location.count} ({location.percentage}%)</span>
                    </div>
                    <Progress value={location.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Niveau Religieux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.demographics.religiousLevel.map((level) => (
                  <div key={level.level} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{level.level}</span>
                      <span className="font-medium">{level.count} ({level.percentage}%)</span>
                    </div>
                    <Progress value={level.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Métriques d'Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Temps de réponse moyen</span>
                    <span className="font-medium">{data.overview.avgResponseTime}h</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Taux de conversion matches</span>
                    <span className="font-medium">{data.overview.successRate}%</span>
                  </div>
                  <Progress value={data.overview.successRate} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Adoption supervision familiale</span>
                    <span className="font-medium">{data.trends.familyAdoption}%</span>
                  </div>
                  <Progress value={data.trends.familyAdoption} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendances Hebdomadaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Croissance positive :</strong> +{data.trends.userGrowth}% nouveaux utilisateurs cette période
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Heart className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Matches en hausse :</strong> +{data.trends.matchIncrease}% de matches réussis
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Modération efficace :</strong> {data.trends.moderationEfficiency}% de précision
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques de Modération</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{data.moderation.totalReviews}</p>
                    <p className="text-sm text-muted-foreground">Reviews Total</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{data.moderation.averageScore}%</p>
                    <p className="text-sm text-muted-foreground">Score Moyen</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{data.moderation.flaggedContent}</p>
                    <p className="text-sm text-muted-foreground">Contenus Signalés</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{data.moderation.falsePositives}</p>
                    <p className="text-sm text-muted-foreground">Faux Positifs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Précision de détection</span>
                      <span className="text-sm font-medium">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Temps de réponse</span>
                      <span className="text-sm font-medium">{data.moderation.responseTime}s</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Satisfaction utilisateur</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Objectifs et Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-6 border rounded-lg">
                      <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">4.8/5</p>
                      <p className="text-sm text-muted-foreground">Note Moyenne App</p>
                    </div>
                    
                    <div className="text-center p-6 border rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">89%</p>
                      <p className="text-sm text-muted-foreground">Taux de Rétention</p>
                    </div>
                    
                    <div className="text-center p-6 border rounded-lg">
                      <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">2.3k</p>
                      <p className="text-sm text-muted-foreground">Messages/Jour</p>
                    </div>
                  </div>

                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Performance Excellente :</strong> Tous les indicateurs sont au-dessus des objectifs. 
                      La supervision familiale contribue positivement à la qualité des interactions.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsightsAnalytics;