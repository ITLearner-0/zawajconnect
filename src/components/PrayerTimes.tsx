import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sun, 
  Sunrise, 
  Clock, 
  Sunset, 
  Moon, 
  MapPin,
  RefreshCw,
  Settings,
  Bell,
  BellOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrayerTime {
  name: string;
  time: string;
  arabic: string;
  icon: React.ComponentType<{ className?: string }>;
  passed: boolean;
}

interface PrayerTimesData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

const PrayerTimes = () => {
  const { toast } = useToast();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData>({
    fajr: '05:30',
    sunrise: '07:15',
    dhuhr: '12:45',
    asr: '16:20',
    maghrib: '19:05',
    isha: '20:30'
  });
  
  const [location, setLocation] = useState('Paris, France');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [timeToNext, setTimeToNext] = useState<string>('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch accurate time from internet
  const fetchInternetTime = async () => {
    try {
      const response = await fetch('https://worldtimeapi.org/api/timezone/Europe/Paris');
      const data = await response.json();
      const internetTime = new Date(data.datetime);
      setCurrentTime(internetTime);
    } catch (error) {
      // Fallback to local time if API fails
      setCurrentTime(new Date());
    }
  };

  // Initial time fetch
  useEffect(() => {
    fetchInternetTime();
  }, []);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(prevTime => new Date(prevTime.getTime() + 1000));
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  // Refresh internet time every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchInternetTime();
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Calculate next prayer and time remaining
  useEffect(() => {
    calculateNextPrayer();
  }, [currentTime, prayerTimes]);

  const calculateNextPrayer = () => {
    const now = currentTime;
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeString = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
    
    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr },
      { name: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha }
    ];

    let nextPrayerName = '';
    let nextPrayerTime = '';
    
    for (const prayer of prayers) {
      if (prayer.time > currentTimeString) {
        nextPrayerName = prayer.name;
        nextPrayerTime = prayer.time;
        break;
      }
    }
    
    // If no prayer found for today, next prayer is Fajr tomorrow
    if (!nextPrayerName) {
      nextPrayerName = 'Fajr';
      nextPrayerTime = prayerTimes.fajr;
    }
    
    setNextPrayer(nextPrayerName);
    
    // Calculate time remaining
    const [hours, minutes] = nextPrayerTime.split(':').map(Number);
    const nextPrayerDate = new Date(now);
    nextPrayerDate.setHours(hours, minutes, 0, 0);
    
    // If the prayer time has passed today, it's tomorrow's prayer
    if (nextPrayerDate <= now) {
      nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
    }
    
    const timeDiff = nextPrayerDate.getTime() - now.getTime();
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    setTimeToNext(`${hoursLeft}h ${minutesLeft}m`);
  };

  const getPrayerList = (): PrayerTime[] => {
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTimeString = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
    
    return [
      {
        name: 'Fajr',
        time: prayerTimes.fajr,
        arabic: 'الفجر',
        icon: Moon,
        passed: prayerTimes.fajr < currentTimeString
      },
      {
        name: 'Lever du soleil',
        time: prayerTimes.sunrise,
        arabic: 'الشروق',
        icon: Sunrise,
        passed: prayerTimes.sunrise < currentTimeString
      },
      {
        name: 'Dhuhr',
        time: prayerTimes.dhuhr,
        arabic: 'الظهر',
        icon: Sun,
        passed: prayerTimes.dhuhr < currentTimeString
      },
      {
        name: 'Asr',
        time: prayerTimes.asr,
        arabic: 'العصر',
        icon: Clock,
        passed: prayerTimes.asr < currentTimeString
      },
      {
        name: 'Maghrib',
        time: prayerTimes.maghrib,
        arabic: 'المغرب',
        icon: Sunset,
        passed: prayerTimes.maghrib < currentTimeString
      },
      {
        name: 'Isha',
        time: prayerTimes.isha,
        arabic: 'العشاء',
        icon: Moon,
        passed: prayerTimes.isha < currentTimeString
      }
    ];
  };

  const updateLocation = async () => {
    setLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // In a real app, you would call a prayer times API here
            // For demo purposes, we'll simulate an API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update location name (this would come from reverse geocoding API)
            setLocation(`Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`);
            
            toast({
              title: "Localisation mise à jour",
              description: "Heures de prière actualisées pour votre position"
            });
          },
          (error) => {
            toast({
              title: "Erreur de localisation",
              description: "Impossible d'obtenir votre position",
              variant: "destructive"
            });
          }
        );
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la localisation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    
    if (!notificationsEnabled) {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            toast({
              title: "Notifications activées",
              description: "Vous recevrez des rappels pour les prières"
            });
          }
        });
      } else {
        toast({
          title: "Notifications activées",
          description: "Vous recevrez des rappels pour les prières"
        });
      }
    } else {
      toast({
        title: "Notifications désactivées",
        description: "Les rappels de prière sont désactivés"
      });
    }
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with current time and next prayer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Heures de Prière
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleNotifications}
              >
                {notificationsEnabled ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={updateLocation}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{formatDate()}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  {location}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {currentTime.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  Heure actuelle
                </p>
              </div>
            </div>
            
            {nextPrayer && (
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Prochaine prière</p>
                    <p className="text-lg font-bold text-primary">{nextPrayer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Dans</p>
                    <p className="text-lg font-bold">{timeToNext}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prayer Times List */}
      <Card>
        <CardHeader>
          <CardTitle>Horaires du Jour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getPrayerList().map((prayer, index) => {
              const Icon = prayer.icon;
              return (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    prayer.passed 
                      ? 'bg-gray-50 opacity-60' 
                      : prayer.name.toLowerCase() === nextPrayer.toLowerCase()
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-background'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${
                      prayer.passed ? 'text-muted-foreground' : 'text-primary'
                    }`} />
                    <div>
                      <p className={`font-medium ${
                        prayer.passed ? 'text-muted-foreground' : ''
                      }`}>
                        {prayer.name}
                      </p>
                      <p className={`text-sm ${
                        prayer.passed ? 'text-muted-foreground' : 'text-muted-foreground'
                      }`}>
                        {prayer.arabic}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        prayer.name.toLowerCase() === nextPrayer.toLowerCase() 
                          ? "default" 
                          : prayer.passed 
                            ? "outline" 
                            : "secondary"
                      }
                    >
                      {prayer.time}
                    </Badge>
                    {prayer.passed && (
                      <Badge variant="outline" className="text-xs">
                        Passé
                      </Badge>
                    )}
                    {prayer.name.toLowerCase() === nextPrayer.toLowerCase() && (
                      <Badge className="text-xs">
                        Suivant
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrayerTimes;