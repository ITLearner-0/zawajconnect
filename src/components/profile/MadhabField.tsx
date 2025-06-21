
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MadhabFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const MadhabField: React.FC<MadhabFieldProps> = ({ value, onChange }) => {
  const madhabs = [
    { value: '', label: 'Sélectionner une école' },
    { value: 'hanafi', label: 'Hanafi' },
    { value: 'maliki', label: 'Maliki' },
    { value: 'shafi', label: 'Shafi\'i' },
    { value: 'hanbali', label: 'Hanbali' },
    { value: 'jafari', label: 'Ja\'fari (Chiite)' },
    { value: 'other', label: 'Autre' }
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="madhab">École juridique (Madhab)</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner votre madhab" />
        </SelectTrigger>
        <SelectContent>
          {madhabs.map((madhab) => (
            <SelectItem key={madhab.value} value={madhab.value}>
              {madhab.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        L'école juridique islamique que vous suivez
      </p>
    </div>
  );
};

export default MadhabField;
