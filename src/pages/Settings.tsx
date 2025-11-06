import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Users, 
  Bell, 
  User,
  LogOut,
  ArrowLeft,
  Crown
} from 'lucide-react';
import PrivacySettingsForm from '@/components/PrivacySettingsForm';
import FamilySupervisionPanel from '@/components/FamilySupervisionPanel';
import VerificationCenter from '@/components/VerificationCenter';
import NotificationSystem from '@/components/NotificationSystem';
import PremiumSubscription from '@/components/PremiumSubscription';
import IDVerificationSystem from '@/components/enhanced/IDVerificationSystem';
import PasswordSecurityPanel from '@/components/enhanced/PasswordSecurityPanel';
import SecurityAlertPanel from '@/components/security/SecurityAlertPanel';
import FamilyRateLimitIndicator from '@/components/security/FamilyRateLimitIndicator';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import { TestUserSelector } from '@/components/TestUserSelector';
import { Code } from 'lucide-react';

const Settings = () => {
  const { user, subscription, signOut } = useAuth();
  const navigate = useNavigate();
  const { securityStatus } = useSecurityMonitor();
  
  // Check for dev mode
  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';
  
  // Check for premium tab in URL params
  const urlParams = new URLSearchParams(window.location.search);
  const tabFromUrl = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'privacy');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        {/* Header avec meilleure disposition */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/enhanced-profile')}
                className="hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gérez vos préférences et votre compte
              </p>
            </div>
          </div>
        </div>

        {/* Main Content avec meilleure organisation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-2 border shadow-sm">
            <TabsList className={`grid w-full ${isDevMode ? 'grid-cols-3 lg:grid-cols-7' : 'grid-cols-3 lg:grid-cols-6'} gap-2 bg-transparent`}>
              <TabsTrigger 
                value="privacy" 
                className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Confidentialité</span>
              </TabsTrigger>
              <TabsTrigger 
                value="family" 
                className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Famille</span>
              </TabsTrigger>
              <TabsTrigger 
                value="verification" 
                className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Vérification</span>
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Sécurité</span>
              </TabsTrigger>
              <TabsTrigger 
                value="premium" 
                className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative"
              >
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Premium</span>
                {subscription.subscribed && (
                  <Badge className="absolute -top-1 -right-1 bg-emerald text-white text-xs px-1.5 py-0 h-4">
                    ✓
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              {isDevMode && (
                <TabsTrigger 
                  value="dev-tools" 
                  className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Code className="h-4 w-4" />
                  <span className="hidden sm:inline">Dev Tools</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Contenu des onglets */}
          <div className="mt-6">
            <TabsContent value="privacy" className="space-y-6">
              <Card className="p-6 shadow-sm">
                <PrivacySettingsForm />
              </Card>
            </TabsContent>

            <TabsContent value="family" className="space-y-6">
              <Card className="p-6 shadow-sm">
                <FamilySupervisionPanel />
              </Card>
            </TabsContent>

            <TabsContent value="verification" className="space-y-6">
              <IDVerificationSystem />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SecurityAlertPanel />
                <div className="space-y-6">
                  <FamilyRateLimitIndicator />
                  <Card className="p-6 shadow-sm">
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Sécurité du Mot de Passe
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                        <span className="text-sm font-medium">Force du mot de passe</span>
                        <Badge variant="outline" className="font-medium">
                          {securityStatus?.password_strength || 'Non évalué'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground px-3">
                        Dernière vérification: Récemment
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="premium" className="space-y-6">
              {subscription.subscribed && (
                <Card className="p-6 shadow-sm border-primary/20 bg-gradient-to-r from-primary/5 to-accent/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Crown className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Statut de l'abonnement</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Vous avez accès aux fonctionnalités premium
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald text-white px-4 py-1.5">
                      Actif
                    </Badge>
                  </div>
                </Card>
              )}
              <PremiumSubscription />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="p-6 shadow-sm">
                <NotificationSystem />
              </Card>
            </TabsContent>

            {isDevMode && (
              <TabsContent value="dev-tools" className="space-y-6">
                <TestUserSelector />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;