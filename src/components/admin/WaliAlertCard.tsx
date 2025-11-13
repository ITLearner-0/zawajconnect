import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminWaliAlert } from '@/hooks/useAdminWaliAlerts';
import { CheckCircle, Ban, Mail, Clock, User, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WaliAlertCardProps {
  alert: AdminWaliAlert;
  onAcknowledge: (alertId: string) => void;
  onSuspend: (alertId: string, waliUserId: string) => void;
  onContact: (alert: AdminWaliAlert) => void;
}

const getRiskLevelConfig = (level: string) => {
  switch (level) {
    case 'critical':
      return {
        variant: 'destructive' as const,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        label: 'Critique',
        icon: AlertTriangle
      };
    case 'high':
      return {
        variant: 'destructive' as const,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        label: 'Élevé',
        icon: AlertTriangle
      };
    case 'medium':
      return {
        variant: 'default' as const,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        label: 'Moyen',
        icon: AlertTriangle
      };
    case 'low':
      return {
        variant: 'secondary' as const,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        label: 'Faible',
        icon: AlertTriangle
      };
    default:
      return {
        variant: 'outline' as const,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        label: level,
        icon: AlertTriangle
      };
  }
};

const WaliAlertCard: React.FC<WaliAlertCardProps> = ({ 
  alert, 
  onAcknowledge, 
  onSuspend, 
  onContact 
}) => {
  const riskConfig = getRiskLevelConfig(alert.risk_level);
  const RiskIcon = riskConfig.icon;

  return (
    <Card className={`transition-all hover:shadow-lg ${alert.acknowledged ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${riskConfig.bgColor}`}>
              <RiskIcon className={`h-5 w-5 ${riskConfig.color}`} />
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={riskConfig.variant}>
                  {riskConfig.label}
                </Badge>
                <Badge variant="outline">
                  {alert.alert_type}
                </Badge>
                {alert.acknowledged && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Traité
                  </Badge>
                )}
              </div>
              
              <h3 className="font-semibold text-foreground text-lg">
                {alert.pattern_detected}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>
                    {alert.wali_profile?.first_name} {alert.wali_profile?.last_name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatDistanceToNow(new Date(alert.created_at), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Details */}
        {alert.details && Object.keys(alert.details).length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-foreground mb-2">Détails:</p>
            <div className="text-sm text-muted-foreground space-y-1">
              {Object.entries(alert.details).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acknowledged Info */}
        {alert.acknowledged && alert.acknowledged_at && (
          <div className="bg-secondary/50 rounded-lg p-3 mb-4">
            <p className="text-sm text-muted-foreground">
              Traité {formatDistanceToNow(new Date(alert.acknowledged_at), { 
                addSuffix: true, 
                locale: fr 
              })}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        {!alert.acknowledged && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="default"
              onClick={() => onAcknowledge(alert.id)}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Traiter
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onSuspend(alert.id, alert.wali_user_id)}
              className="gap-2"
            >
              <Ban className="h-4 w-4" />
              Suspendre
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onContact(alert)}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Contacter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WaliAlertCard;
