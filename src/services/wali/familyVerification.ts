
import { supabase } from '@/integrations/supabase/client';

export interface FamilyRelationshipVerification {
  id: string;
  wali_id: string;
  managed_user_id: string;
  relationship_type: 'father' | 'brother' | 'uncle' | 'grandfather' | 'other';
  verification_method: 'document' | 'witness' | 'community' | 'self_declaration';
  verification_status: 'pending' | 'verified' | 'rejected' | 'requires_review';
  documents_submitted: string[];
  witness_contacts?: string[];
  community_references?: string[];
  verification_notes: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface VerificationDocument {
  type: 'birth_certificate' | 'family_tree' | 'id_documents' | 'marriage_certificate' | 'other';
  url: string;
  description: string;
  uploaded_at: string;
}

export class FamilyVerificationService {
  static async submitVerification(data: {
    wali_id: string;
    managed_user_id: string;
    relationship_type: string;
    verification_method: string;
    documents?: VerificationDocument[];
    witness_contacts?: string[];
    community_references?: string[];
    verification_notes: string;
  }): Promise<{ success: boolean; error?: string; verificationId?: string }> {
    try {
      const { data: verification, error } = await (supabase as any)
        .from('family_relationship_verifications')
        .insert({
          wali_id: data.wali_id,
          managed_user_id: data.managed_user_id,
          relationship_type: data.relationship_type,
          verification_method: data.verification_method,
          documents_submitted: data.documents?.map(d => d.url) || [],
          witness_contacts: data.witness_contacts || [],
          community_references: data.community_references || [],
          verification_notes: data.verification_notes,
          verification_status: 'pending'
        } as any)
        .select('id')
        .single();

      if (error) throw error;

      return { success: true, verificationId: verification.id };
    } catch (error: any) {
      console.error('Error submitting family verification:', error);
      return { success: false, error: error.message };
    }
  }

  static async getVerificationStatus(wali_id: string, managed_user_id: string): Promise<FamilyRelationshipVerification | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('family_relationship_verifications')
        .select('*')
        .eq('wali_id', wali_id)
        .eq('managed_user_id', managed_user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as FamilyRelationshipVerification) || null;
    } catch (error) {
      console.error('Error fetching verification status:', error);
      return null;
    }
  }

  static async updateVerificationStatus(
    verificationId: string,
    status: string,
    notes?: string,
    verifiedBy?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await (supabase as any)
        .from('family_relationship_verifications')
        .update({
          verification_status: status,
          verification_notes: notes,
          verified_by: verifiedBy,
          verified_at: status === 'verified' ? new Date().toISOString() : null
        } as any)
        .eq('id', verificationId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error updating verification status:', error);
      return { success: false, error: error.message };
    }
  }
}
