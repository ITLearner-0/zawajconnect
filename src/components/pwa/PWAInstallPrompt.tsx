
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Download, Smartphone, Zap, Shield, Wifi } from "lucide-react";
import { usePWA } from '@/hooks/usePWA';

const PWAInstallPrompt: React.FC = () => {
  const { showInstallPrompt, installApp, hideInstallDialog, isOnline } = usePWA();

  if (!showInstallPrompt) return null;

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      hideInstallDialog();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-rose-200 dark:border-rose-700 bg-white/95 dark:bg-rose-900/95 backdrop-blur-sm">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={hideInstallDialog}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-800 dark:to-pink-800 p-3 rounded-full">
              <Smartphone className="h-6 w-6 text-rose-600 dark:text-rose-300" />
            </div>
            <div>
              <CardTitle className="text-rose-800 dark:text-rose-200">
                Installer Nikah Connect
              </CardTitle>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200">
                Application Native
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <CardDescription className="text-rose-600 dark:text-rose-300">
            Profitez d'une expérience optimisée avec notre application native
          </CardDescription>

          {/* Avantages */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-green-100 dark:bg-green-800 p-1 rounded-full">
                <Zap className="h-3 w-3 text-green-600 dark:text-green-300" />
              </div>
              <span className="text-rose-700 dark:text-rose-300">
                Accès rapide depuis l'écran d'accueil
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-blue-100 dark:bg-blue-800 p-1 rounded-full">
                <Wifi className="h-3 w-3 text-blue-600 dark:text-blue-300" />
              </div>
              <span className="text-rose-700 dark:text-rose-300">
                Fonctionne hors ligne
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-purple-100 dark:bg-purple-800 p-1 rounded-full">
                <Shield className="h-3 w-3 text-purple-600 dark:text-purple-300" />
              </div>
              <span className="text-rose-700 dark:text-rose-300">
                Notifications en temps réel
              </span>
            </div>
          </div>

          {/* État de la connexion */}
          <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
            <span className="text-sm text-rose-600 dark:text-rose-400">
              État de la connexion
            </span>
            <Badge className={isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </Badge>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Installer l'app
            </Button>
            
            <Button
              variant="outline"
              onClick={hideInstallDialog}
              className="border-rose-300 text-rose-600 hover:bg-rose-50"
            >
              Plus tard
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            L'installation ne prend que quelques secondes
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
