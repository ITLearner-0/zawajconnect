import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Users, MessageSquare, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

interface MetricsProps {
  activeSupervisions: number;
  totalMessages: number;
  moderationAlerts: number;
  approvalsPending: number;
}

const SupervisionMetrics: React.FC<MetricsProps> = ({
  activeSupervisions,
  totalMessages,
  moderationAlerts,
  approvalsPending,
}) => {
  const alertRate = totalMessages > 0 ? (moderationAlerts / totalMessages) * 100 : 0;
  const supervisionEfficiency =
    activeSupervisions > 0 ? Math.min(95, 80 + activeSupervisions * 2) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Supervisions Actives</CardTitle>
          <Users className="h-4 w-4 text-emerald" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{activeSupervisions}</div>
          <p className="text-xs text-muted-foreground">
            {activeSupervisions > 0 ? 'Utilisateurs supervisés' : 'Aucune supervision'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Messages Analysés</CardTitle>
          <MessageSquare className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalMessages}</div>
          <p className="text-xs text-muted-foreground">Conversations surveillées</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertes de Modération</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{moderationAlerts}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={alertRate > 5 ? 'destructive' : 'secondary'} className="text-xs">
              {alertRate.toFixed(1)}% du trafic
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Matches en Attente</CardTitle>
          <Shield className="h-4 w-4 text-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{approvalsPending}</div>
          <p className="text-xs text-muted-foreground">Approbations requises</p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald" />
            Efficacité de la Supervision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Couverture Supervision</span>
              <span className="text-sm text-muted-foreground">{supervisionEfficiency}%</span>
            </div>
            <Progress value={supervisionEfficiency} className="h-2" />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald" />
                <span className="text-sm">Système Actif</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm">Conforme Sharia</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupervisionMetrics;
