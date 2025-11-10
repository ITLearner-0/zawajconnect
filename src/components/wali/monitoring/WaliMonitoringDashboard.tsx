import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useWaliAudit } from '@/hooks/useWaliAudit';
import { useWaliRateLimit } from '@/hooks/useWaliRateLimit';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShieldAlert, RefreshCw } from 'lucide-react';
import { WaliStatsCards } from './WaliStatsCards';
import { WaliActivityChart } from './WaliActivityChart';
import { WaliRateLimitIndicators } from './WaliRateLimitIndicators';
import { WaliActivityList } from './WaliActivityList';

export const WaliMonitoringDashboard = () => {
  const { user } = useAuth();
  const { isVerifiedWali, verificationScore, emailVerified, idVerified, loading: roleLoading } = useUserRole();
  const { getAuditLog, getActionStatistics } = useWaliAudit();
  const { getRateLimitStats } = useWaliRateLimit();

  const [statistics, setStatistics] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [rateLimits, setRateLimits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setRefreshing(true);
      const [stats, audit, limits] = await Promise.all([
        getActionStatistics(user.id),
        getAuditLog(user.id, 100),
        getRateLimitStats(user.id)
      ]);

      setStatistics(stats);
      setAuditLog(audit);
      setRateLimits(limits);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id && !roleLoading) {
      loadData();
    }
  }, [user?.id, roleLoading]);

  // Afficher un message si l'utilisateur n'est pas un Wali vérifié
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

  if (!isVerifiedWali) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Vous devez être un Wali vérifié pour accéder à ce dashboard.
            {!emailVerified && ' Votre email n\'est pas vérifié.'}
            {!idVerified && ' Votre identité n\'est pas vérifiée.'}
            {verificationScore < 85 && ` Score de vérification insuffisant (${verificationScore}/85).`}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Supervision</h1>
          <p className="text-muted-foreground">
            Monitoring de vos activités en tant que Wali
          </p>
        </div>
        <Button 
          onClick={loadData} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Warning si proche des limites */}
      {rateLimits.some(limit => {
        const config = {
          match_approval: 20,
          profile_view: 50,
          settings_modification: 10,
          notification_send: 30
        }[limit.action_type as string] || 100;
        return (limit.action_count / config) >= 0.8;
      }) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attention</AlertTitle>
          <AlertDescription>
            Vous approchez de certaines limites d'utilisation. Consultez les indicateurs ci-dessous pour plus de détails.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <WaliStatsCards statistics={statistics} loading={loading} />

      {/* Charts & Rate Limits */}
      <div className="grid gap-6 md:grid-cols-2">
        <WaliActivityChart auditLog={auditLog} loading={loading} />
        <WaliRateLimitIndicators rateLimits={rateLimits} loading={loading} />
      </div>

      {/* Activity List */}
      <WaliActivityList auditLog={auditLog} loading={loading} />
    </div>
  );
};
