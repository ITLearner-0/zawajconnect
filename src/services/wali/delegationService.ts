
import { supabase } from '@/integrations/supabase/client';

export interface WaliDelegation {
  id: string;
  primary_wali_id: string;
  delegate_wali_id: string;
  managed_user_id: string;
  delegation_type: 'temporary' | 'emergency' | 'specific_event';
  permissions: DelegationPermission[];
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'active' | 'expired' | 'revoked';
  created_at: string;
  activated_at?: string;
  revoked_at?: string;
}

export interface DelegationPermission {
  action: 'approve_conversations' | 'reject_requests' | 'end_conversations' | 'access_messages' | 'make_decisions';
  granted: boolean;
}

export interface DelegateWali {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  relationship: string;
  contact_information: string;
  is_verified: boolean;
  availability_status: string;
}

export class DelegationService {
  static async createDelegation(data: {
    primary_wali_id: string;
    delegate_wali_id: string;
    managed_user_id: string;
    delegation_type: string;
    permissions: DelegationPermission[];
    start_date: string;
    end_date: string;
    reason: string;
  }): Promise<{ success: boolean; error?: string; delegationId?: string }> {
    try {
      const { data: delegation, error } = await (supabase as any)
        .from('wali_delegations')
        .insert([{
          primary_wali_id: data.primary_wali_id,
          delegate_wali_id: data.delegate_wali_id,
          managed_user_id: data.managed_user_id,
          delegation_type: data.delegation_type,
          permissions: data.permissions,
          start_date: data.start_date,
          end_date: data.end_date,
          reason: data.reason,
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) throw error;

      return { success: true, delegationId: delegation.id };
    } catch (error: any) {
      console.error('Error creating delegation:', error);
      return { success: false, error: error.message };
    }
  }

  static async getActiveDelegations(wali_id: string): Promise<WaliDelegation[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('wali_delegations')
        .select('*')
        .or(`primary_wali_id.eq.${wali_id},delegate_wali_id.eq.${wali_id}`)
        .eq('status', 'active')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString());

      if (error) throw error;
      return (data || []) as WaliDelegation[];
    } catch (error) {
      console.error('Error fetching active delegations:', error);
      return [];
    }
  }

  static async acceptDelegation(delegationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('wali_delegations')
        .update({
          status: 'active',
          activated_at: new Date().toISOString()
        })
        .eq('id', delegationId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error accepting delegation:', error);
      return { success: false, error: error.message };
    }
  }

  static async revokeDelegation(delegationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('wali_delegations')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString()
        })
        .eq('id', delegationId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error revoking delegation:', error);
      return { success: false, error: error.message };
    }
  }

  static async findAvailableWalis(excludeWaliId: string): Promise<DelegateWali[]> {
    try {
      const { data, error } = await supabase
        .from('wali_profiles')
        .select('id, user_id, first_name, last_name, relationship, contact_information, is_verified, availability_status')
        .neq('user_id', excludeWaliId)
        .eq('is_verified', true)
        .in('availability_status', ['online', 'away']);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error finding available walis:', error);
      return [];
    }
  }

  static hasPermission(delegation: WaliDelegation, action: string): boolean {
    const permission = delegation.permissions.find(p => p.action === action);
    return permission ? permission.granted : false;
  }

  static async checkExpiredDelegations(): Promise<void> {
    try {
      const { error } = await supabase
        .from('wali_delegations')
        .update({ status: 'expired' })
        .eq('status', 'active')
        .lt('end_date', new Date().toISOString());

      if (error) throw error;
    } catch (error) {
      console.error('Error checking expired delegations:', error);
    }
  }
}
