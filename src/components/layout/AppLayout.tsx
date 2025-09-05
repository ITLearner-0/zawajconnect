import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMobileNav } from '@/hooks/useMobileNav';
import Navigation from '@/components/Navigation';
import Header from '@/components/Header';
import MobileNavToggle from '@/components/MobileNavToggle';
import { Button } from '@/components/ui/button';
import { LogOut, User, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, signOut } = useAuth();
  const { isOpen, toggle, close } = useMobileNav();
  const navigate = useNavigate();

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
    <div className="flex min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
      {/* Top Bar for Authenticated Users */}
      <div className="fixed top-0 right-0 left-0 lg:left-64 z-50 h-16 bg-background/95 backdrop-blur border-b border-border/40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 lg:hidden">
          <MobileNavToggle onToggle={toggle} />
          <span className="font-semibold">NikahConnect</span>
        </div>
        
        {/* User Menu */}
        <div className="flex items-center gap-4 ml-auto">
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
              <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                <User className="h-4 w-4 mr-2" />
                Mon Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/admin')}>
                <Crown className="h-4 w-4 mr-2" />
                Administration
              </DropdownMenuItem>
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
      </div>

      <Navigation isOpen={isOpen} onClose={close} />
      <main className="flex-1 lg:ml-64 transition-all duration-300 pt-16">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;