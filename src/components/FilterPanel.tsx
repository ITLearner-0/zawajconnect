
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import CustomButton from "@/components/CustomButton";
import { FilterCriteria, saveFilter, getSavedFilters, deleteSavedFilter } from "@/utils/location"; // Updated import
import { Check, X, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FilterPanelProps {
  onApplyFilters: (filters: FilterCriteria) => void;
}

const PRACTICE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Very Practicing"];
const EDUCATION_LEVELS = ["High School", "Bachelor's", "Master's", "PhD", "Islamic Studies"];

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
        <div className="space-y-3">
          <Label>Age Range: {ageRange[0]} - {ageRange[1]}</Label>
          <Slider 
            value={ageRange} 
            min={18} 
            max={80} 
            step={1} 
            onValueChange={(value) => setAgeRange(value as [number, number])} 
          />
        </div>

        <div className="space-y-3">
          <Label>Practice Level</Label>
          <div className="flex flex-wrap gap-2">
            {PRACTICE_LEVELS.map(level => (
              <button
                key={level}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedPracticeLevels.includes(level)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
                onClick={() => togglePracticeLevel(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Education</Label>
          <div className="flex flex-wrap gap-2">
            {EDUCATION_LEVELS.map(level => (
              <button
                key={level}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedEducationLevels.includes(level)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
                onClick={() => toggleEducationLevel(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {Object.keys(savedFilters).length > 0 && (
          <div className="space-y-3">
            <Label>Saved Filters</Label>
            <div className="space-y-2">
              {Object.entries(savedFilters).map(([name, _]) => (
                <div key={name} className="flex items-center justify-between bg-secondary p-2 rounded">
                  <span className="text-sm font-medium">{name}</span>
                  <div className="space-x-2">
                    <button 
                      onClick={() => handleLoadFilter(name)}
                      className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded"
                    >
                      Load
                    </button>
                    <button 
                      onClick={() => handleDeleteFilter(name)}
                      className="text-xs px-2 py-1 bg-destructive text-destructive-foreground rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showSaveForm && (
          <div className="space-y-3 border p-3 rounded-md">
            <Label htmlFor="filter-name">Save Current Filter</Label>
            <div className="flex gap-2">
              <Input 
                id="filter-name" 
                placeholder="Filter name" 
                value={filterName} 
                onChange={(e) => setFilterName(e.target.value)}
              />
              <button
                onClick={handleSaveFilter}
                className="p-2 bg-green-500 text-white rounded"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => setShowSaveForm(false)}
                className="p-2 bg-destructive text-white rounded"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="space-x-2">
          <CustomButton variant="outline" onClick={handleResetFilters}>
            Reset
          </CustomButton>
          <CustomButton onClick={handleApplyFilters}>
            Apply Filters
          </CustomButton>
        </div>
        {!showSaveForm && (
          <CustomButton variant="outline" onClick={() => setShowSaveForm(true)}>
            <Save size={16} className="mr-2" />
            Save Filter
          </CustomButton>
        )}
      </CardFooter>
    </Card>
  );
};

export default FilterPanel;
