import { Button } from '@/components/ui/button';
import {
  Heart,
  LogOut,
  Home,
  Search,
  Brain,
  Users,
  BookOpen,
  Settings,
  User,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import NotificationSystem from './NotificationSystem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, signOut, loading } = useAuth();
  const { isWali } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  // Only show public header if not authenticated
  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald to-emerald-light">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">ZawajConnect</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#valeurs"
              className="text-sm font-medium text-muted-foreground hover:text-emerald transition-colors"
            >
              Nos Valeurs
            </a>
            <a
              href="#processus"
              className="text-sm font-medium text-muted-foreground hover:text-emerald transition-colors"
            >
              Comment ça marche
            </a>
            <a
              href="#temoignages"
              className="text-sm font-medium text-muted-foreground hover:text-emerald transition-colors"
            >
              Témoignages
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-muted-foreground hover:text-emerald transition-colors"
            >
              Contact
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex gap-2">
              {loading ? (
                <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-foreground hover:text-emerald"
                    asChild
                  >
                    <Link to="/auth">Se connecter</Link>
                  </Button>
                  <Button
                    className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
                    asChild
                  >
                    <Link to="/auth">S'inscrire</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Authenticated header with navigation
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald to-emerald-light">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">ZawajConnect</span>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/dashboard"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/dashboard')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Home className="h-4 w-4 inline mr-1" />
              Tableau de bord
            </Link>

            <Link
              to="/browse"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/browse')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Search className="h-4 w-4 inline mr-1" />
              Découvrir
            </Link>

            <Link
              to="/advanced-matching"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/advanced-matching')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Brain className="h-4 w-4 inline mr-1" />
              Matching Avancé
            </Link>

            <Link
              to="/compatibility-insights"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/compatibility-insights')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Mes Insights
            </Link>

            <Link
              to="/matches"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/matches')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Users className="h-4 w-4 inline mr-1" />
              Mes Matches
            </Link>

            <Link
              to="/guidance"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/guidance')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <BookOpen className="h-4 w-4 inline mr-1" />
              Guide
            </Link>

            {isWali && (
              <Link
                to="/wali-dashboard"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/wali-dashboard')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Shield className="h-4 w-4 inline mr-1" />
                Wali
              </Link>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <NotificationSystem />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/enhanced-profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Mon Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
