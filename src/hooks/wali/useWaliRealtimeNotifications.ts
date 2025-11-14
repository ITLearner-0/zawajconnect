import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';

export const useWaliRealtimeNotifications = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check if user is admin
    const checkAdminAndSubscribe = async () => {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      const isAdmin = roleData?.role === 'admin' || roleData?.role === 'super_admin';
      if (!isAdmin) return;

      // Subscribe to new wali registrations
      const registrationsChannel = supabase
        .channel('wali-registrations-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'wali_registrations',
          },
          (payload) => {
            logger.realtime.log('New Wali registration received:', payload);
            const registration = payload.new as any;
            
            toast({
              title: '🆕 Nouvelle inscription Wali',
              description: `${registration.first_name} ${registration.last_name} a soumis une demande d'inscription.`,
              duration: 8000,
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'wali_registrations',
            filter: 'status=eq.pending',
          },
          (payload) => {
            const oldData = payload.old as any;
            const newData = payload.new as any;
            
            // Only notify if status changed to pending (resubmission)
            if (oldData.status !== 'pending' && newData.status === 'pending') {
              toast({
                title: '🔄 Inscription Wali mise à jour',
                description: `${newData.first_name} ${newData.last_name} a resoumis sa demande.`,
                duration: 6000,
              });
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            logger.realtime.log('Subscribed to wali registrations');
            setIsConnected(true);
          }
        });

      // Subscribe to critical wali alerts
      const alertsChannel = supabase
        .channel('wali-alerts-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'wali_monitoring_alerts',
          },
          (payload) => {
            logger.realtime.log('New Wali alert received:', payload);
            const alert = payload.new as any;
            
            // Only show toast for high and critical alerts
            if (alert.risk_level === 'high' || alert.risk_level === 'critical') {
              const emoji = alert.risk_level === 'critical' ? '🚨' : '⚠️';
              const title = alert.risk_level === 'critical' 
                ? 'Alerte CRITIQUE Wali' 
                : 'Alerte Importante Wali';
              
              toast({
                title: `${emoji} ${title}`,
                description: alert.alert_type.replace('_', ' ').toUpperCase(),
                variant: 'destructive',
                duration: 10000,
              });
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            logger.realtime.log('Subscribed to wali alerts');
          }
        });

      // Cleanup on unmount
      return () => {
        logger.realtime.log('Unsubscribing from wali realtime channels');
        supabase.removeChannel(registrationsChannel);
        supabase.removeChannel(alertsChannel);
        setIsConnected(false);
      };
    };

    checkAdminAndSubscribe();
  }, [user, toast]);

  return { isConnected };
};
