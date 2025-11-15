import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AdminDashboard from '@/components/AdminDashboard';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Crown } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      // Check user's role in the database using the same pattern as useIsAdmin
      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['super_admin', 'admin', 'moderator']);

      if (roleError) {
        console.error('Error checking user role:', roleError);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (roles && roles.length > 0 && roles[0]) {
        const role = roles[0].role ?? undefined;
        setUserRole(role);

        if (role && ['super_admin', 'admin', 'moderator'].includes(role)) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        // No role found - user should have 'user' role by default
        // Don't automatically grant admin privileges
        setUserRole('user');
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error in admin access check:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const setupFirstSuperAdmin = async () => {
    try {
      // Check if any super admin exists
      const { data: existingSuperAdmin, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'super_admin')
        .limit(1);

      if (checkError) {
        console.error('Error checking for existing super admin:', checkError);
        setIsAdmin(false);
        return;
      }

      // If no super admin exists, make current user super admin
      if (!existingSuperAdmin || existingSuperAdmin.length === 0) {
        const { error: insertError } = await supabase.from('user_roles').insert({
          user_id: user!.id,
          role: 'super_admin',
          assigned_by: user!.id,
        });

        if (insertError) {
          console.error('Error assigning super admin role:', insertError);
          setIsAdmin(false);
          return;
        }

        setUserRole('super_admin');
        setIsAdmin(true);

        toast({
          title: 'Super Admin créé!',
          description: 'Vous avez été désigné comme Super Administrateur du système.',
        });
      } else {
        setIsAdmin(false);
        toast({
          title: 'Accès refusé',
          description: "Vous n'avez pas les permissions d'administrateur",
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error in first super admin setup:', error);
      setIsAdmin(false);
    }
  };

  const grantSuperAdminAccess = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.from('user_roles').upsert({
        user_id: user.id,
        role: 'super_admin',
        assigned_by: user.id,
      });

      if (error) {
        console.error('Error granting super admin access:', error);
        toast({
          title: 'Erreur',
          description: "Impossible d'accorder les privilèges Super Admin",
          variant: 'destructive',
        });
        return;
      }

      setUserRole('super_admin');
      setIsAdmin(true);

      toast({
        title: 'Accès accordé!',
        description: 'Vous disposez maintenant de tous les privilèges Super Admin',
      });
    } catch (error) {
      console.error('Error granting super admin access:', error);
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'attribution des privilèges",
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Accès Administrateur Requis</CardTitle>
            <CardDescription>
              Vous devez être administrateur pour accéder à cette section.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>
                Si vous êtes le propriétaire de cette application, vous pouvez vous accorder les
                privilèges Super Admin.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={grantSuperAdminAccess} className="w-full" variant="default">
                <Crown className="h-4 w-4 mr-2" />
                Devenir Super Admin
              </Button>
              <Button
                onClick={() => navigate('/enhanced-profile')}
                variant="outline"
                className="w-full"
              >
                Retour au tableau de bord
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald to-gold flex items-center justify-center">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Administration</h1>
            <p className="text-muted-foreground">
              Rôle: <span className="font-medium capitalize">{userRole?.replace('_', ' ')}</span>
            </p>
          </div>
        </div>
      </div>
      <AdminDashboard userRole={userRole} />
    </div>
  );
};

export default Admin;
