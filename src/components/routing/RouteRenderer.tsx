import React from 'react';
import { Route } from 'react-router-dom';
import { AppRouteConfig } from '@/config/appRoutes';
import ProtectedRouteWrapper from './ProtectedRouteWrapper';

interface RouteRendererProps {
  routes: AppRouteConfig[];
  isProtected?: boolean;
}

const RouteRenderer: React.FC<RouteRendererProps> = ({ routes, isProtected = false }) => {
  return (
    <>
      {routes.map((route) => {
        const Component = route.component;
        
        if (isProtected || route.protected) {
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRouteWrapper requireOnboarding={route.requiresOnboarding}>
                  <Component />
                </ProtectedRouteWrapper>
              }
            />
          );
        }
        
        return (
          <Route
            key={route.path}
            path={route.path}
            element={<Component />}
          />
        );
      })}
    </>
  );
};

export default RouteRenderer;