import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "@/contexts/AuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import NavigationGuard from "@/components/navigation/NavigationGuard";
import { NavigationProvider } from "@/components/navigation/NavigationProvider";
import RouteTransition from "@/components/navigation/RouteTransition";
import { publicRoutes, specialRoutes, protectedRoutes, notFoundRoute } from "@/config/appRoutes";
import { Toaster } from "@/components/ui/toaster";
import { BadgeNotificationProvider } from "@/components/gamification/BadgeNotificationProvider";
import ProtectedRouteWrapper from "@/components/routing/ProtectedRouteWrapper";
import { FreemiumBanner } from "@/components/FreemiumBanner";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { AchievementNotificationProvider } from "@/components/AchievementNotificationProvider";
import { EmailVerificationMonitor } from "@/components/EmailVerificationMonitor";

// Loading fallback component for lazy-loaded routes
const RouteLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      <p className="text-sm text-gray-600">Chargement...</p>
    </div>
  </div>
);

// Create QueryClient outside component to avoid hook issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  const NotFoundComponent = notFoundRoute.component;
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AuthProvider>
          <UserDataProvider>
            <AchievementNotificationProvider>
              <BadgeNotificationProvider>
                <EmailVerificationMonitor />
                <NavigationProvider>
              <NavigationGuard>
              <FreemiumBanner />
              <RouteTransition>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <Routes>
                    {/* Public routes */}
                    {publicRoutes.map((route) => {
                      const Component = route.component;
                      return (
                        <Route
                          key={route.path}
                          path={route.path}
                          element={
                            <Suspense fallback={<RouteLoadingFallback />}>
                              <Component />
                            </Suspense>
                          }
                        />
                      );
                    })}

                    {/* Special routes (protected with different requirements) */}
                    {specialRoutes.map((route) => {
                      const Component = route.component;
                      return (
                        <Route
                          key={route.path}
                          path={route.path}
                          element={
                            <ProtectedRouteWrapper requireOnboarding={route.requiresOnboarding}>
                              <Suspense fallback={<RouteLoadingFallback />}>
                                <Component />
                              </Suspense>
                            </ProtectedRouteWrapper>
                          }
                        />
                      );
                    })}

                    {/* Protected routes */}
                    {protectedRoutes.map((route) => {
                      const Component = route.component;
                      return (
                        <Route
                          key={route.path}
                          path={route.path}
                          element={
                            <ProtectedRouteWrapper requireOnboarding={route.requiresOnboarding}>
                              <Suspense fallback={<RouteLoadingFallback />}>
                                <Component />
                              </Suspense>
                            </ProtectedRouteWrapper>
                          }
                        />
                      );
                    })}

                    {/* Catch all route */}
                    <Route path={notFoundRoute.path} element={<NotFoundComponent />} />
                  </Routes>
                </Suspense>
              </RouteTransition>
              <CookieConsentBanner />
              </NavigationGuard>
            </NavigationProvider>
            <Toaster />
          </BadgeNotificationProvider>
        </AchievementNotificationProvider>
      </UserDataProvider>
    </AuthProvider>
  </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;