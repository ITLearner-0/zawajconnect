
import { CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    { 
      quote: "Alhamdulillah, j'ai trouvé mon mari grâce à cette application. La fonction de supervision du wali a rassuré ma famille.", 
      author: "Fatima S., Paris" 
    },
    { 
      quote: "Cette plateforme m'a aidé à trouver quelqu'un qui partage vraiment mes valeurs et ma vision d'un foyer islamique.", 
      author: "Ahmed K., Lyon" 
    }
  ];

  return (
    <section className="py-20 md:py-32 px-4 bg-gradient-to-r from-rose-100/50 to-pink-100/50 dark:from-rose-900/30 dark:to-pink-900/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-rose-800 dark:text-rose-200 font-serif">
          Histoires de Réussite
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
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
  );
};

export default TestimonialsSection;
