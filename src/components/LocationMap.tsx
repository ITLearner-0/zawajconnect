
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
    console.log("Loading compatibility matches...");
    try {
      setLoading(true);
      const matches = await findMatches({
        minCompatibilityScore: 70,
        verifiedOnly: false
      });
      console.log("Compatibility matches loaded:", matches.length);
      setCompatibilityMatches(matches);
    } catch (error) {
      console.error("Error loading compatibility matches:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les correspondances compatibles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load nearby profiles
  const loadNearbyProfiles = async (userSession: any) => {
    console.log("Loading nearby profiles for user:", userSession.user.id);
    try {
      setLoading(true);
      
      // Try to get user location first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            console.log("User location obtained:", latitude, longitude);
            setUserCoordinates([longitude, latitude]);
            
            try {
              const nearbyProfiles = await findNearbyProfiles(userSession.user.id, maxDistance, filters);
              console.log("Nearby profiles loaded:", nearbyProfiles.length);
              setProfiles(nearbyProfiles);
              
              if (nearbyProfiles.length === 0) {
                console.log("No nearby profiles found, showing compatibility matches instead");
                setShowLocationMode(false);
                await loadCompatibilityMatches();
              }
            } catch (profileError) {
              console.error("Error loading nearby profiles:", profileError);
              // Fallback to compatibility matches
              setShowLocationMode(false);
              await loadCompatibilityMatches();
            }
          },
          async (geoError) => {
            console.log("Geolocation failed:", geoError.message);
            setLocationError("Impossible d'obtenir votre position. Affichage des correspondances compatibles.");
            setShowLocationMode(false);
            await loadCompatibilityMatches();
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      } else {
        console.log("Geolocation not supported, using compatibility matches");
        setLocationError("La géolocalisation n'est pas supportée par votre navigateur.");
        setShowLocationMode(false);
        await loadCompatibilityMatches();
      }
    } catch (error) {
      console.error("General error in loadNearbyProfiles:", error);
      setShowLocationMode(false);
      await loadCompatibilityMatches();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      console.log("Initializing LocationMap data...");
      
      try {
        // Get current user session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          toast({
            title: "Erreur d'authentification",
            description: "Veuillez vous reconnecter.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }
        
        if (!session) {
          console.log("No session found, redirecting to auth");
          toast({
            title: "Authentification requise",
            description: "Veuillez vous connecter pour voir les profils près de vous.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        console.log("User authenticated:", session.user.id);
        
        // Load data based on mode
        if (showLocationMode) {
          await loadNearbyProfiles(session);
        } else {
          await loadCompatibilityMatches();
        }
        
      } catch (error) {
        console.error("Error in initializeData:", error);
        setLoading(false);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement des données.",
          variant: "destructive",
        });
      }
    };

    initializeData();
  }, [maxDistance, filters, showLocationMode, navigate, toast]);

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

  // Function to retry loading with location
  const handleRetryLocation = () => {
    console.log("Retrying with location...");
    setLocationError(null);
    setShowLocationMode(true);
    window.location.reload();
  };

  const handleToggleMode = () => {
    console.log("Toggling mode from", showLocationMode ? "location" : "compatibility");
    setShowLocationMode(!showLocationMode);
    setProfiles([]);
    setCompatibilityMatches([]);
    setLocationError(null);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Chargement des profils...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-[400px] w-full rounded-md" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {showLocationMode ? 'Profils à proximité' : 'Correspondances compatibles'}
          </CardTitle>
          <div className="flex gap-2">
            <CustomButton
              variant={showLocationMode ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggleMode()}
            >
              Proximité
            </CustomButton>
            <CustomButton
              variant={!showLocationMode ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggleMode()}
            >
              Compatibilité
            </CustomButton>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showLocationMode ? (
          // Location-based view
          locationError ? (
            <div className="h-[400px] flex flex-col items-center justify-center bg-gray-100 rounded-md p-6 text-center">
              <p className="mb-4 text-orange-600">{locationError}</p>
              <div className="flex gap-2">
                <CustomButton onClick={handleRetryLocation} variant="outline">
                  Réessayer avec la localisation
                </CustomButton>
                <CustomButton onClick={() => setShowLocationMode(false)}>
                  Voir les correspondances compatibles
                </CustomButton>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {userCoordinates && profiles.length > 0 && (
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
                <h3 className="text-lg font-medium">
                  Profils à proximité ({profiles.length})
                </h3>
                {profiles.length > 0 ? (
                  <ProfileList profiles={profiles} onNavigateToProfile={navigateToProfile} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucun profil trouvé dans votre région.</p>
                    <CustomButton 
                      onClick={() => setShowLocationMode(false)} 
                      className="mt-4"
                      variant="outline"
                    >
                      Voir les correspondances compatibles
                    </CustomButton>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          // Compatibility-based view
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                Correspondances compatibles ({compatibilityMatches.length})
              </h3>
              {compatibilityMatches.length > 0 ? (
                <CompatibilityProfileList 
                  matches={compatibilityMatches} 
                  onNavigateToProfile={navigateToProfile} 
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucune correspondance compatible trouvée.</p>
                  <p className="text-sm mt-2">
                    Assurez-vous d'avoir complété le test de compatibilité.
                  </p>
                  <CustomButton 
                    onClick={() => navigate("/compatibility")} 
                    className="mt-4"
                  >
                    Faire le test de compatibilité
                  </CustomButton>
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
