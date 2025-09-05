import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
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
  ArrowLeft
} from 'lucide-react';
import PrivacySettingsForm from '@/components/PrivacySettingsForm';
import FamilySupervisionPanel from '@/components/FamilySupervisionPanel';
import VerificationCenter from '@/components/VerificationCenter';
import IslamicCalendarWidget from '@/components/IslamicCalendarWidget';
import NotificationSystem from '@/components/NotificationSystem';

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('privacy');

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
              onClick={() => navigate('/dashboard')}
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
              <TabsList className="grid w-full grid-cols-4">
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
                  <VerificationCenter />
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