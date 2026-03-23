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
      <div className="container mx-auto py-10" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <h1 className="text-3xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>Admin Moderation Dashboard</h1>

        <SetupButton show={showSetupButton} onSetupComplete={handleSetupComplete} />

        {error && <div className="mb-4" style={{ color: 'var(--color-danger)' }}>Error: {error}</div>}

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
              <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Emergency Protocols</h2>
                <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
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

              <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Recent Escalations</h2>
                <div className="space-y-4">
                  {/* This would typically come from the database */}
                  <div className="rounded-lg p-4" style={{ border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)' }}>
                    <div className="flex justify-between">
                      <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Immediate Threat Report</h3>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
                        High
                      </span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Reported 23 minutes ago</p>
                    <div className="flex justify-end mt-3">
                      <button className="text-sm hover:underline" style={{ color: 'var(--color-accent)' }}>
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg p-4" style={{ border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)' }}>
                    <div className="flex justify-between">
                      <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Harassment Report</h3>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                        Medium
                      </span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Reported 2 hours ago</p>
                    <div className="flex justify-end mt-3">
                      <button className="text-sm hover:underline" style={{ color: 'var(--color-accent)' }}>
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
