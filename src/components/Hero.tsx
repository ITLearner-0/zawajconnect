import { Button } from "@/components/ui/button";
import { Heart, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  
  const scrollToValues = () => {
    const element = document.getElementById('valeurs');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <section className="min-h-screen flex items-center justify-center bg-background border-b border-border">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Main Hero Content */}
          <div className="text-center space-y-8 mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground">
              Trouvez Votre Moitié de Foi
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              La plateforme matrimoniale musulmane qui place les valeurs islamiques au cœur de votre recherche
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une approche islamique moderne du mariage, avec l'implication de la famille et le respect des traditions
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg"
              >
                Commencer mon parcours
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={scrollToValues}
                className="border-border hover:bg-muted px-8 py-6 text-lg"
              >
                Découvrir nos valeurs
              </Button>
            </div>

            {/* Family Access Link */}
            <div className="pt-4">
              <a 
                href="/wali-access" 
                className="text-muted-foreground hover:text-foreground underline"
              >
                Accès Supervision Familiale
              </a>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 border border-border bg-card rounded-lg">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground">100% Halal</h3>
                <p className="text-muted-foreground">
                  Toutes nos fonctionnalités respectent les principes islamiques du mariage
                </p>
              </div>
            </div>

            <div className="p-6 border border-border bg-card rounded-lg">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Implication Familiale</h3>
                <p className="text-muted-foreground">
                  Les familles sont impliquées pour une décision éclairée et bénie
                </p>
              </div>
            </div>

            <div className="p-6 border border-border bg-card rounded-lg">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Intention Pure</h3>
                <p className="text-muted-foreground">
                  Une communauté sincère qui cherche le mariage pour les bonnes raisons
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;