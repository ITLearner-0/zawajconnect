
import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import StandardLoadingState from "@/components/ui/StandardLoadingState";

// Lazy load providers to improve initial load performance
const ThemeProvider = React.lazy(() => import('../contexts/ThemeContext').then(module => ({ default: module.ThemeProvider })));
const AccessibilityProvider = React.lazy(() => import('../contexts/AccessibilityContext').then(module => ({ default: module.AccessibilityProvider })));
const AuthProvider = React.lazy(() => import('../contexts/AuthContext').then(module => ({ default: module.default })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  console.log("AppProvider rendering");
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<StandardLoadingState loading={true} loadingText="Chargement de l'application..." />}>
          <ThemeProvider>
            <Suspense fallback={<StandardLoadingState loading={true} loadingText="Chargement des thèmes..." />}>
              <AccessibilityProvider>
                <Suspense fallback={<StandardLoadingState loading={true} loadingText="Chargement de l'authentification..." />}>
                  <AuthProvider>
                    {children}
                    <Toaster />
                  </AuthProvider>
                </Suspense>
              </AccessibilityProvider>
            </Suspense>
          </ThemeProvider>
        </Suspense>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default AppProvider;
