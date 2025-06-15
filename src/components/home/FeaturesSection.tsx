
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Shield, Users, MessageCircle, Video, UserCheck, ArrowRight } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Supervision Wali",
      description: "Respectez les traditions islamiques avec la supervision familiale intégrée",
      benefits: [
        "Conversations surveillées par le wali",
        "Transparence totale avec les familles",
        "Respect des valeurs islamiques"
      ],
      color: "from-rose-500 to-pink-500",
      bgColor: "bg-rose-50 dark:bg-rose-900/30"
    },
    {
      icon: Heart,
      title: "Compatibilité Avancée",
      description: "Algorithme basé sur les valeurs islamiques et la personnalité",
      benefits: [
        "Test de compatibilité religieuse",
        "Matching basé sur les objectifs de vie",
        "Évaluation de la pratique religieuse"
      ],
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50 dark:bg-pink-900/30"
    },
    {
      icon: Users,
      title: "Communauté Vérifiée",
      description: "Profils authentifiés pour des rencontres en toute sécurité",
      benefits: [
        "Vérification d'identité obligatoire",
        "Modération active 24/7",
        "Communauté engagée et sérieuse"
      ],
      color: "from-rose-600 to-pink-400",
      bgColor: "bg-rose-100 dark:bg-rose-800/30"
    },
    {
      icon: MessageCircle,
      title: "Messagerie Sécurisée",
      description: "Communication respectueuse et protégée",
      benefits: [
        "Messages chiffrés de bout en bout",
        "Contrôle parental intégré",
        "Historique conservé pour transparence"
      ],
      color: "from-pink-600 to-rose-400",
      bgColor: "bg-pink-100 dark:bg-pink-800/30"
    }
  ];

  const additionalFeatures = [
    {
      icon: Video,
      title: "Appels Vidéo Supervisés",
      description: "Rencontres virtuelles respectueuses"
    },
    {
      icon: UserCheck,
      title: "Profils Détaillés",
      description: "Informations complètes sur les pratiques religieuses"
    }
  ];

  return (
    <section className="py-20 md:py-32 px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e11d48' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20s-20-8.954-20-20 8.954-20 20-20 20 8.954 20 20zm0-20c0 11.046-8.954 20-20 20s-20-8.954-20-20 8.954-20 20-20 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-rose-800 dark:text-rose-200 font-serif">
            Fonctionnalités Uniques
          </h2>
          <p className="text-xl text-rose-600 dark:text-rose-300 max-w-3xl mx-auto leading-relaxed">
            Des outils pensés pour respecter vos valeurs tout en facilitant des rencontres authentiques et sérieuses.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`group ${feature.bgColor} rounded-3xl p-8 border border-rose-200 dark:border-rose-700 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500`}
            >
              <div className="flex items-start gap-6">
                <div className={`bg-gradient-to-br ${feature.color} p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-rose-800 dark:text-rose-200 mb-3 group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-rose-600 dark:text-rose-300 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-16">
          {additionalFeatures.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white/80 dark:bg-rose-900/40 backdrop-blur-sm rounded-2xl p-6 border border-rose-200 dark:border-rose-700 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-rose-400 to-pink-400 p-3 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-800 dark:text-rose-200 group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-rose-600 dark:text-rose-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/50 dark:to-pink-900/50 rounded-2xl p-8 border border-rose-200 dark:border-rose-700 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-rose-800 dark:text-rose-200 mb-4">
              Prêt à Commencer Votre Recherche ?
            </h3>
            <p className="text-rose-600 dark:text-rose-300 mb-6">
              Rejoignez des milliers de musulmans qui ont trouvé leur moitié grâce à notre plateforme.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Link to="/auth?signup=true" className="flex items-center gap-2">
                  Commencer Maintenant
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="border-2 border-rose-400 text-rose-600 hover:bg-rose-50 dark:border-rose-400 dark:text-rose-300 dark:hover:bg-rose-900/30 font-bold px-8 py-3 rounded-full"
              >
                <Link to="/demo">
                  Voir la Démo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
