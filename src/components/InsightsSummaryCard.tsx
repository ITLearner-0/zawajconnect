import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  BookOpen, 
  Share2,
  Download,
  RefreshCw
} from 'lucide-react';
import { useCompatibilityInsights } from '@/hooks/useCompatibilityInsights';

interface InsightsSummaryCardProps {
  userId?: string;
  compact?: boolean;
}

const InsightsSummaryCard: React.FC<InsightsSummaryCardProps> = ({ 
  userId, 
  compact = false 
}) => {
  const { insights, loading } = useCompatibilityInsights(userId);

  if (loading) {
    return (
      <Card className={compact ? 'p-4' : ''}>
        <CardContent className={compact ? 'p-0' : 'p-6'}>
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Génération des insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="p-6 text-center">
          <Brain className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Insights non disponibles</h3>
          <p className="text-sm text-muted-foreground">
            Complétez le test de compatibilité pour débloquer vos insights personnalisés.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (scores: number[]): string => {
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    if (avg >= 80) return 'text-emerald-600';
    if (avg >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const compatibilityScores = insights.compatibilityAreas.map(area => area.score);
  const averageScore = compatibilityScores.reduce((sum, score) => sum + score, 0) / compatibilityScores.length;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Résumé des Insights</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Compatibility Score */}
        <div className="text-center p-4 bg-white/60 rounded-lg">
          <div className={`text-3xl font-bold ${getScoreColor(compatibilityScores)}`}>
            {Math.round(averageScore)}%
          </div>
          <p className="text-sm text-muted-foreground">Score de Compatibilité Moyen</p>
          <Progress value={averageScore} className="mt-2 h-2" />
        </div>

        {/* Key Insights Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-white/40 p-2 sm:p-3 rounded-lg text-center min-h-[60px] flex flex-col justify-center">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 mx-auto mb-1" />
            <div className="text-[10px] sm:text-xs font-medium text-emerald-700 leading-tight">
              {insights.compatibilityAreas.length} Domaines
            </div>
            <div className="text-[9px] sm:text-xs text-muted-foreground">Analysés</div>
          </div>
          
          <div className="bg-white/40 p-2 sm:p-3 rounded-lg text-center min-h-[60px] flex flex-col justify-center">
            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 mx-auto mb-1" />
            <div className="text-[10px] sm:text-xs font-medium text-blue-700 leading-tight">
              {insights.idealPartner.length} Traits
            </div>
            <div className="text-[9px] sm:text-xs text-muted-foreground">Partenaire idéal</div>
          </div>
          
          <div className="bg-white/40 p-2 sm:p-3 rounded-lg text-center min-h-[60px] flex flex-col justify-center">
            <AlertTriangle className={`h-3 w-3 sm:h-4 sm:w-4 mx-auto mb-1 ${
              insights.suggestions.length > 0 ? 'text-yellow-600' : 'text-green-600'
            }`} />
            <div className={`text-[10px] sm:text-xs font-medium leading-tight ${
              insights.suggestions.length > 0 ? 'text-yellow-700' : 'text-green-700'
            }`}>
              {insights.suggestions.length} Suggestions
            </div>
            <div className="text-[9px] sm:text-xs text-muted-foreground">D'amélioration</div>
          </div>
          
          <div className="bg-white/40 p-2 sm:p-3 rounded-lg text-center min-h-[60px] flex flex-col justify-center">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 mx-auto mb-1" />
            <div className="text-[10px] sm:text-xs font-medium text-emerald-700 leading-tight">
              {insights.islamicGuidance.length} Conseils
            </div>
            <div className="text-[9px] sm:text-xs text-muted-foreground">Islamiques</div>
          </div>
        </div>

        {/* Priority and Style */}
        <div className="space-y-3">
          <div className="bg-white/40 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Priorité Principale</h4>
            <Badge variant="secondary" className="text-xs break-words">
              {insights.priorities[0] || 'Stabilité et respect mutuel'}
            </Badge>
          </div>

          <div className="bg-white/40 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Style Relationnel</h4>
            <p className="text-xs text-muted-foreground leading-relaxed break-words">
              {insights.relationshipStyle}
            </p>
          </div>
        </div>

        {/* Red Flags Alert */}
        {insights.redFlags.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <h4 className="text-sm font-medium text-orange-800">Points d'Attention</h4>
            </div>
            <p className="text-xs text-orange-700">
              {insights.redFlags.length} zone{insights.redFlags.length > 1 ? 's' : ''} d'amélioration identifiée{insights.redFlags.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightsSummaryCard;