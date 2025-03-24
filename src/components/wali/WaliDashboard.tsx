
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Bell, MessageCircle, Activity } from "lucide-react";
import WaliHeader from './WaliHeader';
import ChatRequestsPanel from './ChatRequestsPanel';
import ActiveConversationsPanel from './ActiveConversationsPanel';
import MonitoringPanel from './MonitoringPanel';
import AvailabilityControls from './AvailabilityControls';
import WaliStats from './WaliStats';
import { useWaliDashboard } from '@/hooks/useWaliDashboard';
import { SupervisedConversation } from '@/types/wali';

const WaliDashboard: React.FC = () => {
  const {
    userId,
    isLoading, 
    waliProfile,
    updateAvailabilityStatus,
    chatRequests,
    handleApproveRequest,
    handleRejectRequest,
    totalPendingRequests,
    addWaliNote,
    activeConversations,
    startSupervision,
    endSupervision,
    totalActiveConversations,
    flaggedContent,
    resolveFlaggedContent,
    totalFlaggedItems,
    statistics,
    handleSignOut,
    error
  } = useWaliDashboard();
  
  const [activeTab, setActiveTab] = useState('chat-requests');
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If there's an error but we have a wali profile, show the dashboard with empty data
  // Only show the error screen if there's no profile at all
  if (error && !waliProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-[600px]">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Wali Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!waliProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-[600px]">
          <CardHeader>
            <CardTitle>Wali Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have a Wali profile set up. Please contact support.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <WaliHeader 
        profile={waliProfile} 
        statistics={statistics}
        onSignOut={handleSignOut}
      />
      
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Warning: {error}</p>
            <p className="text-sm text-red-500">Some functionality may be limited.</p>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="md:col-span-1">
          <AvailabilityControls 
            availabilityStatus={waliProfile.availability_status}
            onUpdateAvailability={updateAvailabilityStatus}
          />
          <WaliStats statistics={statistics} className="mt-6" />
        </div>
        
        <div className="md:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="chat-requests" className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat Requests
                {totalPendingRequests > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {totalPendingRequests}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="active-supervision" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Active Supervision
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Detailed Monitoring
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat-requests">
              <ChatRequestsPanel 
                chatRequests={chatRequests}
                onApprove={(id) => handleApproveRequest(id)}
                onReject={(id) => handleRejectRequest(id)}
                onAddNote={addWaliNote}
              />
            </TabsContent>
            
            <TabsContent value="active-supervision">
              <ActiveConversationsPanel 
                conversations={activeConversations as SupervisedConversation[]}
                onStartSupervision={startSupervision}
                onEndSupervision={endSupervision}
              />
            </TabsContent>
            
            <TabsContent value="monitoring">
              <MonitoringPanel 
                flaggedContent={flaggedContent}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WaliDashboard;
