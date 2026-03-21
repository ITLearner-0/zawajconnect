import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, TrendingUp, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TestUser {
  id: string;
  email: string;
  name: string;
  level: string;
  points: number;
  achievements: number;
  description: string;
  stats: {
    viewCount: number;
    shareCount: number;
    exportCount: number;
  };
}

const TEST_USERS: TestUser[] = [
  {
    id: 'beginner',
    email: 'test-phase5-beginner@zawajconnect.me',
    name: 'Test Beginner',
    level: 'Débutant',
    points: 50,
    achievements: 2,
    description: 'Nouveau utilisateur avec profil basique',
    stats: {
      viewCount: 1,
      shareCount: 0,
      exportCount: 0,
    },
  },
  {
    id: 'intermediate',
    email: 'test-phase5-intermediate@zawajconnect.me',
    name: 'Test Intermediate',
    level: 'Intermédiaire',
    points: 250,
    achievements: 5,
    description: 'Utilisateur actif avec plusieurs achievements',
    stats: {
      viewCount: 5,
      shareCount: 2,
      exportCount: 1,
    },
  },
  {
    id: 'advanced',
    email: 'test-phase5-advanced@zawajconnect.me',
    name: 'Test Advanced',
    level: 'Avancé',
    points: 500,
    achievements: 8,
    description: 'Utilisateur expérimenté avec tous les achievements',
    stats: {
      viewCount: 15,
      shareCount: 5,
      exportCount: 3,
    },
  },
];

export function TestUserSelector() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Only render in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  const currentTestUser = TEST_USERS.find((u) => u.email === user?.email);

  const handleSwitchUser = async (userId: string) => {
    const testUser = TEST_USERS.find((u) => u.id === userId);
    if (!testUser) return;

    setLoading(true);
    try {
      // Sign out current user
      await supabase.auth.signOut();

      // Sign in with test user
      const { error } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: 'TestUser123!',
      });

      if (error) throw error;

      toast.success(`Connecté en tant que ${testUser.name}`);

      // Reload to update the entire app state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error switching user:', error);
      toast.error("Erreur lors du changement d'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Test User Selector
        </CardTitle>
        <CardDescription>
          Switcher entre les utilisateurs de test pour tester les achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentTestUser && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Utilisateur actuel</span>
              <Badge variant="secondary">{currentTestUser.level}</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">{currentTestUser.name}</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-primary" />
                  <span className="text-muted-foreground">{currentTestUser.points} pts</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-primary" />
                  <span className="text-muted-foreground">
                    {currentTestUser.achievements} achievements
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span className="text-muted-foreground">
                    {currentTestUser.stats.viewCount} vues
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Choisir un utilisateur test</label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un utilisateur..." />
            </SelectTrigger>
            <SelectContent>
              {TEST_USERS.map((testUser) => (
                <SelectItem key={testUser.id} value={testUser.id}>
                  <div className="flex items-center gap-2">
                    <span>{testUser.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {testUser.level}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedUser && (
          <div className="space-y-3">
            {(() => {
              const testUser = TEST_USERS.find((u) => u.id === selectedUser);
              if (!testUser) return null;

              return (
                <>
                  <div className="p-3 rounded-lg bg-card border border-border space-y-2">
                    <p className="text-xs text-muted-foreground">{testUser.description}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        <div className="text-xs">
                          <p className="font-medium text-foreground">{testUser.points} points</p>
                          <p className="text-muted-foreground">Points total</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        <div className="text-xs">
                          <p className="font-medium text-foreground">{testUser.achievements}</p>
                          <p className="text-muted-foreground">Achievements</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <div className="text-xs">
                          <p className="font-medium text-foreground">{testUser.stats.viewCount}</p>
                          <p className="text-muted-foreground">Vues insights</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <div className="text-xs">
                          <p className="font-medium text-foreground">{testUser.stats.shareCount}</p>
                          <p className="text-muted-foreground">Partages</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSwitchUser(selectedUser)}
                    disabled={loading || currentTestUser?.id === selectedUser}
                    className="w-full"
                  >
                    {loading
                      ? 'Changement en cours...'
                      : `Se connecter en tant que ${testUser.name}`}
                  </Button>
                </>
              );
            })()}
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            💡 Mot de passe pour tous les utilisateurs test :{' '}
            <code className="text-foreground">TestUser123!</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
