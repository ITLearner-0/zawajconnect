import { useAuth } from '@/contexts/AuthContext';
import GamificationAchievementsDashboard from '@/components/gamification/GamificationAchievementsDashboard';
import { StreakDisplay } from '@/components/gamification';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const GamificationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Alert>
          <LogIn className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Please log in to view your achievements and rewards</span>
            <Button onClick={() => navigate('/login')} size="sm">
              Log In
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Achievements & Rewards</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Track your badges, claim rewards, and view your progress
        </p>
      </div>

      <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <StreakDisplay />
        </div>
      </div>

      <GamificationAchievementsDashboard userId={user.id} />
    </div>
  );
};

export default GamificationPage;
