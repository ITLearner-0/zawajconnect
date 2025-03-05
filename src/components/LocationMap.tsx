
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { findNearbyProfiles, FilterCriteria } from "@/utils/locationUtils";
import { supabase } from "@/integrations/supabase/client";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  distance: number;
  age?: number;
  practice_level?: string;
  education?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationMapProps {
  maxDistance?: number;
  filters?: FilterCriteria;
  showCompatibility?: boolean;
}

// This would normally come from Supabase Edge Function Secrets
// For demonstration, we'll use a placeholder that can be replaced with user input
const MAPBOX_TOKEN = 'YOUR_MAPBOX_PUBLIC_TOKEN';

const LocationMap = ({ maxDistance = 50, filters = {}, showCompatibility = false }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>(MAPBOX_TOKEN);
  const { toast } = useToast();
  const [userCoordinates, setUserCoordinates] = useState<[number, number] | null>(null);

  // For development purposes - allow user to input their Mapbox token
  const promptForMapboxToken = () => {
    if (MAPBOX_TOKEN === 'YOUR_MAPBOX_PUBLIC_TOKEN') {
      const token = prompt(
        "Please enter your Mapbox public token. You can get one at https://mapbox.com/account/access-tokens",
        ""
      );
      if (token) {
        setMapboxToken(token);
        return token;
      }
    }
    return mapboxToken;
  };

  useEffect(() => {
    // Function to load the map
    const initializeMap = async () => {
      setLoading(true);
      
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "Authentication required",
            description: "Please sign in to view matches in your area.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        // Get the Mapbox token
        const token = promptForMapboxToken();
        if (!token) {
          toast({
            title: "Mapbox token required",
            description: "A Mapbox token is required to display the map.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        // Check if we can get the user's current location
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setUserCoordinates([longitude, latitude]);
            
            // Update user coordinates in the database
            await supabase.functions.invoke('update-coordinates', {
              body: { 
                user_id: session.user.id,
                latitude,
                longitude
              }
            });
            
            // Fetch nearby profiles with filters
            const nearbyProfiles = await findNearbyProfiles(session.user.id, maxDistance, filters);
            setProfiles(nearbyProfiles);
            
            // Initialize Mapbox
            mapboxgl.accessToken = token;
            
            if (!mapContainer.current) return;
            
            // Create the map
            map.current = new mapboxgl.Map({
              container: mapContainer.current,
              style: 'mapbox://styles/mapbox/light-v11',
              center: [longitude, latitude],
              zoom: 9,
              pitchWithRotate: false,
            });
            
            // Add navigation controls
            map.current.addControl(
              new mapboxgl.NavigationControl(),
              'top-right'
            );
            
            // Add user marker
            new mapboxgl.Marker({ color: '#28717c' })
              .setLngLat([longitude, latitude])
              .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Location</h3>'))
              .addTo(map.current);
            
            // Add markers for nearby profiles
            nearbyProfiles.forEach(profile => {
              if (profile.latitude && profile.longitude) {
                const compatibilityScore = showCompatibility ? 
                  Math.floor(Math.random() * 100) : null; // Mock compatibility score
                
                const markerEl = document.createElement('div');
                markerEl.className = 'custom-marker';
                markerEl.style.backgroundColor = '#d4af37';
                markerEl.style.width = '20px';
                markerEl.style.height = '20px';
                markerEl.style.borderRadius = '50%';
                markerEl.style.border = '2px solid white';
                
                // Create popup content
                let popupContent = `
                  <div class="map-popup">
                    <h3>${profile.first_name} ${profile.last_name}</h3>
                    <p>${profile.distance.toFixed(1)} km away</p>
                `;
                
                if (profile.age) {
                  popupContent += `<p>Age: ${profile.age}</p>`;
                }
                
                if (profile.practice_level) {
                  popupContent += `<p>Practice: ${profile.practice_level}</p>`;
                }
                
                if (compatibilityScore !== null) {
                  popupContent += `<p>Compatibility: ${compatibilityScore}%</p>`;
                }
                
                popupContent += `</div>`;
                
                new mapboxgl.Marker(markerEl)
                  .setLngLat([profile.longitude, profile.latitude])
                  .setPopup(new mapboxgl.Popup().setHTML(popupContent))
                  .addTo(map.current);
              }
            });
            
            setLoading(false);
          },
          (error) => {
            console.error("Error getting location:", error);
            toast({
              title: "Location Error",
              description: "Unable to get your location. Please enable location services.",
              variant: "destructive",
            });
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Error loading map:", error);
        toast({
          title: "Error",
          description: "Failed to load nearby matches. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    initializeMap();
    
    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [maxDistance, filters, toast, showCompatibility, mapboxToken]);

  // Add custom styling for map
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .mapboxgl-popup-content {
        background-color: #fff;
        border-radius: 8px;
        padding: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border-left: 4px solid #28717c;
      }
      .mapboxgl-popup-content h3 {
        margin: 0 0 5px 0;
        color: #28717c;
        font-weight: 600;
      }
      .mapboxgl-popup-content p {
        margin: 5px 0;
        color: #6b2025;
      }
      .custom-marker {
        cursor: pointer;
        transition: transform 0.2s;
      }
      .custom-marker:hover {
        transform: scale(1.2);
      }
      .map-popup {
        min-width: 150px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Matches Near You</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[400px] w-full rounded-md" />
          </div>
        ) : (
          <div className="space-y-4">
            <div 
              ref={mapContainer} 
              className="h-[400px] rounded-md overflow-hidden relative"
            />
            
            <div className="space-y-2 mt-4">
              <h3 className="text-lg font-medium">Nearby Profiles ({profiles.length})</h3>
              {profiles.length === 0 ? (
                <p className="text-sm text-gray-500">No matches found in your area.</p>
              ) : (
                <div className="space-y-2">
                  {profiles.map((profile) => (
                    <div 
                      key={profile.id} 
                      className="p-3 border rounded-md flex justify-between items-center hover:bg-islamic-cream/30 transition-colors cursor-pointer"
                      onClick={() => {
                        if (map.current && profile.latitude && profile.longitude) {
                          map.current.flyTo({
                            center: [profile.longitude, profile.latitude],
                            zoom: 12,
                            essential: true
                          });
                        }
                      }}
                    >
                      <div>
                        <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                        <div className="text-sm text-gray-500">
                          {profile.age && <span className="mr-2">{profile.age} years</span>}
                          {profile.education && <span className="mr-2">{profile.education}</span>}
                          {profile.practice_level && <span>{profile.practice_level}</span>}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {profile.distance.toFixed(1)} km away
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationMap;
