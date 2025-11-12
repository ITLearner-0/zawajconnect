import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Compass,
  Navigation,
  MapPin,
  RefreshCw,
  Target,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  accuracy?: number;
}

// iOS DeviceOrientationEvent extension
interface IOSDeviceOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

// iOS DeviceOrientationEvent constructor with requestPermission
interface IOSDeviceOrientationEventConstructor {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

const QiblaDirection = () => {
  const { toast } = useToast();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [compassSupported, setCompassSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Kaaba coordinates
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  useEffect(() => {
    checkDeviceOrientation();
    getCurrentLocation();
  }, []);

  const checkDeviceOrientation = () => {
    if ('DeviceOrientationEvent' in window) {
      setCompassSupported(true);

      // Request permission for iOS devices
      const DeviceOrientationEventIOS = DeviceOrientationEvent as unknown as IOSDeviceOrientationEventConstructor;
      if (typeof DeviceOrientationEventIOS.requestPermission === 'function') {
        DeviceOrientationEventIOS.requestPermission()
          .then((permission) => {
            setPermissionStatus(permission);
            if (permission === 'granted') {
              startCompass();
            }
          })
          .catch(() => setPermissionStatus('denied'));
      } else {
        setPermissionStatus('granted');
        startCompass();
      }
    }
  };

  const startCompass = () => {
    window.addEventListener('deviceorientationabsolute', handleOrientation);
    window.addEventListener('deviceorientation', handleOrientation);
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (event.alpha !== null) {
      // iOS uses webkitCompassHeading, Android uses alpha
      const iosEvent = event as IOSDeviceOrientationEvent;
      const heading = iosEvent.webkitCompassHeading || (360 - event.alpha);
      setDeviceHeading(heading);
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        const locationData: LocationData = {
          latitude,
          longitude,
          accuracy
        };
        
        setLocation(locationData);
        calculateQiblaDirection(latitude, longitude);
        
        setLoading(false);
        toast({
          title: "Position obtenue",
          description: "Direction de la Qibla calculée"
        });
      },
      (error) => {
        setLoading(false);
        let message = "Erreur de géolocalisation";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Permission de géolocalisation refusée";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Position non disponible";
            break;
          case error.TIMEOUT:
            message = "Délai de géolocalisation expiré";
            break;
        }
        
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const calculateQiblaDirection = (lat: number, lng: number) => {
    // Convert degrees to radians
    const latRad = lat * Math.PI / 180;
    const lngRad = lng * Math.PI / 180;
    const kaabaLatRad = KAABA_LAT * Math.PI / 180;
    const kaabaLngRad = KAABA_LNG * Math.PI / 180;

    // Calculate the difference in longitude
    const deltaLng = kaabaLngRad - lngRad;

    // Calculate the bearing
    const y = Math.sin(deltaLng) * Math.cos(kaabaLatRad);
    const x = Math.cos(latRad) * Math.sin(kaabaLatRad) - 
              Math.sin(latRad) * Math.cos(kaabaLatRad) * Math.cos(deltaLng);

    let bearing = Math.atan2(y, x);
    
    // Convert from radians to degrees
    bearing = bearing * 180 / Math.PI;
    
    // Normalize to 0-360 degrees
    bearing = (bearing + 360) % 360;
    
    setQiblaDirection(bearing);
  };

  const getDistance = () => {
    if (!location) return 0;
    
    const R = 6371; // Earth's radius in kilometers
    const lat1Rad = location.latitude * Math.PI / 180;
    const lat2Rad = KAABA_LAT * Math.PI / 180;
    const deltaLatRad = (KAABA_LAT - location.latitude) * Math.PI / 180;
    const deltaLngRad = (KAABA_LNG - location.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  };

  const getCompassRotation = () => {
    if (!compassSupported || permissionStatus !== 'granted') {
      return qiblaDirection;
    }
    return qiblaDirection - deviceHeading;
  };

  const requestCompassPermission = async () => {
    const DeviceOrientationEventIOS = DeviceOrientationEvent as unknown as IOSDeviceOrientationEventConstructor;
    if (typeof DeviceOrientationEventIOS.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEventIOS.requestPermission();
        setPermissionStatus(permission);
        if (permission === 'granted') {
          startCompass();
          toast({
            title: "Permission accordée",
            description: "La boussole est maintenant active"
          });
        }
      } catch (error) {
        setPermissionStatus('denied');
        toast({
          title: "Permission refusée",
          description: "Impossible d'activer la boussole",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Compass className="h-6 w-6" />
              Direction de la Qibla
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={getCurrentLocation}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {location ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {location.city || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                  </span>
                </div>
                <Badge variant="outline">
                  {getDistance()} km de la Mecque
                </Badge>
              </div>
              
              {location.accuracy && (
                <div className="text-xs text-muted-foreground">
                  Précision: ±{Math.round(location.accuracy)}m
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              {loading ? "Obtention de votre position..." : "Position non disponible"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compass */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Boussole Qibla</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-64 h-64 mx-auto">
            {/* Compass Circle */}
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full">
              {/* Compass Markings */}
              <div className="absolute inset-0">
                {[0, 90, 180, 270].map((degree) => (
                  <div
                    key={degree}
                    className="absolute w-0.5 h-4 bg-primary/40"
                    style={{
                      top: degree === 0 ? '0' : degree === 180 ? 'auto' : '50%',
                      bottom: degree === 180 ? '0' : 'auto',
                      left: degree === 90 ? 'auto' : degree === 270 ? '0' : '50%',
                      right: degree === 90 ? '0' : 'auto',
                      transform: degree === 0 || degree === 180 ? 'translateX(-50%)' : 'translateY(-50%)'
                    }}
                  />
                ))}
              </div>

              {/* Direction Labels */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 font-bold text-primary">N</div>
              <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 font-bold text-primary">E</div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 font-bold text-primary">S</div>
              <div className="absolute top-1/2 -left-6 transform -translate-y-1/2 font-bold text-primary">W</div>

              {/* Qibla Indicator */}
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-500"
                style={{
                  transform: `translate(-50%, -50%) rotate(${getCompassRotation()}deg)`
                }}
              >
                <div className="relative">
                  {/* Qibla Arrow */}
                  <div className="w-1 h-24 bg-gradient-to-t from-transparent via-green-500 to-green-600 transform -translate-x-1/2">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Target className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  
                  {/* Center Dot */}
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-green-600 rounded-full" />
                </div>
              </div>

              {/* Kaaba Icon in Center */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-primary rounded-sm" />
              </div>
            </div>
          </div>

          {/* Direction Info */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(qiblaDirection)}°
              </div>
              <div className="text-sm text-muted-foreground">
                Direction de la Qibla
              </div>
            </div>

            {/* Compass Status */}
            {!compassSupported && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <div className="text-sm text-yellow-700">
                  Boussole non supportée sur cet appareil
                </div>
              </div>
            )}

            {compassSupported && permissionStatus === 'prompt' && (
              <Button onClick={requestCompassPermission} className="w-full">
                <Smartphone className="h-4 w-4 mr-2" />
                Activer la boussole
              </Button>
            )}

            {compassSupported && permissionStatus === 'denied' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <div className="text-sm text-red-700">
                  Permission boussole refusée. Veuillez l'activer dans les paramètres.
                </div>
              </div>
            )}

            {compassSupported && permissionStatus === 'granted' && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <Navigation className="h-4 w-4 text-green-600" />
                <div className="text-sm text-green-700">
                  Boussole active - Orientez votre appareil vers la direction indiquée
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QiblaDirection;