import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface RateLimitData {
  action_type: string;
  action_count: number;
  window_start: string;
}

interface WaliRateLimitIndicatorsProps {
  rateLimits: RateLimitData[];
  loading?: boolean;
}

const RATE_LIMITS = {
  match_approval: { limit: 20, label: 'Approbations de matches', windowHours: 24 },
  profile_view: { limit: 50, label: 'Vues de profils', windowHours: 1 },
  settings_modification: { limit: 10, label: 'Modifications de paramètres', windowHours: 1 },
  notification_send: { limit: 30, label: 'Envois de notifications', windowHours: 24 }
};

export const WaliRateLimitIndicators = ({ rateLimits, loading }: WaliRateLimitIndicatorsProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Limites d'utilisation</CardTitle>
          <CardDescription>État actuel de vos limites d'actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-2 w-full bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const limitsMap = rateLimits.reduce((acc, limit) => {
    acc[limit.action_type] = limit;
    return acc;
  }, {} as Record<string, RateLimitData>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Limites d'utilisation</CardTitle>
        <CardDescription>État actuel de vos limites d'actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(RATE_LIMITS).map(([actionType, config]) => {
          const current = limitsMap[actionType]?.action_count || 0;
          const percentage = (current / config.limit) * 100;
          const isNearLimit = percentage >= 80;
          const isAtLimit = percentage >= 100;

          return (
            <div key={actionType} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{config.label}</span>
                  {isAtLimit ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : isNearLimit ? (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {current} / {config.limit}
                </span>
              </div>
              <Progress 
                value={Math.min(percentage, 100)} 
                className={`h-2 ${
                  isAtLimit 
                    ? '[&>div]:bg-destructive' 
                    : isNearLimit 
                    ? '[&>div]:bg-orange-500' 
                    : '[&>div]:bg-green-500'
                }`}
              />
              <p className="text-xs text-muted-foreground">
                Limite par {config.windowHours === 1 ? 'heure' : '24h'}
                {isAtLimit && ' - Limite atteinte'}
                {isNearLimit && !isAtLimit && ' - Attention: proche de la limite'}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
