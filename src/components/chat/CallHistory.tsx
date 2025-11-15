import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Video, PhoneOff, PhoneMissed, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CallRecord {
  id: string;
  call_type: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  caller_id: string;
  callee_id: string;
}

interface CallHistoryProps {
  matchId: string;
}

export function CallHistory({ matchId }: CallHistoryProps) {
  const { user } = useAuth();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !matchId) return;

    const fetchCalls = async () => {
      const { data, error } = await supabase
        .from('webrtc_calls')
        .select('*')
        .eq('match_id', matchId)
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching call history:', error);
      } else {
        setCalls(data || []);
      }
      setLoading(false);
    };

    fetchCalls();

    // Subscribe to new calls
    const channel = supabase
      .channel(`call_history_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'webrtc_calls',
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          fetchCalls();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, user?.id]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'ended':
        return (
          <Badge variant="default" className="bg-green-500">
            Terminé
          </Badge>
        );
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      case 'missed':
        return <Badge variant="secondary">Manqué</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCallIcon = (call: CallRecord) => {
    const isOutgoing = call.caller_id === user?.id;
    const Icon = call.call_type === 'video' ? Video : Phone;

    if (call.status === 'missed' && !isOutgoing) {
      return <PhoneMissed className="h-5 w-5 text-destructive" />;
    }

    if (call.status === 'rejected' || call.status === 'failed') {
      return <PhoneOff className="h-5 w-5 text-destructive" />;
    }

    return <Icon className={`h-5 w-5 ${isOutgoing ? 'text-blue-500' : 'text-green-500'}`} />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <Phone className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Aucun appel pour le moment</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {calls.map((call) => {
        const isOutgoing = call.caller_id === user?.id;

        return (
          <Card key={call.id} className="p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {getCallIcon(call)}

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {call.call_type === 'video' ? 'Appel vidéo' : 'Appel audio'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isOutgoing ? 'sortant' : 'entrant'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(call.started_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                    <span>•</span>
                    <span>{format(new Date(call.started_at), 'HH:mm', { locale: fr })}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {call.duration_seconds !== null && (
                  <div className="text-sm font-medium">{formatDuration(call.duration_seconds)}</div>
                )}
                {getStatusBadge(call.status)}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
