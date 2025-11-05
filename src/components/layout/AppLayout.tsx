import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import Header from '@/components/Header';
import { AppSidebar } from '@/components/AppSidebar';
import WaliNotificationCenter from '@/components/WaliNotificationCenter';
import { Button } from '@/components/ui/button';
import { LogOut, User, Crown, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import QuickNavigation from '@/components/navigation/QuickNavigation';
import RouteLoadingIndicator from '@/components/navigation/RouteLoadingIndicator';
import NavigationSuggestions from '@/components/navigation/NavigationSuggestions';
import KeyboardShortcutsHelp from '@/components/navigation/KeyboardShortcutsHelp';
import NavigationTour from '@/components/navigation/NavigationTour';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useNavigationAnalytics } from '@/hooks/useNavigationAnalytics';
import { useNavigationPreferences } from '@/hooks/useNavigationPreferences';
import { useEnhancedSessionMonitor } from '@/hooks/useEnhancedSessionMonitor';
import { useSecurityEvents } from '@/hooks/useSecurityEvents';

// Force refresh to clear cache

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, signOut } = useAuth();
  const { isWali } = useUserRole();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { preferences, shouldShowTour, completeTour } = useNavigationPreferences();
  // TEMPORAIREMENT DÉSACTIVÉ - Cause tempête de requêtes réseau
  // const { isSessionNearExpiry } = useEnhancedSessionMonitor();
  // const { events } = useSecurityEvents();
  const isSessionNearExpiry = false;
  const events: unknown[] = [];

  // Enable keyboard shortcuts and analytics
  useKeyboardShortcuts();
  useNavigationAnalytics();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <>
        <Header />
        {children}
      </>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
        {/* Top Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur border-b border-border/40 flex items-center justify-between px-4 z-50">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <span className="font-semibold lg:hidden">ZawajConnect</span>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center gap-4">
            {(isSessionNearExpiry || events.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings?tab=security')}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                <Shield className="h-4 w-4 mr-1" />
                Action requise
              </Button>
            )}
            {preferences.showKeyboardShortcuts && <KeyboardShortcutsHelp />}
            {preferences.showQuickNavigation && <QuickNavigation />}
            <span className="text-sm text-muted-foreground hidden sm:block">
              Connecté en tant que {user.email}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:block">Mon Compte</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/enhanced-profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Mon Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings?tab=security')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Sécurité
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Crown className="h-4 w-4 mr-2" />
                    Administration
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Se Déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <AppSidebar />

        <main className="flex-1 pt-16">
          {preferences.enableTransitions && <RouteLoadingIndicator />}
          <div className="p-4 lg:p-6 mb-20 lg:mb-0">
            {preferences.showBreadcrumb && <Breadcrumb />}
            {preferences.showNavigationSuggestions && <NavigationSuggestions />}
            {children}
          </div>
        </main>
      </div>
      
      {/* Wali Notification Center */}
      {isWali && !isMobile && <WaliNotificationCenter />}
      
      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}

      {/* Navigation Tour */}
      <NavigationTour 
        show={shouldShowTour()} 
        onComplete={completeTour} 
      />
    </SidebarProvider>
  );
};

export default AppLayout;