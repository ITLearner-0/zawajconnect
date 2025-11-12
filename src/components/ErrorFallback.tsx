import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const errorMessage = error.message || 'Une erreur inconnue est survenue';
  const isEnvError = errorMessage.includes('environment variables') || errorMessage.includes('Supabase');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg
              className="h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Erreur de Configuration
            </h1>

            {isEnvError ? (
              <>
                <p className="text-gray-600 mb-4">
                  Le site ne peut pas démarrer car les variables d'environnement Supabase sont manquantes.
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800 font-mono break-all">
                    {errorMessage}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h2 className="font-semibold text-blue-900 mb-2">
                    🔧 Solution pour l'administrateur :
                  </h2>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>
                      Allez sur votre plateforme de déploiement (Netlify ou Vercel)
                    </li>
                    <li>
                      Ajoutez les variables d'environnement suivantes :
                      <div className="bg-white rounded p-2 mt-1 font-mono text-xs">
                        <div>VITE_SUPABASE_URL</div>
                        <div>VITE_SUPABASE_PUBLISHABLE_KEY</div>
                      </div>
                    </li>
                    <li>
                      Obtenez ces valeurs depuis{' '}
                      <a
                        href="https://app.supabase.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600"
                      >
                        votre projet Supabase
                      </a>{' '}
                      (Settings → API)
                    </li>
                    <li>Redéployez le site après avoir ajouté les variables</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Note importante :</strong> Les variables doivent être ajoutées sur
                    la plateforme de déploiement (Netlify/Vercel), pas seulement dans le code GitHub.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Une erreur inattendue s'est produite lors du chargement de l'application.
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800 font-mono break-all">
                    {errorMessage}
                  </p>
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-600 cursor-pointer">
                        Voir la trace complète
                      </summary>
                      <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-48">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>

                {resetErrorBoundary && (
                  <button
                    onClick={resetErrorBoundary}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Réessayer
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Pour plus d'aide, consultez la documentation dans le fichier{' '}
            <code className="bg-gray-100 px-1 py-0.5 rounded">
              PRODUCTION_WHITE_PAGE_FIX.md
            </code>{' '}
            du projet.
          </p>
        </div>
      </div>
    </div>
  );
};
