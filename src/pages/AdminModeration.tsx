import React, { useState, useCallback } from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import MonitoringPanel from '@/components/wali/MonitoringPanel';
import ModerationStats from '@/components/admin/ModerationStats';
import QuickActions from '@/components/admin/QuickActions';
import SetupButton from '@/components/admin/SetupButton';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useModerationData } from '@/hooks/admin/useModerationData';
import { Card } from '@/components/ui/card';
import EmergencyPanel from '@/components/messaging/EmergencyPanel';

const AdminModeration: React.FC = () => {
  const { moderationStats, loading, error, showSetupButton, flaggedContent, refreshData } =
    useModerationData();

  const [activeTab, setActiveTab] = useState('moderation');

  const handleSetupComplete = useCallback(() => {
    // Refresh data after setup is complete
    refreshData();
  }, [refreshData]);

  return (
    <AdminRoute>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-semibold mb-6">Admin Moderation Dashboard</h1>

        <SetupButton show={showSetupButton} onSetupComplete={handleSetupComplete} />

        {error && <div className="text-red-500 mb-4">Error: {error}</div>}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Center</TabsTrigger>
          </TabsList>

          <TabsContent value="moderation">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ModerationStats stats={moderationStats} loading={loading} />
              <QuickActions />
            </div>

            <div className="mt-8">
              <MonitoringPanel flaggedContent={flaggedContent} />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="emergency">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Emergency Protocols</h2>
                <p className="text-muted-foreground mb-4">
                  This center manages emergency reports from users. High priority incidents are
                  highlighted for immediate attention.
                </p>

                {/* Demo emergency panel */}
                <EmergencyPanel
                  conversationId="demo-conversation"
                  userId="admin-user"
                  otherUserId="demo-user"
                />
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Recent Escalations</h2>
                <div className="space-y-4">
                  {/* This would typically come from the database */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">Immediate Threat Report</h3>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        High
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Reported 23 minutes ago</p>
                    <div className="flex justify-end mt-3">
                      <button className="text-sm text-blue-600 hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">Harassment Report</h3>
                      <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                        Medium
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Reported 2 hours ago</p>
                    <div className="flex justify-end mt-3">
                      <button className="text-sm text-blue-600 hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminRoute>
  );
};

export default AdminModeration;
