import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';

// Force refresh to clear cache

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Show a simple layout with only header for unauthenticated pages
  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
          {children}
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cream via-sage/20 to-emerald/5 overflow-x-hidden">
      <Header />
      
      {/* Main content area with traditional centered layout */}
      <main className="flex-1 overflow-x-hidden">
        <div className="container mx-auto px-4 py-8 max-w-7xl max-w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default AppLayout;