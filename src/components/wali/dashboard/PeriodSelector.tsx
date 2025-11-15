import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { KPIPeriod } from '@/hooks/wali/useWaliKPIs';

interface PeriodSelectorProps {
  value: KPIPeriod;
  onChange: (period: KPIPeriod) => void;
}

export const PeriodSelector = ({ value, onChange }: PeriodSelectorProps) => {
  const periods: { value: KPIPeriod; label: string }[] = [
    { value: '7days', label: '7 jours' },
    { value: '30days', label: '30 jours' },
    { value: '90days', label: '90 jours' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <div className="flex gap-1">
        {periods.map((period) => (
          <Button
            key={period.value}
            variant={value === period.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(period.value)}
          >
            {period.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
