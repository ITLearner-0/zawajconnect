import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { KPIPeriod } from '@/hooks/wali/useWaliKPIs';
import { TrendPeriodSelector } from '../monitoring/TrendPeriodSelector';

interface KPIDetailDialogProps {
  kpiKey: string;
  userId: string;
  period: KPIPeriod;
  open: boolean;
  onClose: () => void;
}

interface DailyData {
  date: string;
  value: number;
}

const KPI_CONFIG = {
  requests: {
    title: 'Demandes de Chat',
    description: 'Évolution des demandes de supervision de chat',
    color: 'hsl(var(--primary))',
    table: 'chat_requests',
    field: 'id',
  },
  approved: {
    title: 'Demandes Approuvées',
    description: 'Évolution des demandes approuvées',
    color: 'hsl(142 76% 36%)',
    table: 'chat_requests',
    field: 'id',
    filter: { status: 'approved' },
  },
  rejected: {
    title: 'Demandes Rejetées',
    description: 'Évolution des demandes rejetées',
    color: 'hsl(0 84% 60%)',
    table: 'chat_requests',
    field: 'id',
    filter: { status: 'rejected' },
  },
  conversations: {
    title: 'Conversations Actives',
    description: 'Évolution des conversations supervisées',
    color: 'hsl(221 83% 53%)',
    table: 'supervised_conversations',
    field: 'id',
  },
  alerts: {
    title: 'Messages Signalés',
    description: 'Évolution des messages nécessitant une attention',
    color: 'hsl(0 84% 60%)',
    table: 'flagged_content',
    field: 'id',
  },
};

export const KPIDetailDialog: React.FC<KPIDetailDialogProps> = ({
  kpiKey,
  userId,
  period,
  open,
  onClose,
}) => {
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [drillDownMonths, setDrillDownMonths] = useState(3);

  const config = KPI_CONFIG[kpiKey as keyof typeof KPI_CONFIG];

  useEffect(() => {
    if (!open || !config) return;

    const fetchDailyData = async () => {
      setLoading(true);
      try {
        // Calculate date range based on drill-down period
        const days = drillDownMonths * 30;
        const endDate = new Date();
        const startDate = subDays(endDate, days);

        // Fetch data for each day
        const dailyResults: DailyData[] = [];
        
        for (let i = 0; i < days; i++) {
          const date = subDays(endDate, days - i);
          const dateStr = format(date, 'yyyy-MM-dd');
          const nextDateStr = format(subDays(endDate, days - i - 1), 'yyyy-MM-dd');

          let query = (supabase as any)
            .from(config.table)
            .select('id', { count: 'exact', head: true })
            .gte('created_at', dateStr)
            .lt('created_at', nextDateStr);

          // Apply filters if specified
          if ('filter' in config && config.filter) {
            Object.entries(config.filter).forEach(([key, value]) => {
              query = query.eq(key, value);
            });
          }

          const { count } = await query;
          
          dailyResults.push({
            date: format(date, 'dd MMM', { locale: fr }),
            value: count || 0,
          });
        }

        setDailyData(dailyResults);
      } catch (error) {
        console.error('Error fetching daily data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyData();
  }, [open, config, userId, drillDownMonths]);

  if (!config) return null;

  // Calculate statistics
  const total = dailyData.reduce((sum, d) => sum + d.value, 0);
  const average = dailyData.length > 0 ? (total / dailyData.length).toFixed(1) : '0';
  const max = Math.max(...dailyData.map(d => d.value), 0);
  const min = Math.min(...dailyData.map(d => d.value), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Period Selector */}
          <div className="flex justify-end">
            <TrendPeriodSelector 
              value={drillDownMonths} 
              onChange={setDrillDownMonths} 
            />
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Moyenne/jour</p>
              <p className="text-2xl font-bold">{average}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Maximum</p>
              <p className="text-2xl font-bold">{max}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Minimum</p>
              <p className="text-2xl font-bold">{min}</p>
            </div>
          </div>

          {/* Line Chart */}
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-4">Tendance quotidienne</h4>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Chargement...</p>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={config.color}
                      strokeWidth={2}
                      dot={{ fill: config.color, r: 4 }}
                      activeDot={{ r: 6 }}
                      name={config.title}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Bar Chart for Distribution */}
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-4">Distribution</h4>
            {loading ? (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Chargement...</p>
              </div>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill={config.color} 
                      radius={[4, 4, 0, 0]}
                      name={config.title}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
