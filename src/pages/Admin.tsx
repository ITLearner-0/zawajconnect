import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminDashboard from '@/components/AdminDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    checkAdminStatus();
  }, [user, navigate]);

  const checkAdminStatus = async () => {
    try {
      // For demo purposes, check if user email contains 'admin'
      // In production, you would have a proper user_roles system
      const isAdminUser = user?.email?.includes('admin') || false;
      
      setIsAdmin(!!isAdminUser);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-emerald border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Vérification des permissions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Accès Refusé</h2>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              Cette section est réservée aux administrateurs.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Si vous pensez qu'il s'agit d'une erreur, contactez l'équipe de support.</p>
              <p className="text-gold">Pour la démo: utilisez un email contenant 'admin'</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
      <AdminDashboard />
    </div>
  );
};

export default Admin;