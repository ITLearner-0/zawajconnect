
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Shield, Globe, Moon, Volume2, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    profileViews: false,
    waliUpdates: true,
    marketing: false
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: 'fr',
    soundEnabled: true,
    autoTranslate: false,
    showOnlineStatus: true
  });

  const [searchRadius, setSearchRadius] = useState([50]);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos préférences ont été mises à jour avec succès.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-2xl font-bold text-rose-800 dark:text-rose-200 mb-6">
          Paramètres
        </h1>

        {/* Notifications */}
        <Card className="mb-6 shadow-lg border-rose-200 dark:border-rose-700 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-medium">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-matches">Nouvelles correspondances</Label>
              <Switch 
                id="new-matches"
                checked={notifications.newMatches}
                onCheckedChange={(checked) => handleNotificationChange('newMatches', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="messages">Messages</Label>
              <Switch 
                id="messages"
                checked={notifications.messages}
                onCheckedChange={(checked) => handleNotificationChange('messages', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-views">Vues de profil</Label>
              <Switch 
                id="profile-views"
                checked={notifications.profileViews}
                onCheckedChange={(checked) => handleNotificationChange('profileViews', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="wali-updates">Mises à jour Wali</Label>
              <Switch 
                id="wali-updates"
                checked={notifications.waliUpdates}
                onCheckedChange={(checked) => handleNotificationChange('waliUpdates', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Préférences */}
        <Card className="mb-6 shadow-lg border-rose-200 dark:border-rose-700 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-medium">
              <Globe className="mr-2 h-5 w-5" />
              Préférences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Mode sombre</Label>
              <Switch 
                id="dark-mode"
                checked={preferences.darkMode}
                onCheckedChange={(checked) => handlePreferenceChange('darkMode', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="language">Langue</Label>
              <Select value={preferences.language} onValueChange={(value) => handlePreferenceChange('language', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound">Sons activés</Label>
              <Switch 
                id="sound"
                checked={preferences.soundEnabled}
                onCheckedChange={(checked) => handlePreferenceChange('soundEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recherche */}
        <Card className="mb-6 shadow-lg border-rose-200 dark:border-rose-700 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-medium">
              <Heart className="mr-2 h-5 w-5" />
              Préférences de recherche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Rayon de recherche: {searchRadius[0]} km</Label>
              <Slider 
                value={searchRadius}
                onValueChange={setSearchRadius}
                max={200}
                min={10}
                step={10}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="online-status">Afficher statut en ligne</Label>
              <Switch 
                id="online-status"
                checked={preferences.showOnlineStatus}
                onCheckedChange={(checked) => handlePreferenceChange('showOnlineStatus', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            onClick={saveSettings}
            className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white px-8"
          >
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
