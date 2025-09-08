import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserRole {
  isWaliOnly: boolean;
  isRegularUser: boolean;
  isWali: boolean;
  loading: boolean;
}

// Cache pour éviter les appels répétés
const roleCache = new Map<string, { role: UserRole; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 secondes

export const useUserRole = (): UserRole => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>({
    isWaliOnly: false,
    isRegularUser: false,
    isWali: false,
    loading: true
  });

  // Stable reference pour user.id pour éviter les boucles infinies
  const userId = useMemo(() => user?.id, [user?.id]);

  const checkUserRole = useCallback(async () => {
    if (!userId) return;

    // Vérifier le cache
    const cached = roleCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setRole(cached.role);
      return;
    }

    try {
      console.log('🔍 Fetching role for user:', userId);
      
      // Faire les deux requêtes en parallèle pour optimiser
      const [profileResult, familyResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, age, gender, bio')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('family_members')
          .select('invited_user_id, is_wali, relationship, invitation_status')
          .eq('invited_user_id', userId)
      ]);

      const profile = profileResult.data;
      const invitedAs = familyResult.data;

      // Filtrer les invitations acceptées
      const acceptedInvitations = invitedAs?.filter(invite => invite.invitation_status === 'accepted') || [];
      const isInvitedWali = acceptedInvitations.length > 0;
      const hasCompleteProfile = profile && profile.age && profile.gender && Boolean(profile.bio);

      const finalRole = {
        isWaliOnly: false,
        isRegularUser: hasCompleteProfile || isInvitedWali,
        isWali: isInvitedWali,
        loading: false
      };

      // Mettre en cache le résultat
      roleCache.set(userId, {
        role: finalRole,
        timestamp: Date.now()
      });

      setRole(finalRole);
    } catch (error) {
      console.error('Error checking user role:', error);
      const errorRole = { isWaliOnly: false, isRegularUser: true, isWali: false, loading: false };
      setRole(errorRole);
    }
  }, [userId]);

  useEffect(() => {
    if (!user) {
      setRole({ isWaliOnly: false, isRegularUser: false, isWali: false, loading: false });
      return;
    }

    // Debounce pour éviter les appels trop rapides
    const timeoutId = setTimeout(() => {
      checkUserRole();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [user, checkUserRole]);

  return role;
};