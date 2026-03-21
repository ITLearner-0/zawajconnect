import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  Video, Phone, MessageSquare, Calendar, Clock, Users,
  CheckCircle2, Plus, X, Send
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Meeting {
  id: string;
  candidate_name: string;
  ward_name: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_type: string;
  status: string;
  wali_notes?: string;
}

interface FamilyMeetingSchedulerProps {
  wardUserId: string;
  wardName: string;
}

const meetingTypeIcons: Record<string, React.ElementType> = {
  video: Video,
  audio: Phone,
  text: MessageSquare,
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  rescheduled: 'bg-amber-100 text-amber-700',
};

const FamilyMeetingScheduler = ({ wardUserId, wardName }: FamilyMeetingSchedulerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      candidate_name: 'Ahmed M.',
      ward_name: wardName,
      scheduled_at: '2026-03-25T20:00:00',
      duration_minutes: 30,
      meeting_type: 'video',
      status: 'scheduled',
    },
    {
      id: '2',
      candidate_name: 'Omar K.',
      ward_name: wardName,
      scheduled_at: '2026-03-20T19:00:00',
      duration_minutes: 45,
      meeting_type: 'audio',
      status: 'completed',
      wali_notes: 'Bon échange. Le candidat semble sérieux et pratiquant. À revoir.',
    },
  ]);

  const [formData, setFormData] = useState({
    candidateName: '',
    date: '',
    time: '',
    duration: '30',
    type: 'video',
    notes: '',
  });

  const handleSubmit = async () => {
    if (!formData.candidateName || !formData.date || !formData.time) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }

    const newMeeting: Meeting = {
      id: Date.now().toString(),
      candidate_name: formData.candidateName,
      ward_name: wardName,
      scheduled_at: `${formData.date}T${formData.time}:00`,
      duration_minutes: parseInt(formData.duration),
      meeting_type: formData.type,
      status: 'scheduled',
      wali_notes: formData.notes,
    };

    // Save to Supabase
    if (user) {
      try {
        await supabase.from('family_meetings').insert({
          wali_user_id: user.id,
          candidate_user_id: user.id, // Placeholder
          ward_user_id: wardUserId,
          scheduled_at: newMeeting.scheduled_at,
          duration_minutes: newMeeting.duration_minutes,
          meeting_type: newMeeting.meeting_type,
          wali_notes: newMeeting.wali_notes,
        });
      } catch {
        // Continue with local state
      }
    }

    setMeetings((prev) => [newMeeting, ...prev]);
    setShowForm(false);
    setFormData({ candidateName: '', date: '', time: '', duration: '30', type: 'video', notes: '' });
    toast({ title: 'Réunion planifiée', description: `Réunion avec ${formData.candidateName} programmée.` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Réunions familiales</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-1" /> Planifier
        </Button>
      </div>

      {/* New Meeting Form */}
      {showForm && (
        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Nom du candidat *</Label>
                <Input
                  value={formData.candidateName}
                  onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                  placeholder="Nom du prétendant"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Type de réunion</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Vidéo</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="text">En personne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Heure *</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Notes privées (Wali uniquement)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes préparatoires..."
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700">
                <Send className="h-4 w-4 mr-1" /> Planifier la réunion
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meetings List */}
      <div className="space-y-3">
        {meetings.map((meeting) => {
          const TypeIcon = meetingTypeIcons[meeting.meeting_type] || Video;
          const date = new Date(meeting.scheduled_at);

          return (
            <Card key={meeting.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-100">
                      <TypeIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">Réunion avec {meeting.candidate_name}</p>
                        <Badge className={statusColors[meeting.status] || ''}>
                          {meeting.status === 'scheduled' ? 'Planifiée' :
                           meeting.status === 'completed' ? 'Terminée' :
                           meeting.status === 'cancelled' ? 'Annulée' : 'Reportée'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        {' à '}
                        {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        <span className="ml-2">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {meeting.duration_minutes} min
                        </span>
                      </p>
                      {meeting.wali_notes && (
                        <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                          📝 {meeting.wali_notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FamilyMeetingScheduler;
