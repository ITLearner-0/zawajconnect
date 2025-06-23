
import { useState, useEffect } from 'react';

interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  showInstallPrompt: boolean;
}

export const usePWA = () => {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    showInstallPrompt: false
  });
  
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
    
    setState(prev => ({ ...prev, isInstalled }));

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as PWAInstallPrompt);
      setState(prev => ({ ...prev, isInstallable: true }));
    };

    // Écouter les changements de connexion
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    // Écouter l'installation de l'app
    const handleAppInstalled = () => {
      setState(prev => ({ 
        ...prev, 
        isInstalled: true, 
        isInstallable: false,
        showInstallPrompt: false 
      }));
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setState(prev => ({ 
          ...prev, 
          isInstalled: true, 
          isInstallable: false,
          showInstallPrompt: false 
        }));
      }
      
      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  };

  const showInstallDialog = () => {
    setState(prev => ({ ...prev, showInstallPrompt: true }));
  };

  const hideInstallDialog = () => {
    setState(prev => ({ ...prev, showInstallPrompt: false }));
  };

  return {
    ...state,
    installApp,
    showInstallDialog,
    hideInstallDialog
  };
};
