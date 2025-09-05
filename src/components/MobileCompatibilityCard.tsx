import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Star, 
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

interface MobileCompatibilityCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
  description?: string;
  highlights?: string[];
  className?: string;
}

const MobileCompatibilityCard: React.FC<MobileCompatibilityCardProps> = ({
  title,
  score,
  icon,
  description,
  highlights = [],
  className = ""
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald";
    if (score >= 60) return "text-gold";
    return "text-muted-foreground";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald";
    if (score >= 60) return "bg-gold";
    return "bg-muted";
  };

  return (
    <Card className={`w-full card-hover animate-fade-in ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              {icon}
            </div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <div className={`text-lg font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Progress 
          value={score} 
          className="mb-3 h-2"
        />
        
        {description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>
        )}
        
        {highlights.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {highlights.slice(0, 2).map((highlight, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {highlight}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileCompatibilityCard;