/**
 * Admin Moderation Dashboard
 *
 * Displays comprehensive moderation statistics and trends
 * for platform administrators
 */

// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  AlertCircle,
  Shield,
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Eye,
  Activity,
  BarChart3,
  Calendar,
  Download,
} from 'lucide-react';
import { contentModerationService } from '@/services/contentModerationService';
import type { ModerationStats } from '@/services/contentModerationService';
import { logger } from '@/utils/logger';

const ModerationDashboard = () => {
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange(timeRange);
      const data = await contentModerationService.getStats(startDate, endDate);
      setStats(data);
      logger.log('Moderation stats loaded', { timeRange, data });
    } catch (error) {
      logger.error('Failed to load moderation stats', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (range: string): { startDate?: Date; endDate?: Date } => {
    const now = new Date();
    const endDate = now;

    switch (range) {
      case 'today': {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        return { startDate: startOfDay, endDate };
      }

      case 'week': {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { startDate: weekAgo, endDate };
      }

      case 'month': {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return { startDate: monthAgo, endDate };
      }

      case 'all':
      default:
        return {};
    }
  };

  const getViolationRate = (): number => {
    if (!stats || stats.total_checks === 0) return 0;
    return (stats.violations_found / stats.total_checks) * 100;
  };

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      low: 'bg-yellow-100 text-yellow-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
      critical: 'bg-purple-100 text-purple-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getActionColor = (action: string): string => {
    const colors: Record<string, string> = {
      warned: 'text-yellow-600',
      blocked: 'text-red-600',
      escalated: 'text-orange-600',
      auto_moderated: 'text-blue-600',
    };
    return colors[action] || 'text-gray-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Chargement des statistiques...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur de chargement</AlertTitle>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Tableau de Bord de Modération
          </h2>
          <p className="text-muted-foreground mt-1">
            Surveillance et statistiques de modération de contenu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={timeRange === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('today')}
          >
            Aujourd'hui
          </Button>
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            7 jours
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            30 jours
          </Button>
          <Button
            variant={timeRange === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('all')}
          >
            Tout
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vérifications</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_checks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {getViolationRate().toFixed(1)}% de violations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations Détectées</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.violations_found.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Sur {stats.total_checks} vérifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contenu Bloqué</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.content_blocked.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((stats.content_blocked / stats.total_checks) * 100).toFixed(1)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-modéré</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.auto_moderated.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Modération automatique réussie</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="severity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="severity">Par Sévérité</TabsTrigger>
          <TabsTrigger value="content">Par Type de Contenu</TabsTrigger>
          <TabsTrigger value="actions">Par Action</TabsTrigger>
        </TabsList>

        {/* Severity Tab */}
        <TabsContent value="severity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Violations par Niveau de Sévérité</CardTitle>
              <CardDescription>Distribution des violations selon leur gravité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(stats.by_severity).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getSeverityColor(severity)}>{severity.toUpperCase()}</Badge>
                    <span className="text-sm font-medium capitalize">{severity}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-64 bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getSeverityColor(severity)}`}
                        style={{
                          width: `${((count / stats.violations_found) * 100).toFixed(1)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold w-12 text-right">{count}</span>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {((count / stats.violations_found) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Type Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Violations par Type de Contenu</CardTitle>
              <CardDescription>
                Répartition des violations selon le type de contenu modéré
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(stats.by_content_type).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {type === 'message' && <MessageSquare className="h-4 w-4" />}
                    {type === 'profile' && <Users className="h-4 w-4" />}
                    {type === 'bio' && <Eye className="h-4 w-4" />}
                    {type === 'photo' && <Eye className="h-4 w-4" />}
                    {type === 'comment' && <MessageSquare className="h-4 w-4" />}
                    <span className="text-sm font-medium capitalize">{type}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-64 bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${((count / stats.violations_found) * 100).toFixed(1)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold w-12 text-right">{count}</span>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {((count / stats.violations_found) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions de Modération Prises</CardTitle>
              <CardDescription>
                Détail des mesures appliquées par le système de modération
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Utilisateurs Avertis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getActionColor('warned')}`}>
                    {stats.users_warned}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Avertissements envoyés</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Escaladés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getActionColor('escalated')}`}>
                    {stats.escalations}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    En attente de révision manuelle
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exporter les Données
        </Button>
      </div>
    </div>
  );
};

export default ModerationDashboard;
