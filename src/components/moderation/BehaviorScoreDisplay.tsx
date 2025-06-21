
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  MessageCircle, 
  Heart, 
  CheckCircle, 
  UserCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { BehaviorScore, BehaviorPattern } from '@/services/moderation/behaviorAnalyzer';

interface BehaviorScoreDisplayProps {
  behaviorScore: BehaviorScore;
  showDetails?: boolean;
  className?: string;
}

const BehaviorScoreDisplay: React.FC<BehaviorScoreDisplayProps> = ({
  behaviorScore,
  showDetails = false,
  className = ''
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Bon';
    if (score >= 60) return 'Moyen';
    return 'Préoccupant';
  };

  const getPatternSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPatternIcon = (type: BehaviorPattern['type']) => {
    switch (type) {
      case 'rapid_messaging': return <MessageCircle className="h-4 w-4" />;
      case 'inappropriate_content': return <AlertTriangle className="h-4 w-4" />;
      case 'harassment': return <Shield className="h-4 w-4" />;
      case 'spam': return <Info className="h-4 w-4" />;
      case 'suspicious_requests': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Score Comportemental
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${getScoreColor(behaviorScore.overall)}`}>
            {behaviorScore.overall}/100
          </div>
          <div className="text-sm text-muted-foreground">
            {getScoreLabel(behaviorScore.overall)}
          </div>
          <Progress 
            value={behaviorScore.overall} 
            className="mt-2"
          />
        </div>

        {/* Component Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Communication</span>
            </div>
            <Progress value={behaviorScore.communication} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {behaviorScore.communication}/100
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Respect</span>
            </div>
            <Progress value={behaviorScore.respect} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {behaviorScore.respect}/100
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Conformité</span>
            </div>
            <Progress value={behaviorScore.compliance} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {behaviorScore.compliance}/100
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Confiance</span>
            </div>
            <Progress value={behaviorScore.trustworthiness} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {behaviorScore.trustworthiness}/100
            </div>
          </div>
        </div>

        {/* Behavior Patterns */}
        {behaviorScore.patterns.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Comportements Détectés</h4>
            {behaviorScore.patterns.map((pattern, index) => (
              <Alert key={index} className="py-2">
                <div className="flex items-start gap-3">
                  {getPatternIcon(pattern.type)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{pattern.description}</span>
                      <Badge 
                        variant="outline" 
                        className={getPatternSeverityColor(pattern.severity)}
                      >
                        {pattern.severity}
                      </Badge>
                    </div>
                    <AlertDescription className="text-xs">
                      Conf. {Math.round(pattern.confidence * 100)}%
                    </AlertDescription>
                    {showDetails && pattern.evidence.length > 0 && (
                      <div className="mt-2">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">
                            Voir les preuves ({pattern.evidence.length})
                          </summary>
                          <ul className="mt-1 space-y-1 pl-4">
                            {pattern.evidence.map((evidence, idx) => (
                              <li key={idx} className="text-muted-foreground">
                                • {evidence}
                              </li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {behaviorScore.overall < 80 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {behaviorScore.overall < 60 
                ? "Score préoccupant. Une révision par un modérateur est recommandée."
                : "Score en dessous de la moyenne. Surveillez les interactions futures."
              }
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default BehaviorScoreDisplay;
