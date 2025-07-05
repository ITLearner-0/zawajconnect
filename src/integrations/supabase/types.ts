export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_requests: {
        Row: {
          id: string
          message: string | null
          recipient_id: string
          request_type: string | null
          requested_at: string | null
          requester_id: string
          reviewed_at: string | null
          status: string | null
          suggested_time: string | null
          wali_id: string | null
          wali_notes: string | null
        }
        Insert: {
          id?: string
          message?: string | null
          recipient_id: string
          request_type?: string | null
          requested_at?: string | null
          requester_id: string
          reviewed_at?: string | null
          status?: string | null
          suggested_time?: string | null
          wali_id?: string | null
          wali_notes?: string | null
        }
        Update: {
          id?: string
          message?: string | null
          recipient_id?: string
          request_type?: string | null
          requested_at?: string | null
          requester_id?: string
          reviewed_at?: string | null
          status?: string | null
          suggested_time?: string | null
          wali_id?: string | null
          wali_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_requests_wali_id_fkey"
            columns: ["wali_id"]
            isOneToOne: false
            referencedRelation: "wali_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compatibility_results: {
        Row: {
          answers: Json
          created_at: string | null
          dealbreakers: Json | null
          id: string
          preferences: Json | null
          score: number
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string | null
          dealbreakers?: Json | null
          id?: string
          preferences?: Json | null
          score: number
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string | null
          dealbreakers?: Json | null
          id?: string
          preferences?: Json | null
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      compatibility_scores: {
        Row: {
          calculated_at: string | null
          compatibility_factors: Json | null
          created_at: string | null
          id: string
          score: number
          user1_id: string
          user2_id: string
        }
        Insert: {
          calculated_at?: string | null
          compatibility_factors?: Json | null
          created_at?: string | null
          id?: string
          score: number
          user1_id: string
          user2_id: string
        }
        Update: {
          calculated_at?: string | null
          compatibility_factors?: Json | null
          created_at?: string | null
          id?: string
          score?: number
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      content_flags: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          flag_type: string
          flagged_by: string
          id: string
          notes: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          flag_type: string
          flagged_by: string
          id?: string
          notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          flag_type?: string
          flagged_by?: string
          id?: string
          notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          encryption_enabled: boolean | null
          id: string
          participants: string[]
          retention_policy: Json | null
          wali_supervised: boolean | null
        }
        Insert: {
          created_at?: string | null
          encryption_enabled?: boolean | null
          id?: string
          participants: string[]
          retention_policy?: Json | null
          wali_supervised?: boolean | null
        }
        Update: {
          created_at?: string | null
          encryption_enabled?: boolean | null
          id?: string
          participants?: string[]
          retention_policy?: Json | null
          wali_supervised?: boolean | null
        }
        Relationships: []
      }
      document_verifications: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string | null
          submitted_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string | null
          submitted_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string | null
          submitted_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_relationship_verifications: {
        Row: {
          community_references: string[] | null
          created_at: string
          documents_submitted: string[] | null
          id: string
          managed_user_id: string
          relationship_type: string
          updated_at: string
          verification_method: string
          verification_notes: string
          verification_status: string
          verified_at: string | null
          verified_by: string | null
          wali_id: string
          witness_contacts: string[] | null
        }
        Insert: {
          community_references?: string[] | null
          created_at?: string
          documents_submitted?: string[] | null
          id?: string
          managed_user_id: string
          relationship_type: string
          updated_at?: string
          verification_method: string
          verification_notes?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          wali_id: string
          witness_contacts?: string[] | null
        }
        Update: {
          community_references?: string[] | null
          created_at?: string
          documents_submitted?: string[] | null
          id?: string
          managed_user_id?: string
          relationship_type?: string
          updated_at?: string
          verification_method?: string
          verification_notes?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          wali_id?: string
          witness_contacts?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "family_relationship_verifications_wali_id_fkey"
            columns: ["wali_id"]
            isOneToOne: false
            referencedRelation: "wali_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          match_user_id: string
          message: string | null
          notification_type: string
          score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          match_user_id: string
          message?: string | null
          notification_type: string
          score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          match_user_id?: string
          message?: string | null
          notification_type?: string
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: string[] | null
          content: string
          content_flags: Json | null
          conversation_id: string
          created_at: string | null
          encrypted: boolean | null
          id: string
          is_filtered: boolean | null
          is_read: boolean | null
          is_wali_visible: boolean | null
          iv: string | null
          sender_id: string
        }
        Insert: {
          attachments?: string[] | null
          content: string
          content_flags?: Json | null
          conversation_id: string
          created_at?: string | null
          encrypted?: boolean | null
          id?: string
          is_filtered?: boolean | null
          is_read?: boolean | null
          is_wali_visible?: boolean | null
          iv?: string | null
          sender_id: string
        }
        Update: {
          attachments?: string[] | null
          content?: string
          content_flags?: Json | null
          conversation_id?: string
          created_at?: string | null
          encrypted?: boolean | null
          id?: string
          is_filtered?: boolean | null
          is_read?: boolean | null
          is_wali_visible?: boolean | null
          iv?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about_me: string | null
          birth_date: string | null
          blocked_users: string[] | null
          created_at: string | null
          document_verification_notes: string | null
          document_verification_reviewed_at: string | null
          document_verification_reviewed_by: string | null
          document_verification_status: string | null
          document_verification_submitted_at: string | null
          document_verification_type: string | null
          education_level: string | null
          email_verified: boolean | null
          first_name: string | null
          gallery: string[] | null
          gender: string | null
          id: string
          id_verified: boolean | null
          is_verified: boolean | null
          is_visible: boolean | null
          last_name: string | null
          location: string | null
          madhab: string | null
          occupation: string | null
          phone_verified: boolean | null
          photo_blur_settings: Json | null
          polygamy_stance: string | null
          prayer_frequency: string | null
          privacy_settings: Json | null
          profile_picture: string | null
          religious_practice_level: string | null
          updated_at: string | null
          verification_document_url: string | null
          wali_contact: string | null
          wali_name: string | null
          wali_relationship: string | null
          wali_verified: boolean | null
        }
        Insert: {
          about_me?: string | null
          birth_date?: string | null
          blocked_users?: string[] | null
          created_at?: string | null
          document_verification_notes?: string | null
          document_verification_reviewed_at?: string | null
          document_verification_reviewed_by?: string | null
          document_verification_status?: string | null
          document_verification_submitted_at?: string | null
          document_verification_type?: string | null
          education_level?: string | null
          email_verified?: boolean | null
          first_name?: string | null
          gallery?: string[] | null
          gender?: string | null
          id: string
          id_verified?: boolean | null
          is_verified?: boolean | null
          is_visible?: boolean | null
          last_name?: string | null
          location?: string | null
          madhab?: string | null
          occupation?: string | null
          phone_verified?: boolean | null
          photo_blur_settings?: Json | null
          polygamy_stance?: string | null
          prayer_frequency?: string | null
          privacy_settings?: Json | null
          profile_picture?: string | null
          religious_practice_level?: string | null
          updated_at?: string | null
          verification_document_url?: string | null
          wali_contact?: string | null
          wali_name?: string | null
          wali_relationship?: string | null
          wali_verified?: boolean | null
        }
        Update: {
          about_me?: string | null
          birth_date?: string | null
          blocked_users?: string[] | null
          created_at?: string | null
          document_verification_notes?: string | null
          document_verification_reviewed_at?: string | null
          document_verification_reviewed_by?: string | null
          document_verification_status?: string | null
          document_verification_submitted_at?: string | null
          document_verification_type?: string | null
          education_level?: string | null
          email_verified?: boolean | null
          first_name?: string | null
          gallery?: string[] | null
          gender?: string | null
          id?: string
          id_verified?: boolean | null
          is_verified?: boolean | null
          is_visible?: boolean | null
          last_name?: string | null
          location?: string | null
          madhab?: string | null
          occupation?: string | null
          phone_verified?: boolean | null
          photo_blur_settings?: Json | null
          polygamy_stance?: string | null
          prayer_frequency?: string | null
          privacy_settings?: Json | null
          profile_picture?: string | null
          religious_practice_level?: string | null
          updated_at?: string | null
          verification_document_url?: string | null
          wali_contact?: string | null
          wali_name?: string | null
          wali_relationship?: string | null
          wali_verified?: boolean | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          attempt_count: number | null
          blocked_until: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          action_type: string
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          action_type?: string
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          risk_level: string | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          risk_level?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          risk_level?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          details: Json | null
          device_fingerprint: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          device_fingerprint?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          device_fingerprint?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string | null
          id: string
          ip_address: unknown | null
          last_activity: string | null
          session_token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          session_token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          session_token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      video_calls: {
        Row: {
          conversation_id: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          initiator_id: string
          receiver_id: string
          started_at: string | null
          wali_present: boolean | null
        }
        Insert: {
          conversation_id: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          initiator_id: string
          receiver_id: string
          started_at?: string | null
          wali_present?: boolean | null
        }
        Update: {
          conversation_id?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          initiator_id?: string
          receiver_id?: string
          started_at?: string | null
          wali_present?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "video_calls_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      wali_delegations: {
        Row: {
          activated_at: string | null
          created_at: string
          delegate_wali_id: string
          delegation_type: string
          end_date: string
          id: string
          managed_user_id: string
          permissions: Json
          primary_wali_id: string
          reason: string
          revoked_at: string | null
          start_date: string
          status: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          delegate_wali_id: string
          delegation_type: string
          end_date: string
          id?: string
          managed_user_id: string
          permissions?: Json
          primary_wali_id: string
          reason: string
          revoked_at?: string | null
          start_date: string
          status?: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          delegate_wali_id?: string
          delegation_type?: string
          end_date?: string
          id?: string
          managed_user_id?: string
          permissions?: Json
          primary_wali_id?: string
          reason?: string
          revoked_at?: string | null
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "wali_delegations_delegate_wali_id_fkey"
            columns: ["delegate_wali_id"]
            isOneToOne: false
            referencedRelation: "wali_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wali_delegations_primary_wali_id_fkey"
            columns: ["primary_wali_id"]
            isOneToOne: false
            referencedRelation: "wali_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wali_filters: {
        Row: {
          created_at: string
          filter_config: Json
          filter_name: string
          filter_type: string
          id: string
          is_active: boolean
          updated_at: string
          wali_id: string
        }
        Insert: {
          created_at?: string
          filter_config?: Json
          filter_name: string
          filter_type: string
          id?: string
          is_active?: boolean
          updated_at?: string
          wali_id: string
        }
        Update: {
          created_at?: string
          filter_config?: Json
          filter_name?: string
          filter_type?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          wali_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wali_filters_wali_id_fkey"
            columns: ["wali_id"]
            isOneToOne: false
            referencedRelation: "wali_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wali_invitations: {
        Row: {
          confirmed_at: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invitation_token: string
          managed_user_id: string
          sent_at: string | null
          status: string | null
          wali_profile_id: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invitation_token: string
          managed_user_id: string
          sent_at?: string | null
          status?: string | null
          wali_profile_id?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invitation_token?: string
          managed_user_id?: string
          sent_at?: string | null
          status?: string | null
          wali_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wali_invitations_wali_profile_id_fkey"
            columns: ["wali_profile_id"]
            isOneToOne: false
            referencedRelation: "wali_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wali_onboarding_progress: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          id: string
          module_id: string
          progress_percentage: number
          quiz_score: number | null
          started_at: string | null
          status: string
          updated_at: string
          wali_id: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id: string
          progress_percentage?: number
          quiz_score?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          wali_id: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id?: string
          progress_percentage?: number
          quiz_score?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          wali_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wali_onboarding_progress_wali_id_fkey"
            columns: ["wali_id"]
            isOneToOne: false
            referencedRelation: "wali_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wali_profiles: {
        Row: {
          availability_status: string | null
          chat_preferences: Json | null
          confirmed_at: string | null
          contact_information: string
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          invitation_sent_at: string | null
          invitation_status: string | null
          invitation_token: string | null
          is_verified: boolean | null
          last_active: string | null
          last_name: string
          managed_users: string[] | null
          phone: string | null
          registration_id: string | null
          relationship: string
          supervision_level: string | null
          supervision_settings: Json | null
          user_id: string
          verification_date: string | null
        }
        Insert: {
          availability_status?: string | null
          chat_preferences?: Json | null
          confirmed_at?: string | null
          contact_information: string
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          invitation_sent_at?: string | null
          invitation_status?: string | null
          invitation_token?: string | null
          is_verified?: boolean | null
          last_active?: string | null
          last_name: string
          managed_users?: string[] | null
          phone?: string | null
          registration_id?: string | null
          relationship: string
          supervision_level?: string | null
          supervision_settings?: Json | null
          user_id: string
          verification_date?: string | null
        }
        Update: {
          availability_status?: string | null
          chat_preferences?: Json | null
          confirmed_at?: string | null
          contact_information?: string
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          invitation_sent_at?: string | null
          invitation_status?: string | null
          invitation_token?: string | null
          is_verified?: boolean | null
          last_active?: string | null
          last_name?: string
          managed_users?: string[] | null
          phone?: string | null
          registration_id?: string | null
          relationship?: string
          supervision_level?: string | null
          supervision_settings?: Json | null
          user_id?: string
          verification_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wali_profiles_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "wali_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      wali_registrations: {
        Row: {
          contact_phone: string
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          managed_user_emails: string[] | null
          notes: string | null
          password_hash: string
          relationship_type: string
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          contact_phone: string
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          managed_user_emails?: string[] | null
          notes?: string | null
          password_hash: string
          relationship_type: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          contact_phone?: string
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          managed_user_emails?: string[] | null
          notes?: string | null
          password_hash?: string
          relationship_type?: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      confirm_wali_invitation: {
        Args: { token: string; confirming_user_id: string }
        Returns: boolean
      }
      ensure_user_has_role: {
        Args: {
          user_uuid: string
          user_role?: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      generate_wali_invitation: {
        Args: { wali_user_id: string; managed_user_email: string }
        Returns: {
          invitation_token: string
          invitation_id: string
        }[]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      link_wali_to_user: {
        Args: { wali_user_id: string; managed_user_email: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_user_id: string
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_success?: boolean
          p_risk_level?: string
          p_details?: Json
        }
        Returns: undefined
      }
      update_session_activity: {
        Args: { session_token: string }
        Returns: boolean
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
