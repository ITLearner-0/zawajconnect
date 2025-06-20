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
          occupation: string | null
          phone_verified: boolean | null
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
          occupation?: string | null
          phone_verified?: boolean | null
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
          occupation?: string | null
          phone_verified?: boolean | null
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
      wali_profiles: {
        Row: {
          availability_status: string | null
          chat_preferences: Json | null
          contact_information: string
          created_at: string | null
          first_name: string
          id: string
          is_verified: boolean | null
          last_active: string | null
          last_name: string
          managed_users: string[] | null
          relationship: string
          user_id: string
          verification_date: string | null
        }
        Insert: {
          availability_status?: string | null
          chat_preferences?: Json | null
          contact_information: string
          created_at?: string | null
          first_name: string
          id?: string
          is_verified?: boolean | null
          last_active?: string | null
          last_name: string
          managed_users?: string[] | null
          relationship: string
          user_id: string
          verification_date?: string | null
        }
        Update: {
          availability_status?: string | null
          chat_preferences?: Json | null
          contact_information?: string
          created_at?: string | null
          first_name?: string
          id?: string
          is_verified?: boolean | null
          last_active?: string | null
          last_name?: string
          managed_users?: string[] | null
          relationship?: string
          user_id?: string
          verification_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
