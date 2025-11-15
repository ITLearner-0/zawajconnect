import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { IslamicPattern } from '@/components/ui/islamic-pattern';
import FilterPanel from '@/components/FilterPanel';
import { FilterCriteria } from '@/utils/location';
import { Filter } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';

interface NearbySettingsProps {
  maxDistance: number;
  setMaxDistance: (distance: number) => void;
  showCompatibility: boolean;
  setShowCompatibility: (show: boolean) => void;
  onApplyFilters: (filters: FilterCriteria) => void;
}

const NearbySettings = ({
  maxDistance,
  setMaxDistance,
  showCompatibility,
  setShowCompatibility,
  onApplyFilters,
}: NearbySettingsProps) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  return (
    <div className={isMobile ? 'w-full' : 'lg:col-span-1 space-y-6'}>
      <IslamicPattern variant="card" color="teal" className="overflow-hidden">
        <div className="bg-islamic-teal text-white p-3 sm:p-4 flex items-center">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          <h2 className="text-lg sm:text-xl font-medium">{t('nearby.searchFilters')}</h2>
        </div>
        <div className="p-4 sm:p-6">
          <FilterPanel onApplyFilters={onApplyFilters} />
        </div>
      </IslamicPattern>

      <IslamicPattern variant="gradient" className="p-4 sm:p-6 space-y-4">
        <Label className="mb-3 block font-medium text-islamic-teal">
          {t('nearby.maxDistance')}: {maxDistance} {t('nearby.km')}
        </Label>
        <Slider
          value={[maxDistance]}
          min={1}
          max={100}
          step={1}
          onValueChange={(value) => setMaxDistance(value[0] ?? 10)}
          className="py-4"
        />

        <div className="flex items-center justify-between pt-4 border-t border-islamic-sand">
          <Label htmlFor="showCompatibility" className="text-islamic-blue font-medium">
            {t('nearby.showCompatibility')}
          </Label>
          <Switch
            id="showCompatibility"
            checked={showCompatibility}
            onCheckedChange={setShowCompatibility}
            disabled={!showCompatibility}
          />
        </div>

        {!showCompatibility && (
          <div className="text-sm text-islamic-burgundy bg-islamic-burgundy/10 p-3 rounded border border-islamic-burgundy/20 mt-2">
            {t('nearby.compatibilityTestRequired')}
          </div>
        )}
      </IslamicPattern>
    </div>
  );
};

export default NearbySettings;
