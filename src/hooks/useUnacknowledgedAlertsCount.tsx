import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnacknowledgedAlertsCount = () => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = async () => {
    try {
      const { count: alertCount, error } = await (supabase as any)
        .from('wali_admin_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('acknowledged', false);

      if (error) throw error;
      setCount(alertCount || 0);
    } catch (error) {
      console.error('Error fetching unacknowledged alerts count:', error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();

    // Configurer le realtime pour les mises à jour
    const channel = supabase
      .channel('wali-alerts-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wali_admin_alerts'
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { count, loading };
};
