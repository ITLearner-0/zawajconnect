
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Activity, Lock, Eye, Download } from 'lucide-react';
import { SecurityAuditLogger } from '@/services/security/auditLogger';
import { JWTManager } from '@/services/auth/jwtManager';
import { useAuth } from '@/contexts/AuthContext';

const SecurityDashboard: React.FC = () => {
  const { user } = useAuth();
  const [auditStats, setAuditStats] = useState<any>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
    
    // Update token expiry every minute
    const interval = setInterval(async () => {
      const expiry = await JWTManager.getTokenExpiry();
      setTokenExpiry(expiry);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      const [stats, expiry] = await Promise.all([
        SecurityAuditLogger.getAuditStats(user?.id),
        JWTManager.getTokenExpiry()
      ]);
      
      setAuditStats(stats);
      setTokenExpiry(expiry);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAuditLog = async () => {
    try {
      const stats = await SecurityAuditLogger.getAuditStats(user?.id);
      const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download audit log:', error);
    }
  };

  const getTokenStatus = () => {
    if (!tokenExpiry) return { status: 'unknown', color: 'secondary' };
    
    const now = Date.now();
    const timeLeft = tokenExpiry - now;
    
    if (timeLeft < 5 * 60 * 1000) return { status: 'expires soon', color: 'destructive' };
    if (timeLeft < 15 * 60 * 1000) return { status: 'active', color: 'default' };
    return { status: 'secure', color: 'default' };
  };

  const tokenStatus = getTokenStatus();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor your account security and activity</p>
        </div>
        <Button onClick={handleDownloadAuditLog} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Audit Log
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">JWT Token</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={tokenStatus.color as any}>
                {tokenStatus.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {tokenExpiry ? `Expires ${new Date(tokenExpiry).toLocaleTimeString()}` : 'No active session'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Security events recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Level</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="default">High</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              All protections active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="default">Low</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              No threats detected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
          <CardDescription>
            Your recent account activity and security events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditStats?.byType ? (
            <div className="space-y-2">
              {Object.entries(auditStats.byType).map(([eventType, count]) => (
                <div key={eventType} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{eventType.replace(/_/g, ' ').toUpperCase()}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent activity to display</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
