
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterCriteria } from '@/utils/location';
import AgeRangeFilter from './AgeRangeFilter';
import PracticeLevelFilter from './PracticeLevelFilter';
import EducationFilter from './EducationFilter';
import AdvancedFilterPanel from './AdvancedFilterPanel';
import EnhancedAdvancedFilterPanel from './EnhancedAdvancedFilterPanel';
import SavedFilters from './SavedFilters';
import FilterActions from './FilterActions';
import SaveFilterForm from './SaveFilterForm';
import { useTranslation } from 'react-i18next';
import { getSavedFilters, saveFilter, deleteSavedFilter } from '@/utils/location/filterUtils';

interface FilterPanelProps {
  onApplyFilters: (filters: FilterCriteria) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onApplyFilters }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [savedFilters, setSavedFilters] = useState<Record<string, FilterCriteria>>(getSavedFilters());
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleFilterChange = (key: keyof FilterCriteria, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    console.log('Application des filtres:', filters);
    onApplyFilters(filters);
  };

  const handleResetFilters = () => {
    setFilters({});
    onApplyFilters({});
  };

  const handleSaveFilter = (name: string) => {
    try {
      saveFilter(name, filters);
      setSavedFilters(getSavedFilters());
      setShowSaveForm(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du filtre:', error);
    }
  };

  const handleLoadFilter = (name: string) => {
    const savedFilter = savedFilters[name];
    if (savedFilter) {
      setFilters(savedFilter);
      onApplyFilters(savedFilter);
    }
  };

  const handleDeleteFilter = (name: string) => {
    try {
      deleteSavedFilter(name);
      setSavedFilters(getSavedFilters());
    } catch (error) {
      console.error('Erreur lors de la suppression du filtre:', error);
    }
  };

  const handleShowSaveForm = () => {
    setShowSaveForm(true);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('nearby.filterMatches')}</h3>
      
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">{t('nearby.basicFilters')}</TabsTrigger>
          <TabsTrigger value="advanced">Avancés</TabsTrigger>
          <TabsTrigger value="enhanced">Complets</TabsTrigger>
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
            onReset={handleResetFilters}
            onShowSaveForm={handleShowSaveForm}
            showSaveForm={showSaveForm}
          />
          
          {showSaveForm && (
            <SaveFilterForm 
              onSave={handleSaveFilter}
              onCancel={() => setShowSaveForm(false)}
            />
          )}
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <AdvancedFilterPanel 
            filters={filters.advanced || {}}
            onFiltersChange={(advanced) => handleFilterChange('advanced', advanced)}
          />
          
          <FilterActions 
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            onShowSaveForm={handleShowSaveForm}
            showSaveForm={showSaveForm}
          />
          
          {showSaveForm && (
            <SaveFilterForm 
              onSave={handleSaveFilter}
              onCancel={() => setShowSaveForm(false)}
            />
          )}
        </TabsContent>

        <TabsContent value="enhanced" className="space-y-4">
          <EnhancedAdvancedFilterPanel 
            filters={filters.enhanced || {}}
            onFiltersChange={(enhanced) => handleFilterChange('enhanced', enhanced)}
          />
          
          <FilterActions 
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            onShowSaveForm={handleShowSaveForm}
            showSaveForm={showSaveForm}
          />
          
          {showSaveForm && (
            <SaveFilterForm 
              onSave={handleSaveFilter}
              onCancel={() => setShowSaveForm(false)}
            />
          )}
        </TabsContent>
      </Tabs>
      
      <SavedFilters 
        savedFilters={savedFilters}
        onLoadFilter={handleLoadFilter}
        onDeleteFilter={handleDeleteFilter}
      />
    </div>
  );
};

export default FilterPanel;
