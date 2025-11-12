import { useState, useCallback, useEffect, RefObject } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface PictureInPictureState {
  isInPiP: boolean;
  isSupported: boolean;
  enterPiP: () => Promise<void>;
  exitPiP: () => Promise<void>;
  togglePiP: () => Promise<void>;
}

/**
 * Hook to manage Picture-in-Picture mode for video elements
 * Allows video to float above other content while user navigates the app
 */
export function usePictureInPicture(
  videoRef: RefObject<HTMLVideoElement>
): PictureInPictureState {
  const { toast } = useToast();
  const [isInPiP, setIsInPiP] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Check if PiP is supported
  useEffect(() => {
    if (typeof document !== 'undefined' && document.pictureInPictureEnabled) {
      setIsSupported(true);
    }
  }, []);

  // Listen for PiP events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => {
      console.log('Entered Picture-in-Picture');
      setIsInPiP(true);
    };

    const handleLeavePiP = () => {
      console.log('Left Picture-in-Picture');
      setIsInPiP(false);
    };

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [videoRef]);

  const enterPiP = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Non supporté",
        description: "Le mode Picture-in-Picture n'est pas disponible sur votre appareil",
        variant: "destructive"
      });
      return;
    }

    const video = videoRef.current;
    if (!video) {
      console.error('Video element not found');
      return;
    }

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
      await video.requestPictureInPicture();
    } catch (error) {
      console.error('Error entering Picture-in-Picture:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer le mode Picture-in-Picture",
        variant: "destructive"
      });
    }
  }, [videoRef, isSupported, toast]);

  const exitPiP = useCallback(async () => {
    if (!document.pictureInPictureElement) {
      return;
    }

    try {
      await document.exitPictureInPicture();
    } catch (error) {
      console.error('Error exiting Picture-in-Picture:', error);
    }
  }, []);

  const togglePiP = useCallback(async () => {
    if (isInPiP) {
      await exitPiP();
    } else {
      await enterPiP();
    }
  }, [isInPiP, enterPiP, exitPiP]);

  return {
    isInPiP,
    isSupported,
    enterPiP,
    exitPiP,
    togglePiP
  };
}