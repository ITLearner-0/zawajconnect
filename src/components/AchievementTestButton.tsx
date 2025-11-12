import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAchievementNotifications } from '@/hooks/useAchievementNotifications';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

/**
 * Composant de test pour les notifications d'achievements
 * Utile en développement pour tester les différents types de notifications
 */
export function AchievementTestButton() {
  const { triggerTestNotification } = useAchievementNotifications();
  const [selectedRarity, setSelectedRarity] = useState<'common' | 'rare' | 'epic' | 'legendary'>('common');

  // Seulement visible en mode dev
  if (import.meta.env.VITE_DEV_MODE !== 'true') {
    return null;
  }

  return (
    <Card className="border-dashed border-2 border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Test Achievement Notifications
        </CardTitle>
        <CardDescription className="text-xs">
          Testez les notifications d'achievements avec sons et confettis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={selectedRarity} onValueChange={(v) => setSelectedRarity(v as typeof selectedRarity)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="common">Common (son simple)</SelectItem>
            <SelectItem value="rare">Rare (son + confettis)</SelectItem>
            <SelectItem value="epic">Epic (son + gros confettis)</SelectItem>
            <SelectItem value="legendary">Legendary (son + animation spectaculaire)</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          onClick={() => triggerTestNotification(selectedRarity)}
          className="w-full"
          size="sm"
        >
          Tester Notification {selectedRarity.charAt(0).toUpperCase() + selectedRarity.slice(1)}
        </Button>
      </CardContent>
    </Card>
  );
}
