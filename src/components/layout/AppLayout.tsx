import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import Header from '@/components/Header';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();

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
      <Navigation />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;