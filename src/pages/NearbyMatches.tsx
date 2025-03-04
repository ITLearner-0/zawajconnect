
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LocationMap from "@/components/LocationMap";
import FilterPanel from "@/components/FilterPanel";
import CustomButton from "@/components/CustomButton";
import { FilterCriteria } from "@/utils/locationUtils";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Star, MapPin, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { IslamicPattern } from "@/components/ui/islamic-pattern";

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
    <div className="min-h-screen bg-accent relative before:fixed before:inset-0 before:bg-[url('/islamic-pattern.svg')] before:opacity-5 before:bg-repeat before:z-0">
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-6 flex items-center">
          <CustomButton
            variant="ghost"
            onClick={() => navigate("/")}
            className="mr-4 hover:bg-islamic-teal/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </CustomButton>
          <h1 className="text-3xl font-bold text-islamic-teal flex items-center gap-2">
            Find Nearby Matches
            <Star className="h-5 w-5 text-islamic-gold" />
          </h1>
        </div>

        <IslamicPattern variant="divider" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-islamic-sand">
              <div className="bg-islamic-teal text-white p-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <h2 className="text-xl font-bold">Search Filters</h2>
              </div>
              <div className="p-6">
                <FilterPanel onApplyFilters={handleApplyFilters} />
              </div>
            </div>
            
            <IslamicPattern variant="border" color="secondary" className="bg-white shadow-lg">
              <div className="p-6 space-y-4">
                <Label className="mb-3 block font-semibold text-islamic-teal">Maximum Distance: {maxDistance} km</Label>
                <Slider
                  value={[maxDistance]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={(value) => setMaxDistance(value[0])}
                  className="py-4"
                />

                <div className="flex items-center justify-between pt-4 border-t border-islamic-sand">
                  <Label htmlFor="showCompatibility" className="text-islamic-blue font-medium">Show Compatibility Scores</Label>
                  <Switch
                    id="showCompatibility"
                    checked={showCompatibility}
                    onCheckedChange={setShowCompatibility}
                    disabled={!showCompatibility}
                  />
                </div>
                
                {!showCompatibility && (
                  <div className="text-sm text-islamic-burgundy bg-islamic-burgundy/10 p-3 rounded border border-islamic-burgundy/20 mt-2">
                    Take the compatibility test to enable compatibility scoring
                  </div>
                )}
              </div>
            </IslamicPattern>
          </div>
          
          <div className="lg:col-span-2">
            <IslamicPattern variant="background" className="bg-white rounded-lg shadow-lg p-0.5">
              <div className="rounded-lg overflow-hidden">
                <LocationMap 
                  maxDistance={maxDistance} 
                  filters={filters} 
                  showCompatibility={showCompatibility}
                />
              </div>
            </IslamicPattern>
            
            <div className="text-center mt-6 text-islamic-blue">
              <p className="italic text-sm">
                "And among His Signs is that He created for you mates from among yourselves, 
                that you may dwell in tranquility with them, and He has put love and mercy between your hearts."
              </p>
              <p className="text-xs mt-1">- Ar-Rum 30:21</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyMatches;
