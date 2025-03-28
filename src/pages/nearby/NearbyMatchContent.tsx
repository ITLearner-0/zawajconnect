
import { IslamicPattern } from "@/components/ui/islamic-pattern";
import LocationMap from "@/components/LocationMap";
import NearbyQuote from "./NearbyQuote";
import { FilterCriteria } from "@/utils/location";

interface NearbyMatchContentProps {
  maxDistance: number;
  filters: FilterCriteria;
  showCompatibility: boolean;
}

const NearbyMatchContent = ({ 
  maxDistance, 
  filters, 
  showCompatibility 
}: NearbyMatchContentProps) => {
  return (
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
      
      <NearbyQuote />
    </div>
  );
};

export default NearbyMatchContent;
