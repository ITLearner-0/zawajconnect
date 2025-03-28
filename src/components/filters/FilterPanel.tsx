
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FilterCriteria, saveFilter, getSavedFilters, deleteSavedFilter } from "@/utils/location";
import { useToast } from "@/components/ui/use-toast";

// Import refactored components
import AgeRangeFilter from "./AgeRangeFilter";
import PracticeLevelFilter from "./PracticeLevelFilter";
import EducationFilter from "./EducationFilter";
import SavedFilters from "./SavedFilters";
import SaveFilterForm from "./SaveFilterForm";
import FilterActions from "./FilterActions";

interface FilterPanelProps {
  onApplyFilters: (filters: FilterCriteria) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onApplyFilters }) => {
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 50]);
  const [selectedPracticeLevels, setSelectedPracticeLevels] = useState<string[]>([]);
  const [selectedEducationLevels, setSelectedEducationLevels] = useState<string[]>([]);
  const [savedFilters, setSavedFilters] = useState<Record<string, FilterCriteria>>({});
  const [filterName, setFilterName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const { toast } = useToast();

  // Load saved filters on component mount
  useEffect(() => {
    setSavedFilters(getSavedFilters());
  }, []);

  const handleApplyFilters = () => {
    const filters: FilterCriteria = {
      ageRange,
      practiceLevel: selectedPracticeLevels.length > 0 ? selectedPracticeLevels : undefined,
      education: selectedEducationLevels.length > 0 ? selectedEducationLevels : undefined,
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

    const filters: FilterCriteria = {
      ageRange,
      practiceLevel: selectedPracticeLevels.length > 0 ? selectedPracticeLevels : undefined,
      education: selectedEducationLevels.length > 0 ? selectedEducationLevels : undefined,
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
      <CardContent className="space-y-6">
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
