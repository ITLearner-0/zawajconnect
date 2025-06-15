
import { CardContent } from "@/components/ui/card";
import DemoLink from "@/components/demo/DemoLink";
import { MessageSquare, Video, Shield, Heart, Users, Star } from "lucide-react";
import OptimizedImage from "@/components/ui/OptimizedImage";

const demoFeatures = [
  {
    icon: MessageSquare,
    title: "Messagerie Sécurisée",
    description: "Chat en temps réel avec chiffrement end-to-end"
  },
  {
    icon: Video,
    title: "Appels Vidéo",
    description: "Rencontres virtuelles supervisées par le Wali"
  },
  {
    icon: Shield,
    title: "Supervision Wali",
    description: "Surveillance respectueuse des conversations"
  },
  {
    icon: Heart,
    title: "Compatibilité",
    description: "Système de matching basé sur les valeurs islamiques"
  }
];

const DemoSection = () => {
  return (
    <section className="py-20 md:py-32 px-4 bg-gradient-to-r from-rose-100/50 to-pink-100/50 dark:from-rose-900/30 dark:to-pink-900/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-rose-800 dark:text-rose-200 font-serif">
            Découvrez Notre Plateforme
          </h2>
          <p className="text-xl text-rose-600 dark:text-rose-300 mb-8 max-w-3xl mx-auto">
            Explorez toutes nos fonctionnalités avec des profils de démonstration interactifs. 
            Testez la messagerie, les appels vidéo et découvrez comment nous respectons les valeurs islamiques.
          </p>
        </div>

        {/* Main Demo Area */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Demo Preview */}
          <div className="order-2 lg:order-1">
            <div className="relative bg-white dark:bg-rose-900/50 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-700 overflow-hidden">
              {/* Mock Screenshot */}
              <div className="aspect-video bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900 dark:to-pink-900 p-6">
                <div className="h-full bg-white dark:bg-rose-800 rounded-lg shadow-inner flex items-center justify-center">
                  <OptimizedImage
                    src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop"
                    alt="Interface de démonstration de la plateforme de mariage"
                    className="w-full h-full rounded-lg opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-rose-900/20 dark:bg-rose-700/30 rounded-lg">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4 opacity-90" />
                      <p className="text-lg font-semibold">Interface de Messagerie</p>
                      <p className="text-sm opacity-80">Testez nos fonctionnalités en direct</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Demo Action */}
              <div className="p-8 text-center">
                <DemoLink className="mb-4" />
                <p className="text-sm text-rose-600 dark:text-rose-300">
                  Environnement de test sécurisé • Aucun engagement requis
                </p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="order-1 lg:order-2">
            <h3 className="text-3xl font-bold mb-8 text-rose-800 dark:text-rose-200">
              Fonctionnalités à Tester
            </h3>
            <div className="space-y-6">
              {demoFeatures.map((feature, index) => (
                <div 
                  key={feature.title} 
                  className="flex items-start gap-4 p-4 bg-white/50 dark:bg-rose-900/30 rounded-xl border border-rose-200/50 dark:border-rose-700/50 hover:bg-white/70 dark:hover:bg-rose-900/50 transition-all duration-300"
                >
                  <div className="bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-800 dark:to-pink-800 p-3 rounded-lg">
                    <feature.icon className="h-6 w-6 text-rose-600 dark:text-rose-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-rose-800 dark:text-rose-200 mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-rose-600 dark:text-rose-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Demo Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white dark:bg-rose-900/50 rounded-2xl p-8 border border-rose-200 dark:border-rose-700">
          <div className="text-center">
            <Users className="h-8 w-8 text-rose-600 dark:text-rose-300 mx-auto mb-2" />
            <div className="text-2xl font-bold text-rose-800 dark:text-rose-200">1000+</div>
            <div className="text-sm text-rose-600 dark:text-rose-400">Tests par Jour</div>
          </div>
          <div className="text-center">
            <Star className="h-8 w-8 text-rose-600 dark:text-rose-300 mx-auto mb-2" />
            <div className="text-2xl font-bold text-rose-800 dark:text-rose-200">4.9/5</div>
            <div className="text-sm text-rose-600 dark:text-rose-400">Satisfaction Demo</div>
          </div>
          <div className="text-center">
            <MessageSquare className="h-8 w-8 text-rose-600 dark:text-rose-300 mx-auto mb-2" />
            <div className="text-2xl font-bold text-rose-800 dark:text-rose-200">24/7</div>
            <div className="text-sm text-rose-600 dark:text-rose-400">Disponibilité</div>
          </div>
          <div className="text-center">
            <Shield className="h-8 w-8 text-rose-600 dark:text-rose-300 mx-auto mb-2" />
            <div className="text-2xl font-bold text-rose-800 dark:text-rose-200">100%</div>
            <div className="text-sm text-rose-600 dark:text-rose-400">Sécurisé</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-lg text-rose-700 dark:text-rose-300 mb-6">
            Prêt à commencer votre voyage vers le mariage halal ?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              S'inscrire Maintenant
            </button>
            <button className="border-2 border-rose-400 text-rose-600 bg-white/50 backdrop-blur-sm hover:bg-rose-50 dark:border-rose-300 dark:text-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-800/50 font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              En Savoir Plus
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
