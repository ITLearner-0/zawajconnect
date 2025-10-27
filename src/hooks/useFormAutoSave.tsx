import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface UseFormAutoSaveProps {
  data: any;
  key: string;
  interval?: number;
}

// OPTIMISÉ: Intervalle augmenté à 5 secondes pour réduire les requêtes
export const useFormAutoSave = ({ data, key, interval = 5000 }: UseFormAutoSaveProps) => {
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<string>('');

  useEffect(() => {
    if (!user || !data) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start auto-save interval
    intervalRef.current = setInterval(() => {
      try {
        const serializedData = JSON.stringify(data);
        
        // Only save if data has changed
        if (serializedData !== lastSaveRef.current) {
          // Emit save start event
          window.dispatchEvent(new CustomEvent('onboarding:save:start'));
          
          const saveKey = `${key}_${user.id}`;
          const backupKey = `${key}_backup_${user.email}`;
          const timestampedData = { ...data, timestamp: Date.now() };
          
          localStorage.setItem(saveKey, JSON.stringify(timestampedData));
          localStorage.setItem(backupKey, JSON.stringify(timestampedData));
          
          lastSaveRef.current = serializedData;
          
          
          // Emit save success event
          window.dispatchEvent(new CustomEvent('onboarding:save:success'));
        }
      } catch (error) {
        console.error(`Error auto-saving ${key}:`, error);
        // Emit save error event
        window.dispatchEvent(new CustomEvent('onboarding:save:error'));
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [data, key, interval, user]);

  // Save immediately on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && data) {
        try {
          const saveKey = `${key}_${user.id}`;
          const backupKey = `${key}_backup_${user.email}`;
          const timestampedData = { ...data, timestamp: Date.now() };
          
          localStorage.setItem(saveKey, JSON.stringify(timestampedData));
          localStorage.setItem(backupKey, JSON.stringify(timestampedData));
        } catch (error) {
          console.error(`Error saving ${key} on unload:`, error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [data, key, user]);
};