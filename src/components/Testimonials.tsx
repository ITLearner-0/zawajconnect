import { Card, CardContent } from "@/components/ui/card";
import { Quote, Heart } from "lucide-react";

const testimonials = [
  {
    name: "Amina & Youssef",
    location: "Paris, France",
    duration: "Mariés depuis 2 ans",
    quote: "Grâce à NikahConnect, nous avons pu nous rencontrer dans le respect total de nos valeurs. L'implication de nos familles dès le début a rendu notre union encore plus bénie. Alhamdulillah.",
    image: "👩🏻‍🤝‍👨🏽"
  },
  {
    name: "Fatima & Omar",
    location: "Lyon, France", 
    duration: "Mariés depuis 1 an",
    quote: "La plateforme nous a permis de communiquer de manière halal et respectueuse. Nos familles ont été impliquées à chaque étape. C'était exactement ce que nous recherchions.",
    image: "👩🏻‍🤝‍👨🏻"
  },
  {
    name: "Khadija & Ahmed",
    location: "Marseille, France",
    duration: "Mariés depuis 3 ans",
    quote: "Nous avons apprécié l'approche islamique de la plateforme. Chaque interaction était guidée par la Haya et le respect mutuel. Qu'Allah bénisse cette initiative.",
    image: "🧕🏽👨🏽"
  }
];

const Testimonials = () => {
  return (
    <section id="temoignages" className="py-20 bg-gradient-to-b from-cream to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Témoignages de <span className="text-emerald">Couples Unis</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez les histoires inspirantes de couples qui ont trouvé leur bonheur 
            en respectant les valeurs islamiques.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="shadow-soft hover:shadow-lg transition-all duration-300 border-0 relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-10">
                <Quote className="h-12 w-12 text-emerald" />
              </div>
              
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{testimonial.image}</div>
                  <h3 className="font-bold text-lg text-foreground">{testimonial.name}</h3>
                  <p className="text-emerald text-sm font-medium">{testimonial.location}</p>
                  <p className="text-muted-foreground text-xs">{testimonial.duration}</p>
                </div>
                
                <blockquote className="text-muted-foreground text-sm leading-relaxed italic text-center">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex justify-center mt-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Heart key={i} className="h-4 w-4 fill-emerald text-emerald" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-6">
            <div className="text-3xl font-bold text-emerald mb-2">500+</div>
            <p className="text-muted-foreground text-sm">Mariages bénis</p>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-gold mb-2">95%</div>
            <p className="text-muted-foreground text-sm">Satisfaction familiale</p>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-emerald mb-2">100%</div>
            <p className="text-muted-foreground text-sm">Approche Halal</p>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-gold mb-2">24/7</div>
            <p className="text-muted-foreground text-sm">Support religieux</p>
          </div>
        </div>

        {/* Islamic blessing */}
        <div className="text-center mt-12 p-6 bg-card rounded-lg shadow-soft border-l-4 border-gold">
          <p className="text-muted-foreground italic mb-2">
            "Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles 
            et Il a mis entre vous de l'affection et de la bonté."
          </p>
          <p className="text-sm text-gold font-medium">- Sourate Ar-Rum, verset 21</p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;