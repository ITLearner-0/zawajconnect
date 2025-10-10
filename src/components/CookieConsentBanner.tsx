import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, X } from 'lucide-react';

export const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);
  
  const handleAcceptAll = () => {
    localStorage.setItem('cookie_consent', 'all');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
  };
  
  const handleRejectOptional = () => {
    localStorage.setItem('cookie_consent', 'essential');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
  };
  
  const handleCustomize = () => {
    window.open('/cookie-policy', '_blank');
  };
  
  if (!showBanner) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-lg animate-in slide-in-from-bottom duration-500">
      <Card className="max-w-4xl mx-auto shadow-2xl border-emerald/30 bg-background/95 backdrop-blur-xl">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="h-12 w-12 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center flex-shrink-0">
                <Cookie className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  🍪 Votre Confidentialité Nous Tient à Cœur
                </h3>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  Nous utilisons des cookies pour améliorer votre expérience sur ZawajConnect. 
                  Les cookies essentiels sont nécessaires au fonctionnement de la plateforme 
                  (authentification, sécurité). Vous pouvez choisir d'accepter ou de refuser 
                  les cookies optionnels (analytiques pour améliorer nos services).
                </p>
                <a 
                  href="/cookie-policy" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald underline hover:text-emerald-light font-medium"
                >
                  En savoir plus sur notre Politique de Cookies →
                </a>
              </div>
            </div>
            <button 
              onClick={() => setShowBanner(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fermer le banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button 
              onClick={handleAcceptAll}
              className="flex-1 bg-gradient-to-r from-emerald to-emerald-light hover:opacity-90 text-white font-semibold"
            >
              Accepter Tous les Cookies
            </Button>
            <Button 
              onClick={handleRejectOptional}
              variant="outline"
              className="flex-1 border-emerald/30 hover:bg-emerald/5"
            >
              Cookies Essentiels Uniquement
            </Button>
            <Button 
              onClick={handleCustomize}
              variant="ghost"
              className="flex-1 hover:bg-emerald/10"
            >
              Personnaliser
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
