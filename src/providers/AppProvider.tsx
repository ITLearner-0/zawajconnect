
import React, { Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SessionTimeoutProvider from '@/components/SessionTimeoutProvider';

// Lazy load only the heavy providers
const AuthProvider = React.lazy(() => import('@/contexts/AuthContext'));
const ThemeProvider = React.lazy(() => import('@/contexts/ThemeContext').then(module => ({ default: module.ThemeProvider })));
const AccessibilityProvider = React.lazy(() => import('@/contexts/AccessibilityContext').then(module => ({ default: module.AccessibilityProvider })));
const SecurityProvider = React.lazy(() => import('@/components/security/SecurityProvider').then(module => ({ default: module.SecurityProvider })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log("AppProvider rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingSpinner size="lg" text="Initialisation des thèmes..." centered />}>
        <ThemeProvider>
          <Suspense fallback={<LoadingSpinner size="lg" text="Configuration de l'accessibilité..." centered />}>
            <AccessibilityProvider>
              <Suspense fallback={<LoadingSpinner size="lg" text="Chargement de l'authentification..." centered />}>
                <AuthProvider>
                  <Suspense fallback={<LoadingSpinner size="lg" text="Configuration de la sécurité..." centered />}>
                    <SecurityProvider>
                      <SessionTimeoutProvider>
                        {children}
                        <Toaster />
                        <SonnerToaster />
                      </SessionTimeoutProvider>
                    </SecurityProvider>
                  </Suspense>
                </AuthProvider>
              </Suspense>
            </AccessibilityProvider>
          </Suspense>
        </ThemeProvider>
      </Suspense>
    </QueryClientProvider>
  );
};
