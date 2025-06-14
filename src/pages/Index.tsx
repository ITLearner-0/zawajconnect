
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CardContent } from "@/components/ui/card";
import FeaturedResources from "@/components/resources/FeaturedResources";
import DemoLink from "@/components/demo/DemoLink";
import { IslamicPattern } from "@/components/ui/islamic-pattern";
import { Star, Users, Shield, BookOpen, Heart, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import AccessibilityControls from "@/components/AccessibilityControls";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-burgundy via-rose-600 to-pink-500 dark:from-islamic-darkGreen dark:via-islamic-darkBurgundy dark:to-islamic-darkTeal text-foreground">
      <header className="relative overflow-hidden min-h-screen flex items-center justify-center px-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>
        
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-20 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-2xl font-bold text-white font-serif">
              Nikah Connect
            </div>
            <div className="flex items-center gap-4">
              <AccessibilityControls />
              <ThemeToggle />
            </div>
          </div>
        </nav>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 text-white font-serif leading-tight">
            SE MARIER DE MANIÈRE
            <span className="block bg-gradient-to-r from-islamic-brightGold to-yellow-300 bg-clip-text text-transparent">
              LÉGIFÉRÉE
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Une plateforme de mariage construite sur les valeurs islamiques, 
            vous guidant vers une union bénie et harmonieuse.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-islamic-gold to-yellow-400 hover:from-yellow-400 hover:to-islamic-brightGold text-black font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-lg"
            >
              <Link to="/auth" className="flex items-center gap-2">
                INSCRIPTION FEMME
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            
            <div className="text-white text-sm font-medium">OU</div>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-2 border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg"
            >
              <Link to="/auth" className="flex items-center gap-2">
                INSCRIPTION HOMME
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </header>

      <main className="relative bg-white dark:bg-islamic-darkGreen">
        {/* Features Section */}
        <section className="py-20 md:py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-islamic-burgundy dark:text-islamic-darkBrightGold font-serif">
                Trouvez un(e) époux(se) de manière Halal
              </h2>
              <p className="text-xl text-gray-600 dark:text-islamic-cream/80 max-w-3xl mx-auto">
                Notre plateforme est conçue avec les principes islamiques au cœur, 
                garantissant un parcours respectueux et significatif.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {[
                { 
                  icon: Shield, 
                  title: "Supervision Wali", 
                  text: "Garantit la supervision du Wali pour les utilisatrices, respectant les directives islamiques.", 
                  color: "teal" 
                },
                { 
                  icon: Users, 
                  title: "Profils Vérifiés", 
                  text: "Chaque profil est vérifié, vous assurant de rencontrer des personnes authentiques.", 
                  color: "gold" 
                },
                { 
                  icon: Heart, 
                  title: "Focus Compatibilité", 
                  text: "Notre système aide à vous matcher avec des partenaires partageant vos valeurs.", 
                  color: "burgundy" 
                }
              ].map((feature, index) => (
                <div key={index} className="group">
                  <IslamicPattern 
                    variant="card" 
                    color={feature.color as "teal" | "gold"} 
                    className="rounded-2xl shadow-xl hover:shadow-3xl transform transition-all duration-500 hover:-translate-y-2 dark:bg-islamic-darkCard/80 dark:border-islamic-darkBrightGold/30 h-full"
                  >
                    <CardContent className="pt-12 pb-12 text-center h-full flex flex-col">
                      <div className="bg-gradient-to-br from-islamic-teal/10 to-islamic-gold/10 dark:bg-gradient-to-br dark:from-islamic-darkTeal/20 dark:to-islamic-darkGold/20 p-6 rounded-full w-20 h-20 flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="h-10 w-10 text-islamic-teal dark:text-islamic-darkBrightGold" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-islamic-burgundy dark:text-islamic-darkBrightGold">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-islamic-cream/80 leading-relaxed flex-grow">{feature.text}</p>
                    </CardContent>
                  </IslamicPattern>
                </div>
              ))}
            </div>
          </div>
        </section>

        <IslamicPattern variant="divider" color="gold" className="my-16" />

        {/* Demo Section */}
        <section className="py-20 md:py-32 px-4 bg-gradient-to-r from-islamic-cream/30 to-islamic-sand/30 dark:bg-gradient-to-r dark:from-islamic-darkCard/30 dark:to-islamic-darkTeal/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-islamic-burgundy dark:text-islamic-darkBrightGold font-serif">
              Découvrez Notre Plateforme
            </h2>
            <p className="text-xl text-gray-600 dark:text-islamic-cream/80 mb-12 max-w-2xl mx-auto">
              Essayez nos fonctionnalités de messagerie et d'appel vidéo avec des profils de démonstration interactifs.
            </p>
            
            <IslamicPattern variant="card" color="teal" className="rounded-2xl shadow-2xl dark:bg-islamic-darkCard/80 dark:border-islamic-darkBrightGold/30 max-w-2xl mx-auto">
              <CardContent className="p-12">
                <DemoLink className="mb-6" />
                <p className="text-gray-600 dark:text-islamic-cream/80">
                  Explorez toutes les fonctionnalités en toute sécurité avec notre environnement de test.
                </p>
              </CardContent>
            </IslamicPattern>
          </div>
        </section>

        <IslamicPattern variant="divider" color="teal" className="my-16" />

        {/* Resources Section */}
        <section className="py-20 md:py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-islamic-burgundy dark:text-islamic-darkBrightGold font-serif">
                Ressources Mariage Islamique
              </h2>
              <p className="text-xl text-gray-600 dark:text-islamic-cream/80 max-w-3xl mx-auto">
                Explorez des ressources soigneusement sélectionnées pour vous aider à préparer un mariage islamique réussi.
              </p>
            </div>
            
            <FeaturedResources />
            
            <div className="text-center mt-16">
              <Button 
                asChild 
                variant="outline" 
                className="border-2 border-islamic-gold text-islamic-gold hover:bg-islamic-gold/10 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 rounded-full dark:border-islamic-darkGold dark:text-islamic-darkGold dark:hover:bg-islamic-darkGold/10"
                size="lg"
              >
                <Link to="/resources" className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  Voir Toutes les Ressources
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <IslamicPattern variant="divider" color="gold" className="my-16" />

        {/* Testimonials Section */}
        <section className="py-20 md:py-32 px-4 bg-gradient-to-r from-islamic-cream/30 to-islamic-sand/30 dark:bg-gradient-to-r dark:from-islamic-darkCard/30 dark:to-islamic-darkTeal/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-islamic-burgundy dark:text-islamic-darkBrightGold font-serif">
              Histoires de Réussite
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { 
                  quote: "Alhamdulillah, j'ai trouvé mon mari grâce à cette application. La fonction de supervision du wali a rassuré ma famille.", 
                  author: "Fatima S., Paris" 
                },
                { 
                  quote: "Cette plateforme m'a aidé à trouver quelqu'un qui partage vraiment mes valeurs et ma vision d'un foyer islamique.", 
                  author: "Ahmed K., Lyon" 
                }
              ].map((testimonial, index) => (
                <IslamicPattern key={index} variant="card" color={index % 2 === 0 ? "teal" : "gold"} className="rounded-2xl shadow-xl dark:bg-islamic-darkCard/80 dark:border-islamic-darkBrightGold/30 h-full">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className="flex justify-center mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-6 w-6 text-islamic-brightGold dark:text-islamic-darkBrightGold fill-current" />
                      ))}
                    </div>
                    <blockquote className="italic text-gray-700 dark:text-islamic-cream/90 text-lg text-center flex-grow leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                    <p className="mt-8 font-bold text-islamic-burgundy dark:text-islamic-darkBrightGold text-center">— {testimonial.author}</p>
                  </CardContent>
                </IslamicPattern>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-islamic-burgundy via-rose-600 to-pink-500 dark:from-islamic-darkTeal dark:via-islamic-darkBurgundy dark:to-islamic-darkGreen text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="text-3xl font-bold mb-4 font-serif">Nikah Connect</div>
          <p className="text-white/90 text-lg mb-6">
            Vous guide vers un mariage béni et épanouissant.
          </p>
          <p className="text-white/70">
            &copy; {new Date().getFullYear()} Nikah Connect. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
