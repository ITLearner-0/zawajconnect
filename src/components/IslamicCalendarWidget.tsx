import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Star, Sun, Moon } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PrayerTime {
  name: string;
  time: string;
  arabicName: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface IslamicDate {
  hijriDay: number;
  hijriMonth: string;
  hijriYear: number;
  gregorianDate: string;
  islamicEvents: string[];
}

interface IslamicEvent {
  name: string;
  date: string;
  type: 'festival' | 'holy' | 'important';
  description: string;
}

const IslamicCalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [islamicDate, setIslamicDate] = useState<IslamicDate | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<IslamicEvent[]>([]);
  const [userLocation, setUserLocation] = useState<string>('Paris, France');

  const prayerNames = [
    { name: 'Fajr', arabicName: 'الفجر', icon: Star, baseTime: '05:30' },
    { name: 'Dhuhr', arabicName: 'الظهر', icon: Sun, baseTime: '12:30' },
    { name: 'Asr', arabicName: 'العصر', icon: Sun, baseTime: '15:45' },
    { name: 'Maghrib', arabicName: 'المغرب', icon: Sun, baseTime: '18:20' },
    { name: 'Isha', arabicName: 'العشاء', icon: Moon, baseTime: '19:45' }
  ];

  const islamicEvents: IslamicEvent[] = [
    {
      name: 'Ramadan',
      date: '2024-03-11',
      type: 'holy',
      description: 'Mois de jeûne et de spiritualité'
    },
    {
      name: 'Eid al-Fitr',
      date: '2024-04-10',
      type: 'festival',
      description: 'Fête de la rupture du jeûne'
    },
    {
      name: 'Hajj',
      date: '2024-06-14',
      type: 'holy',
      description: 'Pèlerinage à La Mecque'
    },
    {
      name: 'Eid al-Adha',
      date: '2024-06-16',
      type: 'festival',
      description: 'Fête du sacrifice'
    },
    {
      name: 'Muharram (Nouvel An Islamique)',
      date: '2024-07-07',
      type: 'important',
      description: 'Début de la nouvelle année hijri'
    },
    {
      name: 'Ashura',
      date: '2024-07-17',
      type: 'holy',
      description: 'Jour de jeûne recommandé'
    },
    {
      name: 'Mawlid an-Nabi',
      date: '2024-09-15',
      type: 'important',
      description: 'Naissance du Prophète Muhammad (PBSL)'
    }
  ];

  useEffect(() => {
    generatePrayerTimes();
    calculateIslamicDate();
    loadUpcomingEvents();
  }, [currentDate]);

  const generatePrayerTimes = () => {
    // Simple prayer time calculation (in a real app, you'd use a proper Islamic calendar API)
    const times = prayerNames.map(prayer => {
      // Add some variation based on date and location
      const baseHour = parseInt(prayer.baseTime.split(':')[0] || '0');
      const baseMinute = parseInt(prayer.baseTime.split(':')[1] || '0');
      
      // Simulate seasonal changes
      const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const seasonalOffset = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 60; // ±60 minutes variation
      
      const adjustedMinutes = baseMinute + Math.floor(seasonalOffset);
      let finalHour = baseHour;
      let finalMinute = adjustedMinutes;
      
      if (finalMinute >= 60) {
        finalHour += 1;
        finalMinute -= 60;
      } else if (finalMinute < 0) {
        finalHour -= 1;
        finalMinute += 60;
      }
      
      return {
        name: prayer.name,
        time: `${finalHour.toString().padStart(2, '0')}:${finalMinute.toString().padStart(2, '0')}`,
        arabicName: prayer.arabicName,
        icon: prayer.icon
      };
    });
    
    setPrayerTimes(times);
  };

  const calculateIslamicDate = () => {
    // Simplified Hijri conversion (in a real app, use proper Islamic calendar library)
    const gregorianYear = currentDate.getFullYear();
    const hijriYear = gregorianYear - 579; // Approximate conversion
    
    const islamicMonths = [
      'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
      'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
      'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];
    
    const currentMonth = currentDate.getMonth();
    const hijriMonth = islamicMonths[currentMonth] || '';
    const hijriDay = currentDate.getDate();
    
    // Check for events on this date
    const todayEvents = islamicEvents
      .filter(event => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getMonth() === currentDate.getMonth() &&
          eventDate.getDate() === currentDate.getDate()
        );
      })
      .map(event => event.name);
    
    setIslamicDate({
      hijriDay,
      hijriMonth: hijriMonth || '',
      hijriYear,
      gregorianDate: format(currentDate, 'dd MMMM yyyy', { locale: fr }),
      islamicEvents: todayEvents
    });
  };

  const loadUpcomingEvents = () => {
    const today = new Date();
    const nextMonth = addDays(today, 30);
    
    const upcoming = islamicEvents
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextMonth;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
    
    setUpcomingEvents(upcoming);
  };

  const getNextPrayer = () => {
    // Return null if prayer times are not loaded yet
    if (!prayerTimes || prayerTimes.length === 0) {
      return null;
    }
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    for (const prayer of prayerTimes) {
      if (prayer.time > currentTime) {
        return prayer;
      }
    }
    
    // If no prayer left today, return Fajr of tomorrow
    return prayerTimes[0] ? { ...prayerTimes[0], time: `Demain ${prayerTimes[0].time}` } : undefined;
  };

  const nextPrayer = getNextPrayer();

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'festival':
        return 'bg-gold/10 text-gold-dark border-gold/20';
      case 'holy':
        return 'bg-emerald/10 text-emerald border-emerald/20';
      default:
        return 'bg-sage/10 text-sage-dark border-sage/20';
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? subDays(currentDate, 1) 
      : addDays(currentDate, 1);
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-4">
      {/* Islamic Date Card */}
      <Card className="border-emerald/20 bg-gradient-to-br from-emerald/5 to-gold/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald" />
              <span className="text-emerald">Date Islamique</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate('prev')}
                className="h-8 px-2 text-xs"
              >
                ← <span className="hidden sm:inline ml-1">Précédent</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="text-xs h-8 px-2 hidden sm:inline-flex"
              >
                Aujourd'hui
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate('next')}
                className="h-8 px-2 text-xs"
              >
                <span className="hidden sm:inline mr-1">Suivant</span> →
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {islamicDate && (
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald mb-1">
                  {islamicDate.hijriDay} {islamicDate.hijriMonth} {islamicDate.hijriYear} AH
                </div>
                <div className="text-sm text-muted-foreground">
                  {islamicDate.gregorianDate}
                </div>
              </div>
              
              {islamicDate.islamicEvents.length > 0 && (
                <div className="text-center">
                  {islamicDate.islamicEvents.map((event, index) => (
                    <Badge key={index} className="bg-gold/10 text-gold-dark border-gold/20 mx-1">
                      🌙 {event}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Prayer Card */}
      <Card className="border-emerald/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald" />
              <span>Prochaine Prière</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {userLocation}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextPrayer ? (
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald mb-1">
                {nextPrayer.time}
              </div>
              <div className="text-lg font-semibold mb-1">
                {nextPrayer.name} - {nextPrayer.arabicName}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Chargement des horaires de prière...
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Prayer Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-gold" />
            Horaires de Prière
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {prayerTimes.map((prayer, index) => {
              const Icon = prayer.icon;
              const isNext = prayer === nextPrayer;
              
              return (
                <div
                  key={index}
                  className={`text-center p-3 rounded-lg transition-colors ${
                    isNext 
                      ? 'bg-emerald/10 border border-emerald/20' 
                      : 'bg-muted/50'
                  }`}
                >
                  <Icon className={`h-5 w-5 mx-auto mb-2 ${
                    isNext ? 'text-emerald' : 'text-muted-foreground'
                  }`} />
                  <div className={`text-sm font-medium ${
                    isNext ? 'text-emerald' : 'text-foreground'
                  }`}>
                    {prayer.name}
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {prayer.arabicName}
                  </div>
                  <div className={`text-sm font-bold ${
                    isNext ? 'text-emerald' : 'text-foreground'
                  }`}>
                    {prayer.time}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Islamic Events */}
      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-gold" />
              Événements Islamiques à Venir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{event.name}</h4>
                      <Badge className={getEventBadgeColor(event.type)}>
                        {event.type === 'festival' ? '🎉' : event.type === 'holy' ? '🕌' : '📅'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {event.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.date), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IslamicCalendarWidget;