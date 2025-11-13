import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { WaliAlert } from '@/hooks/wali/useWaliMonitoring';

interface AlertDetailsDialogProps {
  alert: WaliAlert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export const AlertDetailsDialog = ({ alert, open, onOpenChange }: AlertDetailsDialogProps) => {
  if (!alert) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails de l'alerte</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={getRiskColor(alert.risk_level)}>
              {alert.risk_level.toUpperCase()}
            </Badge>
            {alert.acknowledged && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                ✓ Confirmée
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Type d'alerte</h3>
            <p className="text-sm">{alert.alert_type}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground">{alert.description}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold">Informations temporelles</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Créée le:</span>
                <p>
                  {format(new Date(alert.created_at), 'PPP à HH:mm', { locale: fr })}
                </p>
              </div>
              {alert.acknowledged_at && (
                <div>
                  <span className="text-muted-foreground">Confirmée le:</span>
                  <p>
                    {format(new Date(alert.acknowledged_at), 'PPP à HH:mm', {
                      locale: fr,
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {alert.metadata && Object.keys(alert.metadata).length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">Métadonnées</h3>
                <div className="bg-muted p-3 rounded-lg">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(alert.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
