
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFlaggedContent = (userId: string | null) => {
  const { toast } = useToast();
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlaggedContent = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);

      try {
        // Fetch flagged content
        const { data, error } = await supabase
          .from('content_flags')
          .select('*')
          .eq('resolved', false)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching flagged content:', error);
          setError('Failed to load flagged content');
          return;
        }

        setFlaggedContent(data || []);
      } catch (err: any) {
        console.error('Error fetching flagged content:', err);
        setError(err.message || 'Failed to load flagged content');
      } finally {
        setLoading(false);
      }
    };

    fetchFlaggedContent();
  }, [userId, toast]);

  // Resolve flagged content
  const resolveFlaggedContent = async (contentId: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('content_flags')
        .update({ 
          resolved: true,
          resolved_by: userId,
          resolved_at: new Date().toISOString()
        })
        .eq('id', contentId);

      if (error) throw error;

      // Update local state
      setFlaggedContent(prev => prev.filter(item => item.id !== contentId));

      toast({
        title: "Content Resolved",
        description: "The flagged content has been marked as resolved",
      });

      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to resolve flagged content",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    flaggedContent,
    loading,
    error,
    resolveFlaggedContent
  };
};
