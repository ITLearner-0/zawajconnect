import React from 'react';
import { Shield, AlertTriangle, Eye, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSecurityEvents } from '@/hooks/useSecurityEvents';
import { useEnhancedSessionMonitor } from '@/hooks/useEnhancedSessionMonitor';

const SecurityAlertPanel = () => {
  const { events, loading } = useSecurityEvents();
  const { activeSessions, isSessionNearExpiry } = useEnhancedSessionMonitor();

  const criticalEvents = events.filter((e) => e.severity === 'critical' || e.severity === 'high');
  const unresolvedEvents = events.filter((e) => !e.resolved);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatEventTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)} h`;
    return `Il y a ${Math.floor(diffMins / 1440)} j`;
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-emerald" />
          <h3 className="text-lg font-semibold">Alertes de Sécurité</h3>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald" />
          <h3 className="text-lg font-semibold">Alertes de Sécurité</h3>
        </div>
        {(criticalEvents.length > 0 || isSessionNearExpiry) && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Action requise
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {/* Session Security Status */}
        <div className="border-l-4 border-l-emerald pl-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sessions actives</span>
            </div>
            <Badge variant="outline">{activeSessions.length}</Badge>
          </div>
          {isSessionNearExpiry && (
            <div className="mt-2 p-2 bg-destructive/10 rounded-md flex items-center gap-2">
              <Clock className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">Session expire bientôt</span>
            </div>
          )}
        </div>

        {/* Recent Security Events */}
        {unresolvedEvents.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Événements récents</h4>
            {unresolvedEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="border rounded-md p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(event.severity)}>{event.severity}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatEventTime(event.created_at)}
                      </span>
                    </div>
                    <p className="text-sm">{event.description}</p>
                    {event.event_type && (
                      <p className="text-xs text-muted-foreground mt-1">Type: {event.event_type}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {unresolvedEvents.length > 3 && (
              <Button variant="outline" size="sm" className="w-full">
                Voir tous les événements ({unresolvedEvents.length})
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Shield className="h-8 w-8 text-emerald mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucune alerte de sécurité récente</p>
            <p className="text-xs text-muted-foreground mt-1">Votre compte est sécurisé</p>
          </div>
        )}

        {/* Security Tips */}
        <div className="bg-muted/50 rounded-md p-3">
          <h4 className="text-sm font-medium mb-2">Conseils de sécurité</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Vérifiez régulièrement vos sessions actives</li>
            <li>• Activez la vérification en deux étapes</li>
            <li>• Ne partagez jamais vos informations de connexion</li>
            <li>• Signaler toute activité suspecte</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default SecurityAlertPanel;
