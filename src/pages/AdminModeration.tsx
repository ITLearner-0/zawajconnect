import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getModerationStats } from '@/services/moderation';
import { tableExists } from '@/utils/database/core';
import MonitoringPanel from '@/components/wali/MonitoringPanel';

const AdminModeration: React.FC = () => {
  const [moderationStats, setModerationStats] = useState({
    pendingReports: 0,
    flaggedContent: 0,
    totalProcessed: 0,
    resolvedToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSetupButton, setShowSetupButton] = useState(false);
  
  // Fetch flagged content
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchModerationStats = async () => {
      setLoading(true);
      try {
        const stats = await getModerationStats();
        setModerationStats(stats);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchModerationStats();
  }, []);
  
  useEffect(() => {
    const checkModerationTables = async () => {
      const flagsTableExists = await tableExists('content_flags');
      const reportsTableExists = await tableExists('content_reports');
      
      setShowSetupButton(!flagsTableExists || !reportsTableExists);
    };
    
    checkModerationTables();
  }, []);
  
  useEffect(() => {
    const fetchFlaggedContent = async () => {
      try {
        // Fetch flagged content
        const { data, error } = await supabase
          .from('content_flags')
          .select('*')
          .eq('resolved', false)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching flagged content:', error);
          setError('Failed to load flagged content');
          return;
        }
        
        setFlaggedContent(data || []);
      } catch (err: any) {
        console.error('Error fetching flagged content:', err);
        setError(err.message || 'Failed to load flagged content');
      }
    };
    
    fetchFlaggedContent();
  }, []);
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Admin Moderation Dashboard</h1>
      
      {showSetupButton && (
        <div className="mb-6">
          <Button>
            Setup Moderation Tables
          </Button>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 mb-4">Error: {error}</div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Moderation Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-2">
                <p>Pending Reports: {moderationStats.pendingReports}</p>
                <p>Flagged Content: {moderationStats.flaggedContent}</p>
                <p>Total Processed: {moderationStats.totalProcessed}</p>
                <p>Resolved Today: {moderationStats.resolvedToday}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button>Review Pending Reports</Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <MonitoringPanel flaggedContent={flaggedContent} />
      </div>
    </div>
  );
};

export default AdminModeration;
