
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useTranslation } from 'react-i18next';

interface AgeRangeFilterProps {
  value?: [number, number];
  onChange: (range: [number, number]) => void;
}

const AgeRangeFilter: React.FC<AgeRangeFilterProps> = ({ value = [18, 50], onChange }) => {
  const { t } = useTranslation();

  const handleValueChange = (newValue: number[]) => {
    onChange([newValue[0], newValue[1]]);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        {t('nearby.ageRange')}: {value[0]} - {value[1]}
      </Label>
      <Slider
        value={value}
        onValueChange={handleValueChange}
        min={18}
        max={70}
        step={1}
        className="w-full"
      />
    </div>
  );
};

export default AgeRangeFilter;
