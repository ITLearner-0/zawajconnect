
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CompatibilityMatch } from "@/types/compatibility";
import { realtimeService, MatchNotification, RealtimeCallbacks } from "./services/realtimeService";
import { enhancedMatchingService } from "./services/enhancedMatchingService";
import { logInfo, logError } from "./services/loggingService";

export function useRealtimeMatching() {
  const [notifications, setNotifications] = useState<MatchNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Handle new match notifications
  const handleNewMatch = useCallback((match: CompatibilityMatch) => {
    toast({
      title: "Nouvelle correspondance !",
      description: `Vous avez une nouvelle correspondance avec un score de ${match.score}%`,
      duration: 5000,
    });
    
    logInfo('useRealtimeMatching', 'New match received', { match });
  }, [toast]);

  // Handle score updates
  const handleScoreUpdate = useCallback((notification: MatchNotification) => {
    toast({
      title: "Score mis à jour",
      description: notification.message || "Le score de compatibilité a été mis à jour",
      duration: 3000,
    });
    
    logInfo('useRealtimeMatching', 'Score update received', { notification });
  }, [toast]);

  // Handle profile updates
  const handleProfileUpdate = useCallback(async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Trigger match refresh if someone's profile changed
      await enhancedMatchingService.refreshMatches(session.user.id, 'low');
      
      logInfo('useRealtimeMatching', 'Profile update triggered match refresh', { userId });
    } catch (error) {
      logError('useRealtimeMatching', error as Error, { userId });
    }
  }, []);

  // Handle general notifications
  const handleNotification = useCallback((notification: MatchNotification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show different toasts based on notification type
    switch (notification.notification_type) {
      case 'new_match':
        toast({
          title: "Nouvelle correspondance !",
          description: notification.message || "Vous avez une nouvelle correspondance",
          duration: 5000,
        });
        break;
      case 'profile_update':
        toast({
          title: "Profil mis à jour",
          description: notification.message || "Un profil a été mis à jour",
          duration: 3000,
        });
        break;
      case 'score_update':
        // Already handled by handleScoreUpdate
        break;
    }
    
    logInfo('useRealtimeMatching', 'Notification received', { notification });
  }, [toast]);

  // Initialize realtime connections
  useEffect(() => {
    let mounted = true;

    const initializeRealtime = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !mounted) return;

        const userId = session.user.id;

        // Load existing notifications
        const existingNotifications = await realtimeService.getUnreadNotifications(userId);
        if (mounted) {
          setNotifications(existingNotifications);
          setUnreadCount(existingNotifications.length);
        }

        // Set up realtime callbacks
        const callbacks: RealtimeCallbacks = {
          onNewMatch: handleNewMatch,
          onScoreUpdate: handleScoreUpdate,
          onProfileUpdate: handleProfileUpdate,
          onNotification: handleNotification,
        };

        // Subscribe to all realtime channels
        realtimeService.subscribeToCompatibilityResults(userId, callbacks);
        realtimeService.subscribeToProfileUpdates(userId, callbacks);
        realtimeService.subscribeToNotifications(userId, callbacks);

        if (mounted) {
          setIsConnected(true);
          logInfo('useRealtimeMatching', 'Realtime connections established', { userId });
        }
      } catch (error) {
        logError('useRealtimeMatching', error as Error);
        if (mounted) {
          toast({
            title: "Erreur de connexion",
            description: "Impossible d'établir la connexion temps réel",
            variant: "destructive",
          });
        }
      }
    };

    initializeRealtime();

    return () => {
      mounted = false;
      realtimeService.unsubscribeAll();
      setIsConnected(false);
    };
  }, [handleNewMatch, handleScoreUpdate, handleProfileUpdate, handleNotification, toast]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await realtimeService.markNotificationAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      logInfo('useRealtimeMatching', 'Notification marked as read', { notificationId });
    } catch (error) {
      logError('useRealtimeMatching', error as Error, { notificationId });
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Create a new notification (for testing or manual triggers)
  const createNotification = useCallback(async (
    matchUserId: string,
    type: MatchNotification['notification_type'],
    message?: string,
    score?: number
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await realtimeService.createNotification({
        user_id: session.user.id,
        match_user_id: matchUserId,
        notification_type: type,
        message,
        score,
      });
      
      logInfo('useRealtimeMatching', 'Notification created', { matchUserId, type, message });
    } catch (error) {
      logError('useRealtimeMatching', error as Error, { matchUserId, type });
      toast({
        title: "Erreur",
        description: "Impossible de créer la notification",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    createNotification,
    activeChannels: realtimeService.getActiveChannelsCount(),
  };
}
