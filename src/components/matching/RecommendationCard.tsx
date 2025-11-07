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
    <Card className="hover:shadow-xl transition-all hover:scale-[1.01] border-primary/10">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-primary/10">
              <AvatarImage src={recommendation.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent">
                <User className="h-6 w-6 text-primary-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg mb-1">{recommendation.full_name ?? 'Profil Anonyme'}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {recommendation.age ?? '−'} ans • {recommendation.location ?? 'Non spécifié'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {recommendation.profession ?? 'Non spécifié'}
              </p>
            </div>
          </div>
          <Badge className={`${getScoreColor(recommendation.recommendation_score)} font-semibold shrink-0`}>
            <Sparkles className="h-3 w-3 mr-1" />
            {recommendation.recommendation_score}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Compatibility Scores */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">Islamique</span>
              <span className="text-xs">{recommendation.islamic_alignment}%</span>
            </div>
            <Progress value={recommendation.islamic_alignment} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">Compatible</span>
              <span className="text-xs">{recommendation.compatibility_score}%</span>
            </div>
            <Progress value={recommendation.compatibility_score} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">Personnalité</span>
              <span className="text-xs">{recommendation.personality_match}%</span>
            </div>
            <Progress value={recommendation.personality_match} className="h-2" />
          </div>
        </div>

        {/* Recommendation Reasons */}
        {recommendation.recommendation_reasons.length > 0 && (
          <div>
            <p className="text-sm font-medium text-success mb-2">Points forts:</p>
            <div className="flex flex-wrap gap-1">
              {recommendation.recommendation_reasons.slice(0, 3).map((reason: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs bg-success/10 text-success border-success/20">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Shared Interests */}
        {recommendation.shared_interests.length > 0 && (
          <div>
            <p className="text-sm font-medium text-primary mb-2">
              Intérêts partagés ({recommendation.shared_interests.length}):
            </p>
            <div className="flex flex-wrap gap-1">
              {recommendation.shared_interests.slice(0, 4).map((interest: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Success Metrics */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium">Potentiel</span>
            </div>
            <span className={`text-sm font-semibold ${getScoreColor(recommendation.growth_potential).split(' ')[0]}`}>
              {recommendation.growth_potential}%
            </span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart className="h-3 w-3 text-destructive" />
              <span className="text-xs font-medium">Succès</span>
            </div>
            <span className={`text-sm font-semibold ${getScoreColor(recommendation.success_probability).split(' ')[0]}`}>
              {recommendation.success_probability}%
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary font-medium">
            Timeline: {recommendation.relationship_timeline}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleViewProfile}
          >
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