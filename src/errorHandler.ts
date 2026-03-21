/**
 * Global error handler for catastrophic errors that prevent React from mounting
 * This catches errors during module imports and initial setup
 */

export function setupGlobalErrorHandler() {
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showErrorPage(event.reason);
    event.preventDefault();
  });

  // Catch synchronous errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showErrorPage(event.error);
    event.preventDefault();
  });
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showErrorPage(error: any) {
  const errorMessage = error?.message || error?.toString() || 'Une erreur inconnue est survenue';
  const safeErrorMessage = escapeHtml(errorMessage);
  const isEnvError =
    errorMessage.includes('environment variables') || errorMessage.includes('Supabase');

  // Remove any existing error page
  const existingError = document.getElementById('global-error-page');
  if (existingError) {
    existingError.remove();
  }

  // Create error page HTML
  const errorPage = document.createElement('div');
  errorPage.id = 'global-error-page';
  errorPage.innerHTML = `
    <style>
      #global-error-page {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .error-container {
        max-width: 48rem;
        width: 100%;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        padding: 2rem;
      }
      .error-header {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
      }
      .error-icon {
        flex-shrink: 0;
        width: 3rem;
        height: 3rem;
        color: #ef4444;
      }
      .error-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: #111827;
        margin: 0 0 0.5rem 0;
      }
      .error-description {
        color: #4b5563;
        margin: 0 0 1rem 0;
      }
      .error-message {
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 0.5rem;
        padding: 1rem;
        margin: 1rem 0;
        font-family: monospace;
        font-size: 0.875rem;
        color: #991b1b;
        word-break: break-word;
      }
      .solution-box {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 0.5rem;
        padding: 1rem;
        margin: 1rem 0;
      }
      .solution-title {
        font-weight: 600;
        color: #1e3a8a;
        margin: 0 0 0.5rem 0;
      }
      .solution-steps {
        color: #1e40af;
        font-size: 0.875rem;
        margin: 0.5rem 0;
        padding-left: 1.5rem;
      }
      .solution-steps li {
        margin: 0.5rem 0;
      }
      .env-vars {
        background: white;
        border-radius: 0.375rem;
        padding: 0.5rem;
        margin: 0.5rem 0;
        font-family: monospace;
        font-size: 0.75rem;
      }
      .warning-box {
        background: #fefce8;
        border: 1px solid #fde047;
        border-radius: 0.5rem;
        padding: 1rem;
        margin: 1rem 0;
        font-size: 0.875rem;
        color: #854d0e;
      }
      .footer {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e5e7eb;
        font-size: 0.75rem;
        color: #6b7280;
      }
      .code {
        background: #f3f4f6;
        padding: 0.125rem 0.25rem;
        border-radius: 0.25rem;
        font-family: monospace;
      }
      a {
        color: #2563eb;
        text-decoration: underline;
      }
    </style>
    <div class="error-container">
      <div class="error-header">
        <svg class="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div style="flex: 1;">
          <h1 class="error-title">Erreur de Configuration</h1>
          ${
            isEnvError
              ? `
            <p class="error-description">
              Le site ne peut pas démarrer car les variables d'environnement Supabase sont manquantes.
            </p>
            <div class="error-message">${safeErrorMessage}</div>
            <div class="solution-box">
              <h2 class="solution-title">🔧 Solution pour l'administrateur :</h2>
              <ol class="solution-steps">
                <li>Allez sur votre plateforme de déploiement (Netlify ou Vercel)</li>
                <li>
                  Ajoutez les variables d'environnement suivantes :
                  <div class="env-vars">
                    <div>VITE_SUPABASE_URL</div>
                    <div>VITE_SUPABASE_PUBLISHABLE_KEY</div>
                  </div>
                </li>
                <li>
                  Obtenez ces valeurs depuis
                  <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer">
                    votre projet Supabase
                  </a>
                  (Settings → API)
                </li>
                <li>Redéployez le site après avoir ajouté les variables</li>
              </ol>
            </div>
            <div class="warning-box">
              <strong>⚠️ Note importante :</strong> Les variables doivent être ajoutées sur
              la plateforme de déploiement (Netlify/Vercel), pas seulement dans le code GitHub.
            </div>
          `
              : `
            <p class="error-description">
              Une erreur inattendue s'est produite lors du chargement de l'application.
            </p>
            <div class="error-message">${safeErrorMessage}</div>
            <button
              onclick="window.location.reload()"
              style="
                padding: 0.5rem 1rem;
                background: #059669;
                color: white;
                border: none;
                border-radius: 0.375rem;
                cursor: pointer;
                font-weight: 500;
              "
            >
              Réessayer
            </button>
          `
          }
        </div>
      </div>
      <div class="footer">
        Pour plus d'aide, consultez la documentation dans le fichier
        <span class="code">PRODUCTION_WHITE_PAGE_FIX.md</span>
        du projet.
      </div>
    </div>
  `;

  // Add to DOM
  document.body.innerHTML = '';
  document.body.appendChild(errorPage);
}
