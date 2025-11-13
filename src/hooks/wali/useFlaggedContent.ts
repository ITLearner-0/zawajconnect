
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FlaggedItem, Message } from '@/types/wali';
import { useToast } from '../use-toast';

export const useFlaggedContent = (waliId: string) => {
  const [flaggedContent, setFlaggedContent] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch flagged content
  const fetchFlaggedContent = useCallback(async () => {
    if (!waliId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First get conversations this wali is responsible for
      const { data: waliProfile, error: waliError } = await (supabase as any)
        .from('wali_profiles')
        .select('managed_users')
        .eq('user_id', waliId)
        .single();

      if (waliError) {
        throw waliError;
      }

      const managedUsers = (waliProfile as any)?.managed_users;
      if (!managedUsers || !managedUsers.length) {
        setFlaggedContent([]);
        setLoading(false);
        return;
      }

      // Now get flagged content related to these users
      const { data: flags, error: flagsError } = await (supabase as any)
        .from('content_flags')
        .select('*')
        .in('flagged_by', managedUsers)
        .order('created_at', { ascending: false });

      if (flagsError) {
        throw flagsError;
      }

      // Process the data to match our FlaggedItem type
      const processedFlags: FlaggedItem[] = flags.map((flag: any) => ({
        id: flag.id,
        message_id: flag.content_id,
        message: {} as Message, // We'll fetch this later if needed
        conversation_id: flag.content_type === 'message' ? 'unknown' : flag.content_id,
        flag_reason: flag.flag_type,
        flagged_at: flag.created_at,
        flagged_by: flag.flagged_by,
        status: flag.resolved ? 'resolved' : 'pending',
        resolved_at: flag.resolved_at,
        resolved_by: flag.resolved_by,
        resolution_notes: flag.notes
      }));

      setFlaggedContent(processedFlags);
    } catch (err: any) {
      console.error('Error fetching flagged content:', err);
      setError(err.message || 'Failed to load flagged content');
    } finally {
      setLoading(false);
    }
  }, [waliId]);

  useEffect(() => {
    fetchFlaggedContent();

    if (!waliId) {
      return undefined;
    }

    const channel = supabase
      .channel(`flagged_content_${waliId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'content_flags'
      }, () => {
        fetchFlaggedContent();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [waliId, fetchFlaggedContent]);

  // Resolve a flagged item
  const resolveFlaggedContent = async (flagId: string, notes: string = 'Resolved by wali') => {
    if (!waliId) return false;

    try {
      const { error: updateError } = await (supabase as any)
        .from('content_flags')
        .update({ 
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: waliId,
          notes: notes
        })
        .eq('id', flagId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setFlaggedContent(prev => 
        prev.map(item => 
          item.id === flagId 
            ? { 
                ...item, 
                status: 'resolved',
                resolved_at: new Date().toISOString(),
                resolved_by: waliId,
                resolution_notes: notes
              } 
            : item
        )
      );

      toast({
        title: "Flag Resolved",
        description: "You have resolved this flagged content",
        variant: "default"
      });

      return true;
    } catch (err: any) {
      console.error('Error resolving flagged content:', err);
      
      toast({
        title: "Action Failed",
        description: err.message || "Could not resolve this flag",
        variant: "destructive"
      });
      
      return false;
    }
  };

  return {
    flaggedContent,
    loading,
    error,
    resolveFlaggedContent,
    refreshFlaggedContent: fetchFlaggedContent
  };
};
