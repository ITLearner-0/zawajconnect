import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface TypingUser {
  user_id: string;
  user_name: string;
  timestamp: string;
}

export interface OnlineUser {
  user_id: string;
  last_seen: string;
  status: 'online' | 'away' | 'offline';
}

export const useChatPresence = (matchId: string | null) => {
  const { user } = useAuth();
  
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  
  const presenceChannelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTyping = useCallback((typing: boolean) => {
    if (!presenceChannelRef.current || !user) return;

    presenceChannelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        user_name: user.email || 'Utilisateur',
        typing
      }
    });
  }, [user]);

  const startTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    handleTyping(true);
    
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, 1000);
  }, [handleTyping]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    handleTyping(false);
  }, [handleTyping]);

  const setupPresenceTracking = useCallback(() => {
    if (!user || !matchId) return;

    // Cleanup existing channel
    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current);
    }

    const channel = supabase.channel(`presence-${matchId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users = Object.keys(newState).map(userId => ({
          user_id: userId,
          last_seen: new Date().toISOString(),
          status: 'online' as const
        }));
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        setOnlineUsers(prev => prev.filter(u => u.user_id !== key));
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.user_id !== user.id) {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.user_id !== payload.user_id);
            if (payload.typing) {
              return [...filtered, {
                user_id: payload.user_id,
                user_name: payload.user_name,
                timestamp: new Date().toISOString()
              }];
            }
            return filtered;
          });
        }
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        
        await channel.track({
          user_id: user.id,
          user_name: user.email || 'Utilisateur',
          online_at: new Date().toISOString(),
        });
      });

    presenceChannelRef.current = channel;

    // Clean up old typing indicators
    const typingCleanup = setInterval(() => {
      setTypingUsers(prev => prev.filter(u => {
        const timeDiff = Date.now() - new Date(u.timestamp).getTime();
        return timeDiff < 3000;
      }));
    }, 1000);

    return () => {
      clearInterval(typingCleanup);
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, [user, matchId]);

  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.some(u => u.user_id === userId && u.status === 'online');
  }, [onlineUsers]);

  useEffect(() => {
    if (matchId) {
      const cleanup = setupPresenceTracking();
      return cleanup;
    }
  }, [setupPresenceTracking, matchId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, []);

  return {
    typingUsers,
    onlineUsers,
    isUserOnline,
    startTyping,
    stopTyping
  };
};