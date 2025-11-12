import { supabase } from '@/integrations/supabase/client';

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'presence' | 'notification';
  data: any;
  timestamp: number;
  userId?: string;
  conversationId?: string;
}

export interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: number;
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: number;
  location?: string;
}

class WebSocketService {
  private channels: Map<string, any> = new Map();
  private presenceChannels: Map<string, any> = new Map();
  private heartbeatInterval?: NodeJS.Timeout;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Message handling
  subscribeToConversation(
    conversationId: string,
    onMessage: (message: any) => void,
    onTyping: (typing: TypingIndicator) => void
  ) {
    const channelName = `conversation:${conversationId}`;

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName);
    }

    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true },
        },
      })
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        onMessage(payload);
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        onTyping(payload as TypingIndicator);
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onMessage(payload.new);
        }
      )
      .subscribe((status) => {
        console.log(`Conversation channel ${conversationId} status:`, status);

        if (status === 'SUBSCRIBED') {
          this.reconnectAttempts = 0;
        } else if (status === 'CHANNEL_ERROR') {
          this.handleReconnect(channelName);
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  // Présence d'utilisateur
  subscribeToUserPresence(userId: string, onPresenceUpdate: (presence: UserPresence[]) => void) {
    const channelName = `presence:${userId}`;

    if (this.presenceChannels.has(channelName)) {
      return this.presenceChannels.get(channelName);
    }

    const channel = supabase
      .channel(channelName, {
        config: {
          presence: {
            key: userId,
          },
        },
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Fix the type conversion issue
        const presenceList = Object.values(state)
          .flat()
          .map((presence: any) => ({
            userId: presence.userId || userId,
            status: presence.status || 'online',
            lastSeen: presence.lastSeen || Date.now(),
            location: presence.location,
          })) as UserPresence[];
        onPresenceUpdate(presenceList);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        console.log(`Presence channel status:`, status);

        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId,
            status: 'online',
            lastSeen: Date.now(),
            location: window.location.pathname,
          });
        }
      });

    this.presenceChannels.set(channelName, channel);
    return channel;
  }

  // Envoyer un message
  async sendMessage(conversationId: string, message: any) {
    const channel = this.channels.get(`conversation:${conversationId}`);

    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: {
          ...message,
          timestamp: Date.now(),
        },
      });
    }
  }

  // Indicateur de frappe
  async sendTypingIndicator(conversationId: string, userId: string, isTyping: boolean) {
    const channel = this.channels.get(`conversation:${conversationId}`);

    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId,
          conversationId,
          isTyping,
          timestamp: Date.now(),
        },
      });
    }
  }

  // Mettre à jour le statut de présence
  async updatePresence(userId: string, status: 'online' | 'offline' | 'away') {
    const channel = this.presenceChannels.get(`presence:${userId}`);

    if (channel) {
      await channel.track({
        userId,
        status,
        lastSeen: Date.now(),
        location: window.location.pathname,
      });
    }
  }

  // Gestion de la reconnexion
  private handleReconnect(channelName: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts reached for ${channelName}`);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Attempting to reconnect ${channelName} (attempt ${this.reconnectAttempts})`);

      const channel = this.channels.get(channelName);
      if (channel) {
        channel.unsubscribe();
        this.channels.delete(channelName);
      }
    }, delay);
  }

  // Heartbeat pour maintenir la connexion
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.channels.forEach((channel, channelName) => {
        if (channel.state === 'joined') {
          channel.send({
            type: 'broadcast',
            event: 'heartbeat',
            payload: { timestamp: Date.now() },
          });
        }
      });
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  // Nettoyer les connexions
  unsubscribeFromConversation(conversationId: string) {
    const channelName = `conversation:${conversationId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }

  unsubscribeFromPresence(userId: string) {
    const channelName = `presence:${userId}`;
    const channel = this.presenceChannels.get(channelName);

    if (channel) {
      channel.unsubscribe();
      this.presenceChannels.delete(channelName);
    }
  }

  // Nettoyer toutes les connexions
  cleanup() {
    this.stopHeartbeat();

    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.channels.clear();

    this.presenceChannels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.presenceChannels.clear();
  }

  // Statistiques de connexion
  getConnectionStats() {
    return {
      activeChannels: this.channels.size,
      presenceChannels: this.presenceChannels.size,
      reconnectAttempts: this.reconnectAttempts,
      isHeartbeatActive: !!this.heartbeatInterval,
    };
  }
}

export const websocketService = new WebSocketService();
