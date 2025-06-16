
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorDisplayProps {
  error?: Error;
  errorId: string;
  onRetry: () => void;
  onReload: () => void;
  onGoHome: () => void;
  onReportBug: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errorId,
  onRetry,
  onReload,
  onGoHome,
  onReportBug
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            Oops ! Une erreur s'est produite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-gray-600">
              Nous nous excusons pour la gêne occasionnée. Une erreur inattendue s'est produite.
            </p>
            <p className="text-sm text-gray-500">
              ID d'erreur: <code className="bg-gray-100 px-1 py-0.5 rounded">{errorId}</code>
            </p>
          </div>

          {isDevelopment && error && (
            <details className="bg-red-50 border border-red-200 rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-red-800">
                Détails de l'erreur (développement uniquement)
              </summary>
              <div className="mt-3 space-y-2">
                <div>
                  <strong>Message:</strong>
                  <pre className="text-sm bg-white p-2 rounded border mt-1 overflow-auto">
                    {error.message}
                  </pre>
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={onRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
            
            <Button onClick={onReload} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Recharger la page
            </Button>
            
            <Button onClick={onGoHome} variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Button>
            
            <Button onClick={onReportBug} variant="ghost" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Signaler le bug
            </Button>
          </div>

          <div className="text-xs text-gray-500 border-t pt-4">
            <p>Si le problème persiste, veuillez contacter notre support technique.</p>
            <p>Timestamp: {new Date().toLocaleString('fr-FR')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
