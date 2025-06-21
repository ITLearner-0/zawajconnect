
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Video, Phone, Users } from 'lucide-react';

interface CallScheduleData {
  type: 'audio' | 'video';
  date: string;
  time: string;
  duration: number;
  includeWali: boolean;
  notes?: string;
  timezone?: string;
}

interface CallSchedulerProps {
  onScheduleCall: (scheduleData: CallScheduleData) => void;
  otherUserName: string;
  isWaliRequired?: boolean;
}

const CallScheduler: React.FC<CallSchedulerProps> = ({ 
  onScheduleCall, 
  otherUserName,
  isWaliRequired = false 
}) => {
  const [scheduleData, setScheduleData] = useState<CallScheduleData>({
    type: 'video',
    date: '',
    time: '',
    duration: 30,
    includeWali: isWaliRequired,
    notes: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleSchedule = () => {
    if (scheduleData.date && scheduleData.time) {
      onScheduleCall(scheduleData);
      setIsOpen(false);
      // Reset form
      setScheduleData({
        type: 'video',
        date: '',
        time: '',
        duration: 30,
        includeWali: isWaliRequired,
        notes: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinTime = () => {
    const now = new Date();
    const selectedDate = new Date(scheduleData.date);
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    if (isToday) {
      // Add 1 hour buffer for scheduling
      const minTime = new Date(now.getTime() + 60 * 60 * 1000);
      return minTime.toTimeString().slice(0, 5);
    }
    return '08:00';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-1" />
          Planifier
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planifier un Appel avec {otherUserName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Call Type */}
          <div className="space-y-2">
            <Label>Type d'appel</Label>
            <Select
              value={scheduleData.type}
              onValueChange={(value: 'audio' | 'video') => 
                setScheduleData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="audio">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Appel Audio
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Appel Vidéo
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              min={getMinDate()}
              value={scheduleData.date}
              onChange={(e) => 
                setScheduleData(prev => ({ ...prev, date: e.target.value }))
              }
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label>Heure</Label>
            <Input
              type="time"
              min={scheduleData.date ? getMinTime() : undefined}
              value={scheduleData.time}
              onChange={(e) => 
                setScheduleData(prev => ({ ...prev, time: e.target.value }))
              }
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Durée (minutes)</Label>
            <Select
              value={scheduleData.duration.toString()}
              onValueChange={(value) => 
                setScheduleData(prev => ({ ...prev, duration: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 heure</SelectItem>
                <SelectItem value="90">1h30</SelectItem>
                <SelectItem value="120">2 heures</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Wali Supervision */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <Label>Inclure le Wali</Label>
            </div>
            <Switch
              checked={scheduleData.includeWali}
              onCheckedChange={(checked) => 
                setScheduleData(prev => ({ ...prev, includeWali: checked }))
              }
              disabled={isWaliRequired}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optionnel)</Label>
            <Textarea
              placeholder="Ajouter des notes sur l'appel..."
              value={scheduleData.notes}
              onChange={(e) => 
                setScheduleData(prev => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
            />
          </div>

          {/* Timezone Info */}
          <div className="text-xs text-muted-foreground">
            <Clock className="h-3 w-3 inline mr-1" />
            Fuseau horaire: {scheduleData.timezone}
          </div>

          {/* Schedule Button */}
          <Button 
            onClick={handleSchedule}
            disabled={!scheduleData.date || !scheduleData.time}
            className="w-full"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Planifier l'Appel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallScheduler;
