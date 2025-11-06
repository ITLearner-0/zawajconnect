export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievement_unlocks: {
        Row: {
          achievement_id: string
          achievement_title: string
          id: string
          points_awarded: number
          rarity: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          achievement_title: string
          id?: string
          points_awarded?: number
          rarity: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          achievement_title?: string
          id?: string
          points_awarded?: number
          rarity?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      blocked_match_pairs: {
        Row: {
          blocked_at: string | null
          created_at: string | null
          end_reason: string | null
          id: string
          original_match_id: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          blocked_at?: string | null
          created_at?: string | null
          end_reason?: string | null
          id?: string
          original_match_id?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          blocked_at?: string | null
          created_at?: string | null
          end_reason?: string | null
          id?: string
          original_match_id?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_match_pairs_original_match_id_fkey"
            columns: ["original_match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      compatibility_questions: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean | null
          options: Json | null
          question_key: string
          question_text: string
          question_type: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          options?: Json | null
          question_key: string
          question_text: string
          question_type?: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          options?: Json | null
          question_key?: string
          question_text?: string
          question_type?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          can_read_messages: boolean | null
          can_send_messages: boolean | null
          created_at: string | null
          family_member_id: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          match_id: string
          participant_id: string
          participant_type: string
          user_id: string
        }
        Insert: {
          can_read_messages?: boolean | null
          can_send_messages?: boolean | null
          created_at?: string | null
          family_member_id?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          match_id: string
          participant_id: string
          participant_type: string
          user_id: string
        }
        Update: {
          can_read_messages?: boolean | null
          can_send_messages?: boolean | null
          created_at?: string | null
          family_member_id?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          match_id?: string
          participant_id?: string
          participant_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      family_access_audit: {
        Row: {
          access_granted: boolean
          access_timestamp: string
          access_type: string
          accessed_by: string
          family_member_id: string
          id: string
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          access_granted?: boolean
          access_timestamp?: string
          access_type: string
          accessed_by: string
          family_member_id: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          access_granted?: boolean
          access_timestamp?: string
          access_type?: string
          accessed_by?: string
          family_member_id?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Relationships: []
      }
      family_contact_audit_log: {
        Row: {
          access_details: Json
          access_timestamp: string
          accessed_by: string
          family_member_id: string
          id: string
        }
        Insert: {
          access_details: Json
          access_timestamp?: string
          accessed_by: string
          family_member_id: string
          id?: string
        }
        Update: {
          access_details?: Json
          access_timestamp?: string
          accessed_by?: string
          family_member_id?: string
          id?: string
        }
        Relationships: []
      }
      family_contact_secure: {
        Row: {
          access_count: number | null
          contact_visibility: string | null
          created_at: string | null
          encrypted_email: string | null
          encrypted_phone: string | null
          family_member_id: string
          id: string
          last_accessed_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_count?: number | null
          contact_visibility?: string | null
          created_at?: string | null
          encrypted_email?: string | null
          encrypted_phone?: string | null
          family_member_id: string
          id?: string
          last_accessed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_count?: number | null
          contact_visibility?: string | null
          created_at?: string | null
          encrypted_email?: string | null
          encrypted_phone?: string | null
          family_member_id?: string
          id?: string
          last_accessed_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_contact_secure_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: true
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_meetings: {
        Row: {
          created_at: string
          id: string
          match_id: string
          meeting_link: string | null
          meeting_type: string
          notes: string | null
          organizer_id: string
          scheduled_datetime: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          meeting_link?: string | null
          meeting_type?: string
          notes?: string | null
          organizer_id: string
          scheduled_datetime: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          meeting_link?: string | null
          meeting_type?: string
          notes?: string | null
          organizer_id?: string
          scheduled_datetime?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_meetings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          can_communicate: boolean | null
          can_view_profile: boolean | null
          created_at: string
          full_name: string
          id: string
          invitation_accepted_at: string | null
          invitation_sent_at: string | null
          invitation_status: string | null
          invitation_token: string | null
          invited_user_id: string | null
          is_wali: boolean | null
          relationship: string
          user_id: string
        }
        Insert: {
          can_communicate?: boolean | null
          can_view_profile?: boolean | null
          created_at?: string
          full_name: string
          id?: string
          invitation_accepted_at?: string | null
          invitation_sent_at?: string | null
          invitation_status?: string | null
          invitation_token?: string | null
          invited_user_id?: string | null
          is_wali?: boolean | null
          relationship: string
          user_id: string
        }
        Update: {
          can_communicate?: boolean | null
          can_view_profile?: boolean | null
          created_at?: string
          full_name?: string
          id?: string
          invitation_accepted_at?: string | null
          invitation_sent_at?: string | null
          invitation_status?: string | null
          invitation_token?: string | null
          invited_user_id?: string | null
          is_wali?: boolean | null
          relationship?: string
          user_id?: string
        }
        Relationships: []
      }
      family_notifications: {
        Row: {
          action_required: boolean
          content: string
          created_at: string
          family_member_id: string
          id: string
          is_read: boolean
          match_id: string
          notification_type: string
          original_message: string | null
          read_at: string | null
          severity: string
        }
        Insert: {
          action_required?: boolean
          content: string
          created_at?: string
          family_member_id: string
          id?: string
          is_read?: boolean
          match_id: string
          notification_type: string
          original_message?: string | null
          read_at?: string | null
          severity?: string
        }
        Update: {
          action_required?: boolean
          content?: string
          created_at?: string
          family_member_id?: string
          id?: string
          is_read?: boolean
          match_id?: string
          notification_type?: string
          original_message?: string | null
          read_at?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_notifications_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_notifications_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      family_operation_limits: {
        Row: {
          created_at: string | null
          id: string
          last_reset_at: string | null
          operation_count: number | null
          operation_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_reset_at?: string | null
          operation_count?: number | null
          operation_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_reset_at?: string | null
          operation_count?: number | null
          operation_type?: string
          user_id?: string
        }
        Relationships: []
      }
      family_reviews: {
        Row: {
          created_at: string
          family_member_id: string
          id: string
          match_id: string
          notes: string | null
          reviewed_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          family_member_id: string
          id?: string
          match_id: string
          notes?: string | null
          reviewed_at?: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          family_member_id?: string
          id?: string
          match_id?: string
          notes?: string | null
          reviewed_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_reviews_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_reviews_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      family_supervision_rules: {
        Row: {
          blocking: boolean
          created_at: string
          id: string
          is_active: boolean
          notify_family: boolean
          rule_description: string
          rule_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blocking?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          notify_family?: boolean
          rule_description: string
          rule_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blocking?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          notify_family?: boolean
          rule_description?: string
          rule_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      insight_actions: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      insights_analytics: {
        Row: {
          created_at: string | null
          export_count: number | null
          id: string
          last_viewed_at: string | null
          share_count: number | null
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          export_count?: number | null
          id?: string
          last_viewed_at?: string | null
          share_count?: number | null
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          export_count?: number | null
          id?: string
          last_viewed_at?: string | null
          share_count?: number | null
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      islamic_guidance: {
        Row: {
          author: string | null
          category: string
          content: string
          created_at: string
          featured: boolean | null
          id: string
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category: string
          content: string
          created_at?: string
          featured?: boolean | null
          id?: string
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string
          content?: string
          created_at?: string
          featured?: boolean | null
          id?: string
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      islamic_moderation_rules: {
        Row: {
          action: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          islamic_value: string
          keywords: Json
          rule_description: string
          rule_name: string
          severity: string
          updated_at: string
        }
        Insert: {
          action?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          islamic_value: string
          keywords?: Json
          rule_description: string
          rule_name: string
          severity?: string
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          islamic_value?: string
          keywords?: Json
          rule_description?: string
          rule_name?: string
          severity?: string
          updated_at?: string
        }
        Relationships: []
      }
      islamic_preferences: {
        Row: {
          beard_preference: string | null
          created_at: string
          desired_partner_sect: string | null
          halal_diet: boolean | null
          hijab_preference: string | null
          id: string
          importance_of_religion: string | null
          madhab: string | null
          prayer_frequency: string | null
          quran_reading: string | null
          sect: string | null
          smoking: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          beard_preference?: string | null
          created_at?: string
          desired_partner_sect?: string | null
          halal_diet?: boolean | null
          hijab_preference?: string | null
          id?: string
          importance_of_religion?: string | null
          madhab?: string | null
          prayer_frequency?: string | null
          quran_reading?: string | null
          sect?: string | null
          smoking?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          beard_preference?: string | null
          created_at?: string
          desired_partner_sect?: string | null
          halal_diet?: boolean | null
          hijab_preference?: string | null
          id?: string
          importance_of_religion?: string | null
          madhab?: string | null
          prayer_frequency?: string | null
          quran_reading?: string | null
          sect?: string | null
          smoking?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          can_communicate: boolean
          conversation_ended_at: string | null
          conversation_started_at: string | null
          conversation_status: string | null
          created_at: string
          end_message: string | null
          end_reason: string | null
          ended_by: string | null
          family_approved: boolean | null
          family_notes: string | null
          family_reviewed_at: string | null
          family_reviewer_id: string | null
          family_supervision_required: boolean
          family1_approved: boolean | null
          family2_approved: boolean | null
          id: string
          is_mutual: boolean | null
          match_score: number | null
          supervision_started_at: string | null
          updated_at: string
          user1_id: string
          user1_liked: boolean | null
          user2_id: string
          user2_liked: boolean | null
        }
        Insert: {
          can_communicate?: boolean
          conversation_ended_at?: string | null
          conversation_started_at?: string | null
          conversation_status?: string | null
          created_at?: string
          end_message?: string | null
          end_reason?: string | null
          ended_by?: string | null
          family_approved?: boolean | null
          family_notes?: string | null
          family_reviewed_at?: string | null
          family_reviewer_id?: string | null
          family_supervision_required?: boolean
          family1_approved?: boolean | null
          family2_approved?: boolean | null
          id?: string
          is_mutual?: boolean | null
          match_score?: number | null
          supervision_started_at?: string | null
          updated_at?: string
          user1_id: string
          user1_liked?: boolean | null
          user2_id: string
          user2_liked?: boolean | null
        }
        Update: {
          can_communicate?: boolean
          conversation_ended_at?: string | null
          conversation_started_at?: string | null
          conversation_status?: string | null
          created_at?: string
          end_message?: string | null
          end_reason?: string | null
          ended_by?: string | null
          family_approved?: boolean | null
          family_notes?: string | null
          family_reviewed_at?: string | null
          family_reviewer_id?: string | null
          family_supervision_required?: boolean
          family1_approved?: boolean | null
          family2_approved?: boolean | null
          id?: string
          is_mutual?: boolean | null
          match_score?: number | null
          supervision_started_at?: string | null
          updated_at?: string
          user1_id?: string
          user1_liked?: boolean | null
          user2_id?: string
          user2_liked?: boolean | null
        }
        Relationships: []
      }
      matching_history: {
        Row: {
          avg_compatibility_score: number | null
          created_at: string
          id: string
          matched_profiles: Json
          preferences_used: Json
          search_timestamp: string
          total_matches: number
          user_id: string
        }
        Insert: {
          avg_compatibility_score?: number | null
          created_at?: string
          id?: string
          matched_profiles?: Json
          preferences_used?: Json
          search_timestamp?: string
          total_matches?: number
          user_id: string
        }
        Update: {
          avg_compatibility_score?: number | null
          created_at?: string
          id?: string
          matched_profiles?: Json
          preferences_used?: Json
          search_timestamp?: string
          total_matches?: number
          user_id?: string
        }
        Relationships: []
      }
      matching_preferences: {
        Row: {
          created_at: string
          family_approval_required: boolean
          id: string
          min_compatibility: number
          updated_at: string
          use_ai_scoring: boolean
          user_id: string
          weight_cultural: number
          weight_islamic: number
          weight_personality: number
        }
        Insert: {
          created_at?: string
          family_approval_required?: boolean
          id?: string
          min_compatibility?: number
          updated_at?: string
          use_ai_scoring?: boolean
          user_id: string
          weight_cultural?: number
          weight_islamic?: number
          weight_personality?: number
        }
        Update: {
          created_at?: string
          family_approval_required?: boolean
          id?: string
          min_compatibility?: number
          updated_at?: string
          use_ai_scoring?: boolean
          user_id?: string
          weight_cultural?: number
          weight_islamic?: number
          weight_personality?: number
        }
        Relationships: []
      }
      message_suggestions: {
        Row: {
          created_at: string
          id: string
          improvement_reason: string
          islamic_guidance: string | null
          original_message: string
          suggested_message: string
          used: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          improvement_reason: string
          islamic_guidance?: string | null
          original_message: string
          suggested_message: string
          used?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          improvement_reason?: string
          islamic_guidance?: string | null
          original_message?: string
          suggested_message?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          family_member_id: string | null
          id: string
          is_family_supervised: boolean | null
          is_read: boolean | null
          match_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          family_member_id?: string | null
          id?: string
          is_family_supervised?: boolean | null
          is_read?: boolean | null
          match_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          family_member_id?: string | null
          id?: string
          is_family_supervised?: boolean | null
          is_read?: boolean | null
          match_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_logs: {
        Row: {
          action_taken: string
          ai_analysis: Json
          confidence_score: number
          content_analyzed: string
          created_at: string
          human_decision: string | null
          human_reviewed: boolean
          human_reviewer_id: string | null
          id: string
          match_id: string | null
          message_id: string | null
          rules_triggered: Json
          user_id: string
        }
        Insert: {
          action_taken: string
          ai_analysis?: Json
          confidence_score?: number
          content_analyzed: string
          created_at?: string
          human_decision?: string | null
          human_reviewed?: boolean
          human_reviewer_id?: string | null
          id?: string
          match_id?: string | null
          message_id?: string | null
          rules_triggered?: Json
          user_id: string
        }
        Update: {
          action_taken?: string
          ai_analysis?: Json
          confidence_score?: number
          content_analyzed?: string
          created_at?: string
          human_decision?: string | null
          human_reviewed?: boolean
          human_reviewer_id?: string | null
          id?: string
          match_id?: string | null
          message_id?: string | null
          rules_triggered?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_logs_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_logs_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_rules: {
        Row: {
          action: string
          created_at: string | null
          description: string
          id: string
          is_active: boolean
          pattern: string
          rule_type: string
          severity: string
          updated_at: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          description: string
          id?: string
          is_active?: boolean
          pattern: string
          rule_type: string
          severity: string
          updated_at?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean
          pattern?: string
          rule_type?: string
          severity?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      moderation_violations: {
        Row: {
          action_taken: string
          auto_moderated_content: string | null
          content: string
          content_type: string
          created_at: string | null
          id: string
          rules_violated: string[]
          severity: string
          user_id: string
        }
        Insert: {
          action_taken: string
          auto_moderated_content?: string | null
          content: string
          content_type: string
          created_at?: string | null
          id?: string
          rules_violated: string[]
          severity: string
          user_id: string
        }
        Update: {
          action_taken?: string
          auto_moderated_content?: string | null
          content?: string
          content_type?: string
          created_at?: string | null
          id?: string
          rules_violated?: string[]
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          related_match_id: string | null
          related_user_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          related_match_id?: string | null
          related_user_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          related_match_id?: string | null
          related_user_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_match_id_fkey"
            columns: ["related_match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_settings: {
        Row: {
          allow_family_involvement: boolean | null
          allow_messages_from: string | null
          allow_profile_views: boolean | null
          contact_visibility: string | null
          created_at: string
          id: string
          last_seen_visibility: string | null
          photo_visibility: string | null
          profile_visibility: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_family_involvement?: boolean | null
          allow_messages_from?: string | null
          allow_profile_views?: boolean | null
          contact_visibility?: string | null
          created_at?: string
          id?: string
          last_seen_visibility?: string | null
          photo_visibility?: string | null
          profile_visibility?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_family_involvement?: boolean | null
          allow_messages_from?: string | null
          allow_profile_views?: boolean | null
          contact_visibility?: string | null
          created_at?: string
          id?: string
          last_seen_visibility?: string | null
          photo_visibility?: string | null
          profile_visibility?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_comparison_history: {
        Row: {
          compared_profile_ids: string[]
          comparison_name: string | null
          created_at: string
          id: string
          is_favorite: boolean
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          compared_profile_ids: string[]
          comparison_name?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          compared_profile_ids?: string[]
          comparison_name?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_matching_data: {
        Row: {
          age: number | null
          avatar_url: string | null
          city_only: string | null
          created_at: string | null
          education_level: string | null
          gender: string | null
          id: string
          interests: string[] | null
          is_visible: boolean | null
          looking_for: string | null
          profession_category: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          city_only?: string | null
          created_at?: string | null
          education_level?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          is_visible?: boolean | null
          looking_for?: string | null
          profession_category?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          city_only?: string | null
          created_at?: string | null
          education_level?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          is_visible?: boolean | null
          looking_for?: string | null
          profession_category?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_matching_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profile_views: {
        Row: {
          created_at: string
          id: string
          viewed_id: string
          viewer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          viewed_id: string
          viewer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          viewed_id?: string
          viewer_id?: string
        }
        Relationships: []
      }
      profile_views_daily: {
        Row: {
          created_at: string
          id: string
          user_id: string
          viewed_at: string
          viewed_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          viewed_at?: string
          viewed_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          viewed_at?: string
          viewed_user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          education: string | null
          full_name: string | null
          gender: string | null
          id: string
          interests: string[] | null
          location: string | null
          looking_for: string | null
          phone: string | null
          profession: string | null
          terms_accepted_at: string | null
          terms_version: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          education?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          location?: string | null
          looking_for?: string | null
          phone?: string | null
          profession?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          education?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          location?: string | null
          looking_for?: string | null
          phone?: string | null
          profession?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          id: string
          report_type: string
          reported_user_id: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          id?: string
          report_type: string
          reported_user_id: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          report_type?: string
          reported_user_id?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action_type: string
          additional_data: Json | null
          created_at: string | null
          id: string
          ip_address: unknown
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          additional_data?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          additional_data?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          description: string
          event_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          resolved: boolean | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          event_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resolved?: boolean | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          event_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resolved?: boolean | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sensitive_operations_audit: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown
          operation_type: string
          record_id: string | null
          risk_level: string
          success: boolean
          table_accessed: string
          user_agent: string | null
          user_id: string
          verification_score: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown
          operation_type: string
          record_id?: string | null
          risk_level?: string
          success?: boolean
          table_accessed: string
          user_agent?: string | null
          user_id: string
          verification_score?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown
          operation_type?: string
          record_id?: string | null
          risk_level?: string
          success?: boolean
          table_accessed?: string
          user_agent?: string | null
          user_id?: string
          verification_score?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          braintree_customer_id: string | null
          braintree_subscription_id: string | null
          created_at: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          notes: string | null
          paypal_subscription_id: string | null
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          braintree_customer_id?: string | null
          braintree_subscription_id?: string | null
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          paypal_subscription_id?: string | null
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          braintree_customer_id?: string | null
          braintree_subscription_id?: string | null
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          paypal_subscription_id?: string | null
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      supervision_logs: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          family_member_id: string
          id: string
          supervised_user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          family_member_id: string
          id?: string
          supervised_user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          family_member_id?: string
          id?: string
          supervised_user_id?: string
        }
        Relationships: []
      }
      user_compatibility_responses: {
        Row: {
          created_at: string
          id: string
          question_key: string
          response_value: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_key: string
          response_value: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_key?: string
          response_value?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progression: {
        Row: {
          achievements_count: number
          created_at: string | null
          current_level: number
          id: string
          insights_viewed_count: number
          last_level_up_at: string | null
          total_points: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievements_count?: number
          created_at?: string | null
          current_level?: number
          id?: string
          insights_viewed_count?: number
          last_level_up_at?: string | null
          total_points?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievements_count?: number
          created_at?: string | null
          current_level?: number
          id?: string
          insights_viewed_count?: number
          last_level_up_at?: string | null
          total_points?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          expires_at: string | null
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          age_max: number | null
          age_min: number | null
          auto_accept_matches: boolean | null
          created_at: string
          email_notifications: boolean | null
          id: string
          match_notifications: boolean | null
          message_notifications: boolean | null
          profile_visibility: string | null
          search_distance: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          auto_accept_matches?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          match_notifications?: boolean | null
          message_notifications?: boolean | null
          profile_visibility?: string | null
          search_distance?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          auto_accept_matches?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          match_notifications?: boolean | null
          message_notifications?: boolean | null
          profile_visibility?: string | null
          search_distance?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_status: {
        Row: {
          admin_notes: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          reason: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_verifications: {
        Row: {
          created_at: string
          email_verified: boolean | null
          family_verified: boolean | null
          id: string
          id_verified: boolean | null
          phone_verified: boolean | null
          updated_at: string
          user_id: string
          verification_documents: string[] | null
          verification_notes: string | null
          verification_score: number | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          email_verified?: boolean | null
          family_verified?: boolean | null
          id?: string
          id_verified?: boolean | null
          phone_verified?: boolean | null
          updated_at?: string
          user_id: string
          verification_documents?: string[] | null
          verification_notes?: string | null
          verification_score?: number | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          email_verified?: boolean | null
          family_verified?: boolean | null
          id?: string
          id_verified?: boolean | null
          phone_verified?: boolean | null
          updated_at?: string
          user_id?: string
          verification_documents?: string[] | null
          verification_notes?: string | null
          verification_score?: number | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_verifications_profiles"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      video_calls: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string | null
          id: string
          match_id: string
          meeting_id: string
          meeting_link: string
          participants: string[] | null
          platform: string
          scheduled_end_time: string | null
          start_time: string
          status: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          match_id: string
          meeting_id: string
          meeting_link: string
          participants?: string[] | null
          platform?: string
          scheduled_end_time?: string | null
          start_time?: string
          status?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          match_id?: string
          meeting_id?: string
          meeting_link?: string
          participants?: string[] | null
          platform?: string
          scheduled_end_time?: string | null
          start_time?: string
          status?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_calls_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_family_invitation: {
        Args: { p_invitation_token: string; p_invited_user_id: string }
        Returns: boolean
      }
      can_access_family_contact_info: {
        Args: {
          family_member_invited_user_id: string
          family_member_user_id: string
        }
        Returns: boolean
      }
      can_access_family_contact_info_secure: {
        Args: {
          family_member_invited_user_id: string
          family_member_user_id: string
        }
        Returns: boolean
      }
      can_access_match_security_definer: {
        Args: { match_user1_id: string; match_user2_id: string }
        Returns: boolean
      }
      can_view_matching_data: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      can_view_moderation_log: {
        Args: { log_user_id: string }
        Returns: boolean
      }
      can_view_public_profile: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      check_family_access_rate_limit: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      check_family_operation_limit: {
        Args: {
          p_daily_limit?: number
          p_operation_type: string
          p_user_id: string
        }
        Returns: boolean
      }
      check_family_supervision_setup: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      check_incomplete_profiles_and_notify: { Args: never; Returns: undefined }
      check_profile_view_rate_limit: {
        Args: { viewer_uuid: string }
        Returns: boolean
      }
      check_subscription_expiry_and_notify: { Args: never; Returns: undefined }
      check_unread_messages_and_notify: { Args: never; Returns: undefined }
      create_family_invitation: {
        Args: {
          p_email: string
          p_full_name: string
          p_is_wali?: boolean
          p_relationship: string
          p_user_id: string
        }
        Returns: string
      }
      create_notification: {
        Args: {
          match_id?: string
          notification_content: string
          notification_title: string
          notification_type: string
          sender_user_id?: string
          target_user_id: string
        }
        Returns: string
      }
      get_current_user_role_secure: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_family_approval_status: {
        Args: { match_uuid: string }
        Returns: string
      }
      get_family_contact_secure: {
        Args: { family_member_uuid: string }
        Returns: {
          contact_type: string
          contact_value: string
          last_verified: string
        }[]
      }
      get_family_member_contact_secure: {
        Args: { member_id: string }
        Returns: {
          can_view_basic_info: boolean
          full_name: string
          id: string
          relationship: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_subscription_safe: {
        Args: { target_user_id: string }
        Returns: {
          created_at: string
          expires_at: string
          id: string
          plan_type: string
          status: string
          updated_at: string
          user_id: string
        }[]
      }
      get_user_verification_status_secure: {
        Args: { target_user_id: string }
        Returns: {
          email_verified: boolean
          id_verified: boolean
          verification_score: number
        }[]
      }
      has_family_relationship_security_definer: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      has_family_supervision: { Args: { user_uuid: string }; Returns: boolean }
      has_previous_conversation: {
        Args: { u1_id: string; u2_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_family_operation_count: {
        Args: { p_operation_type: string; p_user_id: string }
        Returns: undefined
      }
      increment_insight_views: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_family_supervised: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      is_family_wali: { Args: { profile_user_id: string }; Returns: boolean }
      is_matched_user: { Args: { profile_user_id: string }; Returns: boolean }
      is_own_profile: { Args: { profile_user_id: string }; Returns: boolean }
      is_premium_active: { Args: { user_uuid: string }; Returns: boolean }
      is_premium_user: { Args: never; Returns: boolean }
      is_user_in_active_conversation: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      log_profile_access: {
        Args: {
          p_risk_level?: string
          p_viewed_id: string
          p_viewer_id: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          p_description: string
          p_event_type: string
          p_metadata?: Json
          p_severity: string
          p_user_id: string
        }
        Returns: string
      }
      migrate_family_contact_data_secure: { Args: never; Returns: undefined }
      send_match_suggestions_batch: { Args: never; Returns: undefined }
      send_monthly_newsletter: { Args: never; Returns: undefined }
      send_weekly_tips_batch: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "moderator", "user"],
    },
  },
} as const
