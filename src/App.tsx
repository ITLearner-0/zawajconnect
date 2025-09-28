import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import NavigationGuard from "@/components/navigation/NavigationGuard";
import { NavigationProvider } from "@/components/navigation/NavigationProvider";
import RouteTransition from "@/components/navigation/RouteTransition";
import RouteWrapper from "@/components/routing/RouteWrapper";
import { publicRoutes, specialRoutes, protectedRoutes, notFoundRoute } from "@/config/appRoutes";
import { Toaster } from "@/components/ui/toaster";

// Create QueryClient outside component to avoid hook issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Combine all routes for easier mapping
const allRoutes = [...publicRoutes, ...specialRoutes, ...protectedRoutes];

function App() {
  const NotFoundComponent = notFoundRoute.component;
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <NavigationProvider>
            <NavigationGuard>
              <RouteTransition>
                <Routes>
                  {allRoutes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={<RouteWrapper route={route} />}
                    />
                  ))}
                  
                  {/* Catch all route */}
                  <Route path={notFoundRoute.path} element={<NotFoundComponent />} />
                </Routes>
              </RouteTransition>
            </NavigationGuard>
          </NavigationProvider>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;