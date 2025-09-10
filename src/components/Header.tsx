import { Button } from "@/components/ui/button";
import { Heart, User, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import NotificationSystem from "./NotificationSystem";

const Header = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald to-emerald-light">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">NikahConnect</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#valeurs" className="text-sm font-medium text-muted-foreground hover:text-emerald transition-colors">
            Nos Valeurs
          </a>
          <a href="#processus" className="text-sm font-medium text-muted-foreground hover:text-emerald transition-colors">
            Comment ça marche
          </a>
          <a href="#temoignages" className="text-sm font-medium text-muted-foreground hover:text-emerald transition-colors">
            Témoignages
          </a>
          <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-emerald transition-colors">
            Contact
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          {/* Auth buttons */}
          <div className="hidden md:flex gap-2">
            {loading ? (
              <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <NotificationSystem />
                <span className="text-sm text-muted-foreground">
                  Bonjour, {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-foreground hover:text-emerald"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Déconnexion
                </Button>
              </div>
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
                  <Link to="/enhanced-profile">Mon Profil</Link>
                </Button>
              </>
            )}
          </div>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;