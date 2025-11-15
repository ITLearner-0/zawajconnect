import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  admin_name: string;
  action_type: string;
  registration_id: string | null;
  registration_name: string | null;
  target_user_id: string | null;
  action_details: Record<string, any>;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

export interface AuditFilters {
  search?: string;
  actionType?: string;
  adminUserId?: string;
  registrationId?: string;
  startDate?: Date;
  endDate?: Date;
  successOnly?: boolean;
}

export const useWaliAuditTrail = (filters?: AuditFilters) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = (supabase as any)
        .from('wali_audit_trail_with_details')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.actionType) {
        query = query.eq('action_type', filters.actionType);
      }

      if (filters?.adminUserId) {
        query = query.eq('admin_user_id', filters.adminUserId);
      }

      if (filters?.registrationId) {
        query = query.eq('registration_id', filters.registrationId);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      if (filters?.successOnly) {
        query = query.eq('success', true);
      }

      const { data, error: fetchError } = await query.limit(500);

      if (fetchError) throw fetchError;

      let filteredData = data || [];

      // Client-side search filter
      if (filters?.search && filteredData.length > 0) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter((log: AuditLogEntry) =>
          log.admin_name?.toLowerCase().includes(searchLower) ||
          log.registration_name?.toLowerCase().includes(searchLower) ||
          log.action_type?.toLowerCase().includes(searchLower) ||
          JSON.stringify(log.action_details).toLowerCase().includes(searchLower)
        );
      }

      setLogs(filteredData);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const logAction = useCallback(async (params: {
    actionType: string;
    registrationId?: string;
    targetUserId?: string;
    actionDetails?: Record<string, any>;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    success?: boolean;
    errorMessage?: string;
  }) => {
    try {
      const { data, error } = await (supabase as any).rpc('log_wali_admin_action', {
        p_action_type: params.actionType,
        p_registration_id: params.registrationId || null,
        p_target_user_id: params.targetUserId || null,
        p_action_details: params.actionDetails || {},
        p_old_values: params.oldValues || null,
        p_new_values: params.newValues || null,
        p_success: params.success ?? true,
        p_error_message: params.errorMessage || null
      });

      if (error) throw error;

      // Refresh logs after logging
      fetchAuditLogs();

      return data;
    } catch (err: any) {
      console.error('Error logging action:', err);
      return null;
    }
  }, [fetchAuditLogs]);

  return {
    logs,
    loading,
    error,
    refetch: fetchAuditLogs,
    logAction
  };
};
