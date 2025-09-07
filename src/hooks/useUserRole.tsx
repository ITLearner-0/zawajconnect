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
    console.log('🚀 useUserRole effect triggered, user:', user?.id);
    if (!user) {
      console.log('❌ No user found, setting defaults');
      setRole({ isWaliOnly: false, isRegularUser: false, loading: false });
      return;
    }

    console.log('✅ User found, checking role...');
    checkUserRole();
  }, [user]);

  const checkUserRole = async () => {
    try {
      console.log('🔍 Checking user role for:', user?.id);
      
      // Vérifier si l'utilisateur a un profil complet (indique qu'il cherche un partenaire)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, age, gender, bio')
        .eq('user_id', user?.id)
        .maybeSingle();

      console.log('👤 Profile data:', profile, 'Error:', profileError);

      // Vérifier si l'utilisateur est invité comme membre de famille
      const { data: invitedAs, error: familyError } = await supabase
        .from('family_members')
        .select('invited_user_id, is_wali, relationship, invitation_status')
        .eq('invited_user_id', user?.id);

      console.log('👨‍👩‍👧‍👦 Family member data (all statuses):', invitedAs, 'Error:', familyError);

      // Filtrer les invitations acceptées
      const acceptedInvitations = invitedAs?.filter(invite => invite.invitation_status === 'accepted') || [];
      console.log('✅ Accepted invitations:', acceptedInvitations);

      const isInvitedWali = acceptedInvitations && acceptedInvitations.length > 0;
      const hasCompleteProfile = profile && profile.age && profile.gender && Boolean(profile.bio);

      console.log('🏷️ Role analysis:', {
        isInvitedWali,
        hasCompleteProfile,
        willBeWaliOnly: isInvitedWali && !hasCompleteProfile,
        willBeRegularUser: hasCompleteProfile || (!isInvitedWali && !hasCompleteProfile)
      });

      setRole({
        isWaliOnly: isInvitedWali && !hasCompleteProfile,
        isRegularUser: hasCompleteProfile || (!isInvitedWali && !hasCompleteProfile),
        loading: false
      });
    } catch (error) {
      console.error('❌ Error checking user role:', error);
      setRole({ isWaliOnly: false, isRegularUser: true, loading: false });
    }
  };

  return role;
};