
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DocumentVerification } from '@/types/documents';
import { useToast } from '@/hooks/use-toast';

export const useDocumentVerification = (userId?: string) => {
  const [verifications, setVerifications] = useState<DocumentVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchVerifications = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_verifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching document verifications:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les vérifications de documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchVerifications();
    }
  }, [userId]);

  return {
    verifications,
    loading,
    refetchVerifications: fetchVerifications
  };
};
