import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WaliDashboardStats } from '@/types/wali';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface WaliStatsProps {
  statistics: WaliDashboardStats;
  className?: string;
}

const WaliStats: React.FC<WaliStatsProps> = ({ statistics, className }) => {
  // Sample chart data - in a real app, this would come from the backend
  const chartData = [
    { name: 'Sun', conversations: 4 },
    { name: 'Mon', conversations: 6 },
    { name: 'Tue', conversations: 8 },
    { name: 'Wed', conversations: 10 },
    { name: 'Thu', conversations: 7 },
    { name: 'Fri', conversations: 5 },
    { name: 'Sat', conversations: 2 },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Wali Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Supervised</span>
            <span className="font-medium">{statistics.totalSupervised}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Active Sessions</span>
            <span className="font-medium">{statistics.activeConversations}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Pending Requests</span>
            <span className="font-medium">{statistics.pendingRequests}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Flagged Messages</span>
            <span className="font-medium">{statistics.flaggedMessages}</span>
          </div>
        </div>

        <div className="h-[120px] mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="conversations" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaliStats;
