// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  Phone,
  MapPin,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Send,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, isBefore, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SupervisedUser {
  id: string;
  full_name: string;
  user_id: string;
  relationship: string;
  avatar_url?: string;
}

interface FamilyMeeting {
  id: string;
  match_id: string;
  organizer_id: string;
  scheduled_datetime: string;
  meeting_type: string;
  meeting_link?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'postponed';
  created_at: string;
  updated_at: string;
  // Additional fields from joins
  supervised_user_name?: string;
  candidate_name?: string;
  match_details?: unknown;
}

interface FamilyMeetingSchedulerProps {
  supervisedUsers: SupervisedUser[];
}

const FamilyMeetingScheduler: React.FC<FamilyMeetingSchedulerProps> = ({ supervisedUsers }) => {
  const [meetings, setMeetings] = useState<FamilyMeeting[]>([]);
  const [availableMatches, setAvailableMatches] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [meetingType, setMeetingType] = useState<
    'family_discussion' | 'candidate_interview' | 'family_meeting'
  >('family_discussion');
  const [meetingLocation, setMeetingLocation] = useState<'online' | 'in_person' | 'phone'>(
    'online'
  );
  const [meetingNotes, setMeetingNotes] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<FamilyMeeting | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMeetingsAndMatches();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('family-meetings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_meetings',
        },
        () => {
          loadMeetingsAndMatches();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const loadMeetingsAndMatches = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Load existing meetings
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('family_meetings')
        .select('*')
        .eq('organizer_id', user.id)
        .order('scheduled_datetime', { ascending: true });

      if (meetingsError) {
        console.error('Error loading meetings:', meetingsError);
      } else if (meetingsData) {
        // Enrich meetings with match details
        const enrichedMeetings = await Promise.all(
          meetingsData.map(async (meeting) => {
            const { data: matchData } = await supabase
              .from('matches')
              .select('*')
              .eq('id', meeting.match_id)
              .maybeSingle();

            // Get profiles separately
            const { data: user1Profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', matchData?.user1_id)
              .maybeSingle();

            const { data: user2Profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', matchData?.user2_id)
              .maybeSingle();

            return {
              ...meeting,
              match_details: matchData,
              supervised_user_name: user1Profile?.full_name || 'Utilisateur',
              candidate_name: user2Profile?.full_name || 'Candidat',
            };
          })
        );

        setMeetings(enrichedMeetings as FamilyMeeting[]);
      }

      // Load available matches for scheduling
      const supervisedUserIds = supervisedUsers.map((u) => u.user_id);
      if (supervisedUserIds.length > 0) {
        const { data: matchesData } = await supabase
          .from('matches')
          .select(
            `
            *,
            user1_profile:profiles!matches_user1_id_fkey(full_name),
            user2_profile:profiles!matches_user2_id_fkey(full_name)
          `
          )
          .or(
            `user1_id.in.(${supervisedUserIds.join(',')}),user2_id.in.(${supervisedUserIds.join(',')})`
          )
          .eq('is_mutual', true)
          .eq('family_supervision_required', true);

        setAvailableMatches(matchesData || []);
      }
    } catch (error) {
      console.error('Error loading meetings and matches:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les réunions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMeetingLink = (type: string) => {
    // Generate a unique meeting room ID
    const roomId = `family-meeting-${Date.now()}`;

    switch (type) {
      case 'zoom':
        return `https://zoom.us/j/${roomId}`;
      case 'meet':
        return `https://meet.google.com/${roomId}`;
      case 'teams':
        return `https://teams.microsoft.com/l/meetup-join/${roomId}`;
      default:
        return `https://jitsi.meet/${roomId}`;
    }
  };

  const scheduleMeeting = async () => {
    try {
      if (!selectedDate || !selectedTime || !selectedMatch) {
        toast({
          title: 'Informations manquantes',
          description: 'Veuillez remplir tous les champs obligatoires',
          variant: 'destructive',
        });
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Combine date and time
      const [hours, minutes] = selectedTime.split(':');
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Generate meeting link for online meetings
      const meetingLink = meetingLocation === 'online' ? generateMeetingLink('jitsi') : undefined;

      const meetingData = {
        match_id: selectedMatch,
        organizer_id: user.id,
        scheduled_datetime: scheduledDateTime.toISOString(),
        meeting_type: meetingType,
        meeting_link: meetingLink,
        notes: meetingNotes || null,
        status: 'scheduled',
      };

      const { data, error } = await supabase
        .from('family_meetings')
        .insert(meetingData)
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }

      toast({
        title: 'Réunion programmée',
        description: `La réunion a été programmée pour le ${format(scheduledDateTime, "d MMM yyyy 'à' HH:mm", { locale: fr })}`,
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setSelectedMatch('');
      setMeetingNotes('');
      setIsDialogOpen(false);

      // Reload meetings
      loadMeetingsAndMatches();
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de programmer la réunion',
        variant: 'destructive',
      });
    }
  };

  const updateMeetingStatus = async (meetingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('family_meetings')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', meetingId);

      if (error) throw error;

      toast({
        title: 'Statut mis à jour',
        description: `La réunion a été marquée comme ${status}`,
      });

      loadMeetingsAndMatches();
    } catch (error) {
      console.error('Error updating meeting status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    }
  };

  const deleteMeeting = async (meetingId: string) => {
    try {
      const { error } = await supabase.from('family_meetings').delete().eq('id', meetingId);

      if (error) throw error;

      toast({
        title: 'Réunion supprimée',
        description: 'La réunion a été supprimée',
      });

      loadMeetingsAndMatches();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la réunion',
        variant: 'destructive',
      });
    }
  };

  const copyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: 'Lien copié',
      description: 'Le lien de la réunion a été copié dans le presse-papiers',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'postponed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4" />;
      case 'postponed':
        return <CalendarIcon className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const upcomingMeetings = meetings.filter(
    (m) => m.status === 'scheduled' && isAfter(new Date(m.scheduled_datetime), new Date())
  );

  const pastMeetings = meetings.filter(
    (m) => m.status === 'completed' || isBefore(new Date(m.scheduled_datetime), new Date())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du planificateur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Planificateur de Réunions Familiales</h2>
          <p className="text-muted-foreground">
            Organisez des réunions pour discuter des matches et superviser les rencontres
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Programmer une Réunion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Programmer une Réunion Familiale</DialogTitle>
              <DialogDescription>
                Organisez une réunion pour discuter d'un match avec la famille
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Match Selection */}
              <div className="space-y-2">
                <Label htmlFor="match">Match concerné *</Label>
                <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un match" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMatches.map((match) => (
                      <SelectItem key={match.id} value={match.id}>
                        {match.user1_profile?.full_name} ↔ {match.user2_profile?.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Meeting Type */}
              <div className="space-y-2">
                <Label>Type de réunion *</Label>
                <Select value={meetingType} onValueChange={(value) => setMeetingType(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family_discussion">Discussion familiale</SelectItem>
                    <SelectItem value="candidate_interview">Entretien avec candidat</SelectItem>
                    <SelectItem value="family_meeting">Réunion de famille</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate
                        ? format(selectedDate, 'PPP', { locale: fr })
                        : 'Sélectionner une date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => isBefore(date, new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label htmlFor="time">Heure *</Label>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>

              {/* Meeting Location */}
              <div className="space-y-2">
                <Label>Modalité</Label>
                <Select
                  value={meetingLocation}
                  onValueChange={(value) => setMeetingLocation(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Visioconférence
                      </div>
                    </SelectItem>
                    <SelectItem value="phone">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Appel téléphonique
                      </div>
                    </SelectItem>
                    <SelectItem value="in_person">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        En personne
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  placeholder="Agenda, points à discuter, instructions..."
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={scheduleMeeting} className="w-full">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Programmer la Réunion
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{upcomingMeetings.length}</div>
            <div className="text-sm text-muted-foreground">Réunions à venir</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {meetings.filter((m) => m.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Terminées</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{availableMatches.length}</div>
            <div className="text-sm text-muted-foreground">Matches disponibles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{meetings.length}</div>
            <div className="text-sm text-muted-foreground">Total réunions</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-500" />
              Réunions à Venir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <Card key={meeting.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">
                          {meeting.supervised_user_name} ↔ {meeting.candidate_name}
                        </h4>
                        <Badge className={getStatusColor(meeting.status)}>
                          {getStatusIcon(meeting.status)}
                          <span className="ml-1">{meeting.status}</span>
                        </Badge>
                        <Badge variant="outline">{meeting.meeting_type.replace('_', ' ')}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {format(new Date(meeting.scheduled_datetime), 'd MMM yyyy', {
                            locale: fr,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(meeting.scheduled_datetime), 'HH:mm', { locale: fr })}
                        </span>
                        {meeting.meeting_link && (
                          <span className="flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            Visioconférence
                          </span>
                        )}
                      </div>

                      {meeting.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{meeting.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {meeting.meeting_link && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyMeetingLink(meeting.meeting_link!)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(meeting.meeting_link, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateMeetingStatus(meeting.id, 'completed')}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMeeting(meeting.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Meetings History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Historique des Réunions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {meetings.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Aucune réunion programmée</h3>
              <p className="text-muted-foreground">
                Commencez par programmer votre première réunion familiale
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <Card
                  key={meeting.id}
                  className={`
                  ${
                    meeting.status === 'scheduled'
                      ? 'border-l-4 border-l-blue-500'
                      : meeting.status === 'completed'
                        ? 'border-l-4 border-l-green-500'
                        : meeting.status === 'cancelled'
                          ? 'border-l-4 border-l-red-500'
                          : 'border-l-4 border-l-yellow-500'
                  }
                `}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">
                            {meeting.supervised_user_name} ↔ {meeting.candidate_name}
                          </h4>
                          <Badge className={getStatusColor(meeting.status)}>
                            {getStatusIcon(meeting.status)}
                            <span className="ml-1">{meeting.status}</span>
                          </Badge>
                          <Badge variant="outline">{meeting.meeting_type.replace('_', ' ')}</Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {format(new Date(meeting.scheduled_datetime), "d MMM yyyy 'à' HH:mm", {
                              locale: fr,
                            })}
                          </span>
                          {meeting.meeting_link && (
                            <span className="flex items-center gap-1">
                              <Video className="h-4 w-4" />
                              Visioconférence
                            </span>
                          )}
                        </div>

                        {meeting.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{meeting.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {meeting.meeting_link && meeting.status === 'scheduled' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyMeetingLink(meeting.meeting_link!)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(meeting.meeting_link, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {meeting.status === 'scheduled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateMeetingStatus(meeting.id, 'completed')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMeeting(meeting.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyMeetingScheduler;
