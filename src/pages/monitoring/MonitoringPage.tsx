import React from 'react';
import MonitoringDashboard from '@/components/monitoring/MonitoringDashboard';
import { MonitoringProvider } from '@/components/monitoring/MonitoringProvider';

const MonitoringPage = () => {
  return (
    <MonitoringProvider>
      <MonitoringDashboard />
    </MonitoringProvider>
  );
};

export default MonitoringPage;
