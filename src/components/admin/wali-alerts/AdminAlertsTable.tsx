import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  Ban, 
  Mail, 
  FileText, 
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AdminWaliAlert, useAdminWaliAlerts } from '@/hooks/useAdminWaliAlerts';
import { useAuth } from '@/hooks/useAuth';

interface AdminAlertsTableProps {
  alerts: AdminWaliAlert[];
  loading?: boolean;
  onRefresh: () => void;
}

const severityConfig = {
  low: { label: 'Faible', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  medium: { label: 'Moyen', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  high: { label: 'Élevé', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  critical: { label: 'Critique', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
};

export const AdminAlertsTable = ({ alerts, loading, onRefresh }: AdminAlertsTableProps) => {
  const { user } = useAuth();
  const { acknowledgeAlert, suspendWali } = useAdminWaliAlerts();
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [selectedWali, setSelectedWali] = useState<AdminWaliAlert | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDays, setSuspendDays] = useState('30');

  const filteredAlerts = alerts.filter(alert => {
    if (filterRisk !== 'all' && alert.risk_level !== filterRisk) return false;
    if (filterStatus === 'unacknowledged' && alert.acknowledged) return false;
    if (filterStatus === 'acknowledged' && !alert.acknowledged) return false;
    return true;
  });

  const handleAcknowledge = async (alertId: string) => {
    if (!user?.id) return;
    const success = await acknowledgeAlert(alertId, user.id);
    if (success) onRefresh();
  };

  const handleSuspend = async () => {
    if (!user?.id || !selectedWali) return;
    
    const success = await suspendWali(
      selectedWali.wali_user_id,
      user.id,
      suspendReason,
      parseInt(suspendDays)
    );
    
    if (success) {
      setSuspendDialogOpen(false);
      setSelectedWali(null);
      setSuspendReason('');
      setSuspendDays('30');
      onRefresh();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertes Wali</CardTitle>
          <CardDescription>Gestion des alertes de sécurité</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alertes Wali</CardTitle>
              <CardDescription>
                {filteredAlerts.length} alerte{filteredAlerts.length > 1 ? 's' : ''} 
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                  <SelectItem value="high">Élevé</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="low">Faible</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="unacknowledged">Non traités</SelectItem>
                  <SelectItem value="acknowledged">Traités</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune alerte trouvée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => {
                  const config = severityConfig[alert.risk_level];
                  
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.acknowledged 
                          ? 'bg-muted/50 opacity-75' 
                          : 'bg-background'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={config.color}>
                              {config.label}
                            </Badge>
                            <Badge variant="outline">
                              {alert.alert_type.replace('_', ' ')}
                            </Badge>
                            {alert.acknowledged && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950">
                                Traité
                              </Badge>
                            )}
                          </div>
                          
                          <p className="font-medium mb-1">
                            {alert.wali_profile?.first_name} {alert.wali_profile?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground mb-1">
                            {alert.wali_profile?.email}
                          </p>
                          <p className="text-sm text-foreground mb-2">
                            {alert.pattern_detected}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(alert.created_at), 'PPp', { locale: fr })}
                          </p>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!alert.acknowledged && (
                              <DropdownMenuItem
                                onClick={() => handleAcknowledge(alert.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marquer comme traité
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedWali(alert);
                                setSuspendDialogOpen(true);
                              }}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Suspendre Wali
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Contacter Wali
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Générer rapport
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspendre le Wali</AlertDialogTitle>
            <AlertDialogDescription>
              Suspendre {selectedWali?.wali_profile?.first_name} {selectedWali?.wali_profile?.last_name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Raison de la suspension</Label>
              <Textarea
                id="reason"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Décrire la raison de la suspension..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Durée (jours)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="365"
                value={suspendDays}
                onChange={(e) => setSuspendDays(e.target.value)}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={!suspendReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Suspendre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};