import React from 'react';
import { AppRouteConfig } from '@/config/appRoutes';
import PublicLayout from '@/components/layout/PublicLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import BaseLayout from '@/components/layout/BaseLayout';
import ProtectedRouteWrapper from './ProtectedRouteWrapper';

interface RouteWrapperProps {
  route: AppRouteConfig;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({ route }) => {
  const Component = route.component;

  // Public routes with different layouts
  if (!route.protected) {
    switch (route.layout) {
      case 'auth':
        return (
          <AuthLayout>
            <Component />
          </AuthLayout>
        );
      case 'minimal':
        return (
          <BaseLayout>
            <Component />
          </BaseLayout>
        );
      case 'public':
      default:
        return (
          <PublicLayout>
            <Component />
          </PublicLayout>
        );
    }
  }

  // Protected routes
  const layoutType = route.layout === 'minimal' ? 'minimal' : 'default';
  
  return (
    <ProtectedRouteWrapper 
      requireOnboarding={route.requiresOnboarding} 
      layout={layoutType}
    >
      <Component />
    </ProtectedRouteWrapper>
  );
};

export default RouteWrapper;