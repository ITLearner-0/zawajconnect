
import { useState } from "react";
import { FilterCriteria } from "@/utils/location";
import { Filter } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import AuthCheck from "./AuthCheck";
import NearbyHeader from "./NearbyHeader";
import NearbySettings from "./NearbySettings";
import NearbyMatchContent from "./NearbyMatchContent";

const NearbyMatches = () => {
  const [maxDistance, setMaxDistance] = useState(50);
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [showCompatibility, setShowCompatibility] = useState(true);

  const handleApplyFilters = (newFilters: FilterCriteria) => {
    setFilters(newFilters);
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gradient-to-b from-islamic-cream to-background relative">
        <div className="absolute inset-0 bg-[url('/islamic-pattern.svg')] bg-repeat opacity-5 pointer-events-none"></div>
        <div className="container mx-auto px-4 py-12 relative z-10">
          <NearbyHeader />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <NearbySettings 
              maxDistance={maxDistance}
              setMaxDistance={setMaxDistance}
              showCompatibility={showCompatibility}
              setShowCompatibility={setShowCompatibility}
              onApplyFilters={handleApplyFilters}
            />
            
            <NearbyMatchContent 
              maxDistance={maxDistance} 
              filters={filters} 
              showCompatibility={showCompatibility} 
            />
          </div>
        </div>
      </div>
    </AuthCheck>
  );
};

export default NearbyMatches;
