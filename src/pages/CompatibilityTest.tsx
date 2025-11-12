import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import CompatibilityQuestionnaire from '@/components/CompatibilityQuestionnaire';
import ErrorBoundaryWrapper from '@/components/ErrorBoundaryWrapper';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SessionRecoveryModal } from '@/components/SessionRecoveryModal';

const CompatibilityTest = () => {
  const { user, loading } = useAuth();
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Check for session recovery on mount
  useEffect(() => {
    const handleSessionExpired = () => {
      setShowRecoveryModal(true);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    // Check if user just logged back in and has backup data
    if (user && !loading) {
      const userEmail = user?.email || 'anonymous';
      const sessionId = localStorage.getItem('onboarding_session_id') || 'unknown';
      const today = new Date().toISOString().split('T')[0];

      const backupKeys = [
        `emergency_compatibility_${sessionId}`,
        `emergency_compatibility_${userEmail.replace('@', '_')}`,
        `emergency_compatibility_${today}`,
      ];

      const hasBackup = backupKeys.some((key) => {
        try {
          const backup = localStorage.getItem(key);
          if (backup) {
            const parsed = JSON.parse(backup);
            const backupAge = Date.now() - parsed.timestamp;
            // Show recovery if backup is less than 24 hours old
            return (
              backupAge < 24 * 60 * 60 * 1000 && parsed.data && Object.keys(parsed.data).length > 0
            );
          }
        } catch (error) {
          console.error('Error checking backup for key:', key);
        }
        return false;
      });

      if (hasBackup) {
        setShowRecoveryModal(true);
      }
    }

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?redirect=/compatibility-test" replace />;
  }

  const handleComplete = () => {
    // Redirect to compatibility insights instead of dashboard
    window.location.href = '/compatibility-insights';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
      <Header />
      <main className="pt-20">
        <ErrorBoundaryWrapper>
          <CompatibilityQuestionnaire onComplete={handleComplete} />
        </ErrorBoundaryWrapper>
      </main>
      <Footer />

      <SessionRecoveryModal
        isOpen={showRecoveryModal}
        onRecover={() => {
          setShowRecoveryModal(false);
          // Recovery is handled automatically by emergency backup hook
        }}
        onIgnore={() => {
          setShowRecoveryModal(false);
          // Clear relevant backup data
          const userEmail = user?.email || 'anonymous';
          const sessionId = localStorage.getItem('onboarding_session_id') || 'unknown';
          const today = new Date().toISOString().split('T')[0];

          const keysToClean = [
            `emergency_compatibility_${sessionId}`,
            `emergency_compatibility_${userEmail.replace('@', '_')}`,
            `emergency_compatibility_${today}`,
          ];

          keysToClean.forEach((key) => localStorage.removeItem(key));
        }}
      />
    </div>
  );
};

export default CompatibilityTest;
