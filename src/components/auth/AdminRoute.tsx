
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/auth/useUserRoles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Home } from 'lucide-react';

interface AdminRouteProps {
  children: ReactNode;
  requireModerator?: boolean;
}

const AdminRoute = ({ children, requireModerator = false }: AdminRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isModerator, hasAdminOrModerator, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();

  const loading = authLoading || rolesLoading;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You need to be logged in to access this page.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate('/auth')} className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sign In
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasRequiredAccess = requireModerator ? hasAdminOrModerator() : isAdmin();

  if (!hasRequiredAccess) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You don't have the required permissions to access this page.
              {requireModerator ? ' Moderator or Admin access required.' : ' Admin access required.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={() => navigate('/')} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
