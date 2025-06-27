
import React, { Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy load providers to avoid blocking
const AuthProvider = React.lazy(() => import('@/contexts/AuthContext'));
const ThemeProvider = React.lazy(() => import('@/contexts/ThemeContext').then(module => ({ default: module.ThemeProvider })));
const AccessibilityProvider = React.lazy(() => import('@/contexts/AccessibilityContext').then(module => ({ default: module.AccessibilityProvider })));
const SessionTimeoutProvider = React.lazy(() => import('@/components/SessionTimeoutProvider'));
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

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
                      <Suspense fallback={<LoadingSpinner size="md" text="Configuration de la session..." centered />}>
                        <SessionTimeoutProvider>
                          {children}
                          <Toaster />
                          <SonnerToaster />
                        </SessionTimeoutProvider>
                      </Suspense>
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

export default AppProvider;
