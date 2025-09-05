import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  avatar?: string;
  content: string;
  rating: number;
  matchedWith: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Amina & Omar",
    location: "Paris, France",
    content: "Nous nous sommes rencontrés sur cette plateforme il y a 2 ans. L'approche respectueuse des valeurs islamiques nous a tout de suite séduits. Aujourd'hui, nous sommes mariés et parents d'un petit garçon.",
    rating: 5,
    matchedWith: "Omar"
  },
  {
    id: 2,
    name: "Sarah & Youssef",
    location: "Lyon, France", 
    content: "La fonctionnalité de compatibilité religieuse nous a permis de trouver exactement ce que nous cherchions. Nos familles ont été impliquées dès le début, comme le veut notre tradition.",
    rating: 5,
    matchedWith: "Youssef"
  },
  {
    id: 3,
    name: "Khadija & Ahmed",
    location: "Marseille, France",
    content: "Grâce aux filtres détaillés et à l'accompagnement personnalisé, nous avons pu nous concentrer sur l'essentiel : construire une relation basée sur nos valeurs communes.",
    rating: 5,
    matchedWith: "Ahmed"
  },
  {
    id: 4,
    name: "Fatima & Karim",
    location: "Toulouse, France",
    content: "L'approche halal de cette plateforme nous a rassurés. Nous avons pu apprendre à nous connaître dans le respect et la transparence. Aujourd'hui, nous préparons notre nikah.",
    rating: 5,
    matchedWith: "Karim"
  }
];

const Testimonials = () => {
  return (
    <section id="temoignages" className="py-20 bg-gradient-to-br from-sage/5 via-cream/10 to-emerald/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-sage-700 bg-clip-text text-transparent">
            Témoignages de Bonheur
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les histoires inspirantes de couples qui ont trouvé l'amour et construit leur famille grâce à notre plateforme
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.id} 
              className="relative overflow-hidden border-0 shadow-lg card-hover animate-slide-up bg-card/80 backdrop-blur-sm group"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardContent className="p-8">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-emerald-200 opacity-50 group-hover:animate-float" />
                
                <div className="flex items-center gap-4 mb-6 animate-fade-in" style={{ animationDelay: `${index * 0.2 + 0.1}s` }}>
                  <Avatar className="w-16 h-16 ring-2 ring-emerald-100 hover-scale">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-sage-100 text-emerald-700 text-lg font-semibold">
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                    <p className="text-muted-foreground">{testimonial.location}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 transition-smooth hover-scale ${
                            i < testimonial.rating
                              ? 'text-amber-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <blockquote className="text-muted-foreground leading-relaxed mb-4 text-lg italic animate-fade-in" style={{ animationDelay: `${index * 0.2 + 0.2}s` }}>
                  "{testimonial.content}"
                </blockquote>

                <div className="border-t border-emerald-100 pt-4 animate-fade-in" style={{ animationDelay: `${index * 0.2 + 0.3}s` }}>
                  <p className="text-sm text-emerald-600 font-medium">
                    Mariés • Alhamdulillah
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-sage-50 px-6 py-3 rounded-full border border-emerald-200">
            <Star className="w-5 h-5 text-amber-400 fill-current" />
            <span className="font-semibold text-emerald-700">
              4.9/5 • Plus de 2,000 couples heureux
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;