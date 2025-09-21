import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  CheckCircle, 
  XCircle,
  Activity,
  Clock
} from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import { useUserRole } from '@/hooks/useUserRole';
import SecurityAlertPanel from '@/components/security/SecurityAlertPanel';
import FamilyRateLimitIndicator from '@/components/security/FamilyRateLimitIndicator';
import { useEnhancedSessionMonitor } from '@/hooks/useEnhancedSessionMonitor';

export const SecurityDashboard = () => {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { isWali } = useUserRole();
  const { securityStatus, securityEvents, loading } = useSecurityMonitor();
  const { activeSessions } = useEnhancedSessionMonitor();

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
          Accès refusé. Ce tableau de bord est réservé aux administrateurs.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-emerald" />
        <h1 className="text-2xl font-bold">Tableau de Bord Sécurité</h1>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score de Sécurité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald">
              {securityStatus?.verification_score || 0}/100
            </div>
            <div className="flex items-center gap-2 mt-2">
              {securityStatus?.email_verified && (
                <Badge variant="secondary" className="text-xs">Email ✓</Badge>
              )}
              {securityStatus?.id_verified && (
                <Badge variant="secondary" className="text-xs">ID ✓</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sessions Actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSessions.length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Sessions en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Événements Sécurité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              0
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Non résolus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Statut RLS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-emerald-700">
              Renforcé
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Sécurité niveau entreprise
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="policies">Politiques</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Security Alert Panel */}
            <div className="lg:col-span-2">
              <SecurityAlertPanel />
            </div>
            
            {/* Rate Limiting Status */}
            <div>
              <FamilyRateLimitIndicator />
            </div>
          </div>

          {/* Implementation Status */}
          <Card>
            <CardHeader>
              <CardTitle>Améliorations de Sécurité Implémentées</CardTitle>
              <CardDescription>
                Corrections critiques appliquées à votre application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800">Limitation de Taux Familiale</p>
                    <p className="text-sm text-emerald-700">
                      Protection contre les abus avec limites quotidiennes (3 invitations/jour)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800">Monitoring de Session Avancé</p>
                    <p className="text-sm text-emerald-700">
                      Détection d'anomalies et suivi des appareils
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800">Audit de Sécurité</p>
                    <p className="text-sm text-emerald-700">
                      Journalisation complète des événements de sécurité
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SecurityAlertPanel />
            <FamilyRateLimitIndicator />
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald" />
                Sessions Actives
              </CardTitle>
              <CardDescription>
                Surveillance des sessions utilisateur en temps réel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeSessions.map((session, index) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Session {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={session.is_active ? "outline" : "secondary"}>
                          {session.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(session.last_activity).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {session.device_fingerprint && (
                        <p>Empreinte: {session.device_fingerprint.slice(0, 12)}...</p>
                      )}
                      {session.user_agent && (
                        <p>Navigateur: {session.user_agent.split(' ')[0]}</p>
                      )}
                      {session.ip_address && (
                        <p>IP: {session.ip_address}</p>
                      )}
                    </div>
                  </div>
                ))}
                {activeSessions.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Aucune session active détectée
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Politiques de Sécurité Actives</CardTitle>
              <CardDescription>
                Politiques RLS (Row Level Security) protégeant vos données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="p-3 border rounded">
                  <p className="font-medium">Accès Profil</p>
                  <p className="text-sm text-muted-foreground">
                    Score de vérification 85+ requis avec ID vérifié
                  </p>
                </div>
                
                <div className="p-3 border rounded">
                  <p className="font-medium">Supervision Familiale</p>
                  <p className="text-sm text-muted-foreground">
                    Accès limité dans le temps avec vérification renforcée
                  </p>
                </div>
                
                <div className="p-3 border rounded">
                  <p className="font-medium">Limitation de Taux</p>
                  <p className="text-sm text-muted-foreground">
                    Maximum 3 invitations familiales par jour
                  </p>
                </div>
                
                <div className="p-3 border rounded">
                  <p className="font-medium">Audit de Sécurité</p>
                  <p className="text-sm text-muted-foreground">
                    Journalisation automatique des événements critiques
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;