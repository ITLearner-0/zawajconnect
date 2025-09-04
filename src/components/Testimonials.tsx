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
    name: "Fatima A.",
    location: "London, UK",
    content: "Alhamdulillah, I found my perfect match through NikahNoor. The platform's emphasis on Islamic values and family involvement made me feel safe and confident in my search.",
    rating: 5,
    matchedWith: "Ahmed M."
  },
  {
    id: 2,
    name: "Omar K.",
    location: "Toronto, Canada", 
    content: "The verification process gave me peace of mind knowing I was connecting with genuine people. Met my wife here 6 months ago, and we couldn't be happier!",
    rating: 5,
    matchedWith: "Khadija S."
  },
  {
    id: 3,
    name: "Aisha R.",
    location: "Sydney, Australia",
    content: "What I loved most was the Islamic guidance section and the respectful approach to matrimony. It felt like a community where my values were understood and respected.",
    rating: 5,
    matchedWith: "Yusuf A."
  },
  {
    id: 4,
    name: "Ibrahim H.",
    location: "Dubai, UAE",
    content: "The family involvement feature was perfect for our traditional approach to marriage. Both families were able to connect and get to know each other properly.",
    rating: 5,
    matchedWith: "Mariam L."
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-sage/5 via-cream/10 to-emerald/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-sage-700 bg-clip-text text-transparent">
            Success Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Alhamdulillah, thousands have found their life partners through NikahNoor. 
            Here are some of their beautiful stories.
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
                    Married to {testimonial.matchedWith} • Alhamdulillah
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
              4.9/5 • Over 2,000+ Happy Couples
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;