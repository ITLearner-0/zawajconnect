import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FamilyMember {
  id: string;
  full_name: string;
  relationship: string;
  is_wali: boolean;
  can_communicate: boolean;
  can_view_profile: boolean;
}

interface FamilyNotification {
  id: string;
  notification_type: string;
  content: string;
  original_message?: string;
  severity: string;
  is_read: boolean;
  action_required: boolean;
  created_at: string;
}

interface SupervisionStatus {
  hasWali: boolean;
  canCommunicate: boolean;
  familyApproved: boolean;
  supervisionRequired: boolean;
}

export const useFamilySupervision = () => {
  console.log('🔗 useFamilySupervision hook init');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [notifications, setNotifications] = useState<FamilyNotification[]>([]);
  const [supervisionStatus, setSupervisionStatus] = useState<SupervisionStatus>({
    hasWali: false,
    canCommunicate: false,
    familyApproved: false,
    supervisionRequired: true
  });
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialized) return; // Prevent multiple initializations
    
    console.log('🚀 useFamilySupervision useEffect triggered');
    setInitialized(true);
    
    const initializeData = async () => {
      try {
        await Promise.all([loadFamilyData(), loadNotifications()]);
      } catch (error) {
        console.error('❌ Error initializing family supervision data:', error);
        setLoading(false);
      }
    };

    initializeData();
    
    // Subscribe to real-time notifications
    const subscription = supabase
      .channel('family-notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'family_notifications' 
      }, (payload) => {
        setNotifications(prev => [payload.new as FamilyNotification, ...prev]);
        
        // Show critical notifications immediately
        if (payload.new.severity === 'critical') {
          toast({
            title: "⚠️ Alerte Familiale Critique",
            description: payload.new.content,
            variant: "destructive"
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [initialized]);

  const loadFamilyData = async () => {
    console.log('📊 loadFamilyData starting');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 loadFamilyData - user:', user?.id);
      if (!user) {
        console.log('❌ No user found, returning');
        return;
      }

      console.log('🔍 Querying family_members as wali...');
      // Check if user is a family member (invited as wali) OR has family members
      const { data: familyDataAsWali, error: waliError } = await supabase
        .from('family_members')
        .select('*')
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted')
        .order('created_at', { ascending: false });

      console.log('🔍 Querying family_members as user...');
      const { data: familyDataAsUser, error: userError } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('👨‍👩‍👧‍👦 loadFamilyData - wali data:', familyDataAsWali, 'user data:', familyDataAsUser);
      console.log('❓ Errors:', { waliError, userError });

      if (waliError && userError) {
        console.log('❌ Both queries failed');
        throw waliError || userError;
      }

      // Combine both results
      const allFamilyData = [...(familyDataAsWali || []), ...(familyDataAsUser || [])];
      console.log('📋 Combined family data:', allFamilyData);
      setFamilyMembers(allFamilyData);
      
      // Check user's gender to determine if family supervision is needed
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', user.id)
        .maybeSingle();

      // Only women need family supervision according to Islamic principles
      const isUserFemale = userProfile?.gender === 'female';
      
      // Check supervision status - user is a wali if they appear in invited_user_id
      const isWali = (familyDataAsWali || []).length > 0;
      const hasWali = isWali || (familyDataAsUser || []).some(member => member.is_wali);
      
      console.log('🛡️ loadFamilyData - isWali:', isWali, 'hasWali:', hasWali, 'isUserFemale:', isUserFemale);
      
      const newStatus = {
        ...supervisionStatus,
        hasWali,
        // For men: can always communicate (no family supervision required)
        // For women: can communicate if has wali OR is a wali herself
        // For walis: can always communicate
        canCommunicate: !isUserFemale || hasWali || isWali,
        familyApproved: !isUserFemale || hasWali || isWali,
        supervisionRequired: isUserFemale && !hasWali && !isWali
      };
      
      console.log('🔄 Setting new supervision status:', newStatus);
      setSupervisionStatus(newStatus);

    } catch (error) {
      console.error('❌ Error loading family data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données familiales",
        variant: "destructive"
      });
    } finally {
      console.log('✅ loadFamilyData completed, setting loading to false');
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('family_notifications')
        .select(`
          *,
          family_member:family_members!inner(user_id, full_name, relationship)
        `)
        .eq('family_member.user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const checkMatchSupervision = async (matchId: string): Promise<boolean> => {
    try {
      const { data: match, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (error) throw error;

      if (!match) return false;

      // Get profiles to check gender - only women need family supervision
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, gender')
        .in('user_id', [match.user1_id, match.user2_id]);

      if (profileError) throw profileError;

      // Check which users are female and need wali supervision
      const femaleUsers = profiles?.filter(profile => profile.gender === 'female').map(p => p.user_id) || [];
      
      if (femaleUsers.length === 0) {
        // No female users, no supervision needed
        return match.can_communicate;
      }

      // Check if all female users have wali configured
      const { data: femaleWalis } = await supabase
        .from('family_members')
        .select('user_id, is_wali')
        .in('user_id', femaleUsers)
        .eq('is_wali', true)
        .eq('invitation_status', 'accepted');

      const femaleUsersWithWali = new Set(femaleWalis?.map(w => w.user_id) || []);
      const allFemalesHaveWali = femaleUsers.every(userId => femaleUsersWithWali.has(userId));
      
      return allFemalesHaveWali && match.can_communicate;
    } catch (error) {
      console.error('Error checking match supervision:', error);
      return false;
    }
  };

  const requestFamilyApproval = async (matchId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get wali for current user
      const walis = familyMembers.filter(member => member.is_wali);
      
      if (walis.length === 0) {
        toast({
          title: "Wali requis",
          description: "Vous devez configurer un Wali pour procéder selon les principes islamiques",
          variant: "destructive"
        });
        return;
      }

      // Create notifications for all walis
      for (const wali of walis) {
        await supabase
          .from('family_notifications')
          .insert({
            family_member_id: wali.id,
            match_id: matchId,
            notification_type: 'match_started',
            content: `Nouveau match nécessitant votre approbation pour commencer la communication`,
            severity: 'high',
            action_required: true
          });
      }

      toast({
        title: "Demande envoyée",
        description: "Votre famille a été notifiée pour approuver cette communication",
      });

    } catch (error) {
      console.error('Error requesting family approval:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande d'approbation",
        variant: "destructive"
      });
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('family_notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notif => !notif.is_read);
  };

  const getCriticalNotifications = () => {
    return notifications.filter(notif => notif.severity === 'critical' && !notif.is_read);
  };

  return {
    familyMembers,
    notifications,
    supervisionStatus,
    loading,
    checkMatchSupervision,
    requestFamilyApproval,
    markNotificationAsRead,
    getUnreadNotifications,
    getCriticalNotifications,
    loadFamilyData,
    loadNotifications
  };
};