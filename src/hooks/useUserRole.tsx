import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserRole {
  isWaliOnly: boolean;
  isRegularUser: boolean;
  isWali: boolean;
  loading: boolean;
}

// Cache global pour éviter les appels répétés
const roleCache = new Map<string, { role: UserRole; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute
const activeRequests = new Map<string, Promise<UserRole>>();

// Global flag pour éviter les appels simultanés
let isAnyRequestInProgress = false;

export const useUserRole = (): UserRole => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>({
    isWaliOnly: false,
    isRegularUser: false,
    isWali: false,
    loading: true
  });
  
  // Ref pour éviter les appels multiples
  const isInitialized = useRef(false);
  const lastUserId = useRef<string | null>(null);

  // Stable reference pour user.id
  const userId = useMemo(() => user?.id, [user?.id]);

  const checkUserRole = useCallback(async (targetUserId: string): Promise<UserRole> => {
    // Vérifier s'il y a déjà une requête en cours pour cet utilisateur
    if (activeRequests.has(targetUserId)) {
      console.log('🔄 Reusing active request for user:', targetUserId);
      return activeRequests.get(targetUserId)!;
    }

    // Vérifier le cache
    const cached = roleCache.get(targetUserId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🎯 Using cached role for user:', targetUserId);
      return cached.role;
    }

    // Éviter les requêtes simultanées globales
    if (isAnyRequestInProgress) {
      console.log('⏳ Another request in progress, waiting...');
      // Attendre un peu et réessayer
      await new Promise(resolve => setTimeout(resolve, 100));
      return checkUserRole(targetUserId);
    }

    // Créer une nouvelle requête
    const rolePromise = (async (): Promise<UserRole> => {
      isAnyRequestInProgress = true;
      try {
        console.log('🔍 Fetching role for user:', targetUserId);
        
        const [profileResult, familyResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('full_name, age, gender, bio')
            .eq('user_id', targetUserId)
            .maybeSingle(),
          supabase
            .from('family_members')
            .select('invited_user_id, is_wali, relationship, invitation_status')
            .eq('invited_user_id', targetUserId)
        ]);

        const profile = profileResult.data;
        const invitedAs = familyResult.data;

        const acceptedInvitations = invitedAs?.filter(invite => invite.invitation_status === 'accepted') || [];
        const isInvitedWali = acceptedInvitations.length > 0;
        const hasCompleteProfile = profile && profile.age && profile.gender && Boolean(profile.bio);

        const finalRole = {
          isWaliOnly: false,
          isRegularUser: hasCompleteProfile || isInvitedWali,
          isWali: isInvitedWali,
          loading: false
        };

        console.log('✅ Role fetched for user:', targetUserId, finalRole);

        // Mettre en cache
        roleCache.set(targetUserId, {
          role: finalRole,
          timestamp: Date.now()
        });

        return finalRole;
      } catch (error) {
        console.error('Error checking user role:', error);
        return { isWaliOnly: false, isRegularUser: true, isWali: false, loading: false };
      } finally {
        // Nettoyer les flags et requêtes actives
        isAnyRequestInProgress = false;
        activeRequests.delete(targetUserId);
      }
    })();

    // Stocker la requête active
    activeRequests.set(targetUserId, rolePromise);
    
    return rolePromise;
  }, []);

  useEffect(() => {
    if (!user) {
      setRole({ isWaliOnly: false, isRegularUser: false, isWali: false, loading: false });
      isInitialized.current = false;
      lastUserId.current = null;
      return;
    }

    // Éviter les appels répétés pour le même utilisateur
    if (userId && (userId !== lastUserId.current || !isInitialized.current)) {
      lastUserId.current = userId;
      isInitialized.current = true;
      
      checkUserRole(userId).then(setRole);
    }
  }, [user, userId, checkUserRole]);

  return role;
};