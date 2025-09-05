import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { useCompatibility } from '@/hooks/useCompatibility';
import { Link } from 'react-router-dom';

interface CompatibilityCardProps {
  userId?: string;
  showActions?: boolean;
  compact?: boolean;
}

const CompatibilityCard = ({ userId, showActions = true, compact = false }: CompatibilityCardProps) => {
  const { stats, loading } = useCompatibility();

  if (loading) {
    return (
      <Card className={compact ? 'p-4' : ''}>
        <CardContent className={compact ? 'p-0' : ''}>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isComplete = stats.completionPercentage === 100;
  const isStarted = stats.answeredQuestions > 0;

  return (
    <Card className={`border-l-4 ${isComplete ? 'border-l-emerald' : isStarted ? 'border-l-gold' : 'border-l-gray-300'}`}>
      {!compact && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className={`h-5 w-5 ${isComplete ? 'text-emerald' : 'text-gold'}`} />
            Questionnaire de Compatibilité
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className={compact ? 'p-4' : ''}>
        <div className="space-y-4">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progression</span>
              <Badge 
                variant={isComplete ? "default" : isStarted ? "secondary" : "outline"}
                className={isComplete ? "bg-emerald text-white" : ""}
              >
                {stats.answeredQuestions}/{stats.totalQuestions}
              </Badge>
            </div>
            <Progress 
              value={stats.completionPercentage} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(stats.completionPercentage)}% complété
            </p>
          </div>

          {/* Status Message */}
          <div className="text-sm">
            {isComplete ? (
              <div className="flex items-center gap-2 text-emerald-dark">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Questionnaire terminé</span>
              </div>
            ) : isStarted ? (
              <div className="flex items-center gap-2 text-gold-dark">
                <TrendingUp className="h-4 w-4" />
                <span>En cours - {stats.totalQuestions - stats.answeredQuestions} questions restantes</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Améliorer la précision des matches</span>
              </div>
            )}
          </div>

          {/* Benefits */}
          {!isComplete && !compact && (
            <div className="text-xs text-muted-foreground bg-sage/10 p-3 rounded-lg">
              <p className="font-medium mb-1">Pourquoi compléter ce questionnaire ?</p>
              <ul className="space-y-1">
                <li>• Suggestions de partenaires plus précises</li>
                <li>• Compatibilité basée sur les valeurs islamiques</li>
                <li>• Filtrage par critères importants</li>
              </ul>
            </div>
          )}

          {/* Last Updated */}
          {stats.lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Dernière mise à jour: {new Date(stats.lastUpdated).toLocaleDateString('fr-FR')}
            </p>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              <Link to="/compatibility-test" className="flex-1">
                <Button 
                  className="w-full"
                  variant={isComplete ? "outline" : "default"}
                  size="sm"
                >
                  {isComplete ? 'Modifier réponses' : isStarted ? 'Continuer' : 'Commencer'}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompatibilityCard;