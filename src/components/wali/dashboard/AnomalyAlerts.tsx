import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Anomaly } from '@/utils/analytics/predictiveAnalytics';
import { Badge } from '@/components/ui/badge';

interface AnomalyAlertsProps {
  anomalies: Anomaly[];
}

export const AnomalyAlerts: React.FC<AnomalyAlertsProps> = ({ anomalies }) => {
  if (anomalies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Alertes d'anomalies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Aucune anomalie détectée dans les données récentes
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Le système surveille automatiquement les variations inhabituelles
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeverityColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
    }
  };

  const getSeverityIcon = (deviation: number) => {
    if (deviation > 0) {
      return <TrendingUp className="h-4 w-4" />;
    }
    return <TrendingDown className="h-4 w-4" />;
  };

  // Sort by severity and date
  const sortedAnomalies = [...anomalies].sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[b.severity] - severityOrder[a.severity];
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Alertes d'anomalies détectées
          <Badge variant="destructive" className="ml-2">
            {anomalies.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedAnomalies.slice(0, 10).map((anomaly, index) => (
          <Alert key={index} variant={anomaly.severity === 'high' ? 'destructive' : 'default'}>
            <div className="flex items-start gap-3">
              {getSeverityIcon(anomaly.deviation)}
              <div className="flex-1">
                <AlertTitle className="flex items-center gap-2">
                  {anomaly.metric}
                  <Badge variant={getSeverityColor(anomaly.severity)}>
                    {anomaly.severity === 'high'
                      ? 'Critique'
                      : anomaly.severity === 'medium'
                        ? 'Modéré'
                        : 'Faible'}
                  </Badge>
                </AlertTitle>
                <AlertDescription className="mt-2 space-y-1">
                  <p>
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(anomaly.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p>
                    <span className="font-medium">Valeur observée:</span> {anomaly.value}
                  </p>
                  <p>
                    <span className="font-medium">Valeur attendue:</span> ~{anomaly.expected}
                  </p>
                  <p>
                    <span className="font-medium">Écart:</span>{' '}
                    <span className={anomaly.deviation > 0 ? 'text-green-600' : 'text-red-600'}>
                      {anomaly.deviation > 0 ? '+' : ''}
                      {anomaly.deviation}%
                    </span>
                  </p>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ))}

        {anomalies.length > 10 && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            +{anomalies.length - 10} anomalie(s) supplémentaire(s)
          </p>
        )}
      </CardContent>
    </Card>
  );
};
