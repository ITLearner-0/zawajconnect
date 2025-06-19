
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
import StandardLoadingState from '@/components/ui/StandardLoadingState';
import { useWaliDashboard } from '@/hooks/useWaliDashboard';
import { SupervisedConversation } from '@/types/wali';
import FormErrorBoundary from '@/components/ui/FormErrorBoundary';

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
  
  return (
    <StandardLoadingState
      loading={isLoading}
      error={!waliProfile && error ? error : null}
      loadingText="Loading Wali Dashboard..."
      emptyState={!waliProfile && !error ? {
        title: "Wali Profile Not Found",
        description: "You don't have a Wali profile set up. Please contact support."
      } : undefined}
    >
      <FormErrorBoundary>
        <div className="container mx-auto py-6 max-w-7xl">
          <WaliHeader 
            profile={waliProfile!} 
            statistics={statistics}
            onSignOut={handleSignOut}
          />
          
          {error && waliProfile && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600">Warning: {error}</p>
                <p className="text-sm text-red-500">Some functionality may be limited.</p>
              </CardContent>
            </Card>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="md:col-span-1">
              <FormErrorBoundary>
                <AvailabilityControls 
                  availabilityStatus={waliProfile!.availability_status}
                  onUpdateAvailability={updateAvailabilityStatus}
                />
              </FormErrorBoundary>
              <FormErrorBoundary>
                <WaliStats statistics={statistics} className="mt-6" />
              </FormErrorBoundary>
            </div>
            
            <div className="md:col-span-3">
              <FormErrorBoundary>
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
                    <FormErrorBoundary>
                      <ChatRequestsPanel 
                        chatRequests={chatRequests}
                        onApprove={(id) => handleApproveRequest(id)}
                        onReject={(id) => handleRejectRequest(id)}
                        onAddNote={addWaliNote}
                      />
                    </FormErrorBoundary>
                  </TabsContent>
                  
                  <TabsContent value="active-supervision">
                    <FormErrorBoundary>
                      <ActiveConversationsPanel 
                        conversations={activeConversations as SupervisedConversation[]}
                        onStartSupervision={startSupervision}
                        onEndSupervision={endSupervision}
                      />
                    </FormErrorBoundary>
                  </TabsContent>
                  
                  <TabsContent value="monitoring">
                    <FormErrorBoundary>
                      <MonitoringPanel 
                        flaggedContent={flaggedContent}
                      />
                    </FormErrorBoundary>
                  </TabsContent>
                </Tabs>
              </FormErrorBoundary>
            </div>
          </div>
        </div>
      </FormErrorBoundary>
    </StandardLoadingState>
  );
};

export default WaliDashboard;
