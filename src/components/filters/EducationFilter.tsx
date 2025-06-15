
import React from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface EducationFilterProps {
  value?: string[];
  onChange: (education: string[]) => void;
}

const EducationFilter: React.FC<EducationFilterProps> = ({ value = [], onChange }) => {
  const { t } = useTranslation();

  const educationLevels = [
    { key: 'high_school', label: t('nearby.highSchool') },
    { key: 'bachelors', label: t('nearby.bachelors') },
    { key: 'masters', label: 'Master\'s' },
    { key: 'phd', label: 'PhD' },
    { key: 'other', label: 'Other' }
  ];

  const toggleEducation = (education: string) => {
    const newValue = value.includes(education)
      ? value.filter(e => e !== education)
      : [...value, education];
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{t('nearby.education')}</Label>
      <div className="flex flex-wrap gap-2">
        {educationLevels.map(education => (
          <Badge
            key={education.key}
            variant={value.includes(education.key) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleEducation(education.key)}
          >
            {education.label}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default EducationFilter;
