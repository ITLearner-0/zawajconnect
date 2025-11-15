import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Shield,
  BookOpen,
  Settings,
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FamilyVerificationForm from './FamilyVerificationForm';
import OnboardingProgress from './OnboardingProgress';
import DelegationManager from './DelegationManager';
import AdvancedFiltersConfig from './AdvancedFiltersConfig';

interface WaliDashboardStats {
  pendingVerifications: number;
  activeSupervisions: number;
  onboardingProgress: number;
  activeDelegations: number;
}

const WaliDashboard: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<WaliDashboardStats>({
    pendingVerifications: 0,
    activeSupervisions: 0,
    onboardingProgress: 0,
    activeDelegations: 0,
  });
  const [waliProfile, setWaliProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadWaliData();
  }, []);

  const loadWaliData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Charger le profil wali
      const { data: profile, error: profileError } = await (supabase as any)
        .from('wali_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading wali profile:', profileError);
        return;
      }

      setWaliProfile(profile);

      // Charger les statistiques
      const [verificationsResult, supervisionsResult, onboardingResult, delegationsResult] =
        await Promise.all([
          (supabase as any)
            .from('family_relationship_verifications')
            .select('id', { count: 'exact' })
            .eq('wali_id', (profile as any).id)
            .eq('verification_status', 'pending'),

          (supabase as any)
            .from('chat_requests')
            .select('id', { count: 'exact' })
            .eq('wali_id', (profile as any).user_id)
            .eq('status', 'approved'),

          (supabase as any)
            .from('wali_onboarding_progress')
            .select('status')
            .eq('wali_id', (profile as any).id),

          (supabase as any)
            .from('wali_delegations')
            .select('id', { count: 'exact' })
            .or(
              `primary_wali_id.eq.${(profile as any).id},delegate_wali_id.eq.${(profile as any).id}`
            )
            .eq('status', 'active'),
        ]);

      // Calculer le progrès de formation
      const onboardingData = onboardingResult.data || [];
      const completedModules = onboardingData.filter((p: any) => p.status === 'completed').length;
      const totalModules = Math.max(onboardingData.length, 5); // Au moins 5 modules
      const onboardingProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

      setStats({
        pendingVerifications: verificationsResult.count || 0,
        activeSupervisions: supervisionsResult.count || 0,
        onboardingProgress: Math.round(onboardingProgress),
        activeDelegations: delegationsResult.count || 0,
      });
    } catch (error) {
      console.error('Error loading wali data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du tableau de bord',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatusBadge = (isVerified: boolean) => {
    return isVerified ? (
      <Badge variant="default" className="bg-green-500">
        <CheckCircle className="h-3 w-3 mr-1" />
        Vérifié
      </Badge>
    ) : (
      <Badge variant="outline">
        <Clock className="h-3 w-3 mr-1" />
        En attente
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!waliProfile) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Profil wali non trouvé. Veuillez vous assurer que votre compte est correctement
            configuré.
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Tableau de Bord Wali
          </h1>
          <p className="text-muted-foreground">
            Bienvenue, {waliProfile.first_name} {waliProfile.last_name}
          </p>
        </div>
        {getVerificationStatusBadge(waliProfile.is_verified)}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vérifications</p>
                <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Supervisions</p>
                <p className="text-2xl font-bold">{stats.activeSupervisions}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Formation</p>
                <p className="text-2xl font-bold">{stats.onboardingProgress}%</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Délégations</p>
                <p className="text-2xl font-bold">{stats.activeDelegations}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="verification">Vérification</TabsTrigger>
          <TabsTrigger value="training">Formation</TabsTrigger>
          <TabsTrigger value="delegation">Délégation</TabsTrigger>
          <TabsTrigger value="filters">Filtres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.pendingVerifications > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Vous avez {stats.pendingVerifications} vérification(s) en attente
                      </AlertDescription>
                    </Alert>
                  )}
                  {stats.onboardingProgress < 100 && (
                    <Alert>
                      <BookOpen className="h-4 w-4" />
                      <AlertDescription>
                        Formation incomplète - {stats.onboardingProgress}% terminé
                      </AlertDescription>
                    </Alert>
                  )}
                  {stats.pendingVerifications === 0 && stats.onboardingProgress === 100 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>Tous les éléments sont à jour !</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Actions Rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('verification')}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Gérer les Vérifications
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('training')}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Continuer la Formation
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('delegation')}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Gérer les Délégations
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verification">
          <FamilyVerificationForm
            wali_id={waliProfile.id}
            managed_user_id={waliProfile.managed_users?.[0] || ''}
            onVerificationSubmitted={loadWaliData}
          />
        </TabsContent>

        <TabsContent value="training">
          <OnboardingProgress wali_id={waliProfile.id} onModuleComplete={loadWaliData} />
        </TabsContent>

        <TabsContent value="delegation">
          <DelegationManager
            wali_id={waliProfile.id}
            managed_users={waliProfile.managed_users || []}
          />
        </TabsContent>

        <TabsContent value="filters">
          <AdvancedFiltersConfig wali_id={waliProfile.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WaliDashboard;
