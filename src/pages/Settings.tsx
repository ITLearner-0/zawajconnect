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
import IslamicCalendarWidget from '@/components/IslamicCalendarWidget';
import NotificationSystem from '@/components/NotificationSystem';
import PremiumSubscription from '@/components/PremiumSubscription';
import IDVerificationSystem from '@/components/enhanced/IDVerificationSystem';
import PasswordSecurityPanel from '@/components/enhanced/PasswordSecurityPanel';
import SecurityAlertPanel from '@/components/security/SecurityAlertPanel';
import FamilyRateLimitIndicator from '@/components/security/FamilyRateLimitIndicator';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';

const Settings = () => {
  const { user, subscription, signOut } = useAuth();
  const navigate = useNavigate();
  const { securityStatus } = useSecurityMonitor();
  
  // Check for premium tab in URL params
  const urlParams = new URLSearchParams(window.location.search);
  const tabFromUrl = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'privacy');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/enhanced-profile')}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 text-emerald" />
              <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Islamic Calendar Widget */}
          <div className="lg:col-span-1">
            <IslamicCalendarWidget />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Confidentialité</span>
                </TabsTrigger>
                <TabsTrigger value="family" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Famille</span>
                </TabsTrigger>
                <TabsTrigger value="verification" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Vérification</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Sécurité</span>
                </TabsTrigger>
                <TabsTrigger value="premium" className="flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  <span className="hidden sm:inline">Premium</span>
                  {subscription.subscribed && (
                    <Badge className="ml-1 bg-gold text-primary-foreground text-xs px-1">
                      Actif
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="privacy" className="space-y-6">
                  <PrivacySettingsForm />
                </TabsContent>

                <TabsContent value="family" className="space-y-6">
                  <FamilySupervisionPanel />
                </TabsContent>

            <TabsContent value="verification" className="space-y-6">
              <IDVerificationSystem />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SecurityAlertPanel />
                <div className="space-y-6">
                  <FamilyRateLimitIndicator />
                  <Card className="p-4">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald" />
                      Sécurité du Mot de Passe
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Force du mot de passe</span>
                        <Badge variant="outline">
                          {securityStatus?.password_strength || 'Non évalué'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Dernière vérification: Récemment
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="premium" className="space-y-6">
              {subscription.subscribed && (
                <Card className="p-4 border-gold/20 bg-gradient-to-r from-gold/10 to-emerald/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5 text-gold" />
                      <div>
                        <h3 className="font-semibold">Statut de l'abonnement</h3>
                        <p className="text-sm text-muted-foreground">
                          Vous avez accès aux fonctionnalités premium
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald text-primary-foreground">
                      Actif
                    </Badge>
                  </div>
                </Card>
              )}
              <PremiumSubscription />
            </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <NotificationSystem />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;