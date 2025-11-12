import React from 'react';
import UserLevelBadge from './UserLevelBadge';
import StreakCounter from './StreakCounter';
import DailyQuests from './DailyQuests';
import WeeklyChallenges from './WeeklyChallenges';
import Leaderboard from './Leaderboard';

interface GamificationDashboardProps {
  layout?: 'grid' | 'stack';
}

const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ 
  layout = 'grid' 
}) => {
  if (layout === 'stack') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UserLevelBadge />
          <StreakCounter />
        </div>
        <DailyQuests />
        <WeeklyChallenges />
        <Leaderboard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <UserLevelBadge />
        <StreakCounter />
        <DailyQuests />
        <WeeklyChallenges />
      </div>
      <div>
        <Leaderboard />
      </div>
    </div>
  );
};

export default GamificationDashboard;
