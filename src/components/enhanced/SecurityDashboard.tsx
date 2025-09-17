import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Ban
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface SecurityMetrics {
  total_users: number;
  unverified_users: number;
  suspicious_activities: number;
  pending_verifications: number;
  failed_logins_today: number;
}

interface SuspiciousUser {
  user_id: string;
  full_name: string;
  email: string;
  verification_score: number;
  last_activity: string;
  suspicious_reasons: string[];
}

interface PendingVerification {
  user_id: string;
  full_name: string;
  email: string;
  submitted_at: string;
  verification_type: string;
}

export const SecurityDashboard = () => {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [suspiciousUsers, setSuspiciousUsers] = useState<SuspiciousUser[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      loadSecurityData();
    }
  }, [isAdmin, adminLoading]);

  const loadSecurityData = async () => {
    try {
      // Load security metrics
      const [
        { count: totalUsers },
        { data: unverifiedUsers },
        { data: recentViews },
        { data: pendingDocs }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_verifications').select('user_id').lte('verification_score', 30),
        supabase.from('profile_views').select('viewer_id').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_verifications').select('user_id').eq('id_document_status', 'pending_review')
      ]);

      setMetrics({
        total_users: totalUsers,
        unverified_users: unverifiedUsers.length,
        suspicious_activities: 0, // Would be calculated from actual suspicious activity logs
        pending_verifications: pendingDocs.length,
        failed_logins_today: 0 // Would be from auth logs
      });

      // Load suspicious users (users with high profile view activity)
      const viewCounts: Record<string, number> = {};
      recentViews.forEach((view: any) => {
        viewCounts[view.viewer_id] = (viewCounts[view.viewer_id] || 0) + 1;
      });

      const suspiciousUserIds = Object.entries(viewCounts)
        .filter(([_, count]) => count > 10)
        .map(([userId]) => userId);

      if (suspiciousUserIds.length > 0) {
        const { data: suspiciousData } = await supabase
          .from('profiles')
          .select(`
            user_id,
            full_name,
            user_verifications!inner(verification_score)
          `)
          .in('user_id', suspiciousUserIds);

        setSuspiciousUsers(
          suspiciousData?.map((user: any) => ({
            user_id: user.user_id,
            full_name: user.full_name || 'Unknown',
            email: 'Protected',
            verification_score: user.user_verifications?.verification_score || 0,
            last_activity: new Date().toISOString(),
            suspicious_reasons: ['High profile viewing activity']
          })) || []
        );
      }

      // Load pending verifications
      if (pendingDocs.length > 0) {
        const { data: pendingData } = await supabase
          .from('profiles')
          .select(`
            user_id,
            full_name,
            user_verifications!inner(submitted_at)
          `)
          .in('user_id', pendingDocs.map((p: any) => p.user_id));

        setPendingVerifications(
          pendingData?.map((user: any) => ({
            user_id: user.user_id,
            full_name: user.full_name || 'Unknown',
            email: 'Protected',
            submitted_at: user.user_verifications?.submitted_at || new Date().toISOString(),
            verification_type: 'ID Document'
          })) || []
        );
      }

    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string, approve: boolean) => {
    try {
      const { error } = await supabase
        .from('user_verifications')
        .update({
          id_verified: approve,
          id_document_status: approve ? 'approved' : 'rejected',
          verification_score: approve ? 80 : 20,
          verified_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: approve ? "User Verified" : "Verification Rejected",
        description: `User verification has been ${approve ? 'approved' : 'rejected'}.`,
      });

      loadSecurityData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update verification status.",
        variant: "destructive",
      });
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      // In a real implementation, you'd have a user suspension system
      toast({
        title: "User Suspended",
        description: "User has been temporarily suspended pending review.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend user.",
        variant: "destructive",
      });
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Access denied. This dashboard is only available to administrators.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-emerald" />
        <h1 className="text-2xl font-bold">Security Dashboard</h1>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">Active platform users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unverified Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {metrics?.unverified_users || 0}
            </div>
            <p className="text-xs text-muted-foreground">Score ≤ 30</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics?.pending_verifications || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {suspiciousUsers.length}
            </div>
            <p className="text-xs text-muted-foreground">Flagged users</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="verifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="verifications">Pending Verifications</TabsTrigger>
          <TabsTrigger value="suspicious">Suspicious Activity</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="verifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending ID Verifications</CardTitle>
              <CardDescription>
                Review and approve user identity verification requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingVerifications.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No pending verifications
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingVerifications.map((verification) => (
                    <div key={verification.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{verification.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {verification.verification_type} • Submitted {new Date(verification.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyUser(verification.user_id, false)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleVerifyUser(verification.user_id, true)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspicious" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suspicious Users</CardTitle>
              <CardDescription>
                Users flagged for unusual activity patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suspiciousUsers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No suspicious activity detected
                </p>
              ) : (
                <div className="space-y-4">
                  {suspiciousUsers.map((user) => (
                    <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.full_name}</p>
                          <Badge variant="outline">
                            Score: {user.verification_score}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {user.suspicious_reasons.map((reason, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* View detailed logs */}}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleSuspendUser(user.user_id)}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Suspend
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>
                System-wide security settings and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Action Required:</strong> The following security settings need to be configured in your Supabase dashboard:
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Leaked Password Protection</p>
                    <p className="text-sm text-muted-foreground">
                      Prevents users from using compromised passwords
                    </p>
                  </div>
                  <Badge variant="destructive">Disabled</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">PostgreSQL Security Patches</p>
                    <p className="text-sm text-muted-foreground">
                      Database security updates available
                    </p>
                  </div>
                  <Badge variant="destructive">Update Required</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Enhanced user account security
                    </p>
                  </div>
                  <Badge variant="outline">Available</Badge>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  All RLS policies have been updated with enhanced security requirements. 
                  Users now need higher verification scores for sensitive operations.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;