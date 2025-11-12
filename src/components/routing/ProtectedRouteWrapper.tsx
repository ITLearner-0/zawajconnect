import React from 'react';
import { ReactNode } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleBasedLayout from '@/components/RoleBasedLayout';

interface ProtectedRouteWrapperProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

const ProtectedRouteWrapper: React.FC<ProtectedRouteWrapperProps> = ({
  children,
  requireOnboarding = true,
}) => {
  return (
    <ProtectedRoute requireOnboarding={requireOnboarding}>
      <RoleBasedLayout>{children}</RoleBasedLayout>
    </ProtectedRoute>
  );
};

export default ProtectedRouteWrapper;
