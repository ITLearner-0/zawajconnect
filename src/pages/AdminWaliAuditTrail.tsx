import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWaliAuditTrail, AuditFilters as AuditFiltersType } from '@/hooks/wali/useWaliAuditTrail';
import { AuditFilters, AuditLogTable } from '@/components/wali/audit';
import { PermissionBadge } from '@/components/wali/permissions';
import { WaliAdminTabs } from '@/components/wali/navigation';
import { useWaliAdminPermissions } from '@/hooks/wali/useWaliAdminPermissions';
import { toast } from 'sonner';

const AdminWaliAuditTrail = () => {
  const { permissions } = useWaliAdminPermissions();
  const [filters, setFilters] = useState<AuditFiltersType>({});
  const { logs, loading, refetch } = useWaliAuditTrail(filters);

  const handleExport = () => {
    // Create CSV content
    const headers = ['Date', 'Admin', 'Action', 'Inscription', 'Statut', 'Détails'];
    const rows = logs.map(log => [
      new Date(log.created_at).toLocaleString('fr-FR'),
      log.admin_name || 'Système',
      log.action_type,
      log.registration_name || '-',
      log.success ? 'Succès' : 'Échec',
      JSON.stringify(log.action_details)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Export réussi', {
      description: `${logs.length} entrées exportées`
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Journal d'audit
              <PermissionBadge role={permissions.role} />
            </h1>
            <p className="text-muted-foreground">
              Historique complet des actions administratives
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <WaliAdminTabs />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total d'entrées</p>
          <p className="text-2xl font-bold">{logs.length}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Actions réussies</p>
          <p className="text-2xl font-bold text-green-600">
            {logs.filter(log => log.success).length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Actions échouées</p>
          <p className="text-2xl font-bold text-destructive">
            {logs.filter(log => !log.success).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <AuditFilters filters={filters} onFiltersChange={setFilters} />

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={refetch} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
        <Button onClick={handleExport} disabled={logs.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Table */}
      <AuditLogTable logs={logs} loading={loading} />
    </div>
  );
};

export default AdminWaliAuditTrail;
