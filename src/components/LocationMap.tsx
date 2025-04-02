import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { findNearbyProfiles } from "@/utils/location/nearbyProfiles"; 
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useUserStatus } from "@/hooks/useUserStatus";
import 'mapbox-gl/dist/mapbox-gl.css';

// Import refactored components and utilities
import MapContainer from "./map/MapContainer";
import ProfileList from "./map/ProfileList";
import { Profile, LocationMapProps, MAPBOX_PUBLIC_TOKEN } from "./map/types";
import { addMapCustomStyling, getMapboxToken } from "./map/mapUtils";
import CustomButton from "./CustomButton";

const LocationMap = ({ maxDistance = 50, filters = {}, showCompatibility = false }: LocationMapProps) => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { toast } = useToast();
  const [userCoordinates, setUserCoordinates] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const mapContainerRef = useRef<any>(null);
  const { userId } = useUserStatus();

  useEffect(() => {
    // Function to load the map
    const loadMapData = async () => {
      setLoading(true);
      setLocationError(null);
      
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
        
        // Always use our built-in Mapbox token
        const token = getMapboxToken();
        
        // Check if we can get the user's current location
        if (!navigator.geolocation) {
          setLocationError("Geolocation is not supported by your browser.");
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
              console.log("User coordinates:", longitude, latitude);
              
              // Fetch nearby profiles with filters without updating the database
              // We'll just use the current coordinates for this session
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
            setLocationError("Unable to get your location. Please enable location services.");
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
      } catch (error) {
        console.error("General error:", error);
        setLoading(false);
      }
    };

    loadMapData();
  }, [maxDistance, filters, toast, showCompatibility, userId]);

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

  // Function to retry loading with location
  const handleRetryLocation = () => {
    setLocationError(null);
    loadMapData();
  };

  const loadMapData = () => {
    setLoading(true);
    window.location.reload(); // Simple reload to retry getting location
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
        ) : locationError ? (
          <div className="h-[400px] flex flex-col items-center justify-center bg-gray-100 rounded-md p-6 text-center">
            <p className="mb-4 text-red-600">{locationError}</p>
            <CustomButton onClick={handleRetryLocation}>
              Retry with Location Services
            </CustomButton>
          </div>
        ) : (
          <div className="space-y-4">
            {userCoordinates && (
              <MapContainer
                ref={mapContainerRef}
                profiles={profiles}
                userCoordinates={userCoordinates}
                mapboxToken={MAPBOX_PUBLIC_TOKEN}
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
