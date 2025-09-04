import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, MapPin, Navigation, RefreshCw } from 'lucide-react';

interface QiblaDirectionProps {
  className?: string;
}

const QiblaDirection = ({ className }: QiblaDirectionProps) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');

  // Kaaba coordinates
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  useEffect(() => {
    requestLocationAndCalculateQibla();
  }, []);

  useEffect(() => {
    if ('DeviceOrientationEvent' in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          setDeviceHeading(360 - event.alpha);
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, []);

  const requestLocationAndCalculateQibla = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('La géolocalisation n\'est pas supportée par ce navigateur');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });

      // Calculate Qibla direction
      const qibla = calculateQiblaDirection(latitude, longitude);
      setQiblaDirection(qibla);

      // Get location name
      await getLocationName(latitude, longitude);

    } catch (err) {
      console.error('Erreur lors de la géolocalisation:', err);
      setError('Impossible d\'obtenir votre position. Vérifiez vos autorisations de géolocalisation.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateQiblaDirection = (lat: number, lng: number): number => {
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const toDeg = (rad: number) => rad * (180 / Math.PI);

    const dLng = toRad(KAABA_LNG - lng);
    const lat1 = toRad(lat);
    const lat2 = toRad(KAABA_LAT);

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    let bearing = toDeg(Math.atan2(y, x));
    return (bearing + 360) % 360;
  };

  const getLocationName = async (lat: number, lng: number) => {
    try {
      // In a real app, you'd use a geocoding service like OpenStreetMap Nominatim
      // For now, we'll simulate with a simple city name
      setLocationName('Votre position actuelle');
    } catch (err) {
      console.error('Erreur lors de la récupération du nom de lieu:', err);
      setLocationName('Position inconnue');
    }
  };

  const getDirectionText = (direction: number): string => {
    const directions = [
      'Nord', 'Nord-Nord-Est', 'Nord-Est', 'Est-Nord-Est',
      'Est', 'Est-Sud-Est', 'Sud-Est', 'Sud-Sud-Est',
      'Sud', 'Sud-Sud-Ouest', 'Sud-Ouest', 'Ouest-Sud-Ouest',
      'Ouest', 'Ouest-Nord-Ouest', 'Nord-Ouest', 'Nord-Nord-Ouest'
    ];
    const index = Math.round(direction / 22.5) % 16;
    return directions[index];
  };

  const getQiblaArrowRotation = (): number => {
    if (qiblaDirection === null) return 0;
    return qiblaDirection - deviceHeading;
  };

  return (
    <Card className={`bg-gradient-to-br from-emerald/5 to-gold/5 border-emerald/20 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-emerald" />
          Direction de la Qibla
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <div className="text-center py-6">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button 
              onClick={requestLocationAndCalculateQibla}
              variant="outline"
              size="sm"
              className="border-emerald text-emerald hover:bg-emerald hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-6">
            <div className="h-12 w-12 bg-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <Compass className="h-6 w-6 text-emerald" />
            </div>
            <p className="text-sm text-muted-foreground">
              Calcul de la direction de la Qibla...
            </p>
          </div>
        ) : qiblaDirection !== null ? (
          <>
            {/* Compass */}
            <div className="relative">
              <div className="w-48 h-48 mx-auto relative">
                {/* Compass Base */}
                <div className="w-full h-full rounded-full border-4 border-emerald/20 bg-gradient-to-br from-white to-emerald/5 flex items-center justify-center relative">
                  {/* Direction Markers */}
                  <div className="absolute inset-2 border border-emerald/10 rounded-full">
                    {['N', 'E', 'S', 'W'].map((dir, index) => (
                      <div
                        key={dir}
                        className="absolute text-xs font-bold text-emerald"
                        style={{
                          top: index === 0 ? '5px' : index === 2 ? 'auto' : '50%',
                          bottom: index === 2 ? '5px' : 'auto',
                          left: index === 3 ? '5px' : index === 1 ? 'auto' : '50%',
                          right: index === 1 ? '5px' : 'auto',
                          transform: (index === 0 || index === 2) ? 'translateX(-50%)' : 
                                   (index === 1 || index === 3) ? 'translateY(-50%)' : 'none'
                        }}
                      >
                        {dir}
                      </div>
                    ))}
                  </div>

                  {/* Qibla Arrow */}
                  <div
                    className="absolute w-1 h-20 bg-gradient-to-t from-emerald to-gold rounded-full transition-transform duration-500 origin-bottom"
                    style={{
                      transform: `rotate(${getQiblaArrowRotation()}deg) translateY(-50%)`,
                      transformOrigin: 'center bottom'
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-emerald"></div>
                    </div>
                  </div>

                  {/* Center Dot */}
                  <div className="w-3 h-3 bg-emerald rounded-full shadow-lg"></div>
                </div>
              </div>
            </div>

            {/* Direction Info */}
            <div className="text-center space-y-3">
              <div>
                <p className="text-2xl font-bold text-emerald">
                  {Math.round(qiblaDirection)}°
                </p>
                <p className="text-sm text-muted-foreground">
                  {getDirectionText(qiblaDirection)}
                </p>
              </div>

              {locationName && (
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{locationName}</span>
                </div>
              )}

              <Badge variant="secondary" className="text-xs">
                Distance: ~{userLocation ? Math.round(
                  getDistanceToKaaba(userLocation.lat, userLocation.lng)
                ).toLocaleString() : '0'} km
              </Badge>
            </div>

            <div className="bg-gold/10 p-3 rounded-lg border border-gold/20 text-center">
              <p className="text-xs text-gold-dark italic">
                "وَمِن حَيْثُ خَرَجْتَ فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ"
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                "Et d'où que tu sortes, tourne ton visage vers la Mosquée sacrée" - Coran 2:149
              </p>
            </div>

            <Button 
              onClick={requestLocationAndCalculateQibla}
              variant="outline"
              size="sm"
              className="w-full border-emerald text-emerald hover:bg-emerald hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};

const getDistanceToKaaba = (lat: number, lng: number): number => {
  const R = 6371; // Earth's radius in km
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;
  
  const toRad = (deg: number) => deg * (Math.PI / 180);
  
  const dLat = toRad(KAABA_LAT - lat);
  const dLng = toRad(KAABA_LNG - lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat)) * Math.cos(toRad(KAABA_LAT)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default QiblaDirection;