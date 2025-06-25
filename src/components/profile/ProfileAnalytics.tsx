
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, MessageCircle, Star } from 'lucide-react';

interface ProfileAnalyticsProps {
  userId?: string;
  analytics: {
    profileViews: number;
    profileViewsThisWeek: number;
    averageMatchScore: number;
    responseRate: number;
    profileCompleteness: number;
    popularTimes: string[];
    topMatchingCategories: string[];
  };
  loading?: boolean;
}

const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({ userId, analytics, loading }) => {
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Chargement des statistiques...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-800">
          <TrendingUp className="w-5 h-5" />
          Analytics de Profil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Views */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Vues du profil</span>
            <span className="text-2xl font-bold text-rose-600">{analytics.profileViews}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>+{analytics.profileViewsThisWeek} cette semaine</span>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Complétude du profil</span>
            <span className="text-sm font-semibold">{analytics.profileCompleteness}%</span>
          </div>
          <Progress value={analytics.profileCompleteness} className="w-full" />
        </div>

        {/* Average Match Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Score de compatibilité moyen</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold">{analytics.averageMatchScore}%</span>
            </div>
          </div>
        </div>

        {/* Response Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Taux de réponse</span>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span className="font-semibold">{analytics.responseRate}%</span>
            </div>
          </div>
        </div>

        {/* Top Matching Categories */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Catégories de compatibilité fortes</span>
          <div className="flex flex-wrap gap-2">
            {analytics.topMatchingCategories.map((category, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Popular Times */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Heures d'activité populaires</span>
          <div className="flex flex-wrap gap-2">
            {analytics.popularTimes.map((time, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {time}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileAnalytics;
