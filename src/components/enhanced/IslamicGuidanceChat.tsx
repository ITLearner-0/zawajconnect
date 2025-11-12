// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen,
  Heart,
  Clock,
  Star,
  Moon,
  Sun,
  MessageCircle,
  RefreshCw,
  Quote,
  Lightbulb,
  Compass,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface IslamicContent {
  id: string;
  type: 'verse' | 'hadith' | 'guidance' | 'prayer_reminder' | 'conversation_starter';
  content: string;
  reference?: string;
  category: string;
  relevance_score?: number;
  timing?: 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
}

interface ConversationContext {
  stage: 'introduction' | 'getting_to_know' | 'deeper_discussion' | 'family_meeting';
  duration_days: number;
  message_count: number;
  last_topics: string[];
  relationship_level: 'acquaintance' | 'interested' | 'serious' | 'family_approved';
}

interface IslamicGuidanceChatProps {
  matchId: string;
  conversationContext?: ConversationContext;
  onApplyGuidance?: (guidance: IslamicContent) => void;
}

const IslamicGuidanceChat: React.FC<IslamicGuidanceChatProps> = ({
  matchId,
  conversationContext,
  onApplyGuidance,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [guidanceContent, setGuidanceContent] = useState<IslamicContent[]>([]);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchIslamicGuidance();
    fetchPrayerTimes();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [matchId, conversationContext]);

  const fetchIslamicGuidance = async () => {
    try {
      // Get relevant Islamic guidance based on context
      const { data: guidanceData, error } = await supabase
        .from('islamic_guidance')
        .select('*')
        .eq('published', true)
        .order('featured', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform to our interface
      const guidance: IslamicContent[] = (guidanceData || []).map((item) => ({
        id: item.id,
        type: 'guidance' as const,
        content: item.content,
        reference: item.author,
        category: item.category,
        timing: 'any' as const,
      }));

      // Add contextual verses and hadiths
      const contextualContent = getContextualIslamicContent();

      setGuidanceContent([...guidance, ...contextualContent]);
    } catch (error) {
      console.error('Error fetching Islamic guidance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContextualIslamicContent = (): IslamicContent[] => {
    const currentHour = currentTime.getHours();
    const timeOfDay =
      currentHour < 12
        ? 'morning'
        : currentHour < 17
          ? 'afternoon'
          : currentHour < 21
            ? 'evening'
            : 'night';

    const baseContent: IslamicContent[] = [
      // Quranic verses about marriage and relationships
      {
        id: 'verse-marriage-1',
        type: 'verse',
        content:
          "Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles et Il a mis entre vous de l'affection et de la bonté. Il y a en cela des preuves pour des gens qui réfléchissent.",
        reference: 'Coran 30:21',
        category: 'mariage',
        timing: 'any',
      },
      {
        id: 'verse-respect-1',
        type: 'verse',
        content:
          "Ô vous qui avez cru ! Il ne convient pas que vous héritiez des femmes contre leur gré. Ne les empêchez pas de se remarier dans le but de récupérer une partie de ce que vous leur aviez donné, à moins qu'elles ne commettent un péché prouvé.",
        reference: 'Coran 4:19',
        category: 'respect',
        timing: 'any',
      },
      // Hadiths about good character
      {
        id: 'hadith-character-1',
        type: 'hadith',
        content:
          "Les croyants les plus parfaits en matière de foi sont ceux d'entre eux qui ont le meilleur caractère.",
        reference: 'Abu Dawud',
        category: 'caractère',
        timing: 'any',
      },
      {
        id: 'hadith-marriage-1',
        type: 'hadith',
        content:
          "Quand l'homme regarde sa femme et qu'elle le regarde, Allah les regarde avec miséricorde.",
        reference: 'Tirmidhi',
        category: 'mariage',
        timing: 'any',
      },
    ];

    // Add prayer reminders based on time
    if (currentHour >= 5 && currentHour < 6) {
      baseContent.push({
        id: 'prayer-fajr',
        type: 'prayer_reminder',
        content:
          "C'est l'heure de la prière de Fajr. Prendre un moment pour se connecter à Allah peut bénir vos interactions.",
        category: 'prière',
        timing: 'morning',
      });
    }

    // Add conversation starters based on context
    if (conversationContext?.stage === 'introduction') {
      baseContent.push(
        {
          id: 'starter-introduction-1',
          type: 'conversation_starter',
          content:
            'Vous pourriez partager vos aspirations spirituelles et comment votre foi guide votre vie quotidienne.',
          category: 'conversation',
          timing: 'any',
        },
        {
          id: 'starter-introduction-2',
          type: 'conversation_starter',
          content:
            'Discuter de vos valeurs islamiques importantes pourrait créer une base solide pour votre relation.',
          category: 'conversation',
          timing: 'any',
        }
      );
    } else if (conversationContext?.stage === 'getting_to_know') {
      baseContent.push(
        {
          id: 'starter-getting-to-know-1',
          type: 'conversation_starter',
          content:
            'Explorez ensemble comment vous envisagez construire un foyer islamique harmonieux.',
          category: 'conversation',
          timing: 'any',
        },
        {
          id: 'starter-getting-to-know-2',
          type: 'conversation_starter',
          content:
            "Partagez vos expériences d'apprentissage de l'Islam et vos sources d'inspiration spirituelle.",
          category: 'conversation',
          timing: 'any',
        }
      );
    }

    // Add time-specific guidance
    if (timeOfDay === 'morning') {
      baseContent.push({
        id: 'morning-guidance',
        type: 'guidance',
        content:
          'Le matin est un moment béni pour des conversations sincères et constructives. Commencez par invoquer Allah.',
        category: 'moment',
        timing: 'morning',
      });
    } else if (timeOfDay === 'evening') {
      baseContent.push({
        id: 'evening-guidance',
        type: 'guidance',
        content:
          'Les conversations du soir peuvent être plus profondes. Réfléchissez ensemble sur les bénédictions de la journée.',
        category: 'moment',
        timing: 'evening',
      });
    }

    return baseContent;
  };

  const fetchPrayerTimes = async () => {
    try {
      // For now, we'll use approximate prayer times for France
      const today = new Date();
      setPrayerTimes({
        fajr: '05:30',
        dhuhr: '13:00',
        asr: '16:30',
        maghrib: '19:00',
        isha: '21:00',
        date: today.toDateString(),
      });
    } catch (error) {
      console.error('Error fetching prayer times:', error);
    }
  };

  const isNearPrayerTime = () => {
    if (!prayerTimes) return false;

    const now = format(currentTime, 'HH:mm');
    const prayerTimesList = [
      prayerTimes.fajr,
      prayerTimes.dhuhr,
      prayerTimes.asr,
      prayerTimes.maghrib,
      prayerTimes.isha,
    ];

    return prayerTimesList.some((prayerTime) => {
      const [pHour, pMinute] = prayerTime.split(':').map(Number);
      const [nHour, nMinute] = now.split(':').map(Number);
      const prayerMinutes = pHour * 60 + pMinute;
      const currentMinutes = nHour * 60 + nMinute;

      // Within 15 minutes before prayer time
      return Math.abs(prayerMinutes - currentMinutes) <= 15 && prayerMinutes > currentMinutes;
    });
  };

  const getGuidanceIcon = (type: string) => {
    switch (type) {
      case 'verse':
        return BookOpen;
      case 'hadith':
        return Quote;
      case 'guidance':
        return Lightbulb;
      case 'prayer_reminder':
        return Moon;
      case 'conversation_starter':
        return MessageCircle;
      default:
        return Heart;
    }
  };

  const getGuidanceColor = (type: string) => {
    switch (type) {
      case 'verse':
        return 'text-emerald-600 bg-emerald-50';
      case 'hadith':
        return 'text-blue-600 bg-blue-50';
      case 'guidance':
        return 'text-amber-600 bg-amber-50';
      case 'prayer_reminder':
        return 'text-purple-600 bg-purple-50';
      case 'conversation_starter':
        return 'text-pink-600 bg-pink-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredContent =
    selectedCategory === 'all'
      ? guidanceContent
      : guidanceContent.filter((item) => item.category === selectedCategory);

  const categories = [...new Set(guidanceContent.map((item) => item.category))];

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">
                Chargement des guidances islamiques...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            Guidance Islamique
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              fetchIslamicGuidance();
              toast({ title: 'Guidance actualisée' });
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Prayer Time Alert */}
        {isNearPrayerTime() && prayerTimes && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800">Temps de prière approche</p>
                <p className="text-xs text-purple-600">
                  Considérez prendre une pause pour la prière
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            Tout
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <Separator />

        {/* Guidance Content */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredContent.map((item) => {
            const Icon = getGuidanceIcon(item.type);
            const colorClasses = getGuidanceColor(item.type);

            return (
              <div
                key={item.id}
                className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${colorClasses}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.type === 'verse' && 'Verset'}
                        {item.type === 'hadith' && 'Hadith'}
                        {item.type === 'guidance' && 'Guidance'}
                        {item.type === 'prayer_reminder' && 'Rappel de prière'}
                        {item.type === 'conversation_starter' && 'Sujet de conversation'}
                      </Badge>
                      {onApplyGuidance && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onApplyGuidance(item)}
                          className="text-xs"
                        >
                          Utiliser
                        </Button>
                      )}
                    </div>

                    <p className="text-sm mb-2 leading-relaxed">{item.content}</p>

                    {item.reference && (
                      <p className="text-xs text-muted-foreground italic">— {item.reference}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Aucune guidance disponible pour cette catégorie</p>
          </div>
        )}

        {/* Prayer Times Display */}
        {prayerTimes && (
          <div className="mt-6 p-3 bg-secondary/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Horaires de prière d'aujourd'hui
            </h4>
            <div className="grid grid-cols-5 gap-2 text-xs">
              <div className="text-center">
                <p className="font-medium">Fajr</p>
                <p className="text-muted-foreground">{prayerTimes.fajr}</p>
              </div>
              <div className="text-center">
                <p className="font-medium">Dhuhr</p>
                <p className="text-muted-foreground">{prayerTimes.dhuhr}</p>
              </div>
              <div className="text-center">
                <p className="font-medium">Asr</p>
                <p className="text-muted-foreground">{prayerTimes.asr}</p>
              </div>
              <div className="text-center">
                <p className="font-medium">Maghrib</p>
                <p className="text-muted-foreground">{prayerTimes.maghrib}</p>
              </div>
              <div className="text-center">
                <p className="font-medium">Isha</p>
                <p className="text-muted-foreground">{prayerTimes.isha}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IslamicGuidanceChat;
