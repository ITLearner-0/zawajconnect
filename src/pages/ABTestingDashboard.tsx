import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, TrendingUp, Mail, DollarSign, Eye, MousePointerClick } from 'lucide-react';
import { ABTestVariantForm } from '@/components/abtesting/ABTestVariantForm';
import { ABTestResults } from '@/components/abtesting/ABTestResults';

export default function ABTestingDashboard() {
  const [selectedReminderType, setSelectedReminderType] = useState<'7days' | '3days' | '1day'>(
    '7days'
  );
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch all A/B tests
  const { data: abTests, isLoading: testsLoading } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_ab_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch A/B test analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['ab-test-analytics', selectedReminderType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_ab_test_analytics')
        .select('*')
        .eq('reminder_type', selectedReminderType)
        .order('conversion_rate', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Calculate summary stats
  const summaryStats = analytics?.reduce(
    (acc, variant) => {
      acc.totalSent += variant.total_sent || 0;
      acc.totalOpened += variant.total_opened || 0;
      acc.totalClicked += variant.total_clicked || 0;
      acc.totalRenewed += variant.total_renewed || 0;
      acc.totalRevenue += Number(variant.total_revenue || 0);
      return acc;
    },
    {
      totalSent: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalRenewed: 0,
      totalRevenue: 0,
    }
  );

  const avgOpenRate = summaryStats
    ? ((summaryStats.totalOpened / summaryStats.totalSent) * 100).toFixed(2)
    : '0.00';
  const avgClickRate = summaryStats
    ? ((summaryStats.totalClicked / summaryStats.totalSent) * 100).toFixed(2)
    : '0.00';
  const avgConversionRate = summaryStats
    ? ((summaryStats.totalRenewed / summaryStats.totalSent) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="container mx-auto p-6 space-y-6" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Tests A/B des Emails de Rappel</h1>
          <p className="text-muted-foreground mt-2">
            Optimisez vos emails de renouvellement avec des tests A/B automatisés
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Masquer le formulaire' : 'Créer une variante'}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-6">
          <ABTestVariantForm
            reminderType={selectedReminderType}
            onSuccess={() => setShowCreateForm(false)}
          />
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Emails Envoyés</span>
          </div>
          <div className="text-3xl font-bold">{summaryStats?.totalSent || 0}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-medium text-muted-foreground">Taux d'Ouverture</span>
          </div>
          <div className="text-3xl font-bold">{avgOpenRate}%</div>
          <p className="text-sm text-muted-foreground mt-1">
            {summaryStats?.totalOpened || 0} ouvertures
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-muted-foreground">Taux de Clic</span>
          </div>
          <div className="text-3xl font-bold">{avgClickRate}%</div>
          <p className="text-sm text-muted-foreground mt-1">
            {summaryStats?.totalClicked || 0} clics
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-gold-500" />
            <span className="text-sm font-medium text-muted-foreground">Taux de Conversion</span>
          </div>
          <div className="text-3xl font-bold">{avgConversionRate}%</div>
          <p className="text-sm text-muted-foreground mt-1">
            {summaryStats?.totalRenewed || 0} renouvellements
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-gold-600" />
            <span className="text-sm font-medium text-muted-foreground">Revenus Générés</span>
          </div>
          <div className="text-3xl font-bold">{summaryStats?.totalRevenue.toFixed(0) || 0}€</div>
        </Card>
      </div>

      {/* A/B Test Results by Reminder Type */}
      <Card className="p-6">
        <Tabs value={selectedReminderType} onValueChange={(v) => setSelectedReminderType(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="7days">Rappel J-7</TabsTrigger>
            <TabsTrigger value="3days">Rappel J-3</TabsTrigger>
            <TabsTrigger value="1day">Rappel J-1</TabsTrigger>
          </TabsList>

          <TabsContent value="7days" className="mt-6">
            <ABTestResults
              analytics={analytics || []}
              isLoading={analyticsLoading}
              reminderType="7days"
            />
          </TabsContent>

          <TabsContent value="3days" className="mt-6">
            <ABTestResults
              analytics={analytics || []}
              isLoading={analyticsLoading}
              reminderType="3days"
            />
          </TabsContent>

          <TabsContent value="1day" className="mt-6">
            <ABTestResults
              analytics={analytics || []}
              isLoading={analyticsLoading}
              reminderType="1day"
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
