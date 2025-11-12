import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ModerationStatsProps {
  stats: {
    pendingReports: number;
    flaggedContent: number;
    totalProcessed: number;
    resolvedToday: number;
  };
  loading: boolean;
}

const ModerationStats: React.FC<ModerationStatsProps> = ({ stats, loading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderation Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-2">
            <p>Pending Reports: {stats.pendingReports}</p>
            <p>Flagged Content: {stats.flaggedContent}</p>
            <p>Total Processed: {stats.totalProcessed}</p>
            <p>Resolved Today: {stats.resolvedToday}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModerationStats;
