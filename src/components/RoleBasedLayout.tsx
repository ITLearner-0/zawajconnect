import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import FamilyAccessPortal from '@/components/FamilyAccessPortal';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <RoleBasedLayoutContent>{children}</RoleBasedLayoutContent>
    </ErrorBoundary>
  );
};

const RoleBasedLayoutContent: React.FC<RoleBasedLayoutProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isWaliOnly, isRegularUser, isWali, loading: roleLoading } = useUserRole();

  // Attendre que l'authentification et les rôles soient chargés
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald"></div>
          <p className="text-sm text-muted-foreground">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - cette condition ne devrait jamais être atteinte
  // car ProtectedRoute redirige déjà, mais on la garde par sécurité
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // CORRECTION: Les Walis ont maintenant accès à l'interface complète avec le menu de supervision
  // Wali-only users (sans profil complet) ont accès au portail limité
  if (isWaliOnly) {
    return <FamilyAccessPortal />;
  }

  // Regular users (avec ou sans droits Wali) get the normal app layout with full menu
  if (isRegularUser) {
    return <AppLayout>{children}</AppLayout>;
  }

  // Fallback - redirection vers onboarding pour compléter le profil
  return <Navigate to="/onboarding" replace />;
};

export default RoleBasedLayout;