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
  Code,
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
import RenewalBanner from '@/components/renewal/RenewalBanner';

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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="container mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--color-border-default)' }}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center gap-2 ml-4">
              <SettingsIcon className="h-5 w-5" style={{ color: 'var(--color-text-primary)' }} />
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Paramètres</h1>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)' }}>
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </div>

        {/* Renewal Banner */}
        <RenewalBanner />

        {/* Layout: Menu vertical à gauche et contenu à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Menu vertical à gauche */}
          <aside className="lg:col-span-1">
            <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
                      style={{
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                        color: isActive ? '#fff' : 'var(--color-text-primary)',
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge className="ml-auto text-xs px-2 py-0 h-5" style={{ backgroundColor: 'var(--color-success)', color: '#fff' }}>
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
              <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Confidentialité</h2>
                <PrivacySettingsForm />
              </Card>
            )}

            {activeSection === 'family' && (
              <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Famille</h2>
                <FamilySupervisionPanel />
              </Card>
            )}

            {activeSection === 'verification' && (
              <div>
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Vérification</h2>
                <IDVerificationSystem />
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Sécurité</h2>
                <div className="grid grid-cols-1 gap-6">
                  <SecurityAlertPanel />
                  <FamilyRateLimitIndicator />
                  <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                      Sécurité du Mot de Passe
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3" style={{ backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Force du mot de passe</span>
                        <Badge variant="outline" className="font-medium" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-secondary)' }}>
                          {securityStatus?.password_strength || 'Non évalué'}
                        </Badge>
                      </div>
                      <div className="text-sm px-3" style={{ color: 'var(--color-text-muted)' }}>
                        Dernière vérification: Récemment
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === 'premium' && (
              <div className="space-y-6" data-section="premium">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Premium</h2>
                {subscription.subscribed && (
                  <Card className="p-6" style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-lg)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Crown className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
                        <div>
                          <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>Statut de l'abonnement</h3>
                          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            Vous avez accès aux fonctionnalités premium
                          </p>
                        </div>
                      </div>
                      <Badge className="px-4 py-1.5" style={{ backgroundColor: 'var(--color-success)', color: '#fff' }}>Actif</Badge>
                    </div>
                  </Card>
                )}
                <PremiumSubscription />
              </div>
            )}

            {activeSection === 'notifications' && (
              <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Notifications</h2>
                <NotificationSystem />
              </Card>
            )}

            {activeSection === 'dev-tools' && isDevMode && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Dev Tools</h2>
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
