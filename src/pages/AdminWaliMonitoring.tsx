import { useState, useEffect } from 'react';
import { Shield, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useWaliMonitoring, type WaliAlert } from '@/hooks/wali/useWaliMonitoring';
import { StatisticsCards } from '@/components/wali/monitoring/StatisticsCards';
import { AlertsTable } from '@/components/wali/monitoring/AlertsTable';
import { ActivityList } from '@/components/wali/monitoring/ActivityList';
import { SuspendWaliDialog } from '@/components/wali/monitoring/SuspendWaliDialog';
import { AlertDetailsDialog } from '@/components/wali/monitoring/AlertDetailsDialog';
import { ExportMenu } from '@/components/wali/admin/ExportMenu';
import {
  exportWaliAlertsToExcel,
  exportWaliAlertsToCSV,
  exportWaliActivitiesToExcel,
  exportComprehensiveWaliReport,
} from '@/utils/waliExport';
import { useWaliRegistrations } from '@/hooks/wali';

const AdminWaliMonitoring = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const {
    alerts,
    statistics,
    activities,
    loading,
    refetch,
    acknowledgeAlert,
    suspendWali,
  } = useWaliMonitoring();

  const [selectedAlert, setSelectedAlert] = useState<WaliAlert | null>(null);
  const [suspendDialog, setSuspendDialog] = useState<{
    open: boolean;
    userId: string;
    name: string;
  }>({ open: false, userId: '', name: '' });

  // Check admin access
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setIsAdmin(data?.role === 'admin' || data?.role === 'super_admin');
    };

    checkAdminStatus();
  }, [user]);

  if (isAdmin === null) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleAcknowledge = async (alertId: string) => {
    await acknowledgeAlert(alertId, user.id);
  };

  const handleSuspend = (userId: string, name: string) => {
    setSuspendDialog({ open: true, userId, name });
  };

  const handleConfirmSuspend = async (reason: string, durationDays: number) => {
    await suspendWali(suspendDialog.userId, user.id, reason, durationDays);
  };

  const { registrations } = useWaliRegistrations();

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter((a) => a.acknowledged);

  const handleExportComprehensive = () => {
    exportComprehensiveWaliReport(registrations, alerts, activities);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Monitoring des Walis</h1>
            <p className="text-muted-foreground">
              Surveillance des activités et alertes de sécurité
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportComprehensive} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Rapport Complet
          </Button>
          <Button onClick={refetch} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <StatisticsCards statistics={statistics} />

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">
            Alertes{' '}
            {unacknowledgedAlerts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {unacknowledgedAlerts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity">Activité des Walis</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Alertes Non Confirmées</h2>
            <ExportMenu
              onExportExcel={() => exportWaliAlertsToExcel(alerts)}
              onExportCSV={() => exportWaliAlertsToCSV(alerts)}
              label="Exporter Alertes"
            />
          </div>
          <AlertsTable
            alerts={unacknowledgedAlerts}
            onAcknowledge={handleAcknowledge}
            onViewDetails={setSelectedAlert}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Activité des Walis</h2>
            <Button
              variant="outline"
              onClick={() => exportWaliActivitiesToExcel(activities)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Exporter Activités
            </Button>
          </div>
          <ActivityList activities={activities} onSuspend={handleSuspend} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Alertes Confirmées</h2>
            <AlertsTable
              alerts={acknowledgedAlerts}
              onAcknowledge={handleAcknowledge}
              onViewDetails={setSelectedAlert}
            />
          </div>
        </TabsContent>
      </Tabs>

      <AlertDetailsDialog
        alert={selectedAlert}
        open={!!selectedAlert}
        onOpenChange={(open) => !open && setSelectedAlert(null)}
      />

      <SuspendWaliDialog
        open={suspendDialog.open}
        onOpenChange={(open) => setSuspendDialog({ ...suspendDialog, open })}
        waliUserId={suspendDialog.userId}
        waliName={suspendDialog.name}
        onConfirm={handleConfirmSuspend}
      />
    </div>
  );
};

export default AdminWaliMonitoring;
