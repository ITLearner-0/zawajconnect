import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Crown,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { AchievementTestButton } from '@/components/AchievementTestButton';

const Settings = () => {
  const { user, subscription, signOut } = useAuth();
  const navigate = useNavigate();
  const { securityStatus } = useSecurityMonitor();
  
  // Check for dev mode
  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';
  
  // Check for active section in URL params
  const urlParams = new URLSearchParams(window.location.search);
  const sectionFromUrl = urlParams.get('section');
  const [activeSection, setActiveSection] = useState(sectionFromUrl || 'privacy');

  const menuItems = [
    { id: 'privacy', label: 'Confidentialité', icon: Shield },
    { id: 'family', label: 'Famille', icon: Users },
    { id: 'verification', label: 'Vérification', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'premium', label: 'Premium', icon: Crown, badge: subscription.subscribed },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(isDevMode ? [{ id: 'dev-tools', label: 'Dev Tools', icon: Code }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/enhanced-profile')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center gap-2 ml-4">
              <SettingsIcon className="h-5 w-5 text-foreground" />
              <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </div>

        {/* Layout: Menu vertical à gauche et contenu à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Menu vertical à gauche */}
          <aside className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge className="ml-auto bg-emerald text-white text-xs px-2 py-0 h-5">
                          ✓
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </aside>

          {/* Contenu à droite */}
          <main className="lg:col-span-3">
            {activeSection === 'privacy' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Confidentialité</h2>
                <PrivacySettingsForm />
              </Card>
            )}

            {activeSection === 'family' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Famille</h2>
                <FamilySupervisionPanel />
              </Card>
            )}

            {activeSection === 'verification' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Vérification</h2>
                <IDVerificationSystem />
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Sécurité</h2>
                <div className="grid grid-cols-1 gap-6">
                  <SecurityAlertPanel />
                  <FamilyRateLimitIndicator />
                  <Card className="p-6">
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
            )}

            {activeSection === 'premium' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Premium</h2>
                {subscription.subscribed && (
                  <Card className="p-6 border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Crown className="h-6 w-6 text-primary" />
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
              </div>
            )}

            {activeSection === 'notifications' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                <NotificationSystem />
              </Card>
            )}

            {activeSection === 'dev-tools' && isDevMode && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Dev Tools</h2>
                <TestUserSelector />
                <AchievementTestButton />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;