import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, X, CheckCircle } from 'lucide-react';

interface OnboardingTooltipProps {
  title: string;
  description: string;
  tips: string[];
  example: string;
  isVisible: boolean;
  onClose: () => void;
  onMarkComplete?: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  title,
  description,
  tips,
  example,
  isVisible,
  onClose,
  onMarkComplete,
  position = 'bottom'
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  return (
    <div className={`absolute z-50 ${positionClasses[position]} w-80 ${isAnimating ? 'animate-scale-in' : ''}`}>
      <Card className="border-2 border-primary shadow-lg bg-gradient-to-br from-background to-accent/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1">
              <div className="p-2 rounded-full bg-primary/10 mt-0.5">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-destructive/10"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {tips.length > 0 && (
            <div className="space-y-1.5">
              <Badge variant="outline" className="text-xs">
                💡 Conseils
              </Badge>
              <ul className="space-y-1">
                {tips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {example && (
            <div className="space-y-1.5">
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                ✨ Exemple
              </Badge>
              <div className="p-2 bg-muted/50 rounded text-xs italic border border-muted">
                "{example}"
              </div>
            </div>
          )}

          {onMarkComplete && (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => {
                onMarkComplete();
                onClose();
              }}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              J'ai compris
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTooltip;
