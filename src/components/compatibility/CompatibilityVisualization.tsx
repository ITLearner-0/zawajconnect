import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CompatibilityVisualization } from '@/types/filters';
import { Heart, AlertTriangle, TrendingUp, Users, BookOpen, Home, User } from 'lucide-react';

interface CompatibilityVisualizationProps {
  visualization: CompatibilityVisualization;
  className?: string;
}

const CompatibilityVisualizationComponent: React.FC<CompatibilityVisualizationProps> = ({
  visualization,
  className = '',
}) => {
  const { overallScore, strengths, differences, dealbreakers, compatibilityBreakdown } =
    visualization;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('religious')) return <BookOpen className="h-4 w-4" />;
    if (category.toLowerCase().includes('family')) return <Home className="h-4 w-4" />;
    if (category.toLowerCase().includes('lifestyle')) return <TrendingUp className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Score global */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Score de Compatibilité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </div>
            <p className="text-muted-foreground">Compatibilité globale</p>
          </div>

          <Progress value={overallScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Répartition par catégorie */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Répartition Détaillée</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm">Religieux</span>
              </div>
              <Progress value={compatibilityBreakdown.religious} className="h-2" />
              <span className={`text-xs ${getScoreColor(compatibilityBreakdown.religious)}`}>
                {compatibilityBreakdown.religious}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Style de vie</span>
              </div>
              <Progress value={compatibilityBreakdown.lifestyle} className="h-2" />
              <span className={`text-xs ${getScoreColor(compatibilityBreakdown.lifestyle)}`}>
                {compatibilityBreakdown.lifestyle}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">Personnel</span>
              </div>
              <Progress value={compatibilityBreakdown.personal} className="h-2" />
              <span className={`text-xs ${getScoreColor(compatibilityBreakdown.personal)}`}>
                {compatibilityBreakdown.personal}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="text-sm">Familial</span>
              </div>
              <Progress value={compatibilityBreakdown.family} className="h-2" />
              <span className={`text-xs ${getScoreColor(compatibilityBreakdown.family)}`}>
                {compatibilityBreakdown.family}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Points forts */}
      {strengths.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              Points Forts ({strengths.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  {getCategoryIcon(strength.category)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{strength.category}</span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(strength.score)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{strength.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Différences */}
      {differences.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
              Points à Explorer ({differences.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {differences.map((difference, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  {getCategoryIcon(difference.category)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{difference.category}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(difference.score)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{difference.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deal-breakers */}
      {dealbreakers.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Points d'Incompatibilité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {dealbreakers.map((dealbreaker, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {dealbreaker}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Ces éléments peuvent nécessiter une discussion approfondie.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompatibilityVisualizationComponent;
