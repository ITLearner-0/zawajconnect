import { WaliPermissionAudit } from '@/hooks/wali/useWaliAdminPermissions';
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
import { History, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PermissionHistoryProps {
  history: WaliPermissionAudit[];
  loading?: boolean;
}

export const PermissionHistory = ({ history, loading }: PermissionHistoryProps) => {
  const getRoleBadge = (role: string | null) => {
    if (!role) return <Badge variant="outline">Aucun</Badge>;

    const variants: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
    > = {
      super_admin: { variant: 'destructive', label: 'Super Admin' },
      approver: { variant: 'default', label: 'Approbateur' },
      editor: { variant: 'secondary', label: 'Éditeur' },
      viewer: { variant: 'outline', label: 'Visualiseur' },
    };

    const config = variants[role] ?? { variant: 'outline' as const, label: 'Visualiseur' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getActionType = (oldRole: string | null, newRole: string | null) => {
    if (!oldRole && newRole) return 'Création';
    if (oldRole && !newRole) return 'Révocation';
    return 'Modification';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historique des Changements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historique des Changements
          </CardTitle>
          <CardDescription>Aucun changement de permission enregistré</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Historique des Changements
        </CardTitle>
        <CardDescription>Dernières modifications de permissions ({history.length})</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Changement</TableHead>
              <TableHead>Modifié par</TableHead>
              <TableHead>Raison</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell className="text-sm">
                  {format(new Date(audit.changed_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {audit.user_email || `User ${audit.user_id.substring(0, 8)}`}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getActionType(audit.old_role, audit.new_role)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(audit.old_role)}
                    {audit.old_role && audit.new_role && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    {audit.new_role && getRoleBadge(audit.new_role)}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {audit.changed_by_email || `Admin ${audit.changed_by.substring(0, 8)}`}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {audit.reason || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
