import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import FamilyAccessPortal from '@/components/FamilyAccessPortal';

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { isWaliOnly, isRegularUser, loading } = useUserRole();

  console.log('🎭 RoleBasedLayout state:', { 
    hasUser: !!user, 
    isWaliOnly, 
    isRegularUser, 
    loading,
    userId: user?.id 
  });

  // Loading state
  if (loading) {
    console.log('⏳ Loading user role...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    console.log('🚫 No user, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Wali-only users get the supervision portal
  if (isWaliOnly) {
    console.log('👨‍👩‍👧‍👦 Wali detected, showing FamilyAccessPortal');
    return <FamilyAccessPortal />;
  }

  // Regular users get the normal app layout
  if (isRegularUser) {
    console.log('👤 Regular user, showing AppLayout');
    return <AppLayout>{children}</AppLayout>;
  }

  // Fallback
  console.log('❓ Unknown state, redirecting to /auth');
  return <Navigate to="/auth" replace />;
};

export default RoleBasedLayout;