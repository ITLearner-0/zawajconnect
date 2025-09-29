import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Wifi } from 'lucide-react';

interface MobileOptimizedErrorProps {
  error?: Error;
  resetError?: () => void;
  variant?: 'network' | 'loading' | 'general';
}

const MobileOptimizedError: React.FC<MobileOptimizedErrorProps> = ({
  error,
  resetError,
  variant = 'general'
}) => {
  const getErrorContent = () => {
    switch (variant) {
      case 'network':
        return {
          icon: Wifi,
          title: 'Connexion indisponible',
          message: 'Vérifiez votre connexion internet et réessayez.',
          iconColor: 'text-orange-500'
        };
      case 'loading':
        return {
          icon: RefreshCw,
          title: 'Chargement échoué',
          message: 'Les données n\'ont pas pu être chargées.',
          iconColor: 'text-blue-500'
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Une erreur s\'est produite',
          message: error?.message || 'Quelque chose ne va pas. Veuillez réessayer.',
          iconColor: 'text-destructive'
        };
    }
  };

  const { icon: Icon, title, message, iconColor } = getErrorContent();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Icon className={`h-16 w-16 mx-auto ${iconColor}`} />
          </div>
          
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {title}
          </h2>
          
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            {message}
          </p>
          
          <div className="space-y-3">
            {resetError && (
              <Button 
                onClick={resetError}
                className="w-full bg-emerald hover:bg-emerald-dark"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileOptimizedError;