import { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, TrendingUp, Users } from 'lucide-react';
import { useUnifiedCompatibility } from '@/hooks/useUnifiedCompatibility';

interface CompatibilityScoreProps {
  otherUserId: string;
  showDetails?: boolean;
  compact?: boolean;
}

const CompatibilityScore = ({ otherUserId, showDetails = false, compact = false }: CompatibilityScoreProps) => {
  const { calculateDetailedCompatibility } = useUnifiedCompatibility();
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getScore = async () => {
      setLoading(true);
      try {
        const result = await calculateDetailedCompatibility(otherUserId);
        setScore(result.compatibility_score);
      } catch (error) {
        console.error('Error calculating compatibility:', error);
        setScore(0);
      }
      setLoading(false);
    };

    getScore();
  }, [otherUserId, calculateDetailedCompatibility]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald bg-emerald/10 border-emerald/20';
    if (score >= 60) return 'text-gold bg-gold/10 border-gold/20';
    if (score >= 40) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Excellente compatibilité';
    if (score >= 60) return 'Bonne compatibilité';
    if (score >= 40) return 'Compatibilité moyenne';
    return 'Compatibilité faible';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return Heart;
    if (score >= 50) return TrendingUp;
    return Users;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald"></div>
        <span className="text-sm text-muted-foreground">Calcul...</span>
      </div>
    );
  }

  if (score === null || score === 0) {
    return (
      <Badge variant="outline" className="text-xs">
        <Users className="h-3 w-3 mr-1" />
        Compatibilité inconnue
      </Badge>
    );
  }

  const ScoreIcon = useMemo(() => getScoreIcon(score), [score]);

  if (compact) {
    return (
      <Badge className={`${getScoreColor(score)} text-xs font-medium`}>
        <ScoreIcon className="h-3 w-3 mr-1" />
        {Math.round(score)}%
      </Badge>
    );
  }

  if (showDetails) {
    return (
      <Card className="border-l-4 border-l-emerald/30">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScoreIcon className={`h-5 w-5 ${score >= 60 ? 'text-emerald' : 'text-gold'}`} />
                <span className="font-medium">Score de Compatibilité</span>
              </div>
              <Badge className={`${getScoreColor(score)} font-semibold`}>
                {Math.round(score)}%
              </Badge>
            </div>

            <div>
              <Progress value={score} className="h-2 mb-1" />
              <p className="text-sm text-muted-foreground">
                {getScoreText(score)}
              </p>
            </div>

            {score >= 60 && (
              <div className="text-xs text-emerald-dark bg-emerald/10 p-2 rounded">
                Ce score élevé indique une forte compatibilité basée sur vos valeurs et préférences communes.
              </div>
            )}

            {score < 40 && (
              <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
                Ce score suggère des différences importantes dans vos réponses au questionnaire.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ScoreIcon className={`h-4 w-4 ${score >= 60 ? 'text-emerald' : 'text-gold'}`} />
      <span className="text-sm font-medium">{getScoreText(score)}</span>
      <Badge className={`${getScoreColor(score)} text-xs`}>
        {Math.round(score)}%
      </Badge>
    </div>
  );
};

export default CompatibilityScore;