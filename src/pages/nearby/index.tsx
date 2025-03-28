
import { useState } from "react";
import { FilterCriteria } from "@/utils/location";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Settings } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import { useIsMobile } from "@/hooks/use-mobile";
import AuthCheck from "./AuthCheck";
import NearbyHeader from "./NearbyHeader";
import NearbySettings from "./NearbySettings";
import NearbyMatchContent from "./NearbyMatchContent";
import { useTranslation } from "react-i18next";

const NearbyMatches = () => {
  const [maxDistance, setMaxDistance] = useState(50);
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [showCompatibility, setShowCompatibility] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const handleApplyFilters = (newFilters: FilterCriteria) => {
    setFilters(newFilters);
    if (isMobile) {
      setIsSettingsOpen(false);
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gradient-to-b from-islamic-cream to-background relative">
        <div className="absolute inset-0 bg-[url('/islamic-pattern.svg')] bg-repeat opacity-5 pointer-events-none"></div>
        <div className="container mx-auto px-4 py-6 md:py-12 relative z-10">
          <NearbyHeader />

          {/* Mobile view with sheet for filters */}
          {isMobile ? (
            <div className="mb-4 flex flex-col">
              <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <SheetTrigger asChild>
                  <CustomButton 
                    variant="outline" 
                    className="flex items-center gap-2 mb-4 w-full justify-center"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t('nearby.searchSettings')}</span>
                  </CustomButton>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] max-w-md p-0 pt-12 overflow-y-auto">
                  <div className="p-4">
                    <NearbySettings 
                      maxDistance={maxDistance}
                      setMaxDistance={setMaxDistance}
                      showCompatibility={showCompatibility}
                      setShowCompatibility={setShowCompatibility}
                      onApplyFilters={handleApplyFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <NearbyMatchContent 
                maxDistance={maxDistance} 
                filters={filters} 
                showCompatibility={showCompatibility}
              />
            </div>
          ) : (
            /* Desktop view with grid layout */
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
          )}
        </div>
      </div>
    </AuthCheck>
  );
};

export default NearbyMatches;
