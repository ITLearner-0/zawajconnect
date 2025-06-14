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
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-200 to-rose-100 dark:from-rose-900 dark:via-rose-800 dark:to-pink-900 text-foreground">
      <header className="relative overflow-hidden min-h-screen flex items-center justify-center px-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 dark:opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,182,193,0.3),transparent_70%)]"></div>
        </div>
        
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-20 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-3xl md:text-4xl font-bold text-rose-800 dark:text-rose-100 font-serif">
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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-rose-800 dark:text-rose-100 font-serif leading-tight">
            SE MARIER DE MANIÈRE
            <span className="block bg-gradient-to-r from-rose-500 to-pink-400 dark:from-rose-300 dark:to-pink-200 bg-clip-text text-transparent">
              LÉGIFÉRÉE
            </span>
          </h1>
          
          <p className="text-lg md:text-xl mb-10 text-rose-700 dark:text-rose-200 max-w-3xl mx-auto leading-relaxed">
            Une plateforme de mariage construite sur les valeurs islamiques, 
            vous guidant vers une union bénie et harmonieuse.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-base border-0"
            >
              <Link to="/auth" className="flex items-center gap-2">
                INSCRIPTION FEMME
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            
            <div className="text-rose-600 dark:text-rose-300 text-sm font-medium">OU</div>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-2 border-rose-400 text-rose-600 bg-white/50 backdrop-blur-sm hover:bg-rose-50 dark:border-rose-300 dark:text-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-800/50 font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-base"
            >
              <Link to="/auth" className="flex items-center gap-2">
                INSCRIPTION HOMME
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-rose-600 dark:text-rose-300 animate-bounce">
          <div className="w-6 h-10 border-2 border-rose-400 dark:border-rose-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-rose-400 dark:bg-rose-300 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </header>

      <main className="relative bg-gradient-to-b from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950">
        {/* Features Section */}
        <section className="py-20 md:py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-rose-800 dark:text-rose-200 font-serif">
                Trouvez un(e) époux(se) de manière Halal
              </h2>
              <p className="text-xl text-rose-600 dark:text-rose-300 max-w-3xl mx-auto">
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
                  color: "rose" 
                },
                { 
                  icon: Users, 
                  title: "Profils Vérifiés", 
                  text: "Chaque profil est vérifié, vous assurant de rencontrer des personnes authentiques.", 
                  color: "pink" 
                },
                { 
                  icon: Heart, 
                  title: "Focus Compatibilité", 
                  text: "Notre système aide à vous matcher avec des partenaires partageant vos valeurs.", 
                  color: "rose" 
                }
              ].map((feature, index) => (
                <div key={index} className="group">
                  <div className="bg-white dark:bg-rose-900/50 rounded-2xl shadow-xl hover:shadow-3xl transform transition-all duration-500 hover:-translate-y-2 border border-rose-200 dark:border-rose-700 h-full">
                    <CardContent className="pt-12 pb-12 text-center h-full flex flex-col">
                      <div className="bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-800 dark:to-pink-800 p-6 rounded-full w-20 h-20 flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="h-10 w-10 text-rose-500 dark:text-rose-300" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-rose-800 dark:text-rose-200">{feature.title}</h3>
                      <p className="text-rose-600 dark:text-rose-300 leading-relaxed flex-grow">{feature.text}</p>
                    </CardContent>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-8 bg-gradient-to-r from-transparent via-rose-300/40 dark:via-rose-600/40 to-transparent my-16"></div>

        {/* Demo Section */}
        <section className="py-20 md:py-32 px-4 bg-gradient-to-r from-rose-100/50 to-pink-100/50 dark:from-rose-900/30 dark:to-pink-900/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-rose-800 dark:text-rose-200 font-serif">
              Découvrez Notre Plateforme
            </h2>
            <p className="text-xl text-rose-600 dark:text-rose-300 mb-12 max-w-2xl mx-auto">
              Essayez nos fonctionnalités de messagerie et d'appel vidéo avec des profils de démonstration interactifs.
            </p>
            
            <div className="bg-white dark:bg-rose-900/50 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-700 max-w-2xl mx-auto">
              <CardContent className="p-12">
                <DemoLink className="mb-6" />
                <p className="text-rose-600 dark:text-rose-300">
                  Explorez toutes les fonctionnalités en toute sécurité avec notre environnement de test.
                </p>
              </CardContent>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-8 bg-gradient-to-r from-transparent via-pink-300/40 dark:via-pink-600/40 to-transparent my-16"></div>

        {/* Resources Section */}
        <section className="py-20 md:py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-rose-800 dark:text-rose-200 font-serif">
                Ressources Mariage Islamique
              </h2>
              <p className="text-xl text-rose-600 dark:text-rose-300 max-w-3xl mx-auto">
                Explorez des ressources soigneusement sélectionnées pour vous aider à préparer un mariage islamique réussi.
              </p>
            </div>
            
            <FeaturedResources />
            
            <div className="text-center mt-16">
              <Button 
                asChild 
                variant="outline" 
                className="border-2 border-rose-400 text-rose-600 hover:bg-rose-100 dark:border-rose-400 dark:text-rose-300 dark:hover:bg-rose-900/30 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 rounded-full"
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

        {/* Divider */}
        <div className="h-8 bg-gradient-to-r from-transparent via-rose-300/40 dark:via-rose-600/40 to-transparent my-16"></div>

        {/* Testimonials Section */}
        <section className="py-20 md:py-32 px-4 bg-gradient-to-r from-rose-100/50 to-pink-100/50 dark:from-rose-900/30 dark:to-pink-900/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-rose-800 dark:text-rose-200 font-serif">
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
                <div key={index} className="bg-white dark:bg-rose-900/50 rounded-2xl shadow-xl border border-rose-200 dark:border-rose-700 h-full">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className="flex justify-center mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-6 w-6 text-rose-400 dark:text-rose-300 fill-current" />
                      ))}
                    </div>
                    <blockquote className="italic text-rose-700 dark:text-rose-200 text-lg text-center flex-grow leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                    <p className="mt-8 font-bold text-rose-800 dark:text-rose-200 text-center">— {testimonial.author}</p>
                  </CardContent>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-rose-400 via-pink-400 to-rose-300 dark:from-rose-800 dark:via-pink-800 dark:to-rose-700 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
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
