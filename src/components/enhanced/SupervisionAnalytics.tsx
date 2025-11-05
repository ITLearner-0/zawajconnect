// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Users, 
  MessageSquare, 
  Shield, 
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Heart,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SupervisedUser {
  id: string;
  full_name: string;
  user_id: string;
  relationship: string;
}

interface FamilyNotification {
  id: string;
  notification_type: string;
  severity: string;
  created_at: string;
}

interface WaliStats {
  totalSupervised: number;
  criticalAlerts: number;
  pendingApprovals: number;
  approvalRate: number;
  activeConversations: number;
  recentActivity: number;
}

interface AnalyticsData {
  messageActivity: { date: string; count: number; flagged: number }[];
  notificationTrends: { type: string; count: number; percentage: number }[];
  supervisionMetrics: {
    totalMessages: number;
    flaggedMessages: number;
    approvedMatches: number;
    rejectedMatches: number;
    responseTime: number;
  };
  userActivity: { userId: string; name: string; messages: number; lastSeen: string }[];
  weeklyTrends: { week: string; messages: number; alerts: number; approvals: number }[];
}

interface SupervisionAnalyticsProps {
  supervisedUsers: SupervisedUser[];
  notifications: FamilyNotification[];
  stats: WaliStats;
}

const SupervisionAnalytics: React.FC<SupervisionAnalyticsProps> = ({
  supervisedUsers,
  notifications,
  stats
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    messageActivity: [],
    notificationTrends: [],
    supervisionMetrics: {
      totalMessages: 0,
      flaggedMessages: 0,
      approvedMatches: 0,
      rejectedMatches: 0,
      responseTime: 0
    },
    userActivity: [],
    weeklyTrends: []
  });
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, supervisedUsers]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case '7d':
          startDate = subDays(endDate, 7);
          break;
        case '30d':
          startDate = subDays(endDate, 30);
          break;
        case '90d':
          startDate = subDays(endDate, 90);
          break;
      }

      const supervisedUserIds = supervisedUsers.map(u => u.user_id);
      
      // Load message activity
      const { data: messageData } = await supabase
        .from('messages')
        .select('created_at, match_id')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Load moderation logs for flagged content
      const { data: moderationData } = await supabase
        .from('moderation_logs')
        .select('created_at, action_taken, confidence_score')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Load match approval data
      const { data: matchData } = await supabase
        .from('matches')
        .select('created_at, family1_approved, family2_approved, family_reviewed_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Process message activity by day
      const messageActivity = processMessageActivity(messageData || [], moderationData || []);
      
      // Process notification trends
      const notificationTrends = processNotificationTrends(notifications);
      
      // Calculate supervision metrics
      const supervisionMetrics = calculateSupervisionMetrics(
        messageData || [],
        moderationData || [],
        matchData || []
      );

      // Process user activity
      const userActivity = await processUserActivity(supervisedUsers, messageData || []);

      // Process weekly trends
      const weeklyTrends = processWeeklyTrends(
        messageData || [],
        notifications,
        matchData || [],
        startDate
      );

      setAnalyticsData({
        messageActivity,
        notificationTrends,
        supervisionMetrics,
        userActivity,
        weeklyTrends
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMessageActivity = (messages: unknown[], moderationLogs: unknown[]) => {
    const activityMap = new Map<string, { count: number; flagged: number }>();
    
    // Process messages
    messages.forEach(message => {
      const date = format(new Date(message.created_at), 'yyyy-MM-dd');
      const existing = activityMap.get(date) || { count: 0, flagged: 0 };
      activityMap.set(date, { ...existing, count: existing.count + 1 });
    });

    // Process flagged content
    moderationLogs.forEach(log => {
      const date = format(new Date(log.created_at), 'yyyy-MM-dd');
      const existing = activityMap.get(date) || { count: 0, flagged: 0 };
      if (log.action_taken !== 'approved') {
        activityMap.set(date, { ...existing, flagged: existing.flagged + 1 });
      }
    });

    return Array.from(activityMap.entries())
      .map(([date, data]) => ({
        date,
        count: data.count,
        flagged: data.flagged
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const processNotificationTrends = (notifications: FamilyNotification[]) => {
    const typeMap = new Map<string, number>();
    
    notifications.forEach(notification => {
      const type = notification.notification_type;
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    const total = notifications.length;
    
    return Array.from(typeMap.entries()).map(([type, count]) => ({
      type: type.replace('_', ' '),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  };

  const calculateSupervisionMetrics = (messages: unknown[], moderationLogs: unknown[], matches: unknown[]) => {
    const totalMessages = messages.length;
    const flaggedMessages = moderationLogs.filter(log => log.action_taken !== 'approved').length;
    
    const approvedMatches = matches.filter(match => 
      match.family1_approved === true || match.family2_approved === true
    ).length;
    
    const rejectedMatches = matches.filter(match => 
      match.family1_approved === false || match.family2_approved === false
    ).length;

    // Calculate average response time (simplified)
    const reviewedMatches = matches.filter(match => match.family_reviewed_at);
    const totalResponseTime = reviewedMatches.reduce((sum, match) => {
      const created = new Date(match.created_at);
      const reviewed = new Date(match.family_reviewed_at);
      return sum + (reviewed.getTime() - created.getTime());
    }, 0);
    
    const responseTime = reviewedMatches.length > 0 
      ? Math.round(totalResponseTime / (reviewedMatches.length * 1000 * 60 * 60)) // hours
      : 0;

    return {
      totalMessages,
      flaggedMessages,
      approvedMatches,
      rejectedMatches,
      responseTime
    };
  };

  const processUserActivity = async (users: SupervisedUser[], messages: unknown[]) => {
    const userActivityPromises = users.map(async (user) => {
      // Count messages for this user
      const userMessages = messages.filter(m => 
        // This would need to be enhanced with actual match data lookup
        true // Simplified for now
      ).length;

      return {
        userId: user.user_id,
        name: user.full_name,
        messages: userMessages,
        lastSeen: format(new Date(), 'yyyy-MM-dd HH:mm')
      };
    });

    return Promise.all(userActivityPromises);
  };

  const processWeeklyTrends = (
    messages: unknown[], 
    notifications: FamilyNotification[], 
    matches: unknown[], 
    startDate: Date
  ) => {
    const weeks = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= new Date()) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekMessages = messages.filter(m => {
        const messageDate = new Date(m.created_at);
        return messageDate >= weekStart && messageDate <= weekEnd;
      }).length;

      const weekAlerts = notifications.filter(n => {
        const notifDate = new Date(n.created_at);
        return notifDate >= weekStart && notifDate <= weekEnd && n.severity === 'critical';
      }).length;

      const weekApprovals = matches.filter(m => {
        const matchDate = new Date(m.family_reviewed_at || m.created_at);
        return matchDate >= weekStart && matchDate <= weekEnd;
      }).length;

      weeks.push({
        week: format(weekStart, 'dd MMM', { locale: fr }),
        messages: weekMessages,
        alerts: weekAlerts,
        approvals: weekApprovals
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return weeks;
  };

  const exportAnalytics = () => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      stats,
      analyticsData,
      supervisedUsers: supervisedUsers.map(u => ({
        name: u.full_name,
        relationship: u.relationship
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supervision-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analyses de Supervision</h2>
          <p className="text-muted-foreground">
            Insights détaillés sur l'activité de supervision familiale
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Messages Supervisés</p>
                <p className="text-3xl font-bold text-blue-700">{analyticsData.supervisionMetrics.totalMessages}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center text-xs text-blue-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {analyticsData.supervisionMetrics.flaggedMessages} signalés
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Contenu Signalé</p>
                <p className="text-3xl font-bold text-red-700">{analyticsData.supervisionMetrics.flaggedMessages}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="mt-4">
              <Progress 
                value={analyticsData.supervisionMetrics.totalMessages > 0 
                  ? (analyticsData.supervisionMetrics.flaggedMessages / analyticsData.supervisionMetrics.totalMessages) * 100 
                  : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Matches Approuvés</p>
                <p className="text-3xl font-bold text-green-700">{analyticsData.supervisionMetrics.approvedMatches}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4 flex items-center text-xs text-green-600">
              <Heart className="h-3 w-3 mr-1" />
              {analyticsData.supervisionMetrics.rejectedMatches} rejetés
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Temps de Réponse</p>
                <p className="text-3xl font-bold text-amber-700">{analyticsData.supervisionMetrics.responseTime}h</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
            <div className="mt-4 flex items-center text-xs text-amber-600">
              <Activity className="h-3 w-3 mr-1" />
              Moyenne
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
        </TabsList>

        {/* Message Activity */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Activité des Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.messageActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune activité dans la période sélectionnée
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analyticsData.messageActivity.slice(-10).map((day, index) => (
                      <div key={day.date} className="flex items-center gap-4">
                        <div className="w-20 text-sm text-muted-foreground">
                          {format(new Date(day.date), 'dd MMM', { locale: fr })}
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <Progress value={(day.count / Math.max(...analyticsData.messageActivity.map(d => d.count))) * 100} className="flex-1" />
                          <div className="w-16 text-sm font-medium text-right">{day.count}</div>
                          {day.flagged > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {day.flagged} signalé{day.flagged > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Analysis */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Types de Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyticsData.notificationTrends.map((trend, index) => (
                  <div key={trend.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full`} style={{
                        backgroundColor: `hsl(${index * 45}, 70%, 50%)`
                      }}></div>
                      <span className="text-sm font-medium capitalize">{trend.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={trend.percentage} className="w-20" />
                      <span className="text-sm font-medium w-12 text-right">{trend.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Efficacité de la Supervision
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stats.approvalRate}%
                  </div>
                  <p className="text-sm text-muted-foreground">Taux d'approbation global</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Messages approuvés</span>
                    <span className="font-medium">
                      {analyticsData.supervisionMetrics.totalMessages - analyticsData.supervisionMetrics.flaggedMessages}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Temps de réponse moyen</span>
                    <span className="font-medium">{analyticsData.supervisionMetrics.responseTime}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Matches supervisés</span>
                    <span className="font-medium">
                      {analyticsData.supervisionMetrics.approvedMatches + analyticsData.supervisionMetrics.rejectedMatches}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Activity */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Activité des Utilisateurs Supervisés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.userActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune activité utilisateur
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analyticsData.userActivity.map((user) => (
                      <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{user.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Dernière activité: {user.lastSeen}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{user.messages}</div>
                          <div className="text-xs text-muted-foreground">messages</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Trends */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Tendances Hebdomadaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.weeklyTrends.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Pas assez de données pour afficher les tendances
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analyticsData.weeklyTrends.map((week, index) => (
                      <div key={week.week} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                        <div className="text-center">
                          <div className="text-sm font-medium text-muted-foreground">Semaine</div>
                          <div className="text-lg font-bold">{week.week}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-blue-600">Messages</div>
                          <div className="text-lg font-bold text-blue-700">{week.messages}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-red-600">Alertes</div>
                          <div className="text-lg font-bold text-red-700">{week.alerts}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-green-600">Approbations</div>
                          <div className="text-lg font-bold text-green-700">{week.approvals}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupervisionAnalytics;