
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WaliHeader from './WaliHeader';
import WaliStats from './WaliStats';
import ChatRequestsPanel from './ChatRequestsPanel';
import ActiveConversationsPanel from './ActiveConversationsPanel';
import MonitoringPanel from './MonitoringPanel';
import AvailabilityControls from './AvailabilityControls';
import WaliManagement from './WaliManagement';
import { useWaliDashboard } from '@/hooks/useWaliDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, Shield, Settings } from 'lucide-react';

const WaliDashboard: React.FC = () => {
  const {
    waliProfile,
    isLoading,
    chatRequests,
    handleApproveRequest,
    handleRejectRequest,
    addWaliNote,
    activeConversations,
    startSupervision,
    endSupervision,
    flaggedContent,
    resolveFlaggedContent,
    statistics,
    updateAvailabilityStatus,
    handleSignOut,
    error
  } = useWaliDashboard();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <WaliHeader 
        profile={waliProfile} 
        statistics={statistics}
        onSignOut={handleSignOut}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <WaliStats statistics={statistics} />
        <AvailabilityControls 
          availabilityStatus={waliProfile?.availability_status || 'offline'}
          onUpdateAvailability={updateAvailabilityStatus}
        />
      </div>

      <Tabs defaultValue="supervision" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="supervision" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Supervision
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Management
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="supervision">
          <ActiveConversationsPanel
            conversations={activeConversations}
            onStartSupervision={startSupervision}
            onEndSupervision={endSupervision}
          />
        </TabsContent>

        <TabsContent value="requests">
          <ChatRequestsPanel
            chatRequests={chatRequests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            onAddNote={addWaliNote}
          />
        </TabsContent>

        <TabsContent value="management">
          <WaliManagement />
        </TabsContent>

        <TabsContent value="monitoring">
          <MonitoringPanel 
            flaggedContent={flaggedContent}
            onResolveFlag={resolveFlaggedContent}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WaliDashboard;
