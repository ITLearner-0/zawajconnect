
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterCriteria, saveFilter, getSavedFilters, deleteSavedFilter } from "@/utils/location";
import { AdvancedFilters } from "@/hooks/compatibility/types/advancedFilterTypes";
import { useToast } from "@/components/ui/use-toast";

// Import existing components
import AgeRangeFilter from "./AgeRangeFilter";
import PracticeLevelFilter from "./PracticeLevelFilter";
import EducationFilter from "./EducationFilter";
import SavedFilters from "./SavedFilters";
import SaveFilterForm from "./SaveFilterForm";
import FilterActions from "./FilterActions";
import AdvancedFilterPanel from "./AdvancedFilterPanel";

interface ExtendedFilterCriteria extends FilterCriteria {
  advanced?: AdvancedFilters;
}

interface FilterPanelProps {
  onApplyFilters: (filters: ExtendedFilterCriteria) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onApplyFilters }) => {
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 50]);
  const [selectedPracticeLevels, setSelectedPracticeLevels] = useState<string[]>([]);
  const [selectedEducationLevels, setSelectedEducationLevels] = useState<string[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const [savedFilters, setSavedFilters] = useState<Record<string, ExtendedFilterCriteria>>({});
  const [filterName, setFilterName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const { toast } = useToast();

  // Load saved filters on component mount
  useEffect(() => {
    setSavedFilters(getSavedFilters());
  }, []);

  const handleApplyFilters = () => {
    const filters: ExtendedFilterCriteria = {
      ageRange,
      practiceLevel: selectedPracticeLevels.length > 0 ? selectedPracticeLevels : undefined,
      education: selectedEducationLevels.length > 0 ? selectedEducationLevels : undefined,
      advanced: advancedFilters,
    };
    onApplyFilters(filters);
    toast({
      title: "Filters Applied",
      description: "Your search filters have been applied.",
    });
  };

  const handleResetFilters = () => {
    setAgeRange([18, 50]);
    setSelectedPracticeLevels([]);
    setSelectedEducationLevels([]);
    setAdvancedFilters({});
    onApplyFilters({});
    toast({
      title: "Filters Reset",
      description: "All filters have been reset.",
    });
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your filter.",
        variant: "destructive",
      });
      return;
    }

    const filters: ExtendedFilterCriteria = {
      ageRange,
      practiceLevel: selectedPracticeLevels.length > 0 ? selectedPracticeLevels : undefined,
      education: selectedEducationLevels.length > 0 ? selectedEducationLevels : undefined,
      advanced: advancedFilters,
    };

    saveFilter(filterName, filters);
    setSavedFilters({ ...savedFilters, [filterName]: filters });
    setFilterName("");
    setShowSaveForm(false);
    toast({
      title: "Filter Saved",
      description: `Your "${filterName}" filter has been saved.`,
    });
  };

  const handleDeleteFilter = (name: string) => {
    deleteSavedFilter(name);
    const updatedFilters = { ...savedFilters };
    delete updatedFilters[name];
    setSavedFilters(updatedFilters);
    toast({
      title: "Filter Deleted",
      description: `Your "${name}" filter has been deleted.`,
    });
  };

  const handleLoadFilter = (name: string) => {
    const filter = savedFilters[name];
    if (filter) {
      setAgeRange(filter.ageRange || [18, 50]);
      setSelectedPracticeLevels(filter.practiceLevel || []);
      setSelectedEducationLevels(filter.education || []);
      setAdvancedFilters(filter.advanced || {});
      onApplyFilters(filter);
      toast({
        title: "Filter Loaded",
        description: `Your "${name}" filter has been loaded.`,
      });
    }
  };

  const togglePracticeLevel = (level: string) => {
    setSelectedPracticeLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level) 
        : [...prev, level]
    );
  };

  const toggleEducationLevel = (level: string) => {
    setSelectedEducationLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level) 
        : [...prev, level]
    );
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>Filter Matches</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Filters</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Filters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-6 mt-6">
            <AgeRangeFilter 
              ageRange={ageRange} 
              setAgeRange={setAgeRange} 
            />

            <PracticeLevelFilter 
              selectedLevels={selectedPracticeLevels} 
              toggleLevel={togglePracticeLevel} 
            />

            <EducationFilter 
              selectedLevels={selectedEducationLevels} 
              toggleLevel={toggleEducationLevel} 
            />

            <SavedFilters 
              savedFilters={savedFilters} 
              onLoadFilter={handleLoadFilter} 
              onDeleteFilter={handleDeleteFilter} 
            />

            {showSaveForm && (
              <SaveFilterForm 
                filterName={filterName} 
                setFilterName={setFilterName} 
                onSave={handleSaveFilter} 
                onCancel={() => setShowSaveForm(false)} 
              />
            )}
          </TabsContent>
          
          <TabsContent value="advanced" className="mt-6">
            <AdvancedFilterPanel 
              filters={advancedFilters}
              onFiltersChange={setAdvancedFilters}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <FilterActions 
          onReset={handleResetFilters} 
          onApply={handleApplyFilters} 
          onShowSaveForm={() => setShowSaveForm(true)} 
          showSaveForm={showSaveForm} 
        />
      </CardFooter>
    </Card>
  );
};

export default FilterPanel;
