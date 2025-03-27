import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LocationMap from "@/components/LocationMap";
import FilterPanel from "@/components/FilterPanel";
import CustomButton from "@/components/CustomButton";
import { FilterCriteria } from "@/utils/locationUtils";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Star, MapPin, Heart, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { IslamicPattern } from "@/components/ui/islamic-pattern";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import AccessibilityControls from "@/components/AccessibilityControls";
import { useRLSSetup } from "@/hooks/useRLSSetup";

const NearbyMatches = () => {
  const { isSetup: rlsSetup, isLoading: rlsLoading } = useRLSSetup();
  const navigate = useNavigate();
  const [maxDistance, setMaxDistance] = useState(50);
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [showCompatibility, setShowCompatibility] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "You need to sign in to view matches near you.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }
      
      // Check if user has taken compatibility test
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

    checkAuth();
  }, [navigate, toast]);

  const handleApplyFilters = (newFilters: FilterCriteria) => {
    setFilters(newFilters);
  };

  if (isAuthenticated === false) {
    return null; // Will redirect to auth page
  }

  if (isAuthenticated === null || rlsLoading) {
    // Loading state
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (rlsSetup === false) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col gap-4">
        <div className="text-xl font-bold text-red-500">Database Security Issue</div>
        <p className="text-center max-w-md">
          There was a problem setting up database security. Please contact the administrator.
        </p>
        <CustomButton onClick={() => navigate("/")}>
          Return to Home
        </CustomButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-islamic-cream to-background relative">
      <div className="absolute inset-0 bg-[url('/islamic-pattern.svg')] bg-repeat opacity-5 pointer-events-none"></div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <CustomButton
              variant="ghost"
              onClick={() => navigate("/")}
              className="mr-4 hover:bg-islamic-teal/10 group"
              aria-label="Back to home"
            >
              <ArrowLeft className="mr-2 h-4 w-4 text-islamic-teal group-hover:translate-x-[-2px] transition-transform" />
              Back
            </CustomButton>
            <h1 className="text-3xl font-bold text-islamic-teal flex items-center gap-2 font-serif">
              Find Nearby Matches
              <Star className="h-5 w-5 text-islamic-gold" />
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <AccessibilityControls />
            <ThemeToggle />
          </div>
        </div>

        <IslamicPattern variant="divider" color="teal" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <IslamicPattern variant="card" color="teal" className="overflow-hidden">
              <div className="bg-islamic-teal text-white p-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                <h2 className="text-xl font-medium">Search Filters</h2>
              </div>
              <div className="p-6">
                <FilterPanel onApplyFilters={handleApplyFilters} />
              </div>
            </IslamicPattern>
            
            <IslamicPattern variant="gradient" className="p-6 space-y-4">
              <Label className="mb-3 block font-medium text-islamic-teal">Maximum Distance: {maxDistance} km</Label>
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
            </IslamicPattern>
          </div>
          
          <div className="lg:col-span-2">
            <IslamicPattern variant="card" color="teal" className="p-0.5 overflow-hidden shadow-lg">
              <div className="rounded-lg overflow-hidden">
                <LocationMap 
                  maxDistance={maxDistance} 
                  filters={filters} 
                  showCompatibility={showCompatibility}
                />
              </div>
            </IslamicPattern>
            
            <div className="text-center mt-6 bg-islamic-cream/50 p-4 rounded-lg border border-islamic-gold/10">
              <p className="italic text-islamic-blue font-serif">
                "And among His Signs is that He created for you mates from among yourselves, 
                that you may dwell in tranquility with them, and He has put love and mercy between your hearts."
              </p>
              <p className="text-xs mt-1 text-islamic-burgundy">- Ar-Rum 30:21</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyMatches;
