
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LocationMap from "@/components/LocationMap";
import FilterPanel from "@/components/FilterPanel";
import CustomButton from "@/components/CustomButton";
import { FilterCriteria } from "@/utils/locationUtils";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

const NearbyMatches = () => {
  const navigate = useNavigate();
  const [maxDistance, setMaxDistance] = useState(50);
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [showCompatibility, setShowCompatibility] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has taken compatibility test
    const checkCompatibility = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('compatibility_results')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1);

      if (error) {
        console.error("Error checking compatibility results:", error);
        return;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Compatibility Test",
          description: "Take the compatibility test to see how well you match with others",
          action: (
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => navigate("/compatibility")}
            >
              Take Test
            </CustomButton>
          ),
        });
        setShowCompatibility(false);
      }
    };

    checkCompatibility();
  }, [navigate, toast]);

  const handleApplyFilters = (newFilters: FilterCriteria) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6 flex items-center">
          <CustomButton
            variant="ghost"
            onClick={() => navigate("/")}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </CustomButton>
          <h1 className="text-3xl font-bold">Find Nearby Matches</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <FilterPanel onApplyFilters={handleApplyFilters} />
            
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              <Label className="mb-3 block">Maximum Distance: {maxDistance} km</Label>
              <Slider
                value={[maxDistance]}
                min={1}
                max={100}
                step={1}
                onValueChange={(value) => setMaxDistance(value[0])}
              />

              <div className="flex items-center justify-between pt-4 border-t">
                <Label htmlFor="showCompatibility">Show Compatibility Scores</Label>
                <Switch
                  id="showCompatibility"
                  checked={showCompatibility}
                  onCheckedChange={setShowCompatibility}
                  disabled={!showCompatibility}
                />
              </div>
              
              {!showCompatibility && (
                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  Take the compatibility test to enable compatibility scoring
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <LocationMap 
              maxDistance={maxDistance} 
              filters={filters} 
              showCompatibility={showCompatibility}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyMatches;
