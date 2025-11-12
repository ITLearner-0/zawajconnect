import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Heart, Sparkles } from 'lucide-react';

interface MatchingScoreDisplayProps {
  islamicScore: number;
  culturalScore: number;
  personalityScore: number;
  overallScore: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const MatchingScoreDisplay = ({
  islamicScore,
  culturalScore,
  personalityScore,
  overallScore,
  showLabels = true,
  size = 'md',
}: MatchingScoreDisplayProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-success';
    if (score >= 75) return 'text-warning';
    if (score >= 65) return 'text-primary';
    return 'text-muted-foreground';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-success/10 text-success border-success/20';
    if (score >= 75) return 'bg-warning/10 text-warning border-warning/20';
    if (score >= 65) return 'bg-primary/10 text-primary border-primary/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  const sizeClasses = {
    sm: {
      progress: 'h-1',
      text: 'text-xs',
      icon: 'h-3 w-3',
      badge: 'text-xs',
    },
    md: {
      progress: 'h-2',
      text: 'text-sm',
      icon: 'h-4 w-4',
      badge: 'text-sm',
    },
    lg: {
      progress: 'h-3',
      text: 'text-base',
      icon: 'h-5 w-5',
      badge: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className="space-y-3">
      {/* Overall Score */}
      <div className="text-center">
        <Badge className={`${getScoreBadgeColor(overallScore)} ${classes.badge} font-semibold`}>
          <Sparkles className={`${classes.icon} mr-1`} />
          {overallScore}% compatible
        </Badge>
      </div>

      {/* Individual Scores */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div
            className={`flex items-center justify-center gap-1 mb-1 ${getScoreColor(islamicScore)}`}
          >
            <Shield className={classes.icon} />
            {showLabels && <span className={`font-medium ${classes.text}`}>Islamique</span>}
          </div>
          <Progress value={islamicScore} className={classes.progress} />
          <span className={`${classes.text} ${getScoreColor(islamicScore)} font-semibold`}>
            {islamicScore}%
          </span>
        </div>

        <div className="text-center">
          <div
            className={`flex items-center justify-center gap-1 mb-1 ${getScoreColor(culturalScore)}`}
          >
            <Users className={classes.icon} />
            {showLabels && <span className={`font-medium ${classes.text}`}>Culturel</span>}
          </div>
          <Progress value={culturalScore} className={classes.progress} />
          <span className={`${classes.text} ${getScoreColor(culturalScore)} font-semibold`}>
            {culturalScore}%
          </span>
        </div>

        <div className="text-center">
          <div
            className={`flex items-center justify-center gap-1 mb-1 ${getScoreColor(personalityScore)}`}
          >
            <Heart className={classes.icon} />
            {showLabels && <span className={`font-medium ${classes.text}`}>Personnalité</span>}
          </div>
          <Progress value={personalityScore} className={classes.progress} />
          <span className={`${classes.text} ${getScoreColor(personalityScore)} font-semibold`}>
            {personalityScore}%
          </span>
        </div>
      </div>
    </div>
  );
};
