import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Heart } from 'lucide-react';

interface ProgressStep {
  label: string;
  completed: boolean;
  score?: number;
}

interface EnhancedProgressIndicatorProps {
  title: string;
  overallProgress: number;
  steps: ProgressStep[];
  className?: string;
}

const EnhancedProgressIndicator: React.FC<EnhancedProgressIndicatorProps> = ({
  title,
  overallProgress,
  steps,
  className = '',
}) => {
  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            <Badge variant={overallProgress === 100 ? 'default' : 'secondary'}>
              {overallProgress}% complété
            </Badge>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <Progress value={overallProgress} className="h-3 animate-slide-in-right" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progression globale</span>
              <span>{overallProgress}/100</span>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-300 animate-fade-in ${
                  step.completed ? 'bg-emerald/5 border-emerald/20' : 'bg-muted/20 border-border'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full transition-colors ${
                      step.completed ? 'bg-emerald' : 'bg-muted-foreground'
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      step.completed ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {step.score !== undefined && (
                  <div className="flex items-center space-x-1">
                    {step.completed && <Star className="w-3 h-3 text-gold" />}
                    <span
                      className={`text-xs font-medium ${
                        step.completed ? 'text-emerald' : 'text-muted-foreground'
                      }`}
                    >
                      {step.score}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Button */}
          {overallProgress < 100 && (
            <div className="pt-2">
              <button className="w-full text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                Continuer l'évaluation →
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProgressIndicator;
