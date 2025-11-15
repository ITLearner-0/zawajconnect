import React from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import WaliAlertsAdminDashboard from '@/components/admin/WaliAlertsAdminDashboard';

const AdminWaliAlertsDashboard: React.FC = () => {
  return (
    <AdminRoute>
      <WaliAlertsAdminDashboard />
    </AdminRoute>
  );
};

export default AdminWaliAlertsDashboard;
