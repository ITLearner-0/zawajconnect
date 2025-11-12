import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { CompatibilityArea } from '@/types/compatibility';

interface CompatibilityScoreChartProps {
  areas: CompatibilityArea[];
  showTrends?: boolean;
}

const CompatibilityScoreChart: React.FC<CompatibilityScoreChartProps> = ({ 
  areas, 
  showTrends = false 
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 55) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Très Bon';
    if (score >= 55) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'À Améliorer';
  };

  const getProgressColor = (score: number): string => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-green-500';
    if (score >= 55) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (score: number): React.ReactNode => {
    if (score >= 70) return <TrendingUp className="h-3 w-3" />;
    if (score >= 55) return <Minus className="h-3 w-3" />;
    return <TrendingDown className="h-3 w-3" />;
  };

  const averageScore = areas.reduce((sum, area) => sum + area.score, 0) / areas.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Analyse de Compatibilité Détaillée
          </CardTitle>
          <Badge variant="outline" className={getScoreColor(averageScore)}>
            {Math.round(averageScore)}% Moyen
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Score Display */}
        <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border">
          <div className="text-2xl font-bold text-primary mb-1">
            {Math.round(averageScore)}%
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            Score de Compatibilité Global
          </div>
          <Progress 
            value={averageScore} 
            className="h-3"
          />
        </div>

        {/* Individual Area Scores */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Détail par Domaine
          </h4>
          
          {areas.map((area, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{area.category}</span>
                  {showTrends && getTrendIcon(area.score)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {area.score}%
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getScoreColor(area.score)}`}
                  >
                    {getScoreLabel(area.score)}
                  </Badge>
                </div>
              </div>
              
              <div className="relative">
                <Progress value={area.score} className="h-2" />
                <div 
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getProgressColor(area.score)}`}
                  style={{ width: `${area.score}%` }}
                />
              </div>
              
              <p className="text-xs text-muted-foreground">
                {area.description}
              </p>
            </div>
          ))}
        </div>

        {/* Score Interpretation */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 text-sm">Interprétation</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <span>85%+ Excellent</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>70-84% Très Bon</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>55-69% Bon</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>40-54% Moyen</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>&lt;40% À Améliorer</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompatibilityScoreChart;