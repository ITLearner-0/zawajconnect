import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  isPercentage?: boolean;
  invertColors?: boolean;
}

export const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  changeLabel,
  trend,
  isPercentage = false,
  invertColors = false,
}: KPICardProps) => {
  const getTrendColor = () => {
    if (trend === 'neutral') return 'text-muted-foreground';
    
    const isPositive = trend === 'up';
    const shouldBeGreen = invertColors ? !isPositive : isPositive;
    
    return shouldBeGreen ? 'text-green-600' : 'text-red-600';
  };

  const getTrendBgColor = () => {
    if (trend === 'neutral') return 'bg-muted';
    
    const isPositive = trend === 'up';
    const shouldBeGreen = invertColors ? !isPositive : isPositive;
    
    return shouldBeGreen ? 'bg-green-100' : 'bg-red-100';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {isPercentage && '%'}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {change !== undefined && (
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="outline"
              className={cn(
                'flex items-center gap-1',
                getTrendColor(),
                getTrendBgColor()
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span className="text-xs font-medium">
                {change > 0 && '+'}
                {change}%
              </span>
            </Badge>
            {changeLabel && (
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
