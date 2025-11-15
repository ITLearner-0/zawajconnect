import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TrendPeriodSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export const TrendPeriodSelector = ({ value, onChange }: TrendPeriodSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Période :</span>
      <Select value={value.toString()} onValueChange={(val) => onChange(parseInt(val))}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="3">3 derniers mois</SelectItem>
          <SelectItem value="6">6 derniers mois</SelectItem>
          <SelectItem value="12">12 derniers mois</SelectItem>
          <SelectItem value="24">2 dernières années</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
