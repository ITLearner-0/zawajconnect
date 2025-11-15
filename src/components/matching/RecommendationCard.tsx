import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, TrendingUp, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SmartRecommendation } from '@/types/supabase';

interface RecommendationCardProps {
  recommendation: SmartRecommendation;
}

export const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  const navigate = useNavigate();

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-success bg-success/10 border-success/20';
    if (score >= 75) return 'text-warning bg-warning/10 border-warning/20';
    if (score >= 65) return 'text-primary bg-primary/10 border-primary/20';
    return 'text-muted-foreground bg-muted border-border';
  };

  const handleViewProfile = () => {
    navigate(`/profile/${recommendation.user_id}`);
  };

  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={recommendation.avatar_url} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base mb-0.5">
                {recommendation.full_name ?? 'Profil Anonyme'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {recommendation.age ?? '−'} ans • {recommendation.location ?? 'Non spécifié'}
              </p>
            </div>
          </div>
          <Badge variant="outline">{recommendation.recommendation_score}%</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Compatibility Scores */}
        <div className="space-y-2 text-sm">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">Islamique</span>
              <span className="text-xs">{recommendation.islamic_alignment}%</span>
            </div>
            <Progress value={recommendation.islamic_alignment} className="h-1.5" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">Compatible</span>
              <span className="text-xs">{recommendation.compatibility_score}%</span>
            </div>
            <Progress value={recommendation.compatibility_score} className="h-1.5" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">Personnalité</span>
              <span className="text-xs">{recommendation.personality_match}%</span>
            </div>
            <Progress value={recommendation.personality_match} className="h-1.5" />
          </div>
        </div>

        {/* Recommendation Reasons */}
        {recommendation.recommendation_reasons.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Points forts:</p>
            <div className="flex flex-wrap gap-1">
              {recommendation.recommendation_reasons
                .slice(0, 3)
                .map((reason: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {reason}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {/* Shared Interests */}
        {recommendation.shared_interests.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">
              Intérêts partagés ({recommendation.shared_interests.length}):
            </p>
            <div className="flex flex-wrap gap-1">
              {recommendation.shared_interests
                .slice(0, 4)
                .map((interest: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleViewProfile}>
            Voir le profil
          </Button>
          <Button size="sm" className="flex-1">
            Montrer l'intérêt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
