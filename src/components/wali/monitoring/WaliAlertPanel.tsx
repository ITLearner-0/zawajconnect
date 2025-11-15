import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWaliSuspiciousActivity, SuspiciousPattern } from '@/hooks/useWaliSuspiciousActivity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  ShieldAlert,
  Eye,
  XCircle,
  TrendingUp,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const severityConfig = {
  low: {
    label: 'Faible',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: Eye,
    iconColor: 'text-blue-600',
  },
  medium: {
    label: 'Moyen',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
  },
  high: {
    label: 'Élevé',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    icon: AlertTriangle,
    iconColor: 'text-orange-600',
  },
  critical: {
    label: 'Critique',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: ShieldAlert,
    iconColor: 'text-red-600',
  },
};

const patternTypeConfig = {
  consecutive_rejections: {
    label: 'Rejets consécutifs',
    icon: XCircle,
    description: 'Plusieurs rejets de matches consécutifs détectés',
  },
  repeated_views: {
    label: 'Vues répétées',
    icon: Eye,
    description: 'Accès répétés au même profil dans un court laps de temps',
  },
  rate_limit_exceeded: {
    label: 'Limite dépassée',
    icon: TrendingUp,
    description: "Tentative de dépassement des limites d'utilisation",
  },
};

export const WaliAlertPanel = () => {
  const { user } = useAuth();
  const { analyzeActivity, getWaliAlerts, patterns, checking } = useWaliSuspiciousActivity();

  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const loadAlerts = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const alertsData = await getWaliAlerts(user.id);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (!user?.id) return;

    try {
      setAnalyzing(true);
      await analyzeActivity(user.id);
      await loadAlerts();
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadAlerts();
      runAnalysis();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertes de Sécurité</CardTitle>
          <CardDescription>Détection automatique de comportements suspects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalPatterns = patterns.filter((p) => p.severity === 'critical');
  const highPatterns = patterns.filter((p) => p.severity === 'high');
  const hasWarnings = criticalPatterns.length > 0 || highPatterns.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {hasWarnings ? (
                <ShieldAlert className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              Alertes de Sécurité
            </CardTitle>
            <CardDescription>Détection automatique de comportements suspects</CardDescription>
          </div>
          <Button
            onClick={runAnalysis}
            disabled={analyzing || checking}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${analyzing || checking ? 'animate-spin' : ''}`} />
            Analyser
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Patterns actuels détectés */}
        {patterns.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Patterns détectés</h3>
            <div className="space-y-3">
              {patterns.map((pattern, index) => {
                const config = severityConfig[pattern.severity];
                const typeConfig = patternTypeConfig[pattern.type];
                const Icon = config.icon;
                const TypeIcon = typeConfig.icon;

                return (
                  <Alert key={index} className="relative">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <AlertTitle className="text-sm font-medium">
                            {typeConfig.label}
                          </AlertTitle>
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                        </div>
                        <AlertDescription className="text-xs">
                          {pattern.description}
                        </AlertDescription>
                        {pattern.count && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Occurrences: {pattern.count}
                          </p>
                        )}
                      </div>
                    </div>
                  </Alert>
                );
              })}
            </div>
          </div>
        )}

        {/* Historique des alertes */}
        {alerts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Historique des alertes</h3>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const config = severityConfig[alert.risk_level as keyof typeof severityConfig];
                  const typeConfig =
                    patternTypeConfig[alert.alert_type as keyof typeof patternTypeConfig];
                  const Icon = config?.icon || AlertTriangle;

                  return (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${
                        alert.acknowledged ? 'bg-muted/50 opacity-60' : 'bg-background'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          className={`h-4 w-4 ${config?.iconColor || 'text-orange-600'} flex-shrink-0 mt-0.5`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">
                              {typeConfig?.label || alert.alert_type}
                            </p>
                            <Badge variant="outline" className={config?.color}>
                              {config?.label || alert.risk_level}
                            </Badge>
                            {alert.acknowledged && (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Traité
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {alert.pattern_detected}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(alert.created_at), 'PPp', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Aucune alerte */}
        {patterns.length === 0 && alerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Aucune alerte active</p>
            <p className="text-xs text-muted-foreground">Aucun comportement suspect détecté</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
