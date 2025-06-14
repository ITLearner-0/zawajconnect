
import { CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const EnhancedTestimonialsSection = () => {
  const testimonials = [
    { 
      quote: "Alhamdulillah, j'ai trouvé mon mari grâce à cette application. La fonction de supervision du wali a rassuré ma famille et nous a permis de nous connaître dans le respect des valeurs islamiques.", 
      author: "Fatima S.",
      location: "Paris",
      age: "28 ans",
      timeToMatch: "3 mois"
    },
    { 
      quote: "Cette plateforme m'a aidé à trouver quelqu'un qui partage vraiment mes valeurs et ma vision d'un foyer islamique. Le processus de vérification des profils est excellent.", 
      author: "Ahmed K.",
      location: "Lyon", 
      age: "32 ans",
      timeToMatch: "5 mois"
    },
    {
      quote: "En tant que wali, j'ai apprécié la transparence et le contrôle que j'avais sur les conversations de ma fille. Très rassurant pour les familles.",
      author: "Abu Yussef",
      location: "Marseille",
      age: "55 ans",
      timeToMatch: "2 mois"
    }
  ];

  return (
    <section className="py-20 md:py-32 px-4 bg-gradient-to-r from-rose-100/50 to-pink-100/50 dark:from-rose-900/30 dark:to-pink-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-rose-800 dark:text-rose-200 font-serif">
            Histoires de Réussite
          </h2>
          <p className="text-xl text-rose-600 dark:text-rose-300 max-w-3xl mx-auto">
            Découvrez comment notre plateforme a aidé des familles musulmanes à trouver leur bonheur
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white dark:bg-rose-900/50 rounded-2xl shadow-xl border border-rose-200 dark:border-rose-700 h-full group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 h-full flex flex-col">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-rose-400 dark:text-rose-300 fill-current" />
                  ))}
                </div>
                
                <Quote className="h-8 w-8 text-rose-300 dark:text-rose-600 mb-4 mx-auto" />
                
                <blockquote className="italic text-rose-700 dark:text-rose-200 text-base text-center flex-grow leading-relaxed mb-6">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="text-center border-t border-rose-200 dark:border-rose-700 pt-4">
                  <p className="font-bold text-rose-800 dark:text-rose-200 mb-2">— {testimonial.author}</p>
                  <div className="text-sm text-rose-600 dark:text-rose-400 space-y-1">
                    <p>{testimonial.location} • {testimonial.age}</p>
                    <p className="text-xs bg-rose-100 dark:bg-rose-800/50 px-2 py-1 rounded-full inline-block">
                      Trouvé en {testimonial.timeToMatch}
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="bg-white/50 dark:bg-rose-900/30 backdrop-blur-sm rounded-lg p-6 border border-rose-200 dark:border-rose-700 max-w-md mx-auto">
            <p className="text-rose-700 dark:text-rose-300 font-medium mb-2">Plus de 500 couples mariés</p>
            <p className="text-sm text-rose-600 dark:text-rose-400">avec un taux de satisfaction de 4.9/5</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedTestimonialsSection;
