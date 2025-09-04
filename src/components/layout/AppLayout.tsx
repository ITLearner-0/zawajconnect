import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMobileNav } from '@/hooks/useMobileNav';
import Navigation from '@/components/Navigation';
import Header from '@/components/Header';
import MobileNavToggle from '@/components/MobileNavToggle';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();
  const { isOpen, toggle, close } = useMobileNav();

  if (!user) {
    return (
      <>
        <Header />
        {children}
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
      <MobileNavToggle onToggle={toggle} />
      <Navigation isOpen={isOpen} onClose={close} />
      <main className="flex-1 lg:ml-64 transition-all duration-300">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;