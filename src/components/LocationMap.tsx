
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { findNearbyProfiles } from "@/utils/location"; // Updated import
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import 'mapbox-gl/dist/mapbox-gl.css';

// Import refactored components and utilities
import MapContainer from "./map/MapContainer";
import ProfileList from "./map/ProfileList";
import { Profile, LocationMapProps, MAPBOX_TOKEN_KEY } from "./map/types";
import { promptForMapboxToken, addMapCustomStyling } from "./map/mapUtils";

const LocationMap = ({ maxDistance = 50, filters = {}, showCompatibility = false }: LocationMapProps) => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const { toast } = useToast();
  const [userCoordinates, setUserCoordinates] = useState<[number, number] | null>(null);
  const navigate = useNavigate();
  const mapContainerRef = useRef<any>(null);

  // Load token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(MAPBOX_TOKEN_KEY);
    if (storedToken) {
      setMapboxToken(storedToken);
    }
  }, []);

  useEffect(() => {
    // Function to load the map
    const loadMapData = async () => {
      setLoading(true);
      
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
      if (!navigator.geolocation) {
        toast({
          title: "Location Error",
          description: "Geolocation is not supported by your browser.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoordinates([longitude, latitude]);
          
          try {
            // Update user coordinates in the database
            const { error: coordError } = await supabase.functions.invoke('update-coordinates', {
              body: { 
                user_id: session.user.id,
                latitude,
                longitude
              }
            });
            
            if (coordError) {
              console.error("Error updating coordinates:", coordError);
              toast({
                title: "Warning",
                description: "Could not update your location. Using current location for this session only.",
              });
            }
            
            // Fetch nearby profiles with filters
            const nearbyProfiles = await findNearbyProfiles(session.user.id, maxDistance, filters);
            console.log("Retrieved profiles:", nearbyProfiles);
            setProfiles(nearbyProfiles);
            setLoading(false);
          } catch (innerError) {
            console.error("Error in map initialization:", innerError);
            toast({
              title: "Error",
              description: "There was a problem loading the map data.",
              variant: "destructive",
            });
            setLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enable location services.",
            variant: "destructive",
          });
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    };

    loadMapData();
  }, [maxDistance, filters, toast, showCompatibility]);

  // Add custom styling for map
  useEffect(() => {
    const cleanupStyling = addMapCustomStyling();
    return cleanupStyling;
  }, []);

  // Function to navigate to a profile
  const navigateToProfile = (profileId: string) => {
    console.log("Navigating to profile:", profileId);
    navigate(`/profile/${profileId}`);
  };

  // Handle profile click and fly to location
  const handleProfileClick = (profileId: string) => {
    console.log("Profile clicked:", profileId);
    if (mapContainerRef.current && mapContainerRef.current.flyToProfile) {
      mapContainerRef.current.flyToProfile(profileId);
    } else {
      // If map container ref is not available, just navigate to the profile
      navigateToProfile(profileId);
    }
  };

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
            {userCoordinates && mapboxToken ? (
              <MapContainer
                ref={mapContainerRef}
                profiles={profiles}
                userCoordinates={userCoordinates}
                mapboxToken={mapboxToken}
                showCompatibility={showCompatibility}
                onNavigateToProfile={navigateToProfile}
              />
            ) : (
              <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-md">
                <p>Map loading failed. Please check your location settings and try again.</p>
              </div>
            )}
            
            <div className="space-y-2 mt-4">
              <h3 className="text-lg font-medium">Nearby Profiles ({profiles.length})</h3>
              <ProfileList profiles={profiles} onNavigateToProfile={navigateToProfile} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationMap;
