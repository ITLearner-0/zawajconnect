import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, TrendingUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCompatibility } from '@/hooks/useCompatibility';

interface CompatibilityPromptProps {
  onDismiss?: () => void;
  compact?: boolean;
}

const CompatibilityPrompt = ({ onDismiss, compact = false }: CompatibilityPromptProps) => {
  const { stats } = useCompatibility();
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  // Don't show if completed or dismissed
  if (stats.completionPercentage === 100 || dismissed) {
    return null;
  }

  const isStarted = stats.answeredQuestions > 0;

  return (
    <Card className={`border-l-4 border-l-gold bg-gradient-to-r from-gold/5 to-emerald/5 ${compact ? 'mb-4' : 'mb-6'}`}>
      <CardContent className={compact ? 'p-4' : 'p-6'}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-gold" />
              <h3 className="font-semibold text-foreground">
                {isStarted ? 'Terminez votre questionnaire' : 'Améliorez vos matches'}
              </h3>
              {onDismiss && (
                <button
                  onClick={handleDismiss}
                  className="ml-auto text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {isStarted 
                ? `Vous avez répondu à ${stats.answeredQuestions}/${stats.totalQuestions} questions. Terminez pour des suggestions plus précises.`
                : 'Répondez à notre questionnaire détaillé pour des suggestions de partenaires plus compatibles avec vos valeurs islamiques.'
              }
            </p>

            {isStarted && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progression</span>
                  <span>{Math.round(stats.completionPercentage)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-gold to-emerald h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.completionPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Link to="/compatibility-test">
                <Button size="sm" className="bg-emerald hover:bg-emerald-dark">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {isStarted ? 'Continuer le test' : 'Commencer le test'}
                </Button>
              </Link>
              
              {!compact && (
                <Badge variant="outline" className="text-xs">
                  {stats.totalQuestions} questions
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompatibilityPrompt;