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
  console.log('🔑 useUserRole - checking role for user:', user?.id);
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
      console.log('🔍 checkUserRole starting for user:', user?.id);
      
      // Vérifier si l'utilisateur a un profil complet (indique qu'il cherche un partenaire)
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, age, gender, bio')
        .eq('user_id', user?.id)
        .maybeSingle();

      console.log('👤 Profile data:', profile);

      // Vérifier si l'utilisateur est invité comme membre de famille
      const { data: invitedAs } = await supabase
        .from('family_members')
        .select('invited_user_id, is_wali, relationship, invitation_status')
        .eq('invited_user_id', user?.id);

      console.log('👨‍👩‍👧‍👦 Invited as data:', invitedAs);

      // Filtrer les invitations acceptées
      const acceptedInvitations = invitedAs?.filter(invite => invite.invitation_status === 'accepted') || [];

      const isInvitedWali = acceptedInvitations && acceptedInvitations.length > 0;
      const hasCompleteProfile = profile && profile.age && profile.gender && Boolean(profile.bio);

      console.log('🔧 Role calculation:', {
        isInvitedWali,
        hasCompleteProfile,
        profileDetails: {
          hasAge: !!profile?.age,
          hasGender: !!profile?.gender,
          hasBio: Boolean(profile?.bio)
        }
      });

      const finalRole = {
        isWaliOnly: false, // Les walis peuvent accéder au layout principal pour supervision
        isRegularUser: true, // Donner accès au layout principal
        loading: false
      };

      console.log('✅ Final role assignment:', finalRole);

      setRole(finalRole);
    } catch (error) {
      console.error('Error checking user role:', error);
      setRole({ isWaliOnly: false, isRegularUser: true, loading: false });
    }
  };

  return role;
};