import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ProfileErrorStateProps {
  error: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const ProfileErrorState = ({ error, onRetry, isRetrying }: ProfileErrorStateProps) => {
  return (
    <Card className="border-destructive/20">
      <CardContent className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button 
          onClick={onRetry} 
          disabled={isRetrying}
          variant="outline"
          className="gap-2"
        >
          {isRetrying ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Réessayer
        </Button>
      </CardContent>
    </Card>
  );
};