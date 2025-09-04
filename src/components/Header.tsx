import { Button } from "@/components/ui/button";
import { Heart, User, Menu } from "lucide-react";

const Header = () => {
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
          <Button variant="ghost" size="sm" className="hidden md:flex">
            Se connecter
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-emerald to-emerald-light hover:from-emerald-dark hover:to-emerald text-white">
            <User className="mr-2 h-4 w-4" />
            S'inscrire
          </Button>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;