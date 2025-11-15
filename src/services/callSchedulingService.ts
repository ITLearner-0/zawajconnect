// Service for managing scheduled calls

export interface ScheduledCall {
  id: string;
  conversationId: string;
  initiatorId: string;
  recipientId: string;
  type: 'audio' | 'video';
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // in minutes
  includeWali: boolean;
  waliId?: string;
  notes?: string;
  timezone: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CallReminder {
  callId: string;
  reminderTime: string; // ISO string
  type: '24h' | '1h' | '15min';
  sent: boolean;
}

export class CallSchedulingService {
  // Create a new scheduled call
  static async createScheduledCall(
    conversationId: string,
    initiatorId: string,
    recipientId: string,
    callData: {
      type: 'audio' | 'video';
      date: string;
      time: string;
      duration: number;
      includeWali: boolean;
      notes?: string;
      timezone?: string;
    }
  ): Promise<ScheduledCall> {
    const scheduledCall: ScheduledCall = {
      id: `call-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      conversationId,
      initiatorId,
      recipientId,
      type: callData.type,
      scheduledDate: callData.date,
      scheduledTime: callData.time,
      duration: callData.duration,
      includeWali: callData.includeWali,
      notes: callData.notes,
      timezone: callData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      status: 'pending',
      reminderSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Here you would typically save to database
    console.log('Creating scheduled call:', scheduledCall);

    // Schedule reminders
    this.scheduleReminders(scheduledCall);

    return scheduledCall;
  }

  // Schedule reminders for a call
  static scheduleReminders(call: ScheduledCall): CallReminder[] {
    const callDateTime = new Date(`${call.scheduledDate}T${call.scheduledTime}`);
    const reminders: CallReminder[] = [];

    // 24 hours before
    const reminder24h = new Date(callDateTime.getTime() - 24 * 60 * 60 * 1000);
    if (reminder24h > new Date()) {
      reminders.push({
        callId: call.id,
        reminderTime: reminder24h.toISOString(),
        type: '24h',
        sent: false,
      });
    }

    // 1 hour before
    const reminder1h = new Date(callDateTime.getTime() - 60 * 60 * 1000);
    if (reminder1h > new Date()) {
      reminders.push({
        callId: call.id,
        reminderTime: reminder1h.toISOString(),
        type: '1h',
        sent: false,
      });
    }

    // 15 minutes before
    const reminder15min = new Date(callDateTime.getTime() - 15 * 60 * 1000);
    if (reminder15min > new Date()) {
      reminders.push({
        callId: call.id,
        reminderTime: reminder15min.toISOString(),
        type: '15min',
        sent: false,
      });
    }

    console.log('Scheduled reminders for call:', call.id, reminders);
    return reminders;
  }

  // Update call status
  static async updateCallStatus(callId: string, status: ScheduledCall['status']): Promise<boolean> {
    console.log('Updating call status:', callId, status);
    // Here you would update the database
    return true;
  }

  // Get upcoming calls for a user
  static async getUpcomingCalls(userId: string): Promise<ScheduledCall[]> {
    // Here you would fetch from database
    console.log('Fetching upcoming calls for user:', userId);
    return [];
  }

  // Check if a call conflicts with existing calls
  static checkForConflicts(
    userId: string,
    date: string,
    time: string,
    duration: number
  ): Promise<boolean> {
    // Here you would check against existing calls
    console.log('Checking for call conflicts:', { userId, date, time, duration });
    return Promise.resolve(false);
  }

  // Format call time for display
  static formatCallTime(call: ScheduledCall): string {
    const date = new Date(`${call.scheduledDate}T${call.scheduledTime}`);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: call.timezone,
    }).format(date);
  }

  // Calculate time until call
  static getTimeUntilCall(call: ScheduledCall): string {
    const now = new Date();
    const callTime = new Date(`${call.scheduledDate}T${call.scheduledTime}`);
    const diffMs = callTime.getTime() - now.getTime();

    if (diffMs <= 0) return 'Maintenant';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Dans ${diffHours}h ${diffMinutes}min`;
    } else {
      return `Dans ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  }

  // Generate call notification message
  static generateCallNotification(
    call: ScheduledCall,
    type: 'scheduled' | 'reminder' | 'starting'
  ): string {
    const callTypeText = call.type === 'video' ? 'vidéo' : 'audio';
    const timeText = this.formatCallTime(call);

    switch (type) {
      case 'scheduled':
        return `📞 Appel ${callTypeText} planifié pour ${timeText} (${call.duration}min)${call.includeWali ? ' avec supervision du Wali' : ''}`;

      case 'reminder':
        return `🔔 Rappel: Appel ${callTypeText} dans ${this.getTimeUntilCall(call)}`;

      case 'starting':
        return `📞 Votre appel ${callTypeText} commence maintenant !`;

      default:
        return `📞 Appel ${callTypeText} programmé`;
    }
  }
}
