// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, Clock, TrendingUp, Users, Loader2 } from 'lucide-react';
import { useMatchingHistory, MatchingHistoryEntry } from '@/hooks/useMatchingHistory';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MatchingHistoryPanelProps {
  className?: string;
}

const MatchingHistoryPanel = ({ className }: MatchingHistoryPanelProps) => {
  const { history, loading } = useMatchingHistory();

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy à HH:mm', { locale: fr });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-gold-600 bg-gold-50 border-gold-200';
    return 'text-sage-600 bg-sage-50 border-sage-200';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Historique des Recherches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">Aucun historique disponible</p>
            <p className="text-sm text-muted-foreground">
              Lancez votre première recherche IA pour voir l'historique ici
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry: MatchingHistoryEntry) => (
              <div
                key={entry.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(entry.search_timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {entry.total_matches} matches
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getScoreColor(entry.avg_compatibility_score)}`}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {entry.avg_compatibility_score.toFixed(0)}% moy.
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Islamique:</span>
                    <span className="font-medium ml-1">
                      {entry.preferences_used.weight_islamic}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Culturel:</span>
                    <span className="font-medium ml-1">
                      {entry.preferences_used.weight_cultural}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Personnalité:</span>
                    <span className="font-medium ml-1">
                      {entry.preferences_used.weight_personality}%
                    </span>
                  </div>
                </div>

                {entry.matched_profiles.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium mb-2">Top matches:</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.matched_profiles.slice(0, 3).map((profile, index) => (
                        <Badge key={profile.user_id} variant="outline" className="text-xs">
                          {profile.full_name} ({profile.compatibility_score}%)
                        </Badge>
                      ))}
                      {entry.matched_profiles.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{entry.matched_profiles.length - 3} autres
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchingHistoryPanel;
