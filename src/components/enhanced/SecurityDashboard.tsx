import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  CheckCircle, 
  XCircle
} from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export const SecurityDashboard = () => {
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  if (adminLoading) {
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

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              RLS Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="text-emerald-700 mb-2">✓ Enhanced security implemented</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Fixed conflicting family member policies</li>
                <li>• Enhanced verification requirements</li>
                <li>• Strengthened message security</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Password Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <Badge variant="destructive" className="mb-2">Action Required</Badge>
              <p className="text-xs text-muted-foreground">
                Leaked password protection needs to be enabled in Supabase dashboard
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Database Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <Badge variant="destructive" className="mb-2">Update Available</Badge>
              <p className="text-xs text-muted-foreground">
                PostgreSQL security patches available
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
          <TabsTrigger value="actions">Required Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Improvements Implemented</CardTitle>
              <CardDescription>
                Critical security fixes that have been applied to your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800">Family Member Access Control</p>
                    <p className="text-sm text-emerald-700">
                      Fixed conflicting RLS policies and implemented time-based access restrictions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800">Enhanced Verification Requirements</p>
                    <p className="text-sm text-emerald-700">
                      Users now need higher verification scores for sensitive operations
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800">Message Security</p>
                    <p className="text-sm text-emerald-700">
                      Strengthened message access policies with verification requirements
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800">Role Management</p>
                    <p className="text-sm text-emerald-700">
                      Cleaned up duplicate roles and added comprehensive audit logging
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Security Policies</CardTitle>
              <CardDescription>
                Current Row Level Security (RLS) policies protecting your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="p-3 border rounded">
                  <p className="font-medium">Profile Access</p>
                  <p className="text-sm text-muted-foreground">
                    Ultra-verified users only (Score 85+, ID verified)
                  </p>
                </div>
                
                <div className="p-3 border rounded">
                  <p className="font-medium">Family Supervision</p>
                  <p className="text-sm text-muted-foreground">
                    Time-restricted access with verification requirements
                  </p>
                </div>
                
                <div className="p-3 border rounded">
                  <p className="font-medium">Message Security</p>
                  <p className="text-sm text-muted-foreground">
                    Verified users only, with family oversight capabilities
                  </p>
                </div>
                
                <div className="p-3 border rounded">
                  <p className="font-medium">Admin Access</p>
                  <p className="text-sm text-muted-foreground">
                    Role-based with audit logging
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Required Manual Actions</CardTitle>
              <CardDescription>
                These security settings must be configured manually in your Supabase dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Critical:</strong> These actions are required to complete your security setup.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">1. Enable Leaked Password Protection</p>
                    <p className="text-sm text-muted-foreground">
                      Go to: Authentication → Settings → Password Protection
                    </p>
                  </div>
                  <Badge variant="destructive">Required</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">2. Upgrade PostgreSQL Version</p>
                    <p className="text-sm text-muted-foreground">
                      Go to: Settings → Infrastructure → Database
                    </p>
                  </div>
                  <Badge variant="destructive">Required</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">3. Review User Verification Backlog</p>
                    <p className="text-sm text-muted-foreground">
                      Check pending ID verification requests
                    </p>
                  </div>
                  <Badge variant="outline">Recommended</Badge>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Once these actions are completed, your application will have enterprise-grade security.
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