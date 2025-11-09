import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Video, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';

interface CallRecord {
  id: string;
  match_id: string;
  caller_id: string;
  callee_id: string;
  call_type: 'audio' | 'video';
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  caller_name?: string;
  callee_name?: string;
  supervised_user_id?: string;
  supervised_user_name?: string;
  max_duration_exceeded?: boolean;
}

interface SupervisedCallsHistoryProps {
  supervisedUserId?: string;
}

export function SupervisedCallsHistory({ supervisedUserId }: SupervisedCallsHistoryProps) {
  const { user } = useAuth();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalDuration: 0,
    averageDuration: 0,
    videoCalls: 0,
    audioCalls: 0
  });

  useEffect(() => {
    if (!user) return;
    loadCallsHistory();
    subscribeToCallUpdates();
  }, [user, supervisedUserId]);

  const loadCallsHistory = async () => {
    if (!user) return;

    try {
      // Get all users supervised by this wali
      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('user_id, full_name, max_call_duration_minutes')
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted')
        .eq('is_wali', true);

      if (!familyMembers || familyMembers.length === 0) {
        setLoading(false);
        return;
      }

      const supervisedUserIds = familyMembers.map(fm => fm.user_id);
      const maxDurationsMap = new Map(
        familyMembers.map(fm => [fm.user_id, fm.max_call_duration_minutes])
      );

      // Filter by specific supervised user if provided
      const userIdsToQuery = supervisedUserId 
        ? supervisedUserIds.filter(id => id === supervisedUserId)
        : supervisedUserIds;

      // Get all calls involving supervised users
      const { data: callsData, error } = await supabase
        .from('webrtc_calls')
        .select('*')
        .or(`caller_id.in.(${userIdsToQuery.join(',')}),callee_id.in.(${userIdsToQuery.join(',')})`)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Enrich with profile names
      if (callsData) {
        const userIds = [...new Set([
          ...callsData.map(c => c.caller_id),
          ...callsData.map(c => c.callee_id)
        ])];

        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

        const enrichedCalls: CallRecord[] = callsData.map(call => {
          const supervisedId = supervisedUserIds.includes(call.caller_id) 
            ? call.caller_id 
            : call.callee_id;
          const maxDuration = maxDurationsMap.get(supervisedId);
          const durationExceeded = maxDuration && call.duration_seconds 
            ? call.duration_seconds > (maxDuration * 60) 
            : false;

          return {
            id: call.id,
            match_id: call.match_id,
            caller_id: call.caller_id,
            callee_id: call.callee_id,
            call_type: call.call_type as 'audio' | 'video',
            status: call.status,
            started_at: call.started_at,
            ended_at: call.ended_at,
            duration_seconds: call.duration_seconds,
            caller_name: profileMap.get(call.caller_id) || 'Inconnu',
            callee_name: profileMap.get(call.callee_id) || 'Inconnu',
            supervised_user_id: supervisedId,
            supervised_user_name: profileMap.get(supervisedId) || 'Inconnu',
            max_duration_exceeded: durationExceeded
          };
        });

        setCalls(enrichedCalls);

        // Calculate stats
        const totalDuration = enrichedCalls.reduce((sum, call) => 
          sum + (call.duration_seconds || 0), 0
        );
        const completedCalls = enrichedCalls.filter(c => c.duration_seconds);

        setStats({
          totalCalls: enrichedCalls.length,
          totalDuration,
          averageDuration: completedCalls.length > 0 
            ? Math.round(totalDuration / completedCalls.length) 
            : 0,
          videoCalls: enrichedCalls.filter(c => c.call_type === 'video').length,
          audioCalls: enrichedCalls.filter(c => c.call_type === 'audio').length
        });
      }
    } catch (error) {
      console.error('Error loading calls history:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToCallUpdates = () => {
    const channel = supabase
      .channel('wali-calls-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'webrtc_calls'
      }, () => {
        loadCallsHistory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallIcon = (call: CallRecord) => {
    return call.call_type === 'video' 
      ? <Video className="h-5 w-5 text-primary" />
      : <Phone className="h-5 w-5 text-primary" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'ended':
        return <Badge variant="default" className="bg-green-500">Terminé</Badge>;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalCalls}</div>
              <div className="text-sm text-muted-foreground">Appels totaux</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatDuration(stats.totalDuration)}
              </div>
              <div className="text-sm text-muted-foreground">Durée totale</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatDuration(stats.averageDuration)}
              </div>
              <div className="text-sm text-muted-foreground">Durée moyenne</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Video className="h-4 w-4" />
                <span className="text-lg font-bold">{stats.videoCalls}</span>
                <Phone className="h-4 w-4 ml-2" />
                <span className="text-lg font-bold">{stats.audioCalls}</span>
              </div>
              <div className="text-sm text-muted-foreground">Vidéo / Audio</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calls History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des appels supervisés</CardTitle>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun appel enregistré</p>
            </div>
          ) : (
            <div className="space-y-2">
              {calls.map((call) => (
                <Card key={call.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getCallIcon(call)}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {call.supervised_user_name}
                          </span>
                          <span className="text-muted-foreground">↔</span>
                          <span className="font-medium">
                            {call.caller_id === call.supervised_user_id 
                              ? call.callee_name 
                              : call.caller_name}
                          </span>
                          {call.max_duration_exceeded && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(call.started_at), 'dd MMM yyyy', { locale: fr })}</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{format(new Date(call.started_at), 'HH:mm', { locale: fr })}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(call.started_at), { addSuffix: true, locale: fr })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {call.duration_seconds !== null && (
                        <div className="text-sm font-medium">
                          {formatDuration(call.duration_seconds)}
                        </div>
                      )}
                      {getStatusBadge(call.status)}
                    </div>
                  </div>
                  
                  {call.max_duration_exceeded && (
                    <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Durée maximale dépassée</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}