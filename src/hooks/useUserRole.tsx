import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserRole {
  isWaliOnly: boolean;
  isRegularUser: boolean;
  isWali: boolean;
  isVerifiedWali: boolean; // Wali avec score de vérification ≥85
  canApproveMatches: boolean; // Peut approuver/rejeter des matches
  canViewProfiles: boolean; // Peut voir les profils supervisés
  verificationScore: number;
  emailVerified: boolean;
  idVerified: boolean;
  loading: boolean;
}

// Système de cache global sophistiqué
class RoleCache {
  private cache = new Map<string, { role: UserRole; timestamp: number }>();
  private activeRequests = new Map<string, Promise<UserRole>>();
  private requestQueue = new Set<string>();
  private readonly CACHE_DURATION = 300000; // 5 minutes

  async getRole(userId: string, fetcher: () => Promise<UserRole>): Promise<UserRole> {
    // 1. Vérifier le cache en premier
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('🎯 Cache hit for user:', userId);
      return cached.role;
    }

    // 2. Vérifier si une requête est déjà en cours
    if (this.activeRequests.has(userId)) {
      console.log('🔄 Request already in progress for user:', userId);
      return this.activeRequests.get(userId)!;
    }

    // 3. Vérifier la queue pour éviter les requêtes simultanées
    if (this.requestQueue.has(userId)) {
      console.log('⏳ Request queued for user:', userId);
      // Attendre un court délai et réessayer
      await new Promise((resolve) => setTimeout(resolve, 50));
      return this.getRole(userId, fetcher);
    }

    // 4. Ajouter à la queue et faire la requête
    this.requestQueue.add(userId);
    console.log('🔍 Starting new request for user:', userId);

    const promise = this.executeRequest(userId, fetcher);
    this.activeRequests.set(userId, promise);

    return promise;
  }

  private async executeRequest(
    userId: string,
    fetcher: () => Promise<UserRole>
  ): Promise<UserRole> {
    try {
      const role = await fetcher();

      // Mettre en cache le résultat
      this.cache.set(userId, {
        role,
        timestamp: Date.now(),
      });

      console.log('✅ Role fetched and cached for user:', userId, role);
      return role;
    } catch (error) {
      console.error('❌ Error fetching role for user:', userId, error);
      return {
        isWaliOnly: false,
        isRegularUser: true,
        isWali: false,
        isVerifiedWali: false,
        canApproveMatches: false,
        canViewProfiles: false,
        verificationScore: 0,
        emailVerified: false,
        idVerified: false,
        loading: false,
      };
    } finally {
      // Nettoyer les références
      this.activeRequests.delete(userId);
      this.requestQueue.delete(userId);
    }
  }

  clearCache() {
    this.cache.clear();
    this.activeRequests.clear();
    this.requestQueue.clear();
  }
}

const globalRoleCache = new RoleCache();

export const useUserRole = (): UserRole => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>({
    isWaliOnly: false,
    isRegularUser: false,
    isWali: false,
    isVerifiedWali: false,
    canApproveMatches: false,
    canViewProfiles: false,
    verificationScore: 0,
    emailVerified: false,
    idVerified: false,
    loading: true,
  });

  // Ref pour éviter les appels multiples
  const isInitialized = useRef(false);
  const lastUserId = useRef<string | null>(null);

  // Stable reference pour user.id
  const userId = useMemo(() => user?.id, [user?.id]);

  const fetchUserRole = useCallback(async (targetUserId: string): Promise<UserRole> => {
    return globalRoleCache.getRole(targetUserId, async () => {
      const [profileResult, familyResult, verificationResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, age, gender, bio')
          .eq('user_id', targetUserId)
          .maybeSingle(),
        supabase
          .from('family_members')
          .select('invited_user_id, is_wali, relationship, invitation_status')
          .eq('invited_user_id', targetUserId),
        supabase
          .from('user_verifications')
          .select('email_verified, id_verified, verification_score')
          .eq('user_id', targetUserId)
          .maybeSingle(),
      ]);

      const profile = profileResult.data;
      const invitedAs = familyResult.data;
      const verification = verificationResult.data;

      const acceptedInvitations =
        invitedAs?.filter((invite) => invite.invitation_status === 'accepted') || [];
      const isInvitedWali = acceptedInvitations.some((invite) => invite.is_wali === true);
      const hasCompleteProfile = profile && profile.age && profile.gender && Boolean(profile.bio);

      // Vérification du statut Wali
      const emailVerified = verification?.email_verified ?? false;
      const idVerified = verification?.id_verified ?? false;
      const verificationScore = verification?.verification_score ?? 0;

      // Un Wali vérifié doit avoir:
      // - Email vérifié + ID vérifié + Score ≥85 + Invitation acceptée
      const isVerifiedWali =
        emailVerified && idVerified && verificationScore >= 85 && isInvitedWali;

      // Permissions basées sur le score de vérification
      const canApproveMatches = isVerifiedWali; // Score ≥85 requis
      const canViewProfiles = isInvitedWali && verificationScore >= 70; // Score ≥70 suffit pour voir

      // Logic:
      // - isWaliOnly: true si c'est SEULEMENT un Wali (pas de profil complet)
      // - isWali: true si a des droits de Wali (accepté invitation avec is_wali=true)
      // - isVerifiedWali: true si Wali avec vérifications complètes (≥85)
      // - isRegularUser: true si a un profil complet OU est un Wali accepté

      const isOnlyWali = isInvitedWali && !hasCompleteProfile;

      return {
        isWaliOnly: isOnlyWali,
        isWali: isInvitedWali,
        isVerifiedWali,
        canApproveMatches,
        canViewProfiles,
        verificationScore,
        emailVerified,
        idVerified,
        isRegularUser: hasCompleteProfile || isInvitedWali,
        loading: false,
      };
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setRole({
        isWaliOnly: false,
        isRegularUser: false,
        isWali: false,
        isVerifiedWali: false,
        canApproveMatches: false,
        canViewProfiles: false,
        verificationScore: 0,
        emailVerified: false,
        idVerified: false,
        loading: false,
      });
      isInitialized.current = false;
      lastUserId.current = null;
      return;
    }

    // Éviter les appels répétés pour le même utilisateur
    if (userId && (userId !== lastUserId.current || !isInitialized.current)) {
      lastUserId.current = userId;
      isInitialized.current = true;

      fetchUserRole(userId).then(setRole);
    }
  }, [user, userId, fetchUserRole]);

  return role;
};
