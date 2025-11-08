import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Heart, Star, RefreshCw, Clock, Users } from 'lucide-react';

interface IslamicReminder {
  id: string;
  category: 'marriage' | 'dua' | 'hadith' | 'quran' | 'advice';
  title: string;
  arabic?: string;
  translation: string;
  source: string;
  benefits: string[];
}

const IslamicReminders = () => {
  const [currentReminder, setCurrentReminder] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const reminders: IslamicReminder[] = [
    {
      id: '1',
      category: 'dua',
      title: 'Dua pour trouver un bon époux/épouse',
      arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ',
      translation: 'Notre Seigneur ! Donne-nous, en nos épouses et nos descendants, la joie des yeux',
      source: 'Coran 25:74',
      benefits: ['Demande la bénédiction d\'Allah', 'Recherche la tranquillité', 'Invoque la satisfaction']
    },
    {
      id: '2', 
      category: 'hadith',
      title: 'L\'importance du mariage en Islam',
      translation: 'Quand une personne se marie, elle complète la moitié de sa religion',
      source: 'Hadith rapporté par At-Tabarani',
      benefits: ['Complète la foi', 'Protège de la tentation', 'Apporte la bénédiction']
    },
    {
      id: '3',
      category: 'quran',
      title: 'Les qualités d\'un bon partenaire',
      arabic: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا',
      translation: 'Et parmi Ses signes, Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles',
      source: 'Coran 30:21',
      benefits: ['Recherche la tranquillité', 'Compréhension mutuelle', 'Paix du cœur']
    },
    {
      id: '4',
      category: 'advice',
      title: 'Conseil pour les candidats au mariage',
      translation: 'Épousez celle qui est religieuse, vous serez gagnants',
      source: 'Hadith du Prophète ﷺ (Bukhari & Muslim)',
      benefits: ['Priorité à la religion', 'Stabilité du foyer', 'Éducation des enfants']
    },
    {
      id: '5',
      category: 'dua',
      title: 'Dua avant de rencontrer un prétendant',
      arabic: 'اللَّهُمَّ خِرْ لِي وَاخْتَرْ لِي',
      translation: 'Ô Allah, choisis pour moi et fais le bon choix pour moi',
      source: 'Dua d\'Istikhara',
      benefits: ['Guidance divine', 'Bon choix', 'Tranquillité d\'esprit']
    },
    {
      id: '6',
      category: 'marriage',
      title: 'Les droits et devoirs des époux',
      translation: 'Les meilleures personnes sont celles qui sont bonnes envers leurs familles',
      source: 'Hadith du Prophète ﷺ',
      benefits: ['Respect mutuel', 'Harmonie conjugale', 'Exemple prophétique']
    }
  ];

  const categoryConfig = {
    marriage: { icon: Heart, color: 'bg-pink/10 text-pink-dark border-pink/20', label: 'Mariage' },
    dua: { icon: Star, color: 'bg-gold/10 text-gold-dark border-gold/20', label: 'Dua' },
    hadith: { icon: BookOpen, color: 'bg-emerald/10 text-emerald-dark border-emerald/20', label: 'Hadith' },
    quran: { icon: BookOpen, color: 'bg-blue/10 text-blue-dark border-blue/20', label: 'Coran' },
    advice: { icon: Users, color: 'bg-purple/10 text-purple-dark border-purple/20', label: 'Conseil' }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCurrentReminder(curr => (curr + 1) % reminders.length);
          return 300; // Reset to 5 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const nextReminder = () => {
    setCurrentReminder((prev) => (prev + 1) % reminders.length);
    setTimeLeft(300);
  };

  const prevReminder = () => {
    setCurrentReminder((prev) => (prev - 1 + reminders.length) % reminders.length);
    setTimeLeft(300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const current = reminders[currentReminder];
  if (!current) return null;
  
  const category = categoryConfig[current.category];

  return (
    <section className="py-16 px-4 bg-background border-y border-border">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Rappels Islamiques
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Des versets, hadiths et conseils pour vous guider dans votre recherche du partenaire idéal
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Reminder Card */}
          <div className="lg:col-span-2">
            <Card className="h-full border border-border bg-card">
              <CardContent className="p-8">
                {/* Header with Category and Timer */}
                <div className="flex items-center justify-between mb-6">
                  <Badge className={category.color}>
                    <category.icon className="h-3 w-3 mr-1" />
                    {category.label}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Prochain dans {formatTime(timeLeft)}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  {current.title}
                </h3>

                {/* Arabic Text */}
                {current.arabic && (
                  <div className="text-center mb-6 p-4 bg-muted rounded border border-border">
                    <p className="text-2xl font-arabic text-foreground leading-relaxed">
                      {current.arabic}
                    </p>
                  </div>
                )}

                {/* Translation */}
                <div className="mb-6">
                  <blockquote className="text-lg text-muted-foreground italic leading-relaxed border-l-4 border-primary pl-4">
                    "{current.translation}"
                  </blockquote>
                  <p className="text-sm text-primary font-medium mt-2">
                    - {current.source}
                  </p>
                </div>

                {/* Benefits */}
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-3">Bienfaits spirituels :</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {current.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={prevReminder}
                  >
                    ← Précédent
                  </Button>
                  
                  <div className="flex gap-2">
                    {reminders.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentReminder(index);
                          setTimeLeft(300);
                        }}
                        className={`h-2 w-8 rounded-full ${
                          index === currentReminder ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={nextReminder}
                  >
                    Suivant →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border border-border bg-card">
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  Actions Rapides
                </h4>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={nextReminder}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Nouveau rappel
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setTimeLeft(300)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Réinitialiser timer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Categories Overview */}
            <Card className="border border-border bg-card">
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-4">Catégories</h4>
                <div className="space-y-2">
                  {Object.entries(categoryConfig).map(([key, config]) => {
                    const count = reminders.filter(r => r.category === key).length;
                    return (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{config.label}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Daily Reminder */}
            <Card className="border border-border bg-muted">
              <CardContent className="p-6 text-center">
                <h4 className="font-semibold text-foreground mb-3">Rappel du Jour</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  "Recherchez la guidance d'Allah dans tous vos choix importants."
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Faire Salat al-Istikhara
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IslamicReminders;