import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Calendar } from 'lucide-react';

interface PrayerTime {
  name: string;
  arabicName: string;
  time: string;
  isPassed: boolean;
  isNext: boolean;
}

const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState('Paris, France');
  const [islamicDate, setIslamicDate] = useState('');

  useEffect(() => {
    // Simulate prayer times (in a real app, you'd fetch from an API like Aladhan API)
    const times = [
      { name: 'Fajr', arabicName: 'الفجر', time: '05:30', isPassed: false, isNext: false },
      { name: 'Dhuhr', arabicName: 'الظهر', time: '13:15', isPassed: false, isNext: false },
      { name: 'Asr', arabicName: 'العصر', time: '16:45', isPassed: false, isNext: false },
      { name: 'Maghrib', arabicName: 'المغرب', time: '19:20', isPassed: false, isNext: false },
      { name: 'Isha', arabicName: 'العشاء', time: '21:00', isPassed: false, isNext: false }
    ];

    // Calculate which prayers have passed and which is next
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    let nextPrayerFound = false;
    const updatedTimes = times.map(prayer => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      
      const isPassed = currentMinutes > prayerMinutes;
      const isNext = !nextPrayerFound && !isPassed;
      
      if (isNext) nextPrayerFound = true;
      
      return { ...prayer, isPassed, isNext };
    });

    // If no next prayer found, Fajr is next (next day)
    if (!nextPrayerFound) {
      updatedTimes[0].isNext = true;
    }

    setPrayerTimes(updatedTimes);

    // Simulate Islamic date
    setIslamicDate('15 Rajab 1446');
  }, [currentTime]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const nextPrayer = prayerTimes.find(p => p.isNext);
  const timeUntilNext = nextPrayer ? calculateTimeUntil(nextPrayer.time) : '';

  function calculateTimeUntil(prayerTime: string): string {
    const now = new Date();
    const [hours, minutes] = prayerTime.split(':').map(Number);
    
    let prayerDate = new Date();
    prayerDate.setHours(hours, minutes, 0, 0);
    
    // If prayer time has passed today, it's tomorrow
    if (prayerDate <= now) {
      prayerDate.setDate(prayerDate.getDate() + 1);
    }
    
    const diff = prayerDate.getTime() - now.getTime();
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursUntil > 0) {
      return `${hoursUntil}h ${minutesUntil}min`;
    }
    return `${minutesUntil}min`;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald" />
            Horaires de Prière
          </div>
          <Badge variant="secondary" className="text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            {location}
          </Badge>
        </CardTitle>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {currentTime.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
          <div className="text-gold">
            {islamicDate}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Next Prayer Highlight */}
        {nextPrayer && (
          <div className="bg-gradient-to-r from-emerald/10 to-gold/10 rounded-lg p-4 border border-emerald/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-emerald">Prochaine prière</h3>
              <Badge className="bg-emerald hover:bg-emerald-dark text-white">
                {timeUntilNext}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">{nextPrayer.name}</span>
                <span className="text-gold font-arabic text-xl">{nextPrayer.arabicName}</span>
              </div>
              <span className="text-2xl font-mono font-bold text-emerald">
                {nextPrayer.time}
              </span>
            </div>
          </div>
        )}

        {/* All Prayer Times */}
        <div className="space-y-2">
          {prayerTimes.map((prayer, index) => (
            <div 
              key={prayer.name}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                prayer.isNext 
                  ? 'bg-emerald/5 border border-emerald/20' 
                  : prayer.isPassed 
                    ? 'bg-muted/50 opacity-60' 
                    : 'bg-card hover:bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  prayer.isPassed 
                    ? 'bg-muted-foreground' 
                    : prayer.isNext 
                      ? 'bg-emerald' 
                      : 'bg-gold'
                }`} />
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${
                    prayer.isNext ? 'text-emerald' : ''
                  }`}>
                    {prayer.name}
                  </span>
                  <span className="text-muted-foreground font-arabic">
                    {prayer.arabicName}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {prayer.isPassed && (
                  <Badge variant="secondary" className="text-xs">
                    Terminée
                  </Badge>
                )}
                <span className={`font-mono text-lg ${
                  prayer.isNext ? 'font-bold text-emerald' : ''
                }`}>
                  {prayer.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Islamic Quote */}
        <div className="bg-gradient-to-r from-gold/10 to-emerald/10 rounded-lg p-4 mt-6">
          <p className="text-sm text-center italic text-muted-foreground mb-2">
            "La prière est le pilier de la religion"
          </p>
          <p className="text-xs text-center text-gold">
            - Hadith du Prophète ﷺ
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrayerTimes;