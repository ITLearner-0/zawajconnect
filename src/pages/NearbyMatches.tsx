
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationMap from "@/components/LocationMap";
import FilterPanel from "@/components/FilterPanel";
import CustomButton from "@/components/CustomButton";
import { FilterCriteria } from "@/utils/locationUtils";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const NearbyMatches = () => {
  const navigate = useNavigate();
  const [maxDistance, setMaxDistance] = useState(50);
  const [filters, setFilters] = useState<FilterCriteria>({});

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
            
            <div className="bg-white p-6 rounded-lg shadow">
              <Label className="mb-3 block">Maximum Distance: {maxDistance} km</Label>
              <Slider
                value={[maxDistance]}
                min={1}
                max={100}
                step={1}
                onValueChange={(value) => setMaxDistance(value[0])}
              />
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <LocationMap maxDistance={maxDistance} filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyMatches;
