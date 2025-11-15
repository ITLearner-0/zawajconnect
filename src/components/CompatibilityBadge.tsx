import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CompatibilityBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const CompatibilityBadge = ({
  score,
  size = 'md',
  showTooltip = true,
}: CompatibilityBadgeProps) => {
  const getColorClass = () => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 40) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getProgressColor = () => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getCompatibilityText = () => {
    if (score >= 80) return 'High Compatibility';
    if (score >= 60) return 'Good Compatibility';
    if (score >= 40) return 'Moderate Compatibility';
    return 'Low Compatibility';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const badge = (
    <Badge className={`${getColorClass()} ${sizeClasses[size]} rounded-md font-medium`}>
      <div className="flex items-center gap-1.5">
        <span>{score}%</span>
        {size !== 'sm' && (
          <Progress value={score} className="w-10 h-1.5" indicatorClassName={getProgressColor()} />
        )}
      </div>
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p>{getCompatibilityText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CompatibilityBadge;
