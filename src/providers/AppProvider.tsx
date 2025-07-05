
import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import StandardLoadingState from "@/components/ui/StandardLoadingState";
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import AuthProvider from '@/contexts/AuthContext';

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
        <Suspense fallback={<StandardLoadingState loading={true} loadingText="Initialisation..." />}>
          <ThemeProvider>
            <AccessibilityProvider>
              <AuthProvider>
                {children}
                <Toaster />
              </AuthProvider>
            </AccessibilityProvider>
          </ThemeProvider>
        </Suspense>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default AppProvider;
