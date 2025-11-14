import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStepCardProps {
  title: string;
  description: string;
  completed: boolean;
  locked?: boolean;
  current?: boolean;
  onStart?: () => void;
}

export const OnboardingStepCard = ({
  title,
  description,
  completed,
  locked = false,
  current = false,
  onStart,
}: OnboardingStepCardProps) => {
  return (
    <Card
      className={cn(
        'transition-all',
        current && 'ring-2 ring-primary',
        completed && 'border-success bg-success/5',
        locked && 'opacity-60'
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {completed ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : locked ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <CardDescription>{description}</CardDescription>
          </div>
          <div>
            {completed && <Badge variant="secondary">Complété</Badge>}
            {current && !completed && <Badge>En cours</Badge>}
            {locked && <Badge variant="outline">Verrouillé</Badge>}
          </div>
        </div>
      </CardHeader>
      {!completed && !locked && onStart && (
        <CardContent>
          <Button onClick={onStart} className="w-full">
            {current ? 'Continuer' : 'Commencer'}
          </Button>
        </CardContent>
      )}
    </Card>
  );
};
