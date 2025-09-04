import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Quote, BookOpen, Heart, Users } from 'lucide-react';

interface IslamicQuote {
  text: string;
  source: string;
  arabic?: string;
  category: 'marriage' | 'love' | 'family' | 'faith';
}

const IslamicQuotes = () => {
  const [currentQuote, setCurrentQuote] = useState(0);
  
  const quotes: IslamicQuote[] = [
    {
      text: "Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles et Il a mis entre vous de l'affection et de la bonté.",
      arabic: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
      source: "Coran 30:21",
      category: 'marriage'
    },
    {
      text: "Le monde entier est une provision, et la meilleure provision de ce monde est la femme vertueuse.",
      source: "Hadith - Sahih Muslim",
      category: 'marriage'
    },
    {
      text: "Celui qui se marie accomplit la moitié de sa religion, qu'il craigne Allah pour l'autre moitié.",
      source: "Hadith - Al-Bayhaqi",
      category: 'faith'
    },
    {
      text: "Les croyants qui ont la foi la plus parfaite sont ceux qui ont le meilleur comportement, et les meilleurs d'entre vous sont ceux qui sont les meilleurs avec leurs épouses.",
      source: "Hadith - At-Tirmidhi",
      category: 'love'
    },
    {
      text: "Ô vous qui avez cru ! Il vous est interdit d'hériter des femmes contre leur gré. Ne les empêchez pas de se remarier dans le but de vous approprier une partie de ce que vous leur aviez donné.",
      source: "Coran 4:19",
      category: 'family'
    },
    {
      text: "Et comportez-vous convenablement envers elles. Si vous avez de l'aversion envers elles durant la vie commune, il se peut que vous ayez de l'aversion pour une chose où Allah a déposé un grand bien.",
      source: "Coran 4:19",
      category: 'love'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 8000); // Change quote every 8 seconds

    return () => clearInterval(interval);
  }, [quotes.length]);

  const currentQuoteData = quotes[currentQuote];
  const categoryColors = {
    marriage: 'bg-emerald/10 text-emerald border-emerald/20',
    love: 'bg-gold/10 text-gold-dark border-gold/20', 
    family: 'bg-sage/10 text-sage-dark border-sage/30',
    faith: 'bg-cream-dark/10 text-foreground border-cream-dark/20'
  };

  const categoryIcons = {
    marriage: Heart,
    love: Heart,
    family: Users,
    faith: BookOpen
  };

  const CategoryIcon = categoryIcons[currentQuoteData.category];

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-cream/40 via-sage/10 to-emerald/5">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="h-14 w-14 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <Quote className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Sagesse Islamique sur le Mariage
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Laissez-vous inspirer par les enseignements du Coran et de la Sunnah concernant l'union sacrée
            </p>
          </div>

          <Card className="animate-slide-up card-hover bg-gradient-to-br from-white/80 to-cream/30 border-none shadow-lg">
            <CardContent className="p-8 lg:p-12">
              <div className="text-center space-y-6">
                {/* Arabic Text */}
                {currentQuoteData.arabic && (
                  <div className="animate-fade-in" key={`arabic-${currentQuote}`}>
                    <p className="text-2xl lg:text-3xl text-gold font-arabic leading-relaxed mb-4 opacity-90">
                      {currentQuoteData.arabic}
                    </p>
                  </div>
                )}
                
                {/* French Translation */}
                <div className="animate-fade-in" key={`text-${currentQuote}`} style={{ animationDelay: '0.2s' }}>
                  <blockquote className="text-lg lg:text-xl text-foreground leading-relaxed italic mb-6">
                    "{currentQuoteData.text}"
                  </blockquote>
                </div>

                {/* Source and Category */}
                <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-in" key={`source-${currentQuote}`} style={{ animationDelay: '0.4s' }}>
                  <Badge className={`${categoryColors[currentQuoteData.category]} flex items-center gap-2 px-3 py-1`}>
                    <CategoryIcon className="h-4 w-4" />
                    {currentQuoteData.category.charAt(0).toUpperCase() + currentQuoteData.category.slice(1)}
                  </Badge>
                  <p className="text-muted-foreground font-medium">
                    - {currentQuoteData.source}
                  </p>
                </div>

                {/* Quote Navigation Dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {quotes.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuote(index)}
                      className={`h-3 w-3 rounded-full transition-all duration-300 ${
                        index === currentQuote 
                          ? 'bg-emerald scale-125' 
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                      }`}
                      aria-label={`Quote ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Rejoignez notre communauté et trouvez votre partenaire de vie dans le respect des valeurs islamiques
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-emerald to-emerald-light text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all">
                Commencer Ma Recherche
              </button>
              <button className="border border-emerald text-emerald px-8 py-3 rounded-lg font-semibold hover:bg-emerald/10 transition-all">
                En Savoir Plus
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IslamicQuotes;