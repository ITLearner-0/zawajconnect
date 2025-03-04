
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ContentReport, ContentFlag, ModerationStats } from '@/types/profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getModerationStats } from '@/services/contentModerationService';

// Function to check if the content_reports table exists
const checkContentReportsTable = async () => {
  const { data, error } = await supabase.rpc('table_exists', { table_name: 'content_reports' });
  return data || false;
};

// Function to check if the content_flags table exists
const checkContentFlagsTable = async () => {
  const { data, error } = await supabase.rpc('table_exists', { table_name: 'content_flags' });
  return data || false;
};

const AdminModeration = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [flags, setFlags] = useState<ContentFlag[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    pendingReports: 0,
    flaggedContent: 0,
    totalProcessed: 0,
    resolvedToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');
  const [tablesExist, setTablesExist] = useState({
    contentReports: false,
    contentFlags: false
  });

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Redirect to login if not authenticated
        window.location.href = '/auth';
        return;
      }

      // Check if user has admin role
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error || !profile || profile.role !== 'admin') {
          // Redirect to home if not admin
          window.location.href = '/';
          return;
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        window.location.href = '/';
        return;
      }
      
      // Check if moderation tables exist
      const reportsTableExists = await checkContentReportsTable();
      const flagsTableExists = await checkContentFlagsTable();
      
      setTablesExist({
        contentReports: reportsTableExists,
        contentFlags: flagsTableExists
      });

      if (reportsTableExists || flagsTableExists) {
        fetchData();
      } else {
        setLoading(false);
        toast({
          title: "Database Setup Required",
          description: "Moderation tables have not been created yet",
          variant: "destructive"
        });
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);

        // Get reports if table exists
        if (tablesExist.contentReports) {
          try {
            const { data: reportsData, error: reportsError } = await supabase
              .from('content_reports')
              .select('*')
              .order('created_at', { ascending: false });

            if (reportsError) throw reportsError;
            setReports(reportsData as unknown as ContentReport[]);
          } catch (error) {
            console.error("Error fetching reports:", error);
          }
        }

        // Get flags if table exists
        if (tablesExist.contentFlags) {
          try {
            const { data: flagsData, error: flagsError } = await supabase
              .from('content_flags')
              .select('*')
              .eq('resolved', false)
              .order('created_at', { ascending: false });

            if (flagsError) throw flagsError;
            setFlags(flagsData as unknown as ContentFlag[]);
          } catch (error) {
            console.error("Error fetching flags:", error);
          }
        }

        // Get stats
        try {
          const statsData = await getModerationStats();
          setStats({
            pendingReports: statsData.pendingReports || 0,
            flaggedContent: statsData.flaggedContent || 0,
            totalProcessed: statsData.totalProcessed || 0,
            resolvedToday: statsData.resolvedToday || 0
          });
        } catch (error) {
          console.error("Error fetching stats:", error);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load moderation data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [toast]);

  const handleResolveReport = async (reportId: string, action: string) => {
    if (!tablesExist.contentReports) {
      toast({
        title: "Error",
        description: "Content reports table does not exist",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('content_reports')
        .update({
          status: 'resolved',
          resolution_action: action,
          resolved_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      // Update local state
      setReports(reports.map(report => 
        report.id === reportId
          ? { ...report, status: 'resolved', resolution_action: action as ContentReport['resolution_action'] }
          : report
      ));

      toast({
        title: "Report Resolved",
        description: `Report has been resolved with action: ${action}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve report",
        variant: "destructive"
      });
    }
  };

  const handleResolveFlag = async (flagId: string) => {
    if (!tablesExist.contentFlags) {
      toast({
        title: "Error",
        description: "Content flags table does not exist",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('content_flags')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', flagId);

      if (error) throw error;

      // Update local state
      setFlags(flags.filter(flag => flag.id !== flagId));

      toast({
        title: "Flag Resolved",
        description: "Content flag has been marked as resolved"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve flag",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Content Moderation Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Pending Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.pendingReports}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Flagged Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.flaggedContent}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Resolved Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.resolvedToday}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Content Moderation</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reports">User Reports</TabsTrigger>
              <TabsTrigger value="flags">Flagged Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reports" className="pt-4">
              {loading ? (
                <div className="text-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2">Loading reports...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  No reports found
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Report #{report.id?.substring(0, 8)}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                            <Badge variant="outline">
                              {report.report_type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        {report.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveReport(report.id || '', 'no_action')}
                            >
                              Dismiss
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleResolveReport(report.id || '', 'warning')}
                            >
                              Warn User
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Reported User</p>
                          <p>{report.reported_user_id}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Reported By</p>
                          <p>{report.reporting_user_id}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500">Report Details</p>
                          <p className="bg-gray-50 p-2 rounded mt-1">
                            {report.report_details}
                          </p>
                        </div>
                        {report.status === 'pending' && (
                          <div className="col-span-2 mt-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleResolveReport(report.id || '', 'temporary_ban')}
                            >
                              Ban User Temporarily
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="flags" className="pt-4">
              {loading ? (
                <div className="text-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2">Loading flagged content...</p>
                </div>
              ) : flags.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  No flagged content found
                </div>
              ) : (
                <div className="space-y-4">
                  {flags.map((flag) => (
                    <div key={flag.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {flag.content_type.charAt(0).toUpperCase() + flag.content_type.slice(1)} Content
                          </h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className={getSeverityColor(flag.severity)}>
                              {flag.severity} severity
                            </Badge>
                            <Badge variant="outline">
                              {flag.flag_type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleResolveFlag(flag.id || '')}
                        >
                          Resolve
                        </Button>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Content ID</p>
                          <p>{flag.content_id}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Flagged By</p>
                          <p>{flag.flagged_by}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Content Type</p>
                          <p>{flag.content_type}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Flag Type</p>
                          <p>{flag.flag_type.replace('_', ' ')}</p>
                        </div>
                        {/* Preview button - would fetch and show content in real impl */}
                        <div className="col-span-2 mt-2">
                          <Button variant="outline" size="sm">
                            Preview Content
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminModeration;
