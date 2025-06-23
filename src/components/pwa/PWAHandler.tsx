
import React, { useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import PWAInstallPrompt from './PWAInstallPrompt';
import { toast } from '@/hooks/use-toast';
import { Wifi, WifiOff, Download } from 'lucide-react';

const PWAHandler: React.FC = () => {
  const { isInstallable, isOnline, showInstallDialog } = usePWA();

  useEffect(() => {
    // Enregistrer le service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          
          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast({
                    title: "Mise à jour disponible",
                    description: "Une nouvelle version de l'application est disponible. Actualisez pour l'obtenir.",
                    action: (
                      <button 
                        onClick={() => window.location.reload()}
                        className="bg-rose-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Actualiser
                      </button>
                    )
                  });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Ajouter le manifest au head
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);

    // Métadonnées PWA
    const metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    metaThemeColor.content = '#e11d48';
    document.head.appendChild(metaThemeColor);

    const metaAppleMobileCapable = document.createElement('meta');
    metaAppleMobileCapable.name = 'apple-mobile-web-app-capable';
    metaAppleMobileCapable.content = 'yes';
    document.head.appendChild(metaAppleMobileCapable);

    const metaAppleStatusBar = document.createElement('meta');
    metaAppleStatusBar.name = 'apple-mobile-web-app-status-bar-style';
    metaAppleStatusBar.content = 'default';
    document.head.appendChild(metaAppleStatusBar);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(metaThemeColor);
      document.head.removeChild(metaAppleMobileCapable);
      document.head.removeChild(metaAppleStatusBar);
    };
  }, []);

  useEffect(() => {
    // Notifications de statut de connexion
    const handleOnline = () => {
      toast({
        title: "Connexion rétablie",
        description: "Vous êtes de nouveau en ligne",
        className: "border-green-200 bg-green-50 text-green-800",
      });
    };

    const handleOffline = () => {
      toast({
        title: "Connexion perdue",
        description: "Vous travaillez hors ligne. Certaines fonctionnalités peuvent être limitées.",
        className: "border-orange-200 bg-orange-50 text-orange-800",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Suggérer l'installation après quelques interactions
    let interactionCount = 0;
    const maxInteractions = 3;

    const handleInteraction = () => {
      interactionCount++;
      if (interactionCount >= maxInteractions && isInstallable) {
        showInstallDialog();
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('scroll', handleInteraction);
      }
    };

    if (isInstallable) {
      document.addEventListener('click', handleInteraction);
      document.addEventListener('scroll', handleInteraction);
    }

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
    };
  }, [isInstallable, showInstallDialog]);

  return (
    <>
      {/* Indicateur de statut de connexion */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isOnline ? 'translate-y-0' : 'translate-y-0'
      }`}>
        {!isOnline && (
          <div className="bg-orange-500 text-white text-center py-2 px-4 text-sm flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            Mode hors ligne - Fonctionnalités limitées
          </div>
        )}
      </div>

      {/* Prompt d'installation PWA */}
      <PWAInstallPrompt />

      {/* Bouton d'installation flottant (mobile uniquement) */}
      {isInstallable && (
        <div className="fixed bottom-20 right-4 z-40 md:hidden">
          <button
            onClick={showInstallDialog}
            className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 animate-pulse"
            title="Installer l'application"
          >
            <Download className="h-6 w-6" />
          </button>
        </div>
      )}
    </>
  );
};

export default PWAHandler;
