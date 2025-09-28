import React from 'react';
import { ReactNode } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleBasedLayout from '@/components/RoleBasedLayout';

interface ProtectedRouteWrapperProps {
  children: ReactNode;
  requireOnboarding?: boolean;
  layout?: 'default' | 'minimal' | 'auth';
}

const ProtectedRouteWrapper: React.FC<ProtectedRouteWrapperProps> = ({ 
  children, 
  requireOnboarding = true,
  layout = 'default'
}) => {
  return (
    <ProtectedRoute requireOnboarding={requireOnboarding}>
      {layout === 'minimal' ? (
        children
      ) : (
        <RoleBasedLayout>
          {children}
        </RoleBasedLayout>
      )}
    </ProtectedRoute>
  );
};

export default ProtectedRouteWrapper;