
import React from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface PracticeLevelFilterProps {
  value?: string[];
  onChange: (levels: string[]) => void;
}

const PracticeLevelFilter: React.FC<PracticeLevelFilterProps> = ({ value = [], onChange }) => {
  const { t } = useTranslation();

  const practiceLevels = [
    { key: 'beginner', label: t('nearby.beginner') },
    { key: 'intermediate', label: t('nearby.intermediate') },
    { key: 'advanced', label: t('nearby.advanced') },
    { key: 'very_practicing', label: t('nearby.veryPracticing') }
  ];

  const toggleLevel = (level: string) => {
    const newValue = value.includes(level)
      ? value.filter(l => l !== level)
      : [...value, level];
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{t('nearby.practiceLevel')}</Label>
      <div className="flex flex-wrap gap-2">
        {practiceLevels.map(level => (
          <Badge
            key={level.key}
            variant={value.includes(level.key) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleLevel(level.key)}
          >
            {level.label}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default PracticeLevelFilter;
