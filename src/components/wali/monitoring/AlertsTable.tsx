import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { WaliAlert } from '@/hooks/wali/useWaliMonitoring';

interface AlertsTableProps {
  alerts: WaliAlert[];
  onAcknowledge: (alertId: string) => void;
  onViewDetails: (alert: WaliAlert) => void;
}

const getRiskColor = (level: string) => {
  switch (level) {
    case 'critical':
      return 'bg-destructive text-destructive-foreground';
    case 'high':
      return 'bg-orange-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-white';
    case 'low':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

const getRiskLabel = (level: string) => {
  switch (level) {
    case 'critical':
      return 'Critique';
    case 'high':
      return 'Élevé';
    case 'medium':
      return 'Moyen';
    case 'low':
      return 'Faible';
    default:
      return level;
  }
};

export const AlertsTable = ({ alerts, onAcknowledge, onViewDetails }: AlertsTableProps) => {
  if (alerts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-muted-foreground">Aucune alerte à signaler</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card key={alert.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-1" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getRiskColor(alert.risk_level)}>
                    {getRiskLabel(alert.risk_level)}
                  </Badge>
                  <span className="text-sm font-medium">{alert.alert_type}</span>
                  {alert.acknowledged && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ✓ Confirmée
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    {formatDistanceToNow(new Date(alert.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                  {alert.metadata?.action_count && (
                    <span>Actions: {alert.metadata.action_count}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails(alert)}
              >
                Détails
              </Button>
              {!alert.acknowledged && (
                <Button
                  size="sm"
                  onClick={() => onAcknowledge(alert.id)}
                >
                  Confirmer
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
