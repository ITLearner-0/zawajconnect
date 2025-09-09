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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
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
            foreignKeyName: "conversation_participants_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members_safe"
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
          email: string | null
          full_name: string
          id: string
          invitation_accepted_at: string | null
          invitation_sent_at: string | null
          invitation_status: string | null
          invitation_token: string | null
          invited_user_id: string | null
          is_wali: boolean | null
          phone: string | null
          relationship: string
          user_id: string
        }
        Insert: {
          can_communicate?: boolean | null
          can_view_profile?: boolean | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          invitation_accepted_at?: string | null
          invitation_sent_at?: string | null
          invitation_status?: string | null
          invitation_token?: string | null
          invited_user_id?: string | null
          is_wali?: boolean | null
          phone?: string | null
          relationship: string
          user_id: string
        }
        Update: {
          can_communicate?: boolean | null
          can_view_profile?: boolean | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          invitation_accepted_at?: string | null
          invitation_sent_at?: string | null
          invitation_status?: string | null
          invitation_token?: string | null
          invited_user_id?: string | null
          is_wali?: boolean | null
          phone?: string | null
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
            foreignKeyName: "family_notifications_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members_safe"
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
            foreignKeyName: "family_reviews_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members_safe"
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
          created_at: string
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
          user1_id: string
          user1_liked: boolean | null
          user2_id: string
          user2_liked: boolean | null
        }
        Insert: {
          can_communicate?: boolean
          created_at?: string
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
          user1_id: string
          user1_liked?: boolean | null
          user2_id: string
          user2_liked?: boolean | null
        }
        Update: {
          can_communicate?: boolean
          created_at?: string
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
            foreignKeyName: "messages_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members_safe"
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
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          notes: string | null
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
    }
    Views: {
      family_members_safe: {
        Row: {
          can_communicate: boolean | null
          can_view_profile: boolean | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          invitation_accepted_at: string | null
          invitation_sent_at: string | null
          invitation_status: string | null
          invitation_token: string | null
          invited_user_id: string | null
          is_wali: boolean | null
          phone: string | null
          relationship: string | null
          user_id: string | null
        }
        Insert: {
          can_communicate?: boolean | null
          can_view_profile?: boolean | null
          created_at?: string | null
          email?: never
          full_name?: string | null
          id?: string | null
          invitation_accepted_at?: string | null
          invitation_sent_at?: string | null
          invitation_status?: string | null
          invitation_token?: never
          invited_user_id?: never
          is_wali?: boolean | null
          phone?: never
          relationship?: string | null
          user_id?: string | null
        }
        Update: {
          can_communicate?: boolean | null
          can_view_profile?: boolean | null
          created_at?: string | null
          email?: never
          full_name?: string | null
          id?: string | null
          invitation_accepted_at?: string | null
          invitation_sent_at?: string | null
          invitation_status?: string | null
          invitation_token?: never
          invited_user_id?: never
          is_wali?: boolean | null
          phone?: never
          relationship?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      check_family_supervision_setup: {
        Args: { user_uuid: string }
        Returns: boolean
      }
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
      get_family_approval_status: {
        Args: { match_uuid: string }
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_family_supervision: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
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
