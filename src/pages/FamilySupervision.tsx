import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Heart, Bell } from 'lucide-react';
import FamilyInvitationManager from '@/components/FamilyInvitationManager';
import MatchApprovalSystem from '@/components/MatchApprovalSystem';
import WaliNotificationHub from '@/components/WaliNotificationHub';
import FamilySupervisionDashboard from '@/components/FamilySupervisionDashboard';

const FamilySupervision = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Supervision Familiale</h1>
            <p className="text-muted-foreground">Gérez et supervisez les relations selon les principes islamiques</p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gestion Familiale
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Approbation Matches
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-0">
            <FamilySupervisionDashboard />
          </TabsContent>

          <TabsContent value="family" className="space-y-0">
            <FamilyInvitationManager />
          </TabsContent>

          <TabsContent value="matches" className="space-y-0">
            <MatchApprovalSystem />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-0">
            <WaliNotificationHub />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FamilySupervision;