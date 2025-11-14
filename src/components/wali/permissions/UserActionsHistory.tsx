import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface AdminAction {
  id: string;
  action_type: string;
  registration_id?: string;
  target_user_id?: string;
  action_details: any;
  old_values?: any;
  new_values?: any;
  created_at: string;
  success: boolean;
  error_message?: string;
}

interface UserActionsHistoryProps {
  actions: AdminAction[];
  loading?: boolean;
}

export const UserActionsHistory = ({ actions, loading }: UserActionsHistoryProps) => {
  const getActionLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      approve_registration: 'Approbation inscription',
      reject_registration: 'Rejet inscription',
      update_registration: 'Modification inscription',
      assign_permission: 'Attribution permission',
      revoke_permission: 'Révocation permission',
      update_notes: 'Mise à jour notes',
      view_registration: 'Consultation inscription',
    };
    return labels[actionType] || actionType;
  };

  const getActionBadge = (actionType: string, success: boolean) => {
    if (!success) return <Badge variant="destructive">Échec</Badge>;

    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      approve_registration: 'default',
      reject_registration: 'outline',
      update_registration: 'secondary',
      assign_permission: 'default',
      revoke_permission: 'outline',
    };
    return <Badge variant={variants[actionType] || 'outline'}>{getActionLabel(actionType)}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Historique des Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Historique des Actions
          </CardTitle>
          <CardDescription>Aucune action enregistrée pour cet administrateur</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Historique des Actions
        </CardTitle>
        <CardDescription>
          Toutes les actions effectuées par cet administrateur ({actions.length})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Cible</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Détails</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.map((action) => (
              <TableRow key={action.id}>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {format(new Date(action.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </div>
                </TableCell>
                <TableCell>
                  {getActionBadge(action.action_type, action.success)}
                </TableCell>
                <TableCell className="text-sm">
                  {action.registration_id && (
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span className="font-mono text-xs">
                        {action.registration_id.substring(0, 8)}...
                      </span>
                    </div>
                  )}
                  {action.target_user_id && (
                    <div className="text-xs text-muted-foreground">
                      User: {action.target_user_id.substring(0, 8)}...
                    </div>
                  )}
                  {!action.registration_id && !action.target_user_id && '-'}
                </TableCell>
                <TableCell>
                  {action.success ? (
                    <Badge variant="outline" className="text-green-600">Succès</Badge>
                  ) : (
                    <Badge variant="destructive">Échec</Badge>
                  )}
                </TableCell>
                <TableCell className="max-w-[300px]">
                  {action.error_message ? (
                    <p className="text-xs text-destructive truncate">{action.error_message}</p>
                  ) : action.action_details && typeof action.action_details === 'object' ? (
                    <p className="text-xs text-muted-foreground truncate">
                      {JSON.stringify(action.action_details).substring(0, 100)}...
                    </p>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
