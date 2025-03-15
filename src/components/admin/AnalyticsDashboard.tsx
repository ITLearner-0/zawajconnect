
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useAnalyticsData } from '@/hooks/admin/useAnalyticsData';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MessageCircle, Shield, AlertTriangle, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const { 
    analytics, 
    loading, 
    error, 
    emergencyStats,
    moderationStats,
    userActivityStats,
    waliStats,
    refreshData
  } = useAnalyticsData(dateRange);
  
  const pieColors = ["#10B981", "#3B82F6", "#F97316", "#8B5CF6"];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive reporting and insights</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangePicker 
            value={dateRange}
            onChange={setDateRange}
          />
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </div>
      </div>
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <h3 className="text-2xl font-bold mt-1">{userActivityStats?.activeUsers || 0}</h3>
              </div>
              <Users className="h-8 w-8 text-islamic-teal opacity-80" />
            </div>
            <Progress
              value={(userActivityStats?.activeUsers / userActivityStats?.totalUsers) * 100 || 0}
              className="h-1 mt-3"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {((userActivityStats?.activeUsers / userActivityStats?.totalUsers) * 100 || 0).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Conversations</p>
                <h3 className="text-2xl font-bold mt-1">{analytics?.totalConversations || 0}</h3>
              </div>
              <MessageCircle className="h-8 w-8 text-islamic-teal opacity-80" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                +{analytics?.newConversations || 0} new
              </Badge>
              <p className="text-xs text-muted-foreground">
                in last 7 days
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wali Supervised</p>
                <h3 className="text-2xl font-bold mt-1">{waliStats?.supervisedConversations || 0}</h3>
              </div>
              <Shield className="h-8 w-8 text-islamic-gold opacity-80" />
            </div>
            <Progress
              value={(waliStats?.supervisedConversations / analytics?.totalConversations) * 100 || 0}
              className="h-1 mt-3"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {((waliStats?.supervisedConversations / analytics?.totalConversations) * 100 || 0).toFixed(1)}% of all conversations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emergency Reports</p>
                <h3 className="text-2xl font-bold mt-1 flex items-center">
                  {emergencyStats?.totalReports || 0}
                  {emergencyStats?.pendingHighPriority > 0 && (
                    <Badge className="ml-2 bg-red-500">{emergencyStats.pendingHighPriority}</Badge>
                  )}
                </h3>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-80" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant={emergencyStats?.pendingReports > 0 ? "destructive" : "outline"} className={emergencyStats?.pendingReports > 0 ? "" : "bg-green-50 text-green-700 border-green-200"}>
                {emergencyStats?.pendingReports || 0} pending
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {emergencyStats?.resolvedReports || 0} resolved
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="user-activity">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="user-activity">User Activity</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="wali-statistics">Wali Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="user-activity">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Messages sent per day over time</CardDescription>
              </CardHeader>
              <CardContent>
                {userActivityStats?.messageTrends && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userActivityStats.messageTrends}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
                <CardDescription>User distribution by age group</CardDescription>
              </CardHeader>
              <CardContent>
                {userActivityStats?.demographicStats && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userActivityStats.demographicStats}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {userActivityStats.demographicStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="moderation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Flags</CardTitle>
                <CardDescription>Types of content flags over time</CardDescription>
              </CardHeader>
              <CardContent>
                {moderationStats?.flagsByType && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={moderationStats.flagsByType}>
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Emergency Reports</CardTitle>
                <CardDescription>Recent emergency reports</CardDescription>
              </CardHeader>
              <CardContent>
                {emergencyStats?.recentReports && emergencyStats.recentReports.length > 0 ? (
                  <div className="space-y-4">
                    {emergencyStats.recentReports.map(report => (
                      <div key={report.id} className="flex items-start gap-3 pb-3 border-b">
                        <div className={`rounded-full p-1 ${report.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                          {report.status === 'pending' ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{report.emergency_type}</h4>
                            <Badge variant={report.priority === 'high' ? 'destructive' : 'outline'}>
                              {report.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-10">
                    No recent emergency reports
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="wali-statistics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Wali Activity</CardTitle>
                <CardDescription>Supervision sessions over time</CardDescription>
              </CardHeader>
              <CardContent>
                {waliStats?.supervisionTrends && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={waliStats.supervisionTrends}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Wali Performance</CardTitle>
                <CardDescription>Response times and approval rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Average response time</span>
                      <span className="text-sm font-medium">{waliStats?.averageResponseTime || '0'}h</span>
                    </div>
                    <Progress value={100 - ((waliStats?.averageResponseTime || 0) / 24) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Request approval rate</span>
                      <span className="text-sm font-medium">{waliStats?.approvalRate || '0'}%</span>
                    </div>
                    <Progress value={waliStats?.approvalRate || 0} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Active walis</span>
                      <span className="text-sm font-medium">{waliStats?.activeWalis || 0} / {waliStats?.totalWalis || 0}</span>
                    </div>
                    <Progress value={((waliStats?.activeWalis || 0) / (waliStats?.totalWalis || 1)) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
