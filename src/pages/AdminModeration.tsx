
import React from 'react';
import MonitoringPanel from '@/components/wali/MonitoringPanel';
import ModerationStats from '@/components/admin/ModerationStats';
import QuickActions from '@/components/admin/QuickActions';
import SetupButton from '@/components/admin/SetupButton';
import { useModerationData } from '@/hooks/admin/useModerationData';

const AdminModeration: React.FC = () => {
  const { 
    moderationStats, 
    loading, 
    error, 
    showSetupButton, 
    flaggedContent 
  } = useModerationData();
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Admin Moderation Dashboard</h1>
      
      <SetupButton show={showSetupButton} />
      
      {error && (
        <div className="text-red-500 mb-4">Error: {error}</div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModerationStats stats={moderationStats} loading={loading} />
        <QuickActions />
      </div>
      
      <div className="mt-8">
        <MonitoringPanel flaggedContent={flaggedContent} />
      </div>
    </div>
  );
};

export default AdminModeration;
