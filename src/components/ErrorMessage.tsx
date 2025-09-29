import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  variant?: 'default' | 'minimal';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message = "Une erreur s'est produite", 
  onRetry, 
  showRetry = true,
  variant = 'default'
}) => {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground">
        <AlertCircle className="h-4 w-4 mr-2" />
        <span className="text-sm">{message}</span>
        {showRetry && onRetry && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRetry}
            className="ml-2 h-auto p-1"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Erreur
        </h3>
        <p className="text-muted-foreground mb-4">
          {message}
        </p>
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorMessage;