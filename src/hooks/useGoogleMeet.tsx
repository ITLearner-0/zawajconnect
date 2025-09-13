import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MeetingData {
  id: string;
  link: string;
  startTime: string;
  endTime?: string;
  participants: string[];
}

interface UseGoogleMeetResult {
  isLoading: boolean;
  error: string | null;
  meeting: MeetingData | null;
  createMeeting: (options: CreateMeetingOptions) => Promise<MeetingData | null>;
  joinMeeting: (meetingLink: string) => void;
  endMeeting: (meetingId: string) => Promise<void>;
  storeMeetingInDB: (meetingData: MeetingData, matchId: string) => Promise<void>;
}

interface CreateMeetingOptions {
  title?: string;
  description?: string;
  duration?: number; // en minutes
  participants?: string[];
}

export const useGoogleMeet = (): UseGoogleMeetResult => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<MeetingData | null>(null);

  const createMeeting = useCallback(async (options: CreateMeetingOptions): Promise<MeetingData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Pour l'instant, on simule la création d'une réunion Google Meet
      // Dans une vraie implémentation, ceci appellerait l'API Google Meet
      
      const meetingId = `meet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const meetingLink = `https://meet.google.com/${meetingId}`;
      
      // Simulation d'un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const meetingData: MeetingData = {
        id: meetingId,
        link: meetingLink,
        startTime: new Date().toISOString(),
        participants: options.participants || []
      };

      setMeeting(meetingData);
      
      toast({
        title: "Réunion Google Meet créée",
        description: "La réunion a été créée avec succès"
      });

      return meetingData;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      
      toast({
        title: "Erreur",
        description: "Impossible de créer la réunion Google Meet",
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const joinMeeting = useCallback((meetingLink: string) => {
    try {
      // Validation du lien Google Meet
      if (!meetingLink.includes('meet.google.com')) {
        toast({
          title: "Lien invalide",
          description: "Ce n'est pas un lien Google Meet valide",
          variant: "destructive"
        });
        return;
      }

      // Ouvrir la réunion dans un nouvel onglet
      window.open(meetingLink, '_blank', 'noopener,noreferrer');
      
      toast({
        title: "Redirection vers Google Meet",
        description: "La réunion s'ouvre dans un nouvel onglet"
      });
      
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir la réunion",
        variant: "destructive"
      });
    }
  }, [toast]);

  const endMeeting = useCallback(async (meetingId: string) => {
    setIsLoading(true);
    
    try {
      // Dans une vraie implémentation, ceci appellerait l'API Google Meet pour terminer la réunion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (meeting && meeting.id === meetingId) {
        setMeeting({
          ...meeting,
          endTime: new Date().toISOString()
        });
      }
      
      toast({
        title: "Réunion terminée",
        description: "La réunion Google Meet a été terminée"
      });
      
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de terminer la réunion",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [meeting, toast]);

  const storeMeetingInDB = useCallback(async (meetingData: MeetingData, matchId: string) => {
    try {
      // Note: La table video_calls sera créée lors de la prochaine mise à jour des types
      // Pour l'instant, on simule juste le stockage
      console.log('Meeting data would be stored:', { matchId, meetingData });

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast({
          title: "Avertissement",
          description: "Réunion créée mais non sauvegardée",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    }
  }, [toast]);

  return {
    isLoading,
    error,
    meeting,
    createMeeting,
    joinMeeting,
    endMeeting,
    storeMeetingInDB
  };
};