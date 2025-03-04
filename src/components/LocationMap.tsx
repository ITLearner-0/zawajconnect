
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { findNearbyProfiles } from "@/utils/locationUtils";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  distance: number;
}

interface LocationMapProps {
  maxDistance?: number;
}

const LocationMap = ({ maxDistance = 50 }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { toast } = useToast();

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
        
        // Fetch nearby profiles
        const nearbyProfiles = await findNearbyProfiles(session.user.id, maxDistance);
        setProfiles(nearbyProfiles);
        
        // Here you would initialize the map with the profiles
        // For this example, we're not actually initializing a real map as it would
        // require additional libraries like Mapbox or Leaflet
        
        // In a real implementation, you would:
        // 1. Initialize the map library
        // 2. Set the center to the user's location
        // 3. Add markers for each nearby profile
        
        // For demonstration purposes, we'll just log what we would do
        console.log(`Map would be centered on user ${session.user.id}`);
        console.log(`${nearbyProfiles.length} nearby profiles would be displayed as markers`);
        
      } catch (error) {
        console.error("Error loading map:", error);
        toast({
          title: "Error",
          description: "Failed to load nearby matches. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeMap();
    
    // Cleanup function
    return () => {
      // In a real implementation, you would destroy the map instance here
    };
  }, [maxDistance, toast]);

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
              className="h-[400px] bg-gray-100 rounded-md flex items-center justify-center"
            >
              <p className="text-gray-500">
                Map visualization would appear here.
                <br />
                To implement a real map, integrate a mapping library like Mapbox or Google Maps.
              </p>
            </div>
            
            <div className="space-y-2 mt-4">
              <h3 className="text-lg font-medium">Nearby Profiles ({profiles.length})</h3>
              {profiles.length === 0 ? (
                <p className="text-sm text-gray-500">No matches found in your area.</p>
              ) : (
                <div className="space-y-2">
                  {profiles.map((profile) => (
                    <div 
                      key={profile.id} 
                      className="p-3 border rounded-md flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{profile.first_name} {profile.last_name}</p>
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
