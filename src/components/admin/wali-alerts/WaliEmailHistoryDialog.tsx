import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  MousePointer
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  WaliEmailHistoryItem, 
  WaliEmailStats, 
  useWaliEmailHistory 
} from '@/hooks/useWaliEmailHistory';

interface WaliEmailHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waliUserId: string;
  waliName: string;
}

const emailTypeConfig = {
  contact: { label: 'Contact', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900' },
  suspension: { label: 'Suspension', color: 'bg-red-100 text-red-800 dark:bg-red-900' },
  warning: { label: 'Avertissement', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900' },
  reactivation: { label: 'Réactivation', color: 'bg-green-100 text-green-800 dark:bg-green-900' }
};

const deliveryStatusConfig = {
  pending: { label: 'En attente', icon: Clock, color: 'bg-gray-100 text-gray-800' },
  sent: { label: 'Envoyé', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
  delivered: { label: 'Délivré', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  failed: { label: 'Échec', icon: XCircle, color: 'bg-red-100 text-red-800' },
  bounced: { label: 'Rejeté', icon: XCircle, color: 'bg-red-100 text-red-800' }
};

export const WaliEmailHistoryDialog = ({
  open,
  onOpenChange,
  waliUserId,
  waliName
}: WaliEmailHistoryDialogProps) => {
  const { getEmailHistory, getEmailStats, loading } = useWaliEmailHistory();
  const [history, setHistory] = useState<WaliEmailHistoryItem[]>([]);
  const [stats, setStats] = useState<WaliEmailStats | null>(null);

  useEffect(() => {
    if (open && waliUserId) {
      loadData();
    }
  }, [open, waliUserId]);

  const loadData = async () => {
    const [historyData, statsData] = await Promise.all([
      getEmailHistory(waliUserId),
      getEmailStats(waliUserId)
    ]);
    setHistory(historyData);
    setStats(statsData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Historique des emails - {waliName}
          </DialogTitle>
          <DialogDescription>
            Tous les emails envoyés à ce Wali
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Statistiques */}
            {stats && (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground mb-1">Total</div>
                  <div className="text-2xl font-bold">{stats.total_emails}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground mb-1">Envoyés</div>
                  <div className="text-2xl font-bold text-blue-600">{stats.sent_count}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground mb-1">Délivrés</div>
                  <div className="text-2xl font-bold text-green-600">{stats.delivered_count}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground mb-1">Échecs</div>
                  <div className="text-2xl font-bold text-red-600">{stats.failed_count}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground mb-1">Ouverts</div>
                  <div className="text-2xl font-bold text-purple-600">{stats.opened_count}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground mb-1">Cliqués</div>
                  <div className="text-2xl font-bold text-orange-600">{stats.clicked_count}</div>
                </Card>
              </div>
            )}

            {/* Liste des emails */}
            <ScrollArea className="flex-1 pr-4">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun email envoyé à ce Wali</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((email) => {
                    const typeConfig = emailTypeConfig[email.email_type as keyof typeof emailTypeConfig];
                    const statusConfig = deliveryStatusConfig[email.delivery_status as keyof typeof deliveryStatusConfig];
                    const StatusIcon = statusConfig.icon;

                    return (
                      <Card key={email.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={typeConfig.color}>
                                {typeConfig.label}
                              </Badge>
                              <Badge variant="outline" className={statusConfig.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground text-right">
                              {format(new Date(email.sent_at), 'PPp', { locale: fr })}
                            </div>
                          </div>

                          <h4 className="font-semibold mb-2">{email.subject}</h4>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                            {email.message_content}
                          </p>

                          <Separator className="my-3" />

                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-muted-foreground">Envoyé par:</span>
                              <p className="font-medium">{email.sender_name}</p>
                            </div>
                            
                            {email.delivered_at && (
                              <div>
                                <span className="text-muted-foreground">Délivré:</span>
                                <p className="font-medium">
                                  {format(new Date(email.delivered_at), 'PPp', { locale: fr })}
                                </p>
                              </div>
                            )}

                            {email.opened_at && (
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Ouvert:</span>
                                <p className="font-medium">
                                  {format(new Date(email.opened_at), 'PPp', { locale: fr })}
                                </p>
                              </div>
                            )}

                            {email.clicked_at && (
                              <div className="flex items-center gap-1">
                                <MousePointer className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Cliqué:</span>
                                <p className="font-medium">
                                  {format(new Date(email.clicked_at), 'PPp', { locale: fr })}
                                </p>
                              </div>
                            )}
                          </div>

                          {email.error_message && (
                            <div className="mt-3 p-2 bg-destructive/10 rounded text-xs text-destructive">
                              <strong>Erreur:</strong> {email.error_message}
                            </div>
                          )}

                          {email.metadata?.suspension_duration_days && (
                            <div className="mt-3 p-2 bg-muted rounded text-xs">
                              <strong>Durée de suspension:</strong> {email.metadata.suspension_duration_days} jours
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
