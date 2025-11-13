import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  Ban, 
  Mail, 
  Filter,
  TrendingUp,
  Bell,
  Clock,
  User
} from 'lucide-react';
import { useAdminWaliAlerts, AdminWaliAlert } from '@/hooks/useAdminWaliAlerts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import WaliAlertCard from './WaliAlertCard';
import WaliAlertsStatistics from './WaliAlertsStatistics';
import WaliAlertsTrend from './WaliAlertsTrend';
import WaliAlertFilters from './WaliAlertFilters';
import WaliAlertQuickActions from './WaliAlertQuickActions';
import WaliAlertContactModal from './WaliAlertContactModal';

interface Filters {
  riskLevel?: string;
  acknowledged?: boolean;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

const WaliAlertsAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getAlerts, getStatistics, getTrends, acknowledgeAlert, suspendWali } = useAdminWaliAlerts();
  
  const [alerts, setAlerts] = useState<AdminWaliAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<AdminWaliAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [statistics, setStatistics] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AdminWaliAlert | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Real-time subscription for new alerts
  useEffect(() => {
    const channel = supabase
      .channel('wali-alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wali_admin_alerts'
        },
        (payload) => {
          console.log('Alert change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            // New alert created
            loadData();
            toast({
              title: '🚨 Nouvelle alerte',
              description: 'Une nouvelle alerte wali a été détectée',
              variant: 'destructive'
            });
          } else if (payload.eventType === 'UPDATE') {
            // Alert updated
            setAlerts(prev => 
              prev.map(alert => 
                alert.id === payload.new.id 
                  ? { ...alert, ...payload.new }
                  : alert
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Apply filters whenever alerts or filters change
  useEffect(() => {
    applyFilters();
  }, [alerts, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [alertsData, statsData, trendsData] = await Promise.all([
        getAlerts({ limit: 100 }),
        getStatistics(),
        getTrends(30)
      ]);
      
      setAlerts(alertsData);
      setStatistics(statsData);
      setTrends(trendsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...alerts];

    // Risk level filter
    if (filters.riskLevel && filters.riskLevel !== 'all') {
      filtered = filtered.filter(alert => alert.risk_level === filters.riskLevel);
    }

    // Acknowledged filter
    if (filters.acknowledged !== undefined) {
      filtered = filtered.filter(alert => alert.acknowledged === filters.acknowledged);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(alert => 
        new Date(alert.created_at) >= new Date(filters.dateFrom!)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(alert => 
        new Date(alert.created_at) <= new Date(filters.dateTo!)
      );
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(alert => 
        alert.pattern_detected.toLowerCase().includes(query) ||
        alert.alert_type.toLowerCase().includes(query) ||
        alert.wali_profile?.first_name?.toLowerCase().includes(query) ||
        alert.wali_profile?.last_name?.toLowerCase().includes(query)
      );
    }

    setFilteredAlerts(filtered);
  };

  const handleAcknowledge = async (alertId: string) => {
    if (!user) return;
    
    const success = await acknowledgeAlert(alertId, user.id);
    if (success) {
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { 
                ...alert, 
                acknowledged: true, 
                acknowledged_by: user.id,
                acknowledged_at: new Date().toISOString()
              }
            : alert
        )
      );
    }
  };

  const handleSuspend = async (alertId: string, waliUserId: string) => {
    if (!user) return;
    
    const reason = window.prompt('Raison de la suspension:');
    if (!reason) return;

    const durationDays = window.prompt('Durée en jours (30 par défaut):', '30');
    const duration = parseInt(durationDays || '30', 10);

    const success = await suspendWali(waliUserId, user.id, reason, duration);
    if (success) {
      // Acknowledge the alert automatically
      await handleAcknowledge(alertId);
    }
  };

  const handleContact = (alert: AdminWaliAlert) => {
    setSelectedAlert(alert);
    setContactModalOpen(true);
  };

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Tableau de Bord - Alertes Wali
          </h1>
          <p className="text-muted-foreground mt-2">
            Surveillance en temps réel des comportements suspects
          </p>
        </div>
        
        {unacknowledgedCount > 0 && (
          <Badge variant="destructive" className="text-lg px-4 py-2">
            <Bell className="h-4 w-4 mr-2" />
            {unacknowledgedCount} non traitée{unacknowledgedCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Statistics */}
      {statistics && (
        <WaliAlertsStatistics statistics={statistics} />
      )}

      {/* Filters */}
      <WaliAlertFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        alertCount={filteredAlerts.length}
      />

      {/* Main Content */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertes ({filteredAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tendances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Chargement des alertes...</p>
              </CardContent>
            </Card>
          ) : filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Aucune alerte
                </h3>
                <p className="text-muted-foreground">
                  {alerts.length === 0 
                    ? 'Aucune alerte détectée pour le moment' 
                    : 'Aucune alerte ne correspond aux filtres sélectionnés'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <WaliAlertCard
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={handleAcknowledge}
                    onSuspend={handleSuspend}
                    onContact={handleContact}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="trends">
          <WaliAlertsTrend trends={trends} />
        </TabsContent>
      </Tabs>

      {/* Contact Modal */}
      <WaliAlertContactModal
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
        alert={selectedAlert}
      />
    </div>
  );
};

export default WaliAlertsAdminDashboard;
