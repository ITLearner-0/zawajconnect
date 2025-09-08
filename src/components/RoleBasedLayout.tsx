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
  const { isWaliOnly, isRegularUser, loading: roleLoading } = useUserRole();

  // Attendre que l'authentification et les rôles soient chargés
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald"></div>
      </div>
    );
  }

  // Not authenticated - seulement après que l'auth loading soit terminé
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Wali-only users get the supervision portal
  if (isWaliOnly) {
    return <FamilyAccessPortal />;
  }

  // Regular users get the normal app layout
  if (isRegularUser) {
    return <AppLayout>{children}</AppLayout>;
  }

  // Fallback - seulement si on est sûr que l'utilisateur n'a pas le bon rôle
  return <Navigate to="/auth" replace />;
};

export default RoleBasedLayout;