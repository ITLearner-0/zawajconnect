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
  BellOff,
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
    isha: '20:30',
  });

  const [location, setLocation] = useState('Paris, France');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [timeToNext, setTimeToNext] = useState<string>('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  // Fetch prayer times from Mawaqit API
  const fetchPrayerTimes = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=3`
      );
      const data = await response.json();

      if (data.code === 200 && data.data.timings) {
        const timings = data.data.timings;
        setPrayerTimes({
          fajr: timings.Fajr,
          sunrise: timings.Sunrise,
          dhuhr: timings.Dhuhr,
          asr: timings.Asr,
          maghrib: timings.Maghrib,
          isha: timings.Isha,
        });

        // Update location name
        if (data.data.meta?.timezone) {
          setLocation(data.data.meta.timezone);
        }

        toast({
          title: 'Heures de prière mises à jour',
          description: 'Les horaires ont été récupérés avec succès via Mawaqit',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les heures de prière',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get user location and fetch prayer times on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lon: longitude });
          fetchPrayerTimes(latitude, longitude);
        },
        (error) => {
          toast({
            title: 'Localisation désactivée',
            description: 'Utilisation des heures par défaut pour Paris',
            variant: 'default',
          });
          // Default to Paris coordinates
          setCoordinates({ lat: 48.8566, lon: 2.3522 });
          fetchPrayerTimes(48.8566, 2.3522);
        }
      );
    }
  }, []);

  // Update current time every second using local browser time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

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
      { name: 'Isha', time: prayerTimes.isha },
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
    const timeParts = nextPrayerTime.split(':');
    const hours = parseInt(timeParts[0] ?? '0');
    const minutes = parseInt(timeParts[1] ?? '0');
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
        passed: prayerTimes.fajr < currentTimeString,
      },
      {
        name: 'Lever du soleil',
        time: prayerTimes.sunrise,
        arabic: 'الشروق',
        icon: Sunrise,
        passed: prayerTimes.sunrise < currentTimeString,
      },
      {
        name: 'Dhuhr',
        time: prayerTimes.dhuhr,
        arabic: 'الظهر',
        icon: Sun,
        passed: prayerTimes.dhuhr < currentTimeString,
      },
      {
        name: 'Asr',
        time: prayerTimes.asr,
        arabic: 'العصر',
        icon: Clock,
        passed: prayerTimes.asr < currentTimeString,
      },
      {
        name: 'Maghrib',
        time: prayerTimes.maghrib,
        arabic: 'المغرب',
        icon: Sunset,
        passed: prayerTimes.maghrib < currentTimeString,
      },
      {
        name: 'Isha',
        time: prayerTimes.isha,
        arabic: 'العشاء',
        icon: Moon,
        passed: prayerTimes.isha < currentTimeString,
      },
    ];
  };

  const updateLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lon: longitude });
          fetchPrayerTimes(latitude, longitude);
        },
        (error) => {
          toast({
            title: 'Erreur de localisation',
            description: "Impossible d'obtenir votre position",
            variant: 'destructive',
          });
        }
      );
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);

    if (!notificationsEnabled) {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            toast({
              title: 'Notifications activées',
              description: 'Vous recevrez des rappels pour les prières',
            });
          }
        });
      } else {
        toast({
          title: 'Notifications activées',
          description: 'Vous recevrez des rappels pour les prières',
        });
      }
    } else {
      toast({
        title: 'Notifications désactivées',
        description: 'Les rappels de prière sont désactivés',
      });
    }
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
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
                    <Icon
                      className={`h-5 w-5 ${
                        prayer.passed ? 'text-muted-foreground' : 'text-primary'
                      }`}
                    />
                    <div>
                      <p className={`font-medium ${prayer.passed ? 'text-muted-foreground' : ''}`}>
                        {prayer.name}
                      </p>
                      <p
                        className={`text-sm ${
                          prayer.passed ? 'text-muted-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {prayer.arabic}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        prayer.name.toLowerCase() === nextPrayer.toLowerCase()
                          ? 'default'
                          : prayer.passed
                            ? 'outline'
                            : 'secondary'
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
                      <Badge className="text-xs">Suivant</Badge>
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
