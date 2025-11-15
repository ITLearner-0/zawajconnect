import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AuditLogEntry } from '@/hooks/wali/useWaliAuditTrail';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AuditLogTableProps {
  logs: AuditLogEntry[];
  loading: boolean;
}

const ACTION_LABELS: Record<string, string> = {
  registration_approved: 'Inscription approuvée',
  registration_rejected: 'Inscription rejetée',
  registration_viewed: 'Inscription consultée',
  notes_updated: 'Notes mises à jour',
  comment_added: 'Commentaire ajouté',
  comment_updated: 'Commentaire modifié',
  comment_deleted: 'Commentaire supprimé',
  permission_changed: 'Permission modifiée',
  filter_saved: 'Filtre sauvegardé',
};

const getActionLabel = (actionType: string) => {
  return ACTION_LABELS[actionType] || actionType;
};

const AuditLogRow = ({ log }: { log: AuditLogEntry }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="w-10">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </TableCell>
        <TableCell>
          {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
        </TableCell>
        <TableCell className="font-medium">{log.admin_name || 'Système'}</TableCell>
        <TableCell>
          <Badge variant="outline">{getActionLabel(log.action_type)}</Badge>
        </TableCell>
        <TableCell>{log.registration_name || '-'}</TableCell>
        <TableCell>
          {log.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
        </TableCell>
      </TableRow>
      <CollapsibleContent asChild>
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/30 p-4">
            <div className="space-y-3">
              {/* Action Details */}
              {log.action_details && Object.keys(log.action_details).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Détails de l'action</h4>
                  <pre className="text-xs bg-background p-2 rounded border overflow-auto">
                    {JSON.stringify(log.action_details, null, 2)}
                  </pre>
                </div>
              )}

              {/* Old/New Values */}
              {(log.old_values || log.new_values) && (
                <div className="grid grid-cols-2 gap-4">
                  {log.old_values && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Anciennes valeurs</h4>
                      <pre className="text-xs bg-background p-2 rounded border overflow-auto">
                        {JSON.stringify(log.old_values, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.new_values && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Nouvelles valeurs</h4>
                      <pre className="text-xs bg-background p-2 rounded border overflow-auto">
                        {JSON.stringify(log.new_values, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {log.error_message && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Message d'erreur
                  </h4>
                  <p className="text-sm text-destructive">{log.error_message}</p>
                </div>
              )}

              {/* Technical Info */}
              <div className="flex gap-4 text-xs text-muted-foreground">
                {log.ip_address && <span>IP: {log.ip_address}</span>}
                {log.user_agent && (
                  <span className="truncate max-w-md">User Agent: {log.user_agent}</span>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const AuditLogTable = ({ logs, loading }: AuditLogTableProps) => {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Aucun log d'audit trouvé</p>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Date & Heure</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Inscription</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <AuditLogRow key={log.id} log={log} />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
