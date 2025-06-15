
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterCriteria } from '@/utils/location';
import AgeRangeFilter from './AgeRangeFilter';
import PracticeLevelFilter from './PracticeLevelFilter';
import EducationFilter from './EducationFilter';
import AdvancedFilterPanel from './AdvancedFilterPanel';
import SavedFilters from './SavedFilters';
import FilterActions from './FilterActions';
import { useTranslation } from 'react-i18next';

interface FilterPanelProps {
  onApplyFilters: (filters: FilterCriteria) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onApplyFilters }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<FilterCriteria>({});

  const handleFilterChange = (key: keyof FilterCriteria, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onApplyFilters({});
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('nearby.filterMatches')}</h3>
      
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">{t('nearby.basicFilters')}</TabsTrigger>
          <TabsTrigger value="advanced">{t('nearby.advancedFilters')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <AgeRangeFilter 
            value={filters.ageRange}
            onChange={(range) => handleFilterChange('ageRange', range)}
          />
          
          <PracticeLevelFilter 
            value={filters.practiceLevel}
            onChange={(levels) => handleFilterChange('practiceLevel', levels)}
          />
          
          <EducationFilter 
            value={filters.education}
            onChange={(education) => handleFilterChange('education', education)}
          />
          
          <FilterActions 
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            onSave={() => {}} // Implement save functionality
          />
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <AdvancedFilterPanel 
            filters={filters.advanced}
            onChange={(advanced) => handleFilterChange('advanced', advanced)}
          />
          
          <FilterActions 
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            onSave={() => {}} // Implement save functionality
          />
        </TabsContent>
      </Tabs>
      
      <SavedFilters onLoadFilter={(savedFilter) => setFilters(savedFilter)} />
    </div>
  );
};

export default FilterPanel;
