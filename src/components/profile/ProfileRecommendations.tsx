import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Camera, Edit, MessageSquare } from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'photo' | 'content' | 'activity' | 'verification';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionText: string;
}

interface ProfileRecommendationsProps {
  userId?: string;
  recommendations: Recommendation[];
  loading?: boolean;
  onRecommendationAction: (recommendationId: string) => void;
}

const ProfileRecommendations: React.FC<ProfileRecommendationsProps> = ({
  userId,
  recommendations,
  loading,
  onRecommendationAction,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'photo':
        return <Camera className="w-4 h-4" />;
      case 'content':
        return <Edit className="w-4 h-4" />;
      case 'activity':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Chargement des recommandations...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-800">
          <Lightbulb className="w-5 h-5" />
          Recommandations pour améliorer votre profil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Excellent ! Votre profil est optimisé.</p>
            <p className="text-sm">Aucune amélioration nécessaire pour le moment.</p>
          </div>
        ) : (
          recommendations.map((recommendation) => (
            <div key={recommendation.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getIcon(recommendation.type)}
                  <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                </div>
                <Badge className={`text-xs ${getPriorityColor(recommendation.priority)}`}>
                  {recommendation.priority === 'high'
                    ? 'Priorité élevée'
                    : recommendation.priority === 'medium'
                      ? 'Priorité moyenne'
                      : 'Priorité faible'}
                </Badge>
              </div>

              <p className="text-sm text-gray-600">{recommendation.description}</p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onRecommendationAction(recommendation.id)}
                className="w-full"
              >
                {recommendation.actionText}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileRecommendations;
