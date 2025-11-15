import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface BackupData {
  timestamp: number;
  sessionId: string;
  data: unknown;
}

export const useEmergencyBackup = () => {
  const { user } = useAuth();

  // Generate a unique session ID for this onboarding session
  const getSessionId = useCallback(() => {
    const existing = localStorage.getItem('onboarding_session_id');
    if (existing) return existing;

    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('onboarding_session_id', newSessionId);
    return newSessionId;
  }, []);

  // Save emergency backup that survives auth issues
  const saveEmergencyBackup = useCallback(
    (key: string, data: unknown) => {
      try {
        const sessionId = getSessionId();
        const backupData: BackupData = {
          timestamp: Date.now(),
          sessionId,
          data,
        };

        // Multiple backup strategies
        const emergencyKey = `emergency_${key}_${sessionId}`;
        const timeBasedKey = `emergency_${key}_${new Date().toISOString().split('T')[0]}`;
        const userEmail = user?.email || 'anonymous';
        const emailKey = `emergency_${key}_${userEmail.replace('@', '_')}`;

        localStorage.setItem(emergencyKey, JSON.stringify(backupData));
        localStorage.setItem(timeBasedKey, JSON.stringify(backupData));
        localStorage.setItem(emailKey, JSON.stringify(backupData));
      } catch (error) {
        console.error('Failed to save emergency backup:', error);
      }
    },
    [user, getSessionId]
  );

  // Restore emergency backup - OPTIMISÉ pour ne restaurer qu'une seule fois
  const restoreEmergencyBackup = useCallback(
    (key: string): unknown => {
      try {
        // Vérifier si déjà restauré dans cette session pour éviter les boucles
        const restoredKey = `restored_${key}`;
        if (sessionStorage.getItem(restoredKey)) {
          return null; // Déjà restauré, ne pas réessayer
        }

        const sessionId = getSessionId();
        const userEmail = user?.email || 'anonymous';

        // Try multiple backup sources
        const possibleKeys = [
          `emergency_${key}_${sessionId}`,
          `emergency_${key}_${userEmail.replace('@', '_')}`,
          `emergency_${key}_${new Date().toISOString().split('T')[0]}`,
          // Try previous days too
          `emergency_${key}_${new Date(Date.now() - 86400000).toISOString().split('T')[0]}`,
        ];

        for (const backupKey of possibleKeys) {
          const backup = localStorage.getItem(backupKey);
          if (backup) {
            const parsed: BackupData = JSON.parse(backup);

            // Check if backup is recent (within 24 hours)
            if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
              console.log(`Emergency backup restored from ${backupKey}`);
              // Marquer comme restauré pour cette session
              sessionStorage.setItem(restoredKey, 'true');
              return parsed.data;
            }
          }
        }

        return null;
      } catch (error) {
        console.error('Failed to restore emergency backup:', error);
        return null;
      }
    },
    [user, getSessionId]
  );

  // Clean old emergency backups
  const cleanOldBackups = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      const weekMs = 7 * 24 * 60 * 60 * 1000;

      keys.forEach((key) => {
        if (key.startsWith('emergency_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.timestamp && now - data.timestamp > weekMs) {
              localStorage.removeItem(key);
            }
          } catch {
            // Remove malformed emergency data
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning old backups:', error);
    }
  }, []);

  // Auto-clean on mount
  useEffect(() => {
    cleanOldBackups();
  }, [cleanOldBackups]);

  return {
    saveEmergencyBackup,
    restoreEmergencyBackup,
    cleanOldBackups,
  };
};
