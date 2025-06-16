
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { findNearbyProfiles } from "@/utils/location/nearbyProfiles"; 
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useUserStatus } from "@/hooks/useUserStatus";
import { useTranslation } from "react-i18next";
import { useCompatibilityMatching } from "@/hooks/compatibility/useCompatibilityMatching";
import 'mapbox-gl/dist/mapbox-gl.css';

// Import refactored components and utilities
import MapContainer from "./map/MapContainer";
import ProfileList from "./map/ProfileList";
import CompatibilityProfileList from "./map/CompatibilityProfileList";
import { Profile, LocationMapProps, MAPBOX_PUBLIC_TOKEN } from "./map/types";
import { addMapCustomStyling, getMapboxToken } from "./map/mapUtils";
import CustomButton from "./CustomButton";

const LocationMap = ({ maxDistance = 50, filters = {}, showCompatibility = false }: LocationMapProps) => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [compatibilityMatches, setCompatibilityMatches] = useState<any[]>([]);
  const [showLocationMode, setShowLocationMode] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();
  const [userCoordinates, setUserCoordinates] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const mapContainerRef = useRef<any>(null);
  const { userId } = useUserStatus();
  const { findMatches } = useCompatibilityMatching();

  // Load compatibility matches
  const loadCompatibilityMatches = async () => {
    try {
      setLoading(true);
      const matches = await findMatches({
        minCompatibilityScore: 70,
        verifiedOnly: false
      });
      setCompatibilityMatches(matches);
    } catch (error) {
      console.error("Error loading compatibility matches:", error);
    } finally {
      setLoading(false);
    }
  };

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
        
        // If user wants compatibility mode, load those matches
        if (!showLocationMode) {
          await loadCompatibilityMatches();
          return;
        }

        // Check if we can get the user's current location
        if (!navigator.geolocation) {
          setLocationError("Geolocation is not supported by your browser.");
          // Fallback to compatibility matches
          setShowLocationMode(false);
          await loadCompatibilityMatches();
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setUserCoordinates([longitude, latitude]);
            
            try {
              console.log("User coordinates:", longitude, latitude);
              
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
          async (error) => {
            console.error("Error getting location:", error);
            setLocationError("Unable to get your location. Showing compatibility matches instead.");
            
            // Fallback to compatibility matches
            setShowLocationMode(false);
            await loadCompatibilityMatches();
            
            toast({
              title: "Location not available",
              description: "Showing compatibility-based matches instead.",
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } catch (error) {
        console.error("General error:", error);
        // Fallback to compatibility matches
        setShowLocationMode(false);
        await loadCompatibilityMatches();
      }
    };

    loadMapData();
  }, [maxDistance, filters, showCompatibility, userId, showLocationMode]);

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
      navigateToProfile(profileId);
    }
  };

  // Toggle between location and compatibility mode
  const toggleMode = () => {
    setShowLocationMode(!showLocationMode);
  };

  // Function to retry loading with location
  const handleRetryLocation = () => {
    setLocationError(null);
    setShowLocationMode(true);
    window.location.reload();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {showLocationMode ? t('nearby.matchesNearYou') : 'Compatible Matches'}
          </CardTitle>
          <div className="flex gap-2">
            <CustomButton
              variant={showLocationMode ? "default" : "outline"}
              size="sm"
              onClick={() => setShowLocationMode(true)}
            >
              Location
            </CustomButton>
            <CustomButton
              variant={!showLocationMode ? "default" : "outline"}
              size="sm"
              onClick={() => setShowLocationMode(false)}
            >
              Compatibility
            </CustomButton>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[400px] w-full rounded-md" />
          </div>
        ) : showLocationMode ? (
          // Location-based view
          locationError ? (
            <div className="h-[400px] flex flex-col items-center justify-center bg-gray-100 rounded-md p-6 text-center">
              <p className="mb-4 text-orange-600">{locationError}</p>
              <div className="flex gap-2">
                <CustomButton onClick={handleRetryLocation} variant="outline">
                  Retry with Location
                </CustomButton>
                <CustomButton onClick={() => setShowLocationMode(false)}>
                  View Compatible Matches
                </CustomButton>
              </div>
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
              )}
              
              <div className="space-y-2 mt-4">
                <h3 className="text-lg font-medium">{t('nearby.matchesNearYou')} ({profiles.length})</h3>
                <ProfileList profiles={profiles} onNavigateToProfile={navigateToProfile} />
              </div>
            </div>
          )
        ) : (
          // Compatibility-based view
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Compatible Matches ({compatibilityMatches.length})</h3>
              <CompatibilityProfileList 
                matches={compatibilityMatches} 
                onNavigateToProfile={navigateToProfile} 
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationMap;
