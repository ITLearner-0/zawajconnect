import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WaliSuspension } from '@/hooks/wali/useWaliSuspensions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';

interface SuspensionListProps {
  suspensions: WaliSuspension[];
  onLift: (suspensionId: string) => void;
  canManage?: boolean;
}

export const SuspensionList = ({ suspensions, onLift, canManage = false }: SuspensionListProps) => {
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'permanent':
        return <Shield className="h-4 w-4" />;
      case 'temporary':
        return <Clock className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'permanent':
        return 'Permanente';
      case 'temporary':
        return 'Temporaire';
      case 'warning':
        return 'Avertissement';
      default:
        return type;
    }
  };

  if (suspensions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
          <p>Aucune suspension active</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {suspensions.map((suspension) => (
        <Card key={suspension.id} className={suspension.is_active ? 'border-destructive' : ''}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getTypeIcon(suspension.suspension_type)}
                  <CardTitle className="text-lg">
                    {getTypeLabel(suspension.suspension_type)}
                  </CardTitle>
                  {suspension.is_active && (
                    <Badge variant="destructive">Active</Badge>
                  )}
                  {!suspension.is_active && suspension.lifted_at && (
                    <Badge variant="secondary">Levée</Badge>
                  )}
                </div>
                {suspension.severity_level && (
                  <Badge variant={getSeverityColor(suspension.severity_level)}>
                    {suspension.severity_level.toUpperCase()}
                  </Badge>
                )}
              </div>
              {canManage && suspension.is_active && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onLift(suspension.id)}
                >
                  Lever la suspension
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Raison :</p>
              <p className="text-sm text-muted-foreground">{suspension.reason}</p>
            </div>

            {suspension.notes && (
              <div>
                <p className="text-sm font-medium mb-1">Notes :</p>
                <p className="text-sm text-muted-foreground">{suspension.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Suspendu le :</p>
                <p className="text-muted-foreground">
                  {format(new Date(suspension.suspended_at), 'PPp', { locale: fr })}
                </p>
              </div>

              {suspension.expires_at && (
                <div>
                  <p className="font-medium">Expire le :</p>
                  <p className="text-muted-foreground">
                    {format(new Date(suspension.expires_at), 'PPp', { locale: fr })}
                  </p>
                </div>
              )}

              {suspension.lifted_at && (
                <div>
                  <p className="font-medium">Levée le :</p>
                  <p className="text-muted-foreground">
                    {format(new Date(suspension.lifted_at), 'PPp', { locale: fr })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
