import { useState } from 'react';
import {
  Shield,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useWaliAdminPermissions } from '@/hooks/wali/useWaliAdminPermissions';
import { useWaliKPIs, KPIPeriod } from '@/hooks/wali/useWaliKPIs';
import { KPICard, PeriodSelector } from '@/components/wali/dashboard';
import { PermissionBadge } from '@/components/wali/permissions';
import { WaliAdminTabs } from '@/components/wali/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const AdminWaliDashboard = () => {
  const { user } = useAuth();
  const { permissions, loading: permissionsLoading } = useWaliAdminPermissions();
  const [period, setPeriod] = useState<KPIPeriod>('30days');
  const { kpis, loading, refetch } = useWaliKPIs(period);

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Chargement...</p>
      </div>
    );
  }

  if (!user || !permissions.canView) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const getPeriodLabel = () => {
    const labels: Record<KPIPeriod, string> = {
      '7days': '7 derniers jours',
      '30days': '30 derniers jours',
      '90days': '90 derniers jours',
      custom: 'Période personnalisée',
    };
    return labels[period];
  };

  const getTrend = (value: number): 'up' | 'down' | 'neutral' => {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  };

  return (
    <div className="container mx-auto py-8 space-y-6" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Dashboard Wali</h1>
                <PermissionBadge role={permissions.role} />
              </div>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Métriques et KPIs en temps réel avec comparaison
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <PeriodSelector value={period} onChange={setPeriod} />
            <Button onClick={refetch} disabled={loading} variant="outline" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)', borderRadius: 'var(--radius-md)' }}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <WaliAdminTabs />
      </div>

      <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--color-text-primary)' }}>Vue d'ensemble - {getPeriodLabel()}</CardTitle>
          <CardDescription style={{ color: 'var(--color-text-muted)' }}>Comparaison avec la période précédente</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : kpis ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Total Inscriptions"
                value={kpis.current.total_registrations}
                icon={Users}
                change={kpis.comparison.registrations_change}
                changeLabel="vs période précédente"
                trend={getTrend(kpis.comparison.registrations_change)}
              />

              <KPICard
                title="Taux d'Approbation"
                value={kpis.current.approval_rate}
                icon={CheckCircle}
                isPercentage
                change={kpis.comparison.approval_rate_change}
                changeLabel="vs période précédente"
                trend={getTrend(kpis.comparison.approval_rate_change)}
              />

              <KPICard
                title="Temps Moyen de Traitement"
                value={kpis.current.avg_processing_time_hours.toFixed(1)}
                subtitle="heures"
                icon={Clock}
                change={kpis.comparison.processing_time_change}
                changeLabel="vs période précédente"
                trend={getTrend(kpis.comparison.processing_time_change)}
                invertColors
              />

              <KPICard
                title="Alertes par Jour"
                value={kpis.current.alerts_per_day?.toFixed(1) || 0}
                icon={AlertTriangle}
                change={kpis.comparison.alerts_change}
                changeLabel="vs période précédente"
                trend={getTrend(kpis.comparison.alerts_change)}
                invertColors
              />

              <KPICard
                title="Inscriptions Approuvées"
                value={kpis.current.approved_count}
                subtitle={`${kpis.previous.approved_count} période précédente`}
                icon={CheckCircle}
                trend={
                  kpis.current.approved_count > kpis.previous.approved_count
                    ? 'up'
                    : kpis.current.approved_count < kpis.previous.approved_count
                      ? 'down'
                      : 'neutral'
                }
              />

              <KPICard
                title="Inscriptions Rejetées"
                value={kpis.current.rejected_count}
                subtitle={`${kpis.previous.rejected_count} période précédente`}
                icon={XCircle}
                trend={
                  kpis.current.rejected_count > kpis.previous.rejected_count
                    ? 'up'
                    : kpis.current.rejected_count < kpis.previous.rejected_count
                      ? 'down'
                      : 'neutral'
                }
                invertColors
              />

              <KPICard
                title="En Attente"
                value={kpis.current.pending_count || 0}
                subtitle="Inscriptions à traiter"
                icon={Clock}
              />

              <KPICard
                title="Alertes Critiques"
                value={kpis.current.critical_alerts}
                subtitle={`${kpis.current.total_alerts} alertes totales`}
                icon={AlertTriangle}
                trend={
                  kpis.current.critical_alerts > kpis.previous.critical_alerts
                    ? 'up'
                    : kpis.current.critical_alerts < kpis.previous.critical_alerts
                      ? 'down'
                      : 'neutral'
                }
                invertColors
              />
            </div>
          ) : (
            <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
              Aucune donnée disponible pour cette période
            </div>
          )}
        </CardContent>
      </Card>

      {kpis && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--color-text-primary)' }}>Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 mt-0.5" style={{ color: 'var(--color-success)' }} />
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Performance de Traitement</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {kpis.comparison.processing_time_change < 0
                      ? `Le temps de traitement s'est amélioré de ${Math.abs(kpis.comparison.processing_time_change).toFixed(1)}%`
                      : kpis.comparison.processing_time_change > 0
                        ? `Le temps de traitement a augmenté de ${kpis.comparison.processing_time_change.toFixed(1)}%`
                        : 'Le temps de traitement est stable'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Taux d'Approbation</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {kpis.current.approval_rate.toFixed(1)}% des inscriptions sont approuvées
                    {kpis.comparison.approval_rate_change !== 0 &&
                      ` (${kpis.comparison.approval_rate_change > 0 ? '+' : ''}${kpis.comparison.approval_rate_change.toFixed(1)}%)`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: 'var(--color-warning)' }} />
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Alertes de Sécurité</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {kpis.current.total_alerts} alertes détectées
                    {kpis.current.critical_alerts > 0 &&
                      ` dont ${kpis.current.critical_alerts} critiques`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--color-text-primary)' }}>Comparaison de Période</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Période actuelle</span>
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{getPeriodLabel()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Inscriptions</span>
                  <span className="text-sm font-bold">{kpis.current.total_registrations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Approuvées</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>
                    {kpis.current.approved_count}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Rejetées</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--color-danger)' }}>
                    {kpis.current.rejected_count}
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-2" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Période précédente</span>
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Comparaison</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Inscriptions</span>
                  <span className="text-sm font-bold">{kpis.previous.total_registrations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Approuvées</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>
                    {kpis.previous.approved_count}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Rejetées</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--color-danger)' }}>
                    {kpis.previous.rejected_count}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminWaliDashboard;
