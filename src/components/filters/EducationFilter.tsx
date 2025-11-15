import React from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface EducationFilterProps {
  value?: string[];
  onChange: (education: string[]) => void;
}

const EducationFilter: React.FC<EducationFilterProps> = ({ value = [], onChange }) => {
  const educationLevels = [
    { key: 'high_school', label: 'Lycée' },
    { key: 'bachelors', label: 'Licence' },
    { key: 'masters', label: 'Master' },
    { key: 'phd', label: 'Doctorat' },
    { key: 'other', label: 'Autre' },
  ];

  const toggleEducation = (education: string) => {
    const newValue = value.includes(education)
      ? value.filter((e) => e !== education)
      : [...value, education];
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Éducation</Label>
      <div className="flex flex-wrap gap-2">
        {educationLevels.map((education) => (
          <Badge
            key={education.key}
            variant={value.includes(education.key) ? 'default' : 'outline'}
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
