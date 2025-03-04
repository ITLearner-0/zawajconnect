
import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import CustomButton from "@/components/CustomButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { geocodeLocation, updateUserCoordinates } from "@/utils/locationUtils";
import { supabase } from "@/integrations/supabase/client";
import LocationMap from "@/components/LocationMap";

const NearbyMatches = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [location, setLocation] = useState("");
  const [maxDistance, setMaxDistance] = useState([50]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const handleUpdateLocation = async () => {
    if (!location.trim()) {
      toast({
        title: "Location required",
        description: "Please enter a location to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to search for matches.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Geocode the location
      const locationData = await geocodeLocation(location);
      
      if (!locationData) {
        toast({
          title: "Location not found",
          description: "Could not find coordinates for the entered location. Please try a different location.",
          variant: "destructive",
        });
        return;
      }

      // Update user's coordinates in the database
      const success = await updateUserCoordinates(
        session.user.id, 
        locationData.latitude, 
        locationData.longitude
      );
      
      if (!success) {
        throw new Error("Failed to update location");
      }

      toast({
        title: "Location updated",
        description: "Your location has been updated. Showing nearby matches.",
      });
      
      setShowMap(true);
    } catch (error) {
      console.error("Error updating location:", error);
      toast({
        title: "Error",
        description: "Failed to update your location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Find Nearby Matches</h1>
              <CustomButton variant="outline" onClick={() => navigate("/")}>
                Back to Home
              </CustomButton>
            </div>
            <p className="text-gray-600">
              Discover compatible matches in your area
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Your Location</Label>
                <div className="flex space-x-2">
                  <Input
                    id="location"
                    placeholder="Enter city, region or address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <CustomButton 
                    onClick={handleUpdateLocation}
                    disabled={isSearching}
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </CustomButton>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Maximum Distance: {maxDistance[0]} km</Label>
                <Slider
                  min={5}
                  max={100}
                  step={5}
                  value={maxDistance}
                  onValueChange={setMaxDistance}
                />
              </div>
            </div>
            
            {showMap && <LocationMap maxDistance={maxDistance[0]} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NearbyMatches;
