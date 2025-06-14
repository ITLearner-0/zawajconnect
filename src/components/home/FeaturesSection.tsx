
import { CardContent } from "@/components/ui/card";
import { Shield, Users, Heart } from "lucide-react";

const FeaturesSection = () => {
  const features = [
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
  ];

  return (
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
          {features.map((feature, index) => (
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
  );
};

export default FeaturesSection;
