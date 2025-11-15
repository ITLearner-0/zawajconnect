import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WaliAdminPermission } from '@/hooks/wali/useWaliAdminPermissions';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserDetailsCardProps {
  permission: WaliAdminPermission;
}

export const UserDetailsCard = ({ permission }: UserDetailsCardProps) => {
  const getRoleBadge = (role: string) => {
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

  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      super_admin: 'Tous les droits + gestion des permissions',
      approver: 'Peut approuver/rejeter les inscriptions',
      editor: 'Peut modifier les inscriptions',
      viewer: 'Lecture seule',
    };
    return descriptions[role] || '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Informations de l'Administrateur
        </CardTitle>
        <CardDescription>Détails du compte et permissions actuelles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Nom</span>
            </div>
            <p className="font-medium">{permission.user_name || 'Non défini'}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </div>
            <p className="font-medium">{permission.user_email || 'Non défini'}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Rôle actuel</span>
            </div>
            <div className="flex items-center gap-2">{getRoleBadge(permission.role)}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Permission assignée le</span>
            </div>
            <p className="font-medium">
              {format(new Date(permission.assigned_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Description du rôle</h4>
          <p className="text-sm text-muted-foreground">{getRoleDescription(permission.role)}</p>
        </div>

        {permission.notes && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Notes</h4>
            <p className="text-sm text-muted-foreground">{permission.notes}</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Identifiant système</h4>
          <p className="text-xs text-muted-foreground font-mono">{permission.user_id}</p>
        </div>
      </CardContent>
    </Card>
  );
};
