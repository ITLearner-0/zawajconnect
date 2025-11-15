import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import {
  useAdminWaliAlerts,
  AdminWaliAlert,
  AlertsStatistics,
  AlertTrend,
} from '@/hooks/useAdminWaliAlerts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert, RefreshCw, ArrowLeft } from 'lucide-react';
import { AdminAlertsStatsCards } from '@/components/admin/wali-alerts/AdminAlertsStatsCards';
import { AdminAlertsTrendChart } from '@/components/admin/wali-alerts/AdminAlertsTrendChart';
import { AdminAlertsTable } from '@/components/admin/wali-alerts/AdminAlertsTable';

const AdminWaliAlertsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const { getAlerts, getStatistics, getTrends, loading } = useAdminWaliAlerts();

  const [alerts, setAlerts] = useState<AdminWaliAlert[]>([]);
  const [statistics, setStatistics] = useState<AlertsStatistics | null>(null);
  const [trends, setTrends] = useState<AlertTrend[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setRefreshing(true);
      const [alertsData, statsData, trendsData] = await Promise.all([
        getAlerts({ limit: 100 }),
        getStatistics(),
        getTrends(30),
      ]);

      setAlerts(alertsData);
      setStatistics(statsData);
      setTrends(trendsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id && !roleLoading && isAdmin) {
      loadData();
    }
  }, [user?.id, roleLoading, isAdmin]);

  if (roleLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Vous devez être administrateur pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alertes Wali</h1>
            <p className="text-muted-foreground">Gestion centralisée des alertes de sécurité</p>
          </div>
        </div>
        <Button onClick={loadData} disabled={refreshing || loading} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistics Cards */}
      <AdminAlertsStatsCards statistics={statistics} loading={loading} />

      {/* Trend Chart */}
      <AdminAlertsTrendChart trends={trends} loading={loading} />

      {/* Alerts Table */}
      <AdminAlertsTable alerts={alerts} loading={loading} onRefresh={loadData} />
    </div>
  );
};

export default AdminWaliAlertsPage;
