import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserRole {
  isWaliOnly: boolean;
  isRegularUser: boolean;
  loading: boolean;
}

export const useUserRole = (): UserRole => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>({
    isWaliOnly: false,
    isRegularUser: false,
    loading: true
  });

  useEffect(() => {
    if (!user) {
      setRole({ isWaliOnly: false, isRegularUser: false, loading: false });
      return;
    }

    checkUserRole();
  }, [user]);

  const checkUserRole = async () => {
    try {
      // Vérifier si l'utilisateur a un profil complet (indique qu'il cherche un partenaire)
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, age, gender, bio')
        .eq('user_id', user?.id)
        .maybeSingle();

      // Vérifier si l'utilisateur est invité comme membre de famille
      const { data: invitedAs } = await supabase
        .from('family_members')
        .select('invited_user_id, is_wali, relationship')
        .eq('invited_user_id', user?.id)
        .eq('invitation_status', 'accepted');

      const isInvitedWali = invitedAs && invitedAs.length > 0;
      const hasCompleteProfile = profile && profile.age && profile.gender && Boolean(profile.bio);

      setRole({
        isWaliOnly: isInvitedWali && !hasCompleteProfile,
        isRegularUser: hasCompleteProfile || (!isInvitedWali && !hasCompleteProfile),
        loading: false
      });
    } catch (error) {
      console.error('Error checking user role:', error);
      setRole({ isWaliOnly: false, isRegularUser: true, loading: false });
    }
  };

  return role;
};