import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle, XCircle, Eye, MessageSquare, Settings, Bell, AlertCircle } from 'lucide-react';

interface AuditAction {
  id: string;
  action_type: string;
  created_at: string;
  success: boolean;
  action_details: any;
  supervised_user_id?: string;
}

interface WaliActivityListProps {
  auditLog: AuditAction[];
  loading?: boolean;
}

const actionTypeConfig: Record<string, { 
  label: string; 
  icon: any; 
  color: string;
  bgColor: string;
}> = {
  match_approved: { 
    label: 'Match approuvé', 
    icon: CheckCircle, 
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950'
  },
  match_rejected: { 
    label: 'Match rejeté', 
    icon: XCircle, 
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950'
  },
  profile_viewed: { 
    label: 'Profil consulté', 
    icon: Eye, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950'
  },
  match_needs_discussion: { 
    label: 'Discussion nécessaire', 
    icon: MessageSquare, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950'
  },
  settings_modified: { 
    label: 'Paramètres modifiés', 
    icon: Settings, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950'
  },
  invitation_sent: { 
    label: 'Invitation envoyée', 
    icon: Bell, 
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950'
  },
  permission_changed: { 
    label: 'Permissions modifiées', 
    icon: Settings, 
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950'
  }
};

export const WaliActivityList = ({ auditLog, loading }: WaliActivityListProps) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('7days');

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Historique des actions</CardTitle>
          <CardDescription>Liste détaillée de toutes vos actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrer les actions
  const filteredActions = auditLog.filter(action => {
    if (filterType !== 'all' && action.action_type !== filterType) {
      return false;
    }

    const actionDate = new Date(action.created_at);
    const now = new Date();
    
    switch (filterDate) {
      case '24h':
        return (now.getTime() - actionDate.getTime()) < 24 * 60 * 60 * 1000;
      case '7days':
        return (now.getTime() - actionDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
      case '30days':
        return (now.getTime() - actionDate.getTime()) < 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  });

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Historique des actions</CardTitle>
            <CardDescription>
              {filteredActions.length} action{filteredActions.length > 1 ? 's' : ''} enregistrée{filteredActions.length > 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type d'action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                {Object.entries(actionTypeConfig).map(([type, config]) => (
                  <SelectItem key={type} value={type}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Dernières 24h</SelectItem>
                <SelectItem value="7days">7 derniers jours</SelectItem>
                <SelectItem value="30days">30 derniers jours</SelectItem>
                <SelectItem value="all">Tout</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {filteredActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune action trouvée</p>
              <p className="text-sm text-muted-foreground mt-2">
                Modifiez les filtres pour afficher plus d'actions
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActions.map((action) => {
                const config = actionTypeConfig[action.action_type] || {
                  label: action.action_type,
                  icon: AlertCircle,
                  color: 'text-gray-600',
                  bgColor: 'bg-gray-50 dark:bg-gray-950'
                };
                const Icon = config.icon;

                return (
                  <div 
                    key={action.id}
                    className={`flex gap-4 p-4 rounded-lg border ${config.bgColor} transition-colors hover:shadow-sm`}
                  >
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full bg-background flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{config.label}</p>
                        <Badge variant={action.success ? 'default' : 'destructive'} className="text-xs">
                          {action.success ? 'Succès' : 'Échec'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(action.created_at), 'PPp', { locale: fr })}
                      </p>
                      {action.action_details?.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          "{action.action_details.notes}"
                        </p>
                      )}
                      {action.action_details?.user2_name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Concernant: {action.action_details.user2_name}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
