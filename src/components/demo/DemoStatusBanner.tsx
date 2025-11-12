import React from 'react';
import { AlertTriangle, Info, Eye, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface DemoStatusBannerProps {
  variant?: 'default' | 'prominent' | 'minimal';
  showDetails?: boolean;
}

const DemoStatusBanner: React.FC<DemoStatusBannerProps> = ({
  variant = 'default',
  showDetails = true,
}) => {
  if (variant === 'minimal') {
    return (
      <Badge
        variant="outline"
        className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 fixed top-4 right-4 z-50 animate-pulse"
      >
        <Eye className="h-3 w-3 mr-1" />
        Mode Démo
      </Badge>
    );
  }

  if (variant === 'prominent') {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Mode Démonstration Actif</h3>
              <p className="text-blue-100 text-sm">
                Vous explorez une version de démonstration avec des données fictives
              </p>
            </div>
          </div>
          <Badge className="bg-white text-blue-600 hover:bg-blue-50">
            <Users className="h-3 w-3 mr-1" />
            Profils Limités
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="text-blue-800 dark:text-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <strong>Mode Démo Actif</strong> - Vous utilisez une version de démonstration
            {showDetails && (
              <span className="block text-sm text-blue-600 dark:text-blue-300 mt-1">
                • Profils fictifs représentatifs • Conversations pré-écrites • Toutes les
                fonctionnalités disponibles
              </span>
            )}
          </div>
          <Badge
            variant="outline"
            className="border-blue-300 text-blue-700 bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:bg-blue-900"
          >
            Démo
          </Badge>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DemoStatusBanner;
