export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  auth: {
    Tables: {
      audit_log_entries: {
        Row: {
          created_at: string | null;
          id: string;
          instance_id: string | null;
          ip_address: string;
          payload: Json | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          instance_id?: string | null;
          ip_address?: string;
          payload?: Json | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          instance_id?: string | null;
          ip_address?: string;
          payload?: Json | null;
        };
        Relationships: [];
      };
      flow_state: {
        Row: {
          auth_code: string;
          auth_code_issued_at: string | null;
          authentication_method: string;
          code_challenge: string;
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"];
          created_at: string | null;
          id: string;
          provider_access_token: string | null;
          provider_refresh_token: string | null;
          provider_type: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          auth_code: string;
          auth_code_issued_at?: string | null;
          authentication_method: string;
          code_challenge: string;
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"];
          created_at?: string | null;
          id: string;
          provider_access_token?: string | null;
          provider_refresh_token?: string | null;
          provider_type: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          auth_code?: string;
          auth_code_issued_at?: string | null;
          authentication_method?: string;
          code_challenge?: string;
          code_challenge_method?: Database["auth"]["Enums"]["code_challenge_method"];
          created_at?: string | null;
          id?: string;
          provider_access_token?: string | null;
          provider_refresh_token?: string | null;
          provider_type?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      identities: {
        Row: {
          created_at: string | null;
          email: string | null;
          id: string;
          identity_data: Json;
          last_sign_in_at: string | null;
          provider: string;
          provider_id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          id?: string;
          identity_data: Json;
          last_sign_in_at?: string | null;
          provider: string;
          provider_id: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          id?: string;
          identity_data?: Json;
          last_sign_in_at?: string | null;
          provider?: string;
          provider_id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "identities_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      instances: {
        Row: {
          created_at: string | null;
          id: string;
          raw_base_config: string | null;
          updated_at: string | null;
          uuid: string | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          raw_base_config?: string | null;
          updated_at?: string | null;
          uuid?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          raw_base_config?: string | null;
          updated_at?: string | null;
          uuid?: string | null;
        };
        Relationships: [];
      };
      mfa_amr_claims: {
        Row: {
          authentication_method: string;
          created_at: string;
          id: string;
          session_id: string;
          updated_at: string;
        };
        Insert: {
          authentication_method: string;
          created_at: string;
          id: string;
          session_id: string;
          updated_at: string;
        };
        Update: {
          authentication_method?: string;
          created_at?: string;
          id?: string;
          session_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mfa_amr_claims_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      mfa_challenges: {
        Row: {
          created_at: string;
          factor_id: string;
          id: string;
          ip_address: unknown;
          otp_code: string | null;
          verified_at: string | null;
          web_authn_session_data: Json | null;
        };
        Insert: {
          created_at: string;
          factor_id: string;
          id: string;
          ip_address: unknown;
          otp_code?: string | null;
          verified_at?: string | null;
          web_authn_session_data?: Json | null;
        };
        Update: {
          created_at?: string;
          factor_id?: string;
          id?: string;
          ip_address?: unknown;
          otp_code?: string | null;
          verified_at?: string | null;
          web_authn_session_data?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "mfa_challenges_auth_factor_id_fkey";
            columns: ["factor_id"];
            isOneToOne: false;
            referencedRelation: "mfa_factors";
            referencedColumns: ["id"];
          },
        ];
      };
      mfa_factors: {
        Row: {
          created_at: string;
          factor_type: Database["auth"]["Enums"]["factor_type"];
          friendly_name: string | null;
          id: string;
          last_challenged_at: string | null;
          last_webauthn_challenge_data: Json | null;
          phone: string | null;
          secret: string | null;
          status: Database["auth"]["Enums"]["factor_status"];
          updated_at: string;
          user_id: string;
          web_authn_aaguid: string | null;
          web_authn_credential: Json | null;
        };
        Insert: {
          created_at: string;
          factor_type: Database["auth"]["Enums"]["factor_type"];
          friendly_name?: string | null;
          id: string;
          last_challenged_at?: string | null;
          last_webauthn_challenge_data?: Json | null;
          phone?: string | null;
          secret?: string | null;
          status: Database["auth"]["Enums"]["factor_status"];
          updated_at: string;
          user_id: string;
          web_authn_aaguid?: string | null;
          web_authn_credential?: Json | null;
        };
        Update: {
          created_at?: string;
          factor_type?: Database["auth"]["Enums"]["factor_type"];
          friendly_name?: string | null;
          id?: string;
          last_challenged_at?: string | null;
          last_webauthn_challenge_data?: Json | null;
          phone?: string | null;
          secret?: string | null;
          status?: Database["auth"]["Enums"]["factor_status"];
          updated_at?: string;
          user_id?: string;
          web_authn_aaguid?: string | null;
          web_authn_credential?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "mfa_factors_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      oauth_authorizations: {
        Row: {
          approved_at: string | null;
          authorization_code: string | null;
          authorization_id: string;
          client_id: string;
          code_challenge: string | null;
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"] | null;
          created_at: string;
          expires_at: string;
          id: string;
          redirect_uri: string;
          resource: string | null;
          response_type: Database["auth"]["Enums"]["oauth_response_type"];
          scope: string;
          state: string | null;
          status: Database["auth"]["Enums"]["oauth_authorization_status"];
          user_id: string | null;
        };
        Insert: {
          approved_at?: string | null;
          authorization_code?: string | null;
          authorization_id: string;
          client_id: string;
          code_challenge?: string | null;
          code_challenge_method?: Database["auth"]["Enums"]["code_challenge_method"] | null;
          created_at?: string;
          expires_at?: string;
          id: string;
          redirect_uri: string;
          resource?: string | null;
          response_type?: Database["auth"]["Enums"]["oauth_response_type"];
          scope: string;
          state?: string | null;
          status?: Database["auth"]["Enums"]["oauth_authorization_status"];
          user_id?: string | null;
        };
        Update: {
          approved_at?: string | null;
          authorization_code?: string | null;
          authorization_id?: string;
          client_id?: string;
          code_challenge?: string | null;
          code_challenge_method?: Database["auth"]["Enums"]["code_challenge_method"] | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          redirect_uri?: string;
          resource?: string | null;
          response_type?: Database["auth"]["Enums"]["oauth_response_type"];
          scope?: string;
          state?: string | null;
          status?: Database["auth"]["Enums"]["oauth_authorization_status"];
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "oauth_authorizations_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "oauth_clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "oauth_authorizations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      oauth_clients: {
        Row: {
          client_name: string | null;
          client_secret_hash: string | null;
          client_type: Database["auth"]["Enums"]["oauth_client_type"];
          client_uri: string | null;
          created_at: string;
          deleted_at: string | null;
          grant_types: string;
          id: string;
          logo_uri: string | null;
          redirect_uris: string;
          registration_type: Database["auth"]["Enums"]["oauth_registration_type"];
          updated_at: string;
        };
        Insert: {
          client_name?: string | null;
          client_secret_hash?: string | null;
          client_type?: Database["auth"]["Enums"]["oauth_client_type"];
          client_uri?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          grant_types: string;
          id: string;
          logo_uri?: string | null;
          redirect_uris: string;
          registration_type: Database["auth"]["Enums"]["oauth_registration_type"];
          updated_at?: string;
        };
        Update: {
          client_name?: string | null;
          client_secret_hash?: string | null;
          client_type?: Database["auth"]["Enums"]["oauth_client_type"];
          client_uri?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          grant_types?: string;
          id?: string;
          logo_uri?: string | null;
          redirect_uris?: string;
          registration_type?: Database["auth"]["Enums"]["oauth_registration_type"];
          updated_at?: string;
        };
        Relationships: [];
      };
      oauth_consents: {
        Row: {
          client_id: string;
          granted_at: string;
          id: string;
          revoked_at: string | null;
          scopes: string;
          user_id: string;
        };
        Insert: {
          client_id: string;
          granted_at?: string;
          id: string;
          revoked_at?: string | null;
          scopes: string;
          user_id: string;
        };
        Update: {
          client_id?: string;
          granted_at?: string;
          id?: string;
          revoked_at?: string | null;
          scopes?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "oauth_consents_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "oauth_clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "oauth_consents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      one_time_tokens: {
        Row: {
          created_at: string;
          id: string;
          relates_to: string;
          token_hash: string;
          token_type: Database["auth"]["Enums"]["one_time_token_type"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          relates_to: string;
          token_hash: string;
          token_type: Database["auth"]["Enums"]["one_time_token_type"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          relates_to?: string;
          token_hash?: string;
          token_type?: Database["auth"]["Enums"]["one_time_token_type"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "one_time_tokens_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      refresh_tokens: {
        Row: {
          created_at: string | null;
          id: number;
          instance_id: string | null;
          parent: string | null;
          revoked: boolean | null;
          session_id: string | null;
          token: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          instance_id?: string | null;
          parent?: string | null;
          revoked?: boolean | null;
          session_id?: string | null;
          token?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          instance_id?: string | null;
          parent?: string | null;
          revoked?: boolean | null;
          session_id?: string | null;
          token?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      saml_providers: {
        Row: {
          attribute_mapping: Json | null;
          created_at: string | null;
          entity_id: string;
          id: string;
          metadata_url: string | null;
          metadata_xml: string;
          name_id_format: string | null;
          sso_provider_id: string;
          updated_at: string | null;
        };
        Insert: {
          attribute_mapping?: Json | null;
          created_at?: string | null;
          entity_id: string;
          id: string;
          metadata_url?: string | null;
          metadata_xml: string;
          name_id_format?: string | null;
          sso_provider_id: string;
          updated_at?: string | null;
        };
        Update: {
          attribute_mapping?: Json | null;
          created_at?: string | null;
          entity_id?: string;
          id?: string;
          metadata_url?: string | null;
          metadata_xml?: string;
          name_id_format?: string | null;
          sso_provider_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "saml_providers_sso_provider_id_fkey";
            columns: ["sso_provider_id"];
            isOneToOne: false;
            referencedRelation: "sso_providers";
            referencedColumns: ["id"];
          },
        ];
      };
      saml_relay_states: {
        Row: {
          created_at: string | null;
          flow_state_id: string | null;
          for_email: string | null;
          id: string;
          redirect_to: string | null;
          request_id: string;
          sso_provider_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          flow_state_id?: string | null;
          for_email?: string | null;
          id: string;
          redirect_to?: string | null;
          request_id: string;
          sso_provider_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          flow_state_id?: string | null;
          for_email?: string | null;
          id?: string;
          redirect_to?: string | null;
          request_id?: string;
          sso_provider_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "saml_relay_states_flow_state_id_fkey";
            columns: ["flow_state_id"];
            isOneToOne: false;
            referencedRelation: "flow_state";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saml_relay_states_sso_provider_id_fkey";
            columns: ["sso_provider_id"];
            isOneToOne: false;
            referencedRelation: "sso_providers";
            referencedColumns: ["id"];
          },
        ];
      };
      schema_migrations: {
        Row: {
          version: string;
        };
        Insert: {
          version: string;
        };
        Update: {
          version?: string;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          aal: Database["auth"]["Enums"]["aal_level"] | null;
          created_at: string | null;
          factor_id: string | null;
          id: string;
          ip: unknown;
          not_after: string | null;
          oauth_client_id: string | null;
          refresh_token_counter: number | null;
          refresh_token_hmac_key: string | null;
          refreshed_at: string | null;
          tag: string | null;
          updated_at: string | null;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null;
          created_at?: string | null;
          factor_id?: string | null;
          id: string;
          ip?: unknown;
          not_after?: string | null;
          oauth_client_id?: string | null;
          refresh_token_counter?: number | null;
          refresh_token_hmac_key?: string | null;
          refreshed_at?: string | null;
          tag?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null;
          created_at?: string | null;
          factor_id?: string | null;
          id?: string;
          ip?: unknown;
          not_after?: string | null;
          oauth_client_id?: string | null;
          refresh_token_counter?: number | null;
          refresh_token_hmac_key?: string | null;
          refreshed_at?: string | null;
          tag?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_oauth_client_id_fkey";
            columns: ["oauth_client_id"];
            isOneToOne: false;
            referencedRelation: "oauth_clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      sso_domains: {
        Row: {
          created_at: string | null;
          domain: string;
          id: string;
          sso_provider_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          domain: string;
          id: string;
          sso_provider_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          domain?: string;
          id?: string;
          sso_provider_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sso_domains_sso_provider_id_fkey";
            columns: ["sso_provider_id"];
            isOneToOne: false;
            referencedRelation: "sso_providers";
            referencedColumns: ["id"];
          },
        ];
      };
      sso_providers: {
        Row: {
          created_at: string | null;
          disabled: boolean | null;
          id: string;
          resource_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          disabled?: boolean | null;
          id: string;
          resource_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          disabled?: boolean | null;
          id?: string;
          resource_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          aud: string | null;
          banned_until: string | null;
          confirmation_sent_at: string | null;
          confirmation_token: string | null;
          confirmed_at: string | null;
          created_at: string | null;
          deleted_at: string | null;
          email: string | null;
          email_change: string | null;
          email_change_confirm_status: number | null;
          email_change_sent_at: string | null;
          email_change_token_current: string | null;
          email_change_token_new: string | null;
          email_confirmed_at: string | null;
          encrypted_password: string | null;
          id: string;
          instance_id: string | null;
          invited_at: string | null;
          is_anonymous: boolean;
          is_sso_user: boolean;
          is_super_admin: boolean | null;
          last_sign_in_at: string | null;
          phone: string | null;
          phone_change: string | null;
          phone_change_sent_at: string | null;
          phone_change_token: string | null;
          phone_confirmed_at: string | null;
          raw_app_meta_data: Json | null;
          raw_user_meta_data: Json | null;
          reauthentication_sent_at: string | null;
          reauthentication_token: string | null;
          recovery_sent_at: string | null;
          recovery_token: string | null;
          role: string | null;
          updated_at: string | null;
        };
        Insert: {
          aud?: string | null;
          banned_until?: string | null;
          confirmation_sent_at?: string | null;
          confirmation_token?: string | null;
          confirmed_at?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          email_change?: string | null;
          email_change_confirm_status?: number | null;
          email_change_sent_at?: string | null;
          email_change_token_current?: string | null;
          email_change_token_new?: string | null;
          email_confirmed_at?: string | null;
          encrypted_password?: string | null;
          id: string;
          instance_id?: string | null;
          invited_at?: string | null;
          is_anonymous?: boolean;
          is_sso_user?: boolean;
          is_super_admin?: boolean | null;
          last_sign_in_at?: string | null;
          phone?: string | null;
          phone_change?: string | null;
          phone_change_sent_at?: string | null;
          phone_change_token?: string | null;
          phone_confirmed_at?: string | null;
          raw_app_meta_data?: Json | null;
          raw_user_meta_data?: Json | null;
          reauthentication_sent_at?: string | null;
          reauthentication_token?: string | null;
          recovery_sent_at?: string | null;
          recovery_token?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Update: {
          aud?: string | null;
          banned_until?: string | null;
          confirmation_sent_at?: string | null;
          confirmation_token?: string | null;
          confirmed_at?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          email_change?: string | null;
          email_change_confirm_status?: number | null;
          email_change_sent_at?: string | null;
          email_change_token_current?: string | null;
          email_change_token_new?: string | null;
          email_confirmed_at?: string | null;
          encrypted_password?: string | null;
          id?: string;
          instance_id?: string | null;
          invited_at?: string | null;
          is_anonymous?: boolean;
          is_sso_user?: boolean;
          is_super_admin?: boolean | null;
          last_sign_in_at?: string | null;
          phone?: string | null;
          phone_change?: string | null;
          phone_change_sent_at?: string | null;
          phone_change_token?: string | null;
          phone_confirmed_at?: string | null;
          raw_app_meta_data?: Json | null;
          raw_user_meta_data?: Json | null;
          reauthentication_sent_at?: string | null;
          reauthentication_token?: string | null;
          recovery_sent_at?: string | null;
          recovery_token?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      email: { Args: never; Returns: string };
      jwt: { Args: never; Returns: Json };
      role: { Args: never; Returns: string };
      uid: { Args: never; Returns: string };
    };
    Enums: {
      aal_level: "aal1" | "aal2" | "aal3";
      code_challenge_method: "s256" | "plain";
      factor_status: "unverified" | "verified";
      factor_type: "totp" | "webauthn" | "phone";
      oauth_authorization_status: "pending" | "approved" | "denied" | "expired";
      oauth_client_type: "public" | "confidential";
      oauth_registration_type: "dynamic" | "manual";
      oauth_response_type: "code";
      one_time_token_type:
        | "confirmation_token"
        | "reauthentication_token"
        | "recovery_token"
        | "email_change_token_new"
        | "email_change_token_current"
        | "phone_change_token";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  cron: {
    Tables: {
      job: {
        Row: {
          active: boolean;
          command: string;
          database: string;
          jobid: number;
          jobname: string | null;
          nodename: string;
          nodeport: number;
          schedule: string;
          username: string;
        };
        Insert: {
          active?: boolean;
          command: string;
          database?: string;
          jobid?: number;
          jobname?: string | null;
          nodename?: string;
          nodeport?: number;
          schedule: string;
          username?: string;
        };
        Update: {
          active?: boolean;
          command?: string;
          database?: string;
          jobid?: number;
          jobname?: string | null;
          nodename?: string;
          nodeport?: number;
          schedule?: string;
          username?: string;
        };
        Relationships: [];
      };
      job_run_details: {
        Row: {
          command: string | null;
          database: string | null;
          end_time: string | null;
          job_pid: number | null;
          jobid: number | null;
          return_message: string | null;
          runid: number;
          start_time: string | null;
          status: string | null;
          username: string | null;
        };
        Insert: {
          command?: string | null;
          database?: string | null;
          end_time?: string | null;
          job_pid?: number | null;
          jobid?: number | null;
          return_message?: string | null;
          runid?: number;
          start_time?: string | null;
          status?: string | null;
          username?: string | null;
        };
        Update: {
          command?: string | null;
          database?: string | null;
          end_time?: string | null;
          job_pid?: number | null;
          jobid?: number | null;
          return_message?: string | null;
          runid?: number;
          start_time?: string | null;
          status?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      alter_job: {
        Args: {
          active?: boolean;
          command?: string;
          database?: string;
          job_id: number;
          schedule?: string;
          username?: string;
        };
        Returns: undefined;
      };
      schedule:
        | {
            Args: { command: string; job_name: string; schedule: string };
            Returns: number;
          }
        | { Args: { command: string; schedule: string }; Returns: number };
      schedule_in_database: {
        Args: {
          active?: boolean;
          command: string;
          database: string;
          job_name: string;
          schedule: string;
          username?: string;
        };
        Returns: number;
      };
      unschedule: { Args: { job_name: string }; Returns: boolean } | { Args: { job_id: number }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  extensions: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      pg_stat_statements: {
        Row: {
          calls: number | null;
          dbid: unknown;
          jit_deform_count: number | null;
          jit_deform_time: number | null;
          jit_emission_count: number | null;
          jit_emission_time: number | null;
          jit_functions: number | null;
          jit_generation_time: number | null;
          jit_inlining_count: number | null;
          jit_inlining_time: number | null;
          jit_optimization_count: number | null;
          jit_optimization_time: number | null;
          local_blk_read_time: number | null;
          local_blk_write_time: number | null;
          local_blks_dirtied: number | null;
          local_blks_hit: number | null;
          local_blks_read: number | null;
          local_blks_written: number | null;
          max_exec_time: number | null;
          max_plan_time: number | null;
          mean_exec_time: number | null;
          mean_plan_time: number | null;
          min_exec_time: number | null;
          min_plan_time: number | null;
          minmax_stats_since: string | null;
          plans: number | null;
          query: string | null;
          queryid: number | null;
          rows: number | null;
          shared_blk_read_time: number | null;
          shared_blk_write_time: number | null;
          shared_blks_dirtied: number | null;
          shared_blks_hit: number | null;
          shared_blks_read: number | null;
          shared_blks_written: number | null;
          stats_since: string | null;
          stddev_exec_time: number | null;
          stddev_plan_time: number | null;
          temp_blk_read_time: number | null;
          temp_blk_write_time: number | null;
          temp_blks_read: number | null;
          temp_blks_written: number | null;
          toplevel: boolean | null;
          total_exec_time: number | null;
          total_plan_time: number | null;
          userid: unknown;
          wal_bytes: number | null;
          wal_fpi: number | null;
          wal_records: number | null;
        };
        Relationships: [];
      };
      pg_stat_statements_info: {
        Row: {
          dealloc: number | null;
          stats_reset: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      dearmor: { Args: { "": string }; Returns: string };
      gen_random_uuid: { Args: never; Returns: string };
      gen_salt: { Args: { "": string }; Returns: string };
      pg_stat_statements: {
        Args: { showtext: boolean };
        Returns: Record<string, unknown>[];
      };
      pg_stat_statements_info: { Args: never; Returns: Record<string, unknown> };
      pg_stat_statements_reset: {
        Args: {
          dbid?: unknown;
          minmax_only?: boolean;
          queryid?: number;
          userid?: unknown;
        };
        Returns: string;
      };
      pgp_armor_headers: {
        Args: { "": string };
        Returns: Record<string, unknown>[];
      };
      uuid_generate_v1: { Args: never; Returns: string };
      uuid_generate_v1mc: { Args: never; Returns: string };
      uuid_generate_v3: {
        Args: { name: string; namespace: string };
        Returns: string;
      };
      uuid_generate_v4: { Args: never; Returns: string };
      uuid_generate_v5: {
        Args: { name: string; namespace: string };
        Returns: string;
      };
      uuid_nil: { Args: never; Returns: string };
      uuid_ns_dns: { Args: never; Returns: string };
      uuid_ns_oid: { Args: never; Returns: string };
      uuid_ns_url: { Args: never; Returns: string };
      uuid_ns_x500: { Args: never; Returns: string };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  graphql: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      _internal_resolve: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query: string;
          variables?: Json;
        };
        Returns: Json;
      };
      comment_directive: { Args: { comment_: string }; Returns: Json };
      exception: { Args: { message: string }; Returns: string };
      get_schema_version: { Args: never; Returns: number };
      resolve: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  net: {
    Tables: {
      _http_response: {
        Row: {
          content: string | null;
          content_type: string | null;
          created: string;
          error_msg: string | null;
          headers: Json | null;
          id: number | null;
          status_code: number | null;
          timed_out: boolean | null;
        };
        Insert: {
          content?: string | null;
          content_type?: string | null;
          created?: string;
          error_msg?: string | null;
          headers?: Json | null;
          id?: number | null;
          status_code?: number | null;
          timed_out?: boolean | null;
        };
        Update: {
          content?: string | null;
          content_type?: string | null;
          created?: string;
          error_msg?: string | null;
          headers?: Json | null;
          id?: number | null;
          status_code?: number | null;
          timed_out?: boolean | null;
        };
        Relationships: [];
      };
      http_request_queue: {
        Row: {
          body: string | null;
          headers: Json | null;
          id: number;
          method: string;
          timeout_milliseconds: number;
          url: string;
        };
        Insert: {
          body?: string | null;
          headers?: Json | null;
          id?: number;
          method: string;
          timeout_milliseconds: number;
          url: string;
        };
        Update: {
          body?: string | null;
          headers?: Json | null;
          id?: number;
          method?: string;
          timeout_milliseconds?: number;
          url?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      _await_response: { Args: { request_id: number }; Returns: boolean };
      _encode_url_with_params_array: {
        Args: { params_array: string[]; url: string };
        Returns: string;
      };
      _http_collect_response: {
        Args: { async?: boolean; request_id: number };
        Returns: Database["net"]["CompositeTypes"]["http_response_result"];
        SetofOptions: {
          from: "*";
          to: "http_response_result";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      _urlencode_string: { Args: { string: string }; Returns: string };
      check_worker_is_up: { Args: never; Returns: undefined };
      http_collect_response: {
        Args: { async?: boolean; request_id: number };
        Returns: Database["net"]["CompositeTypes"]["http_response_result"];
        SetofOptions: {
          from: "*";
          to: "http_response_result";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      http_delete: {
        Args: {
          body?: Json;
          headers?: Json;
          params?: Json;
          timeout_milliseconds?: number;
          url: string;
        };
        Returns: number;
      };
      http_get: {
        Args: {
          headers?: Json;
          params?: Json;
          timeout_milliseconds?: number;
          url: string;
        };
        Returns: number;
      };
      http_post: {
        Args: {
          body?: Json;
          headers?: Json;
          params?: Json;
          timeout_milliseconds?: number;
          url: string;
        };
        Returns: number;
      };
      wait_until_running: { Args: never; Returns: undefined };
      wake: { Args: never; Returns: undefined };
      worker_restart: { Args: never; Returns: boolean };
    };
    Enums: {
      request_status: "PENDING" | "SUCCESS" | "ERROR";
    };
    CompositeTypes: {
      http_response: {
        status_code: number | null;
        headers: Json | null;
        body: string | null;
      };
      http_response_result: {
        status: Database["net"]["Enums"]["request_status"] | null;
        message: string | null;
        response: Database["net"]["CompositeTypes"]["http_response"] | null;
      };
    };
  };
  pgbouncer: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_auth: {
        Args: { p_usename: string };
        Returns: {
          password: string;
          username: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      achievement_unlocks: {
        Row: {
          achievement_id: string;
          achievement_title: string;
          id: string;
          points_awarded: number;
          rarity: string;
          unlocked_at: string | null;
          user_id: string;
        };
        Insert: {
          achievement_id: string;
          achievement_title: string;
          id?: string;
          points_awarded?: number;
          rarity: string;
          unlocked_at?: string | null;
          user_id: string;
        };
        Update: {
          achievement_id?: string;
          achievement_title?: string;
          id?: string;
          points_awarded?: number;
          rarity?: string;
          unlocked_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      admin_settings: {
        Row: {
          category: string;
          created_at: string | null;
          description: string | null;
          id: string;
          setting_key: string;
          setting_value: Json;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          category?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          setting_key: string;
          setting_value: Json;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          category?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          setting_key?: string;
          setting_value?: Json;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      blocked_match_pairs: {
        Row: {
          blocked_at: string | null;
          created_at: string | null;
          end_reason: string | null;
          id: string;
          original_match_id: string | null;
          user1_id: string;
          user2_id: string;
        };
        Insert: {
          blocked_at?: string | null;
          created_at?: string | null;
          end_reason?: string | null;
          id?: string;
          original_match_id?: string | null;
          user1_id: string;
          user2_id: string;
        };
        Update: {
          blocked_at?: string | null;
          created_at?: string | null;
          end_reason?: string | null;
          id?: string;
          original_match_id?: string | null;
          user1_id?: string;
          user2_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blocked_match_pairs_original_match_id_fkey";
            columns: ["original_match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      call_feedback: {
        Row: {
          audio_quality: string | null;
          call_id: string;
          comments: string | null;
          connection_stability: string | null;
          created_at: string;
          id: string;
          rating: number;
          technical_issues: string[] | null;
          user_id: string;
          video_quality: string | null;
        };
        Insert: {
          audio_quality?: string | null;
          call_id: string;
          comments?: string | null;
          connection_stability?: string | null;
          created_at?: string;
          id?: string;
          rating: number;
          technical_issues?: string[] | null;
          user_id: string;
          video_quality?: string | null;
        };
        Update: {
          audio_quality?: string | null;
          call_id?: string;
          comments?: string | null;
          connection_stability?: string | null;
          created_at?: string;
          id?: string;
          rating?: number;
          technical_issues?: string[] | null;
          user_id?: string;
          video_quality?: string | null;
        };
        Relationships: [];
      };
      chat_requests: {
        Row: {
          created_at: string | null;
          expires_at: string | null;
          id: string;
          message: string | null;
          recipient_id: string;
          requested_at: string | null;
          requester_id: string;
          responded_at: string | null;
          response_message: string | null;
          status: string | null;
          updated_at: string | null;
          wali_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          message?: string | null;
          recipient_id: string;
          requested_at?: string | null;
          requester_id: string;
          responded_at?: string | null;
          response_message?: string | null;
          status?: string | null;
          updated_at?: string | null;
          wali_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          message?: string | null;
          recipient_id?: string;
          requested_at?: string | null;
          requester_id?: string;
          responded_at?: string | null;
          response_message?: string | null;
          status?: string | null;
          updated_at?: string | null;
          wali_id?: string | null;
        };
        Relationships: [];
      };
      compatibility_questions: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          is_active: boolean | null;
          options: Json | null;
          question_key: string;
          question_text: string;
          question_type: string;
          updated_at: string;
          weight: number | null;
        };
        Insert: {
          category: string;
          created_at?: string;
          id?: string;
          is_active?: boolean | null;
          options?: Json | null;
          question_key: string;
          question_text: string;
          question_type?: string;
          updated_at?: string;
          weight?: number | null;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean | null;
          options?: Json | null;
          question_key?: string;
          question_text?: string;
          question_type?: string;
          updated_at?: string;
          weight?: number | null;
        };
        Relationships: [];
      };
      compatibility_results: {
        Row: {
          answers: Json | null;
          created_at: string | null;
          id: string;
          preferences: Json | null;
          score: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          answers?: Json | null;
          created_at?: string | null;
          id?: string;
          preferences?: Json | null;
          score: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          answers?: Json | null;
          created_at?: string | null;
          id?: string;
          preferences?: Json | null;
          score?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      content_flags: {
        Row: {
          content_id: string;
          content_type: string;
          created_at: string | null;
          flag_type: string;
          flagged_by: string;
          id: string;
          notes: string | null;
          resolved: boolean | null;
          resolved_at: string | null;
          resolved_by: string | null;
          severity: string;
          updated_at: string | null;
        };
        Insert: {
          content_id: string;
          content_type: string;
          created_at?: string | null;
          flag_type: string;
          flagged_by: string;
          id?: string;
          notes?: string | null;
          resolved?: boolean | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          severity: string;
          updated_at?: string | null;
        };
        Update: {
          content_id?: string;
          content_type?: string;
          created_at?: string | null;
          flag_type?: string;
          flagged_by?: string;
          id?: string;
          notes?: string | null;
          resolved?: boolean | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          severity?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      conversation_participants: {
        Row: {
          can_read_messages: boolean | null;
          can_send_messages: boolean | null;
          created_at: string | null;
          family_member_id: string | null;
          id: string;
          is_active: boolean | null;
          joined_at: string | null;
          match_id: string;
          participant_id: string;
          participant_type: string;
          user_id: string;
        };
        Insert: {
          can_read_messages?: boolean | null;
          can_send_messages?: boolean | null;
          created_at?: string | null;
          family_member_id?: string | null;
          id?: string;
          is_active?: boolean | null;
          joined_at?: string | null;
          match_id: string;
          participant_id: string;
          participant_type: string;
          user_id: string;
        };
        Update: {
          can_read_messages?: boolean | null;
          can_send_messages?: boolean | null;
          created_at?: string | null;
          family_member_id?: string | null;
          id?: string;
          is_active?: boolean | null;
          joined_at?: string | null;
          match_id?: string;
          participant_id?: string;
          participant_type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_participants_family_member_id_fkey";
            columns: ["family_member_id"];
            isOneToOne: false;
            referencedRelation: "family_members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_participants_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          created_at: string | null;
          encryption_enabled: boolean | null;
          id: string;
          participants: string[];
          updated_at: string | null;
          wali_supervised: boolean | null;
        };
        Insert: {
          created_at?: string | null;
          encryption_enabled?: boolean | null;
          id?: string;
          participants: string[];
          updated_at?: string | null;
          wali_supervised?: boolean | null;
        };
        Update: {
          created_at?: string | null;
          encryption_enabled?: boolean | null;
          id?: string;
          participants?: string[];
          updated_at?: string | null;
          wali_supervised?: boolean | null;
        };
        Relationships: [];
      };
      daily_quests: {
        Row: {
          created_at: string;
          description: string;
          icon: string;
          id: string;
          is_active: boolean;
          quest_type: string;
          target_value: number;
          title: string;
          updated_at: string;
          xp_reward: number;
        };
        Insert: {
          created_at?: string;
          description: string;
          icon?: string;
          id?: string;
          is_active?: boolean;
          quest_type: string;
          target_value?: number;
          title: string;
          updated_at?: string;
          xp_reward?: number;
        };
        Update: {
          created_at?: string;
          description?: string;
          icon?: string;
          id?: string;
          is_active?: boolean;
          quest_type?: string;
          target_value?: number;
          title?: string;
          updated_at?: string;
          xp_reward?: number;
        };
        Relationships: [];
      };
      email_ab_test_results: {
        Row: {
          ab_test_id: string;
          clicked_at: string | null;
          created_at: string;
          days_until_expiry: number;
          id: string;
          ip_address: unknown;
          opened_at: string | null;
          promo_code_used: string | null;
          renewal_amount: number | null;
          renewed_at: string | null;
          sent_at: string;
          subscription_id: string;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          ab_test_id: string;
          clicked_at?: string | null;
          created_at?: string;
          days_until_expiry: number;
          id?: string;
          ip_address?: unknown;
          opened_at?: string | null;
          promo_code_used?: string | null;
          renewal_amount?: number | null;
          renewed_at?: string | null;
          sent_at?: string;
          subscription_id: string;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          ab_test_id?: string;
          clicked_at?: string | null;
          created_at?: string;
          days_until_expiry?: number;
          id?: string;
          ip_address?: unknown;
          opened_at?: string | null;
          promo_code_used?: string | null;
          renewal_amount?: number | null;
          renewed_at?: string | null;
          sent_at?: string;
          subscription_id?: string;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "email_ab_test_results_ab_test_id_fkey";
            columns: ["ab_test_id"];
            isOneToOne: false;
            referencedRelation: "email_ab_test_analytics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "email_ab_test_results_ab_test_id_fkey";
            columns: ["ab_test_id"];
            isOneToOne: false;
            referencedRelation: "email_ab_tests";
            referencedColumns: ["id"];
          },
        ];
      };
      email_ab_tests: {
        Row: {
          created_at: string;
          created_by: string | null;
          cta_text: string;
          email_tone: string;
          id: string;
          is_active: boolean;
          notes: string | null;
          offer_percentage: number;
          promo_code: string;
          reminder_type: string;
          subject_line: string;
          test_name: string;
          traffic_allocation: number;
          variant_name: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          cta_text: string;
          email_tone: string;
          id?: string;
          is_active?: boolean;
          notes?: string | null;
          offer_percentage: number;
          promo_code: string;
          reminder_type: string;
          subject_line: string;
          test_name: string;
          traffic_allocation?: number;
          variant_name: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          cta_text?: string;
          email_tone?: string;
          id?: string;
          is_active?: boolean;
          notes?: string | null;
          offer_percentage?: number;
          promo_code?: string;
          reminder_type?: string;
          subject_line?: string;
          test_name?: string;
          traffic_allocation?: number;
          variant_name?: string;
        };
        Relationships: [];
      };
      family_access_audit: {
        Row: {
          access_granted: boolean;
          access_timestamp: string;
          access_type: string;
          accessed_by: string;
          family_member_id: string;
          id: string;
          ip_address: unknown;
          user_agent: string | null;
        };
        Insert: {
          access_granted?: boolean;
          access_timestamp?: string;
          access_type: string;
          accessed_by: string;
          family_member_id: string;
          id?: string;
          ip_address?: unknown;
          user_agent?: string | null;
        };
        Update: {
          access_granted?: boolean;
          access_timestamp?: string;
          access_type?: string;
          accessed_by?: string;
          family_member_id?: string;
          id?: string;
          ip_address?: unknown;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      family_contact_audit_log: {
        Row: {
          access_details: Json;
          access_timestamp: string;
          accessed_by: string;
          family_member_id: string;
          id: string;
        };
        Insert: {
          access_details: Json;
          access_timestamp?: string;
          accessed_by: string;
          family_member_id: string;
          id?: string;
        };
        Update: {
          access_details?: Json;
          access_timestamp?: string;
          accessed_by?: string;
          family_member_id?: string;
          id?: string;
        };
        Relationships: [];
      };
      family_contact_secure: {
        Row: {
          access_count: number | null;
          contact_visibility: string | null;
          created_at: string | null;
          encrypted_email: string | null;
          encrypted_phone: string | null;
          family_member_id: string;
          id: string;
          last_accessed_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          access_count?: number | null;
          contact_visibility?: string | null;
          created_at?: string | null;
          encrypted_email?: string | null;
          encrypted_phone?: string | null;
          family_member_id: string;
          id?: string;
          last_accessed_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          access_count?: number | null;
          contact_visibility?: string | null;
          created_at?: string | null;
          encrypted_email?: string | null;
          encrypted_phone?: string | null;
          family_member_id?: string;
          id?: string;
          last_accessed_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "family_contact_secure_family_member_id_fkey";
            columns: ["family_member_id"];
            isOneToOne: true;
            referencedRelation: "family_members";
            referencedColumns: ["id"];
          },
        ];
      };
      family_meetings: {
        Row: {
          created_at: string;
          id: string;
          match_id: string;
          meeting_link: string | null;
          meeting_type: string;
          notes: string | null;
          organizer_id: string;
          scheduled_datetime: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          match_id: string;
          meeting_link?: string | null;
          meeting_type?: string;
          notes?: string | null;
          organizer_id: string;
          scheduled_datetime: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          match_id?: string;
          meeting_link?: string | null;
          meeting_type?: string;
          notes?: string | null;
          organizer_id?: string;
          scheduled_datetime?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "family_meetings_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      family_members: {
        Row: {
          allow_video_calls: boolean | null;
          can_communicate: boolean | null;
          can_view_profile: boolean | null;
          created_at: string;
          full_name: string;
          id: string;
          invitation_accepted_at: string | null;
          invitation_sent_at: string | null;
          invitation_status: string | null;
          invitation_token: string | null;
          invited_user_id: string | null;
          is_wali: boolean | null;
          max_call_duration_minutes: number | null;
          notify_on_calls: boolean | null;
          relationship: string;
          require_call_approval: boolean | null;
          user_id: string;
        };
        Insert: {
          allow_video_calls?: boolean | null;
          can_communicate?: boolean | null;
          can_view_profile?: boolean | null;
          created_at?: string;
          full_name: string;
          id?: string;
          invitation_accepted_at?: string | null;
          invitation_sent_at?: string | null;
          invitation_status?: string | null;
          invitation_token?: string | null;
          invited_user_id?: string | null;
          is_wali?: boolean | null;
          max_call_duration_minutes?: number | null;
          notify_on_calls?: boolean | null;
          relationship: string;
          require_call_approval?: boolean | null;
          user_id: string;
        };
        Update: {
          allow_video_calls?: boolean | null;
          can_communicate?: boolean | null;
          can_view_profile?: boolean | null;
          created_at?: string;
          full_name?: string;
          id?: string;
          invitation_accepted_at?: string | null;
          invitation_sent_at?: string | null;
          invitation_status?: string | null;
          invitation_token?: string | null;
          invited_user_id?: string | null;
          is_wali?: boolean | null;
          max_call_duration_minutes?: number | null;
          notify_on_calls?: boolean | null;
          relationship?: string;
          require_call_approval?: boolean | null;
          user_id?: string;
        };
        Relationships: [];
      };
      family_notifications: {
        Row: {
          action_required: boolean;
          content: string;
          created_at: string;
          family_member_id: string;
          id: string;
          is_read: boolean;
          match_id: string;
          notification_type: string;
          original_message: string | null;
          read_at: string | null;
          severity: string;
        };
        Insert: {
          action_required?: boolean;
          content: string;
          created_at?: string;
          family_member_id: string;
          id?: string;
          is_read?: boolean;
          match_id: string;
          notification_type: string;
          original_message?: string | null;
          read_at?: string | null;
          severity?: string;
        };
        Update: {
          action_required?: boolean;
          content?: string;
          created_at?: string;
          family_member_id?: string;
          id?: string;
          is_read?: boolean;
          match_id?: string;
          notification_type?: string;
          original_message?: string | null;
          read_at?: string | null;
          severity?: string;
        };
        Relationships: [
          {
            foreignKeyName: "family_notifications_family_member_id_fkey";
            columns: ["family_member_id"];
            isOneToOne: false;
            referencedRelation: "family_members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "family_notifications_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      family_operation_limits: {
        Row: {
          created_at: string | null;
          id: string;
          last_reset_at: string | null;
          operation_count: number | null;
          operation_type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          last_reset_at?: string | null;
          operation_count?: number | null;
          operation_type: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          last_reset_at?: string | null;
          operation_count?: number | null;
          operation_type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      family_relationship_verifications: {
        Row: {
          community_references: string[] | null;
          created_at: string | null;
          documents_submitted: string[] | null;
          id: string;
          managed_user_id: string;
          relationship_type: string;
          verification_method: string;
          verification_notes: string;
          verification_status: string;
          verified_at: string | null;
          verified_by: string | null;
          wali_id: string;
          witness_contacts: string[] | null;
        };
        Insert: {
          community_references?: string[] | null;
          created_at?: string | null;
          documents_submitted?: string[] | null;
          id?: string;
          managed_user_id: string;
          relationship_type: string;
          verification_method: string;
          verification_notes: string;
          verification_status?: string;
          verified_at?: string | null;
          verified_by?: string | null;
          wali_id: string;
          witness_contacts?: string[] | null;
        };
        Update: {
          community_references?: string[] | null;
          created_at?: string | null;
          documents_submitted?: string[] | null;
          id?: string;
          managed_user_id?: string;
          relationship_type?: string;
          verification_method?: string;
          verification_notes?: string;
          verification_status?: string;
          verified_at?: string | null;
          verified_by?: string | null;
          wali_id?: string;
          witness_contacts?: string[] | null;
        };
        Relationships: [];
      };
      family_reviews: {
        Row: {
          created_at: string;
          family_member_id: string;
          id: string;
          match_id: string;
          notes: string | null;
          reviewed_at: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          family_member_id: string;
          id?: string;
          match_id: string;
          notes?: string | null;
          reviewed_at?: string;
          status: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          family_member_id?: string;
          id?: string;
          match_id?: string;
          notes?: string | null;
          reviewed_at?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "family_reviews_family_member_id_fkey";
            columns: ["family_member_id"];
            isOneToOne: false;
            referencedRelation: "family_members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "family_reviews_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      family_supervision_rules: {
        Row: {
          blocking: boolean;
          created_at: string;
          id: string;
          is_active: boolean;
          notify_family: boolean;
          rule_description: string;
          rule_name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          blocking?: boolean;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          notify_family?: boolean;
          rule_description: string;
          rule_name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          blocking?: boolean;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          notify_family?: boolean;
          rule_description?: string;
          rule_name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      favorite_tags: {
        Row: {
          created_at: string | null;
          favorite_id: string;
          id: string;
          tag_id: string;
        };
        Insert: {
          created_at?: string | null;
          favorite_id: string;
          id?: string;
          tag_id: string;
        };
        Update: {
          created_at?: string | null;
          favorite_id?: string;
          id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorite_tags_favorite_id_fkey";
            columns: ["favorite_id"];
            isOneToOne: false;
            referencedRelation: "profile_favorites";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorite_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "profile_tags";
            referencedColumns: ["id"];
          },
        ];
      };
      insight_actions: {
        Row: {
          action_type: string;
          created_at: string | null;
          id: string;
          metadata: Json | null;
          user_id: string;
        };
        Insert: {
          action_type: string;
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          user_id: string;
        };
        Update: {
          action_type?: string;
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          user_id?: string;
        };
        Relationships: [];
      };
      insights_analytics: {
        Row: {
          created_at: string | null;
          export_count: number | null;
          id: string;
          last_viewed_at: string | null;
          share_count: number | null;
          updated_at: string | null;
          user_id: string;
          view_count: number | null;
        };
        Insert: {
          created_at?: string | null;
          export_count?: number | null;
          id?: string;
          last_viewed_at?: string | null;
          share_count?: number | null;
          updated_at?: string | null;
          user_id: string;
          view_count?: number | null;
        };
        Update: {
          created_at?: string | null;
          export_count?: number | null;
          id?: string;
          last_viewed_at?: string | null;
          share_count?: number | null;
          updated_at?: string | null;
          user_id?: string;
          view_count?: number | null;
        };
        Relationships: [];
      };
      islamic_guidance: {
        Row: {
          author: string | null;
          category: string;
          content: string;
          created_at: string;
          featured: boolean | null;
          id: string;
          published: boolean | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          author?: string | null;
          category: string;
          content: string;
          created_at?: string;
          featured?: boolean | null;
          id?: string;
          published?: boolean | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          author?: string | null;
          category?: string;
          content?: string;
          created_at?: string;
          featured?: boolean | null;
          id?: string;
          published?: boolean | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      islamic_moderation_rules: {
        Row: {
          action: string;
          created_at: string;
          created_by: string | null;
          id: string;
          is_active: boolean;
          islamic_value: string;
          keywords: Json;
          rule_description: string;
          rule_name: string;
          severity: string;
          updated_at: string;
        };
        Insert: {
          action?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_active?: boolean;
          islamic_value: string;
          keywords?: Json;
          rule_description: string;
          rule_name: string;
          severity?: string;
          updated_at?: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_active?: boolean;
          islamic_value?: string;
          keywords?: Json;
          rule_description?: string;
          rule_name?: string;
          severity?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      islamic_preferences: {
        Row: {
          beard_preference: string | null;
          created_at: string;
          desired_partner_sect: string | null;
          halal_diet: boolean | null;
          hijab_preference: string | null;
          id: string;
          importance_of_religion: string | null;
          madhab: string | null;
          prayer_frequency: string | null;
          quran_reading: string | null;
          sect: string | null;
          smoking: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          beard_preference?: string | null;
          created_at?: string;
          desired_partner_sect?: string | null;
          halal_diet?: boolean | null;
          hijab_preference?: string | null;
          id?: string;
          importance_of_religion?: string | null;
          madhab?: string | null;
          prayer_frequency?: string | null;
          quran_reading?: string | null;
          sect?: string | null;
          smoking?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          beard_preference?: string | null;
          created_at?: string;
          desired_partner_sect?: string | null;
          halal_diet?: boolean | null;
          hijab_preference?: string | null;
          id?: string;
          importance_of_religion?: string | null;
          madhab?: string | null;
          prayer_frequency?: string | null;
          quran_reading?: string | null;
          sect?: string | null;
          smoking?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      login_streaks: {
        Row: {
          created_at: string;
          current_streak: number;
          id: string;
          last_login_date: string;
          longest_streak: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_streak?: number;
          id?: string;
          last_login_date?: string;
          longest_streak?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_streak?: number;
          id?: string;
          last_login_date?: string;
          longest_streak?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      match_notifications: {
        Row: {
          action_url: string | null;
          created_at: string | null;
          id: string;
          is_read: boolean | null;
          match_id: string | null;
          message: string;
          metadata: Json | null;
          notification_type: string;
          read_at: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          action_url?: string | null;
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          match_id?: string | null;
          message: string;
          metadata?: Json | null;
          notification_type: string;
          read_at?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          action_url?: string | null;
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          match_id?: string | null;
          message?: string;
          metadata?: Json | null;
          notification_type?: string;
          read_at?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          can_communicate: boolean;
          conversation_ended_at: string | null;
          conversation_started_at: string | null;
          conversation_status: string | null;
          created_at: string;
          end_message: string | null;
          end_reason: string | null;
          ended_by: string | null;
          family_approved: boolean | null;
          family_notes: string | null;
          family_reviewed_at: string | null;
          family_reviewer_id: string | null;
          family_supervision_required: boolean;
          family1_approved: boolean | null;
          family2_approved: boolean | null;
          id: string;
          is_mutual: boolean | null;
          match_score: number | null;
          supervision_started_at: string | null;
          updated_at: string;
          user1_id: string;
          user1_liked: boolean | null;
          user2_id: string;
          user2_liked: boolean | null;
        };
        Insert: {
          can_communicate?: boolean;
          conversation_ended_at?: string | null;
          conversation_started_at?: string | null;
          conversation_status?: string | null;
          created_at?: string;
          end_message?: string | null;
          end_reason?: string | null;
          ended_by?: string | null;
          family_approved?: boolean | null;
          family_notes?: string | null;
          family_reviewed_at?: string | null;
          family_reviewer_id?: string | null;
          family_supervision_required?: boolean;
          family1_approved?: boolean | null;
          family2_approved?: boolean | null;
          id?: string;
          is_mutual?: boolean | null;
          match_score?: number | null;
          supervision_started_at?: string | null;
          updated_at?: string;
          user1_id: string;
          user1_liked?: boolean | null;
          user2_id: string;
          user2_liked?: boolean | null;
        };
        Update: {
          can_communicate?: boolean;
          conversation_ended_at?: string | null;
          conversation_started_at?: string | null;
          conversation_status?: string | null;
          created_at?: string;
          end_message?: string | null;
          end_reason?: string | null;
          ended_by?: string | null;
          family_approved?: boolean | null;
          family_notes?: string | null;
          family_reviewed_at?: string | null;
          family_reviewer_id?: string | null;
          family_supervision_required?: boolean;
          family1_approved?: boolean | null;
          family2_approved?: boolean | null;
          id?: string;
          is_mutual?: boolean | null;
          match_score?: number | null;
          supervision_started_at?: string | null;
          updated_at?: string;
          user1_id?: string;
          user1_liked?: boolean | null;
          user2_id?: string;
          user2_liked?: boolean | null;
        };
        Relationships: [];
      };
      matching_history: {
        Row: {
          avg_compatibility_score: number | null;
          created_at: string;
          id: string;
          matched_profiles: Json;
          preferences_used: Json;
          search_timestamp: string;
          total_matches: number;
          user_id: string;
        };
        Insert: {
          avg_compatibility_score?: number | null;
          created_at?: string;
          id?: string;
          matched_profiles?: Json;
          preferences_used?: Json;
          search_timestamp?: string;
          total_matches?: number;
          user_id: string;
        };
        Update: {
          avg_compatibility_score?: number | null;
          created_at?: string;
          id?: string;
          matched_profiles?: Json;
          preferences_used?: Json;
          search_timestamp?: string;
          total_matches?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      matching_preferences: {
        Row: {
          created_at: string;
          family_approval_required: boolean;
          id: string;
          min_compatibility: number;
          updated_at: string;
          use_ai_scoring: boolean;
          user_id: string;
          weight_cultural: number;
          weight_islamic: number;
          weight_personality: number;
        };
        Insert: {
          created_at?: string;
          family_approval_required?: boolean;
          id?: string;
          min_compatibility?: number;
          updated_at?: string;
          use_ai_scoring?: boolean;
          user_id: string;
          weight_cultural?: number;
          weight_islamic?: number;
          weight_personality?: number;
        };
        Update: {
          created_at?: string;
          family_approval_required?: boolean;
          id?: string;
          min_compatibility?: number;
          updated_at?: string;
          use_ai_scoring?: boolean;
          user_id?: string;
          weight_cultural?: number;
          weight_islamic?: number;
          weight_personality?: number;
        };
        Relationships: [];
      };
      message_suggestions: {
        Row: {
          created_at: string;
          id: string;
          improvement_reason: string;
          islamic_guidance: string | null;
          original_message: string;
          suggested_message: string;
          used: boolean;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          improvement_reason: string;
          islamic_guidance?: string | null;
          original_message: string;
          suggested_message: string;
          used?: boolean;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          improvement_reason?: string;
          islamic_guidance?: string | null;
          original_message?: string;
          suggested_message?: string;
          used?: boolean;
          user_id?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          content: string;
          created_at: string;
          family_member_id: string | null;
          id: string;
          is_family_supervised: boolean | null;
          is_read: boolean | null;
          match_id: string;
          sender_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          family_member_id?: string | null;
          id?: string;
          is_family_supervised?: boolean | null;
          is_read?: boolean | null;
          match_id: string;
          sender_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          family_member_id?: string | null;
          id?: string;
          is_family_supervised?: boolean | null;
          is_read?: boolean | null;
          match_id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_family_member_id_fkey";
            columns: ["family_member_id"];
            isOneToOne: false;
            referencedRelation: "family_members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      moderation_actions: {
        Row: {
          action_type: string;
          created_at: string | null;
          expires_at: string | null;
          id: string;
          reason: string;
          severity: string;
          user_id: string;
        };
        Insert: {
          action_type: string;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          reason: string;
          severity: string;
          user_id: string;
        };
        Update: {
          action_type?: string;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          reason?: string;
          severity?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      moderation_appeals: {
        Row: {
          appeal_reason: string;
          created_at: string | null;
          evidence: string | null;
          id: string;
          moderation_action_id: string;
          reviewed_at: string | null;
          reviewer_notes: string | null;
          status: string;
          user_id: string;
        };
        Insert: {
          appeal_reason: string;
          created_at?: string | null;
          evidence?: string | null;
          id?: string;
          moderation_action_id: string;
          reviewed_at?: string | null;
          reviewer_notes?: string | null;
          status?: string;
          user_id: string;
        };
        Update: {
          appeal_reason?: string;
          created_at?: string | null;
          evidence?: string | null;
          id?: string;
          moderation_action_id?: string;
          reviewed_at?: string | null;
          reviewer_notes?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      moderation_logs: {
        Row: {
          action_taken: string;
          ai_analysis: Json;
          confidence_score: number;
          content_analyzed: string;
          created_at: string;
          human_decision: string | null;
          human_reviewed: boolean;
          human_reviewer_id: string | null;
          id: string;
          match_id: string | null;
          message_id: string | null;
          rules_triggered: Json;
          user_id: string;
        };
        Insert: {
          action_taken: string;
          ai_analysis?: Json;
          confidence_score?: number;
          content_analyzed: string;
          created_at?: string;
          human_decision?: string | null;
          human_reviewed?: boolean;
          human_reviewer_id?: string | null;
          id?: string;
          match_id?: string | null;
          message_id?: string | null;
          rules_triggered?: Json;
          user_id: string;
        };
        Update: {
          action_taken?: string;
          ai_analysis?: Json;
          confidence_score?: number;
          content_analyzed?: string;
          created_at?: string;
          human_decision?: string | null;
          human_reviewed?: boolean;
          human_reviewer_id?: string | null;
          id?: string;
          match_id?: string | null;
          message_id?: string | null;
          rules_triggered?: Json;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "moderation_logs_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "moderation_logs_message_id_fkey";
            columns: ["message_id"];
            isOneToOne: false;
            referencedRelation: "messages";
            referencedColumns: ["id"];
          },
        ];
      };
      moderation_rules: {
        Row: {
          action: string;
          created_at: string | null;
          description: string;
          id: string;
          is_active: boolean;
          pattern: string;
          rule_type: string;
          severity: string;
          updated_at: string | null;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          description: string;
          id?: string;
          is_active?: boolean;
          pattern: string;
          rule_type: string;
          severity: string;
          updated_at?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          description?: string;
          id?: string;
          is_active?: boolean;
          pattern?: string;
          rule_type?: string;
          severity?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      moderation_violations: {
        Row: {
          action_taken: string;
          auto_moderated_content: string | null;
          content: string;
          content_type: string;
          created_at: string | null;
          id: string;
          rules_violated: string[];
          severity: string;
          user_id: string;
        };
        Insert: {
          action_taken: string;
          auto_moderated_content?: string | null;
          content: string;
          content_type: string;
          created_at?: string | null;
          id?: string;
          rules_violated: string[];
          severity: string;
          user_id: string;
        };
        Update: {
          action_taken?: string;
          auto_moderated_content?: string | null;
          content?: string;
          content_type?: string;
          created_at?: string | null;
          id?: string;
          rules_violated?: string[];
          severity?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      note_tags: {
        Row: {
          created_at: string | null;
          id: string;
          note_id: string;
          tag_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          note_id: string;
          tag_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          note_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "note_tags_note_id_fkey";
            columns: ["note_id"];
            isOneToOne: false;
            referencedRelation: "profile_notes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "note_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "profile_tags";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          is_read: boolean | null;
          related_match_id: string | null;
          related_user_id: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          is_read?: boolean | null;
          related_match_id?: string | null;
          related_user_id?: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean | null;
          related_match_id?: string | null;
          related_user_id?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_related_match_id_fkey";
            columns: ["related_match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      onboarding_analytics: {
        Row: {
          created_at: string;
          event_type: string;
          id: string;
          metadata: Json | null;
          step_name: string | null;
          step_number: number | null;
          time_spent_seconds: number | null;
          user_id: string;
          validation_errors: Json | null;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          id?: string;
          metadata?: Json | null;
          step_name?: string | null;
          step_number?: number | null;
          time_spent_seconds?: number | null;
          user_id: string;
          validation_errors?: Json | null;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          id?: string;
          metadata?: Json | null;
          step_name?: string | null;
          step_number?: number | null;
          time_spent_seconds?: number | null;
          user_id?: string;
          validation_errors?: Json | null;
        };
        Relationships: [];
      };
      privacy_settings: {
        Row: {
          allow_family_involvement: boolean | null;
          allow_messages_from: string | null;
          allow_profile_views: boolean | null;
          contact_visibility: string | null;
          created_at: string;
          id: string;
          last_seen_visibility: string | null;
          photo_visibility: string | null;
          profile_visibility: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          allow_family_involvement?: boolean | null;
          allow_messages_from?: string | null;
          allow_profile_views?: boolean | null;
          contact_visibility?: string | null;
          created_at?: string;
          id?: string;
          last_seen_visibility?: string | null;
          photo_visibility?: string | null;
          profile_visibility?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          allow_family_involvement?: boolean | null;
          allow_messages_from?: string | null;
          allow_profile_views?: boolean | null;
          contact_visibility?: string | null;
          created_at?: string;
          id?: string;
          last_seen_visibility?: string | null;
          photo_visibility?: string | null;
          profile_visibility?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_comparison_history: {
        Row: {
          compared_profile_ids: string[];
          comparison_name: string | null;
          created_at: string;
          id: string;
          is_favorite: boolean;
          notes: string | null;
          rating: number | null;
          tags: string[] | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          compared_profile_ids: string[];
          comparison_name?: string | null;
          created_at?: string;
          id?: string;
          is_favorite?: boolean;
          notes?: string | null;
          rating?: number | null;
          tags?: string[] | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          compared_profile_ids?: string[];
          comparison_name?: string | null;
          created_at?: string;
          id?: string;
          is_favorite?: boolean;
          notes?: string | null;
          rating?: number | null;
          tags?: string[] | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_favorites: {
        Row: {
          created_at: string | null;
          id: string;
          profile_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          profile_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          profile_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_matching_data: {
        Row: {
          age: number | null;
          avatar_url: string | null;
          city_only: string | null;
          created_at: string | null;
          education_level: string | null;
          gender: string | null;
          id: string;
          interests: string[] | null;
          is_visible: boolean | null;
          looking_for: string | null;
          profession_category: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          age?: number | null;
          avatar_url?: string | null;
          city_only?: string | null;
          created_at?: string | null;
          education_level?: string | null;
          gender?: string | null;
          id?: string;
          interests?: string[] | null;
          is_visible?: boolean | null;
          looking_for?: string | null;
          profession_category?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          age?: number | null;
          avatar_url?: string | null;
          city_only?: string | null;
          created_at?: string | null;
          education_level?: string | null;
          gender?: string | null;
          id?: string;
          interests?: string[] | null;
          is_visible?: boolean | null;
          looking_for?: string | null;
          profession_category?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_matching_data_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      profile_notes: {
        Row: {
          created_at: string;
          id: string;
          note: string;
          profile_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          note: string;
          profile_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          note?: string;
          profile_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_tags: {
        Row: {
          color: string;
          created_at: string | null;
          id: string;
          tag_name: string;
          user_id: string;
        };
        Insert: {
          color?: string;
          created_at?: string | null;
          id?: string;
          tag_name: string;
          user_id: string;
        };
        Update: {
          color?: string;
          created_at?: string | null;
          id?: string;
          tag_name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_views: {
        Row: {
          created_at: string;
          id: string;
          viewed_id: string;
          viewer_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          viewed_id: string;
          viewer_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          viewed_id?: string;
          viewer_id?: string;
        };
        Relationships: [];
      };
      profile_views_daily: {
        Row: {
          created_at: string;
          id: string;
          user_id: string;
          viewed_at: string;
          viewed_user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          user_id: string;
          viewed_at?: string;
          viewed_user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          user_id?: string;
          viewed_at?: string;
          viewed_user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          age: number | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          education: string | null;
          full_name: string | null;
          gender: string | null;
          id: string;
          interests: string[] | null;
          location: string | null;
          looking_for: string | null;
          onboarding_completed: boolean | null;
          phone: string | null;
          profession: string | null;
          terms_accepted_at: string | null;
          terms_version: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          age?: number | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          education?: string | null;
          full_name?: string | null;
          gender?: string | null;
          id?: string;
          interests?: string[] | null;
          location?: string | null;
          looking_for?: string | null;
          onboarding_completed?: boolean | null;
          phone?: string | null;
          profession?: string | null;
          terms_accepted_at?: string | null;
          terms_version?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          age?: number | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          education?: string | null;
          full_name?: string | null;
          gender?: string | null;
          id?: string;
          interests?: string[] | null;
          location?: string | null;
          looking_for?: string | null;
          onboarding_completed?: boolean | null;
          phone?: string | null;
          profession?: string | null;
          terms_accepted_at?: string | null;
          terms_version?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          admin_notes: string | null;
          created_at: string;
          description: string;
          id: string;
          report_type: string;
          reported_user_id: string;
          reporter_id: string;
          resolved_at: string | null;
          resolved_by: string | null;
          status: string | null;
        };
        Insert: {
          admin_notes?: string | null;
          created_at?: string;
          description: string;
          id?: string;
          report_type: string;
          reported_user_id: string;
          reporter_id: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: string | null;
        };
        Update: {
          admin_notes?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          report_type?: string;
          reported_user_id?: string;
          reporter_id?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: string | null;
        };
        Relationships: [];
      };
      security_audit_log: {
        Row: {
          action_type: string;
          additional_data: Json | null;
          created_at: string | null;
          id: string;
          ip_address: unknown;
          record_id: string | null;
          table_name: string;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          action_type: string;
          additional_data?: Json | null;
          created_at?: string | null;
          id?: string;
          ip_address?: unknown;
          record_id?: string | null;
          table_name: string;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          action_type?: string;
          additional_data?: Json | null;
          created_at?: string | null;
          id?: string;
          ip_address?: unknown;
          record_id?: string | null;
          table_name?: string;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      security_events: {
        Row: {
          created_at: string | null;
          description: string;
          event_type: string;
          id: string;
          ip_address: unknown;
          metadata: Json | null;
          resolved: boolean | null;
          severity: string;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          description: string;
          event_type: string;
          id?: string;
          ip_address?: unknown;
          metadata?: Json | null;
          resolved?: boolean | null;
          severity?: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string;
          event_type?: string;
          id?: string;
          ip_address?: unknown;
          metadata?: Json | null;
          resolved?: boolean | null;
          severity?: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      sensitive_operations_audit: {
        Row: {
          created_at: string;
          id: string;
          ip_address: unknown;
          operation_type: string;
          record_id: string | null;
          risk_level: string;
          success: boolean;
          table_accessed: string;
          user_agent: string | null;
          user_id: string;
          verification_score: number | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          ip_address?: unknown;
          operation_type: string;
          record_id?: string | null;
          risk_level?: string;
          success?: boolean;
          table_accessed: string;
          user_agent?: string | null;
          user_id: string;
          verification_score?: number | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          ip_address?: unknown;
          operation_type?: string;
          record_id?: string | null;
          risk_level?: string;
          success?: boolean;
          table_accessed?: string;
          user_agent?: string | null;
          user_id?: string;
          verification_score?: number | null;
        };
        Relationships: [];
      };
      subscription_history: {
        Row: {
          action: string;
          created_at: string | null;
          id: string;
          new_values: Json | null;
          old_values: Json | null;
          performed_by: string | null;
          reason: string | null;
          subscription_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          id?: string;
          new_values?: Json | null;
          old_values?: Json | null;
          performed_by?: string | null;
          reason?: string | null;
          subscription_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          id?: string;
          new_values?: Json | null;
          old_values?: Json | null;
          performed_by?: string | null;
          reason?: string | null;
          subscription_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscription_history_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          braintree_customer_id: string | null;
          braintree_subscription_id: string | null;
          created_at: string;
          expires_at: string | null;
          granted_at: string;
          granted_by: string | null;
          id: string;
          notes: string | null;
          paypal_subscription_id: string | null;
          plan_type: string;
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          braintree_customer_id?: string | null;
          braintree_subscription_id?: string | null;
          created_at?: string;
          expires_at?: string | null;
          granted_at?: string;
          granted_by?: string | null;
          id?: string;
          notes?: string | null;
          paypal_subscription_id?: string | null;
          plan_type?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          braintree_customer_id?: string | null;
          braintree_subscription_id?: string | null;
          created_at?: string;
          expires_at?: string | null;
          granted_at?: string;
          granted_by?: string | null;
          id?: string;
          notes?: string | null;
          paypal_subscription_id?: string | null;
          plan_type?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      supervision_logs: {
        Row: {
          action_type: string;
          created_at: string;
          details: Json | null;
          family_member_id: string;
          id: string;
          supervised_user_id: string;
        };
        Insert: {
          action_type: string;
          created_at?: string;
          details?: Json | null;
          family_member_id: string;
          id?: string;
          supervised_user_id: string;
        };
        Update: {
          action_type?: string;
          created_at?: string;
          details?: Json | null;
          family_member_id?: string;
          id?: string;
          supervised_user_id?: string;
        };
        Relationships: [];
      };
      user_challenge_progress: {
        Row: {
          challenge_id: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          current_progress: number;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          challenge_id: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          current_progress?: number;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          challenge_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          current_progress?: number;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "weekly_challenges";
            referencedColumns: ["id"];
          },
        ];
      };
      user_compatibility_responses: {
        Row: {
          created_at: string;
          id: string;
          question_key: string;
          response_value: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          question_key: string;
          response_value: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          question_key?: string;
          response_value?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_daily_quest_progress: {
        Row: {
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          current_progress: number;
          id: string;
          quest_date: string;
          quest_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          current_progress?: number;
          id?: string;
          quest_date?: string;
          quest_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          current_progress?: number;
          id?: string;
          quest_date?: string;
          quest_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_daily_quest_progress_quest_id_fkey";
            columns: ["quest_id"];
            isOneToOne: false;
            referencedRelation: "daily_quests";
            referencedColumns: ["id"];
          },
        ];
      };
      user_levels: {
        Row: {
          created_at: string;
          current_level: string;
          id: string;
          level_progress: number;
          total_xp: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_level?: string;
          id?: string;
          level_progress?: number;
          total_xp?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_level?: string;
          id?: string;
          level_progress?: number;
          total_xp?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_progression: {
        Row: {
          achievements_count: number;
          created_at: string | null;
          current_level: number;
          id: string;
          insights_viewed_count: number;
          last_level_up_at: string | null;
          total_points: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          achievements_count?: number;
          created_at?: string | null;
          current_level?: number;
          id?: string;
          insights_viewed_count?: number;
          last_level_up_at?: string | null;
          total_points?: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          achievements_count?: number;
          created_at?: string | null;
          current_level?: number;
          id?: string;
          insights_viewed_count?: number;
          last_level_up_at?: string | null;
          total_points?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          assigned_at: string | null;
          assigned_by: string | null;
          created_at: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          assigned_at?: string | null;
          assigned_by?: string | null;
          created_at?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          assigned_at?: string | null;
          assigned_by?: string | null;
          created_at?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_sessions: {
        Row: {
          created_at: string | null;
          device_fingerprint: string | null;
          expires_at: string | null;
          id: string;
          ip_address: unknown;
          is_active: boolean | null;
          last_activity: string | null;
          session_token: string;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          device_fingerprint?: string | null;
          expires_at?: string | null;
          id?: string;
          ip_address?: unknown;
          is_active?: boolean | null;
          last_activity?: string | null;
          session_token: string;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          device_fingerprint?: string | null;
          expires_at?: string | null;
          id?: string;
          ip_address?: unknown;
          is_active?: boolean | null;
          last_activity?: string | null;
          session_token?: string;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          age_max: number | null;
          age_min: number | null;
          auto_accept_matches: boolean | null;
          created_at: string;
          email_notifications: boolean | null;
          id: string;
          match_notifications: boolean | null;
          message_notifications: boolean | null;
          profile_visibility: string | null;
          search_distance: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          age_max?: number | null;
          age_min?: number | null;
          auto_accept_matches?: boolean | null;
          created_at?: string;
          email_notifications?: boolean | null;
          id?: string;
          match_notifications?: boolean | null;
          message_notifications?: boolean | null;
          profile_visibility?: string | null;
          search_distance?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          age_max?: number | null;
          age_min?: number | null;
          auto_accept_matches?: boolean | null;
          created_at?: string;
          email_notifications?: boolean | null;
          id?: string;
          match_notifications?: boolean | null;
          message_notifications?: boolean | null;
          profile_visibility?: string | null;
          search_distance?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_status: {
        Row: {
          admin_notes: string | null;
          created_at: string;
          created_by: string | null;
          expires_at: string | null;
          id: string;
          reason: string | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          admin_notes?: string | null;
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          reason?: string | null;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          admin_notes?: string | null;
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          reason?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_verifications: {
        Row: {
          created_at: string;
          email_verified: boolean | null;
          family_verified: boolean | null;
          id: string;
          id_verified: boolean | null;
          phone_verified: boolean | null;
          updated_at: string;
          user_id: string;
          verification_documents: string[] | null;
          verification_notes: string | null;
          verification_score: number | null;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          created_at?: string;
          email_verified?: boolean | null;
          family_verified?: boolean | null;
          id?: string;
          id_verified?: boolean | null;
          phone_verified?: boolean | null;
          updated_at?: string;
          user_id: string;
          verification_documents?: string[] | null;
          verification_notes?: string | null;
          verification_score?: number | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          created_at?: string;
          email_verified?: boolean | null;
          family_verified?: boolean | null;
          id?: string;
          id_verified?: boolean | null;
          phone_verified?: boolean | null;
          updated_at?: string;
          user_id?: string;
          verification_documents?: string[] | null;
          verification_notes?: string | null;
          verification_score?: number | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_user_verifications_profiles";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      video_calls: {
        Row: {
          created_at: string | null;
          description: string | null;
          end_time: string | null;
          id: string;
          match_id: string;
          meeting_id: string;
          meeting_link: string;
          participants: string[] | null;
          platform: string;
          scheduled_end_time: string | null;
          start_time: string;
          status: string;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          end_time?: string | null;
          id?: string;
          match_id: string;
          meeting_id: string;
          meeting_link: string;
          participants?: string[] | null;
          platform?: string;
          scheduled_end_time?: string | null;
          start_time?: string;
          status?: string;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          end_time?: string | null;
          id?: string;
          match_id?: string;
          meeting_id?: string;
          meeting_link?: string;
          participants?: string[] | null;
          platform?: string;
          scheduled_end_time?: string | null;
          start_time?: string;
          status?: string;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "video_calls_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      wali_delegations: {
        Row: {
          activated_at: string | null;
          created_at: string | null;
          delegate_wali_id: string;
          delegation_type: string;
          end_date: string;
          id: string;
          managed_user_id: string;
          permissions: Json;
          primary_wali_id: string;
          reason: string;
          revoked_at: string | null;
          start_date: string;
          status: string;
        };
        Insert: {
          activated_at?: string | null;
          created_at?: string | null;
          delegate_wali_id: string;
          delegation_type: string;
          end_date: string;
          id?: string;
          managed_user_id: string;
          permissions?: Json;
          primary_wali_id: string;
          reason: string;
          revoked_at?: string | null;
          start_date: string;
          status?: string;
        };
        Update: {
          activated_at?: string | null;
          created_at?: string | null;
          delegate_wali_id?: string;
          delegation_type?: string;
          end_date?: string;
          id?: string;
          managed_user_id?: string;
          permissions?: Json;
          primary_wali_id?: string;
          reason?: string;
          revoked_at?: string | null;
          start_date?: string;
          status?: string;
        };
        Relationships: [];
      };
      wali_email_history: {
        Row: {
          clicked_at: string | null;
          created_at: string | null;
          delivered_at: string | null;
          delivery_status: string;
          email_type: string;
          error_message: string | null;
          id: string;
          message_content: string;
          metadata: Json | null;
          opened_at: string | null;
          resend_email_id: string | null;
          sent_at: string;
          sent_by: string;
          subject: string;
          wali_user_id: string;
        };
        Insert: {
          clicked_at?: string | null;
          created_at?: string | null;
          delivered_at?: string | null;
          delivery_status?: string;
          email_type: string;
          error_message?: string | null;
          id?: string;
          message_content: string;
          metadata?: Json | null;
          opened_at?: string | null;
          resend_email_id?: string | null;
          sent_at?: string;
          sent_by: string;
          subject: string;
          wali_user_id: string;
        };
        Update: {
          clicked_at?: string | null;
          created_at?: string | null;
          delivered_at?: string | null;
          delivery_status?: string;
          email_type?: string;
          error_message?: string | null;
          id?: string;
          message_content?: string;
          metadata?: Json | null;
          opened_at?: string | null;
          resend_email_id?: string | null;
          sent_at?: string;
          sent_by?: string;
          subject?: string;
          wali_user_id?: string;
        };
        Relationships: [];
      };
      wali_filters: {
        Row: {
          created_at: string | null;
          filter_config: Json;
          filter_name: string;
          filter_type: string;
          id: string;
          is_active: boolean | null;
          updated_at: string | null;
          wali_id: string;
        };
        Insert: {
          created_at?: string | null;
          filter_config?: Json;
          filter_name: string;
          filter_type: string;
          id?: string;
          is_active?: boolean | null;
          updated_at?: string | null;
          wali_id: string;
        };
        Update: {
          created_at?: string | null;
          filter_config?: Json;
          filter_name?: string;
          filter_type?: string;
          id?: string;
          is_active?: boolean | null;
          updated_at?: string | null;
          wali_id?: string;
        };
        Relationships: [];
      };
      wali_profiles: {
        Row: {
          availability_status: string | null;
          contact_information: string | null;
          created_at: string | null;
          first_name: string;
          id: string;
          is_verified: boolean | null;
          last_name: string;
          relationship: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          availability_status?: string | null;
          contact_information?: string | null;
          created_at?: string | null;
          first_name: string;
          id?: string;
          is_verified?: boolean | null;
          last_name: string;
          relationship: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          availability_status?: string | null;
          contact_information?: string | null;
          created_at?: string | null;
          first_name?: string;
          id?: string;
          is_verified?: boolean | null;
          last_name?: string;
          relationship?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      webrtc_calls: {
        Row: {
          call_type: string;
          callee_id: string;
          caller_id: string;
          connected_at: string | null;
          created_at: string;
          duration_seconds: number | null;
          end_reason: string | null;
          ended_at: string | null;
          family_notified: boolean | null;
          id: string;
          match_id: string;
          quality_metrics: Json | null;
          started_at: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          call_type: string;
          callee_id: string;
          caller_id: string;
          connected_at?: string | null;
          created_at?: string;
          duration_seconds?: number | null;
          end_reason?: string | null;
          ended_at?: string | null;
          family_notified?: boolean | null;
          id?: string;
          match_id: string;
          quality_metrics?: Json | null;
          started_at?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          call_type?: string;
          callee_id?: string;
          caller_id?: string;
          connected_at?: string | null;
          created_at?: string;
          duration_seconds?: number | null;
          end_reason?: string | null;
          ended_at?: string | null;
          family_notified?: boolean | null;
          id?: string;
          match_id?: string;
          quality_metrics?: Json | null;
          started_at?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "webrtc_calls_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      weekly_challenges: {
        Row: {
          challenge_type: string;
          created_at: string;
          description: string;
          id: string;
          is_active: boolean;
          target_value: number;
          title: string;
          week_end: string;
          week_start: string;
          xp_reward: number;
        };
        Insert: {
          challenge_type: string;
          created_at?: string;
          description: string;
          id?: string;
          is_active?: boolean;
          target_value: number;
          title: string;
          week_end: string;
          week_start: string;
          xp_reward?: number;
        };
        Update: {
          challenge_type?: string;
          created_at?: string;
          description?: string;
          id?: string;
          is_active?: boolean;
          target_value?: number;
          title?: string;
          week_end?: string;
          week_start?: string;
          xp_reward?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      email_ab_test_analytics: {
        Row: {
          click_rate: number | null;
          conversion_rate: number | null;
          created_at: string | null;
          email_tone: string | null;
          id: string | null;
          is_active: boolean | null;
          offer_percentage: number | null;
          open_rate: number | null;
          reminder_type: string | null;
          revenue_per_email: number | null;
          subject_line: string | null;
          test_name: string | null;
          total_clicked: number | null;
          total_opened: number | null;
          total_renewed: number | null;
          total_revenue: number | null;
          total_sent: number | null;
          traffic_allocation: number | null;
          variant_name: string | null;
        };
        Relationships: [];
      };
      leaderboard: {
        Row: {
          avatar_url: string | null;
          current_level: string | null;
          current_streak: number | null;
          full_name: string | null;
          longest_streak: number | null;
          rank: number | null;
          total_xp: number | null;
          user_id: string | null;
        };
        Relationships: [];
      };
      onboarding_analytics_summary: {
        Row: {
          abandonment_count: number | null;
          abandonment_rate: number | null;
          avg_time_spent: number | null;
          last_event_at: string | null;
          step_name: string | null;
          step_number: number | null;
          total_visits: number | null;
          unique_users: number | null;
          validation_error_count: number | null;
        };
        Relationships: [];
      };
      public_invitation_info: {
        Row: {
          full_name: string | null;
          invitation_sent_at: string | null;
          invitation_token: string | null;
          is_valid: boolean | null;
          relationship: string | null;
        };
        Insert: {
          full_name?: string | null;
          invitation_sent_at?: string | null;
          invitation_token?: string | null;
          is_valid?: never;
          relationship?: string | null;
        };
        Update: {
          full_name?: string | null;
          invitation_sent_at?: string | null;
          invitation_token?: string | null;
          is_valid?: never;
          relationship?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      accept_family_invitation: {
        Args: { p_invitation_token: string; p_invited_user_id: string };
        Returns: boolean;
      };
      acknowledge_wali_alert: {
        Args: { p_admin_id: string; p_alert_id: string };
        Returns: boolean;
      };
      add_user_xp: {
        Args: { p_user_id: string; p_xp_amount: number };
        Returns: undefined;
      };
      assign_daily_quests_to_user: {
        Args: { p_user_id: string };
        Returns: {
          description: string;
          icon: string;
          quest_id: string;
          quest_type: string;
          target_value: number;
          title: string;
          xp_reward: number;
        }[];
      };
      can_access_family_contact_info: {
        Args: {
          family_member_invited_user_id: string;
          family_member_user_id: string;
        };
        Returns: boolean;
      };
      can_access_family_contact_info_secure: {
        Args: {
          family_member_invited_user_id: string;
          family_member_user_id: string;
        };
        Returns: boolean;
      };
      can_access_match_security_definer: {
        Args: { match_user1_id: string; match_user2_id: string };
        Returns: boolean;
      };
      can_view_matching_data: {
        Args: { target_user_id: string };
        Returns: boolean;
      };
      can_view_moderation_log: {
        Args: { log_user_id: string };
        Returns: boolean;
      };
      can_view_public_profile: {
        Args: { profile_user_id: string };
        Returns: boolean;
      };
      check_family_access_rate_limit: {
        Args: { user_uuid: string };
        Returns: boolean;
      };
      check_family_operation_limit: {
        Args: {
          p_daily_limit?: number;
          p_operation_type: string;
          p_user_id: string;
        };
        Returns: boolean;
      };
      check_family_supervision_setup: {
        Args: { user_uuid: string };
        Returns: boolean;
      };
      check_incomplete_profiles_and_notify: { Args: never; Returns: undefined };
      check_profile_view_rate_limit: {
        Args: { viewer_uuid: string };
        Returns: boolean;
      };
      check_subscription_expiry_and_notify: { Args: never; Returns: undefined };
      check_unread_messages_and_notify: { Args: never; Returns: undefined };
      create_family_invitation: {
        Args: {
          p_email: string;
          p_full_name: string;
          p_is_wali?: boolean;
          p_relationship: string;
          p_user_id: string;
        };
        Returns: string;
      };
      create_notification: {
        Args: {
          match_id?: string;
          notification_content: string;
          notification_title: string;
          notification_type: string;
          sender_user_id?: string;
          target_user_id: string;
        };
        Returns: string;
      };
      get_current_user_role_secure: {
        Args: never;
        Returns: Database["public"]["Enums"]["app_role"];
      };
      get_family_approval_status: {
        Args: { match_uuid: string };
        Returns: string;
      };
      get_family_contact_secure: {
        Args: { family_member_uuid: string };
        Returns: {
          contact_type: string;
          contact_value: string;
          last_verified: string;
        }[];
      };
      get_family_member_contact_secure: {
        Args: { member_id: string };
        Returns: {
          can_view_basic_info: boolean;
          full_name: string;
          id: string;
          relationship: string;
        }[];
      };
      get_onboarding_funnel: {
        Args: { days_back?: number };
        Returns: {
          avg_time_seconds: number;
          completion_rate: number;
          step_name: string;
          step_number: number;
          users_completed: number;
          users_started: number;
        }[];
      };
      get_user_role: {
        Args: { _user_id: string };
        Returns: Database["public"]["Enums"]["app_role"];
      };
      get_user_subscription_safe: {
        Args: { target_user_id: string };
        Returns: {
          created_at: string;
          expires_at: string;
          id: string;
          plan_type: string;
          status: string;
          updated_at: string;
          user_id: string;
        }[];
      };
      get_user_verification_status_secure: {
        Args: { target_user_id: string };
        Returns: {
          email_verified: boolean;
          id_verified: boolean;
          verification_score: number;
        }[];
      };
      get_validation_error_stats: {
        Args: { days_back?: number };
        Returns: {
          error_count: number;
          error_percentage: number;
          field_name: string;
        }[];
      };
      get_wali_alerts_statistics: {
        Args: never;
        Returns: {
          alerts_this_month: number;
          alerts_this_week: number;
          alerts_today: number;
          critical_alerts: number;
          high_alerts: number;
          low_alerts: number;
          medium_alerts: number;
          total_alerts: number;
          unacknowledged_alerts: number;
        }[];
      };
      get_wali_alerts_trend: {
        Args: { p_days?: number };
        Returns: {
          critical_count: number;
          date: string;
          high_count: number;
          low_count: number;
          medium_count: number;
          total_count: number;
        }[];
      };
      get_wali_email_history: {
        Args: { p_limit?: number; p_wali_user_id: string };
        Returns: {
          clicked_at: string;
          delivered_at: string;
          delivery_status: string;
          email_type: string;
          error_message: string;
          id: string;
          message_content: string;
          metadata: Json;
          opened_at: string;
          sender_name: string;
          sent_at: string;
          sent_by: string;
          subject: string;
          wali_user_id: string;
        }[];
      };
      get_wali_email_stats: {
        Args: { p_wali_user_id: string };
        Returns: {
          clicked_count: number;
          delivered_count: number;
          failed_count: number;
          last_email_sent_at: string;
          opened_count: number;
          sent_count: number;
          total_emails: number;
        }[];
      };
      has_family_relationship_security_definer: {
        Args: { target_user_id: string };
        Returns: boolean;
      };
      has_family_supervision: { Args: { user_uuid: string }; Returns: boolean };
      has_previous_conversation: {
        Args: { u1_id: string; u2_id: string };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      increment_family_operation_count: {
        Args: { p_operation_type: string; p_user_id: string };
        Returns: undefined;
      };
      increment_insight_views: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      is_admin: { Args: { _user_id: string }; Returns: boolean };
      is_family_supervised: {
        Args: { profile_user_id: string };
        Returns: boolean;
      };
      is_family_wali: { Args: { profile_user_id: string }; Returns: boolean };
      is_matched_user: { Args: { profile_user_id: string }; Returns: boolean };
      is_own_profile: { Args: { profile_user_id: string }; Returns: boolean };
      is_premium_active: { Args: { user_uuid: string }; Returns: boolean };
      is_premium_user: { Args: never; Returns: boolean };
      is_user_in_active_conversation: {
        Args: { check_user_id: string };
        Returns: boolean;
      };
      is_wali_suspended: { Args: { p_user_id: string }; Returns: boolean };
      log_profile_access: {
        Args: {
          p_risk_level?: string;
          p_viewed_id: string;
          p_viewer_id: string;
        };
        Returns: undefined;
      };
      log_security_event: {
        Args: {
          p_description: string;
          p_event_type: string;
          p_metadata?: Json;
          p_severity: string;
          p_user_id: string;
        };
        Returns: string;
      };
      migrate_family_contact_data_secure: { Args: never; Returns: undefined };
      select_ab_test_variant: {
        Args: { p_reminder_type: string };
        Returns: {
          ab_test_id: string;
          cta_text: string;
          email_tone: string;
          offer_percentage: number;
          promo_code: string;
          subject_line: string;
          variant_name: string;
        }[];
      };
      send_match_suggestions_batch: { Args: never; Returns: undefined };
      send_monthly_newsletter: { Args: never; Returns: undefined };
      send_weekly_tips_batch: { Args: never; Returns: undefined };
      suspend_wali_user: {
        Args: {
          p_admin_id: string;
          p_duration_days?: number;
          p_reason: string;
          p_wali_user_id: string;
        };
        Returns: boolean;
      };
      update_login_streak: { Args: { p_user_id: string }; Returns: undefined };
    };
    Enums: {
      app_role: "super_admin" | "admin" | "moderator" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  realtime: {
    Tables: {
      messages: {
        Row: {
          event: string | null;
          extension: string;
          id: string;
          inserted_at: string;
          payload: Json | null;
          private: boolean | null;
          topic: string;
          updated_at: string;
        };
        Insert: {
          event?: string | null;
          extension: string;
          id?: string;
          inserted_at?: string;
          payload?: Json | null;
          private?: boolean | null;
          topic: string;
          updated_at?: string;
        };
        Update: {
          event?: string | null;
          extension?: string;
          id?: string;
          inserted_at?: string;
          payload?: Json | null;
          private?: boolean | null;
          topic?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages_2025_11_10: {
        Row: {
          event: string | null;
          extension: string;
          id: string;
          inserted_at: string;
          payload: Json | null;
          private: boolean | null;
          topic: string;
          updated_at: string;
        };
        Insert: {
          event?: string | null;
          extension: string;
          id?: string;
          inserted_at?: string;
          payload?: Json | null;
          private?: boolean | null;
          topic: string;
          updated_at?: string;
        };
        Update: {
          event?: string | null;
          extension?: string;
          id?: string;
          inserted_at?: string;
          payload?: Json | null;
          private?: boolean | null;
          topic?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages_2025_11_11: {
        Row: {
          event: string | null;
          extension: string;
          id: string;
          inserted_at: string;
          payload: Json | null;
          private: boolean | null;
          topic: string;
          updated_at: string;
        };
        Insert: {
          event?: string | null;
          extension: string;
          id?: string;
          inserted_at?: string;
          payload?: Json | null;
          private?: boolean | null;
          topic: string;
          updated_at?: string;
        };
        Update: {
          event?: string | null;
          extension?: string;
          id?: string;
          inserted_at?: string;
          payload?: Json | null;
          private?: boolean | null;
          topic?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages_2025_11_12: {
        Row: {
          event: string | null;
          extension: string;
          id: string;
          inserted_at: string;
          payload: Json | null;
          private: boolean | null;
          topic: string;
          updated_at: string;
        };
        Insert: {
          event?: string | null;
          extension: string;
          id?: string;
          inserted_at?: string;
          payload?: Json | null;
          private?: boolean | null;
          topic: string;
          updated_at?: string;
        };
        Update: {
          event?: string | null;
          extension?: string;
          id?: string;
          inserted_at?: string;
          payload?: Json | null;
          private?: boolean | null;
          topic?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages_2025_11_13: {
        Row: {
          event: string | null;
          extension: string;
          id: string;
          inserted_at: string;
          payload: Json | null;
          private: boolean | null;
          topic: string;
          updated_at: string;
        };
        Insert: {
          event?: string | null;
          extension: string;
          id?: string;
          inserted_at?: string;
          payload?: Json | null;
          private?: boolean | null;
          topic: string;
          updated_at?: string;
        };
        Update: {
          event?: string | null;
          extension?: string;
          id?: string;
          inserted_at?: string;
          payload?: Json | null;
          private?: boolean | null;
          topic?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages_2025_11_14: {
        Row: {
          event: string | null;
          extension: string;
          id: string;
          inserted_at: string;
          payload: Json | null;
          private: boolean | null;
          topic: string;
          updated_at: string;
        };
        Insert: {
          event?: string | null;
          extension: string;
          id?: string;
          inserted_at?: string;
          payload?: Json | null;
          private?: boolean | null;
          topic: string;
          updated_at?: string;
        };
        Update: {
          event?: string | null;
          extension?: string;
          id?: string;
          inserted_at?: string;
          payload?: Json | null;
          private?: boolean | null;
          topic?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages_2025_11_15: {
        Row: {
          event: string | null;
          extension: string;
          id: string;
          inserted_at: string;
          payload: Json | null;
          private: boolean | null;
          topic: string;
          updated_at: string;
        };
        Insert: {
          event?: string | null;
          extension: string;
          id?: string;
          inserted_at?: string;
          payload?: Json | null;
          private?: boolean | null;
          topic: string;
          updated_at?: string;
        };
        Update: {
          event?: string | null;
          extension?: string;
          id?: string;
          inserted_at?: string;
          payload?: Json | null;
          private?: boolean | null;
          topic?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages_2025_11_16: {
        Row: {
          event: string | null;
          extension: string;
          id: string;
          inserted_at: string;
          payload: Json | null;
          private: boolean | null;
          topic: string;
          updated_at: string;
        };
        Insert: {
          event?: string | null;
          extension: string;
          id?: string;
          inserted_at?: string;
          payload?: Json | null;
          private?: boolean | null;
          topic: string;
          updated_at?: string;
        };
        Update: {
          event?: string | null;
          extension?: string;
          id?: string;
          inserted_at?: string;
          payload?: Json | null;
          private?: boolean | null;
          topic?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      schema_migrations: {
        Row: {
          inserted_at: string | null;
          version: number;
        };
        Insert: {
          inserted_at?: string | null;
          version: number;
        };
        Update: {
          inserted_at?: string | null;
          version?: number;
        };
        Relationships: [];
      };
      subscription: {
        Row: {
          claims: Json;
          claims_role: unknown;
          created_at: string;
          entity: unknown;
          filters: Database["realtime"]["CompositeTypes"]["user_defined_filter"][];
          id: number;
          subscription_id: string;
        };
        Insert: {
          claims: Json;
          claims_role?: unknown;
          created_at?: string;
          entity: unknown;
          filters?: Database["realtime"]["CompositeTypes"]["user_defined_filter"][];
          id?: never;
          subscription_id: string;
        };
        Update: {
          claims?: Json;
          claims_role?: unknown;
          created_at?: string;
          entity?: unknown;
          filters?: Database["realtime"]["CompositeTypes"]["user_defined_filter"][];
          id?: never;
          subscription_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      apply_rls: {
        Args: { max_record_bytes?: number; wal: Json };
        Returns: Database["realtime"]["CompositeTypes"]["wal_rls"][];
        SetofOptions: {
          from: "*";
          to: "wal_rls";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      broadcast_changes: {
        Args: {
          event_name: string;
          level?: string;
          new: Record<string, unknown>;
          old: Record<string, unknown>;
          operation: string;
          table_name: string;
          table_schema: string;
          topic_name: string;
        };
        Returns: undefined;
      };
      build_prepared_statement_sql: {
        Args: {
          columns: Database["realtime"]["CompositeTypes"]["wal_column"][];
          entity: unknown;
          prepared_statement_name: string;
        };
        Returns: string;
      };
      cast: { Args: { type_: unknown; val: string }; Returns: Json };
      check_equality_op: {
        Args: {
          op: Database["realtime"]["Enums"]["equality_op"];
          type_: unknown;
          val_1: string;
          val_2: string;
        };
        Returns: boolean;
      };
      is_visible_through_filters: {
        Args: {
          columns: Database["realtime"]["CompositeTypes"]["wal_column"][];
          filters: Database["realtime"]["CompositeTypes"]["user_defined_filter"][];
        };
        Returns: boolean;
      };
      list_changes: {
        Args: {
          max_changes: number;
          max_record_bytes: number;
          publication: unknown;
          slot_name: unknown;
        };
        Returns: Database["realtime"]["CompositeTypes"]["wal_rls"][];
        SetofOptions: {
          from: "*";
          to: "wal_rls";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      quote_wal2json: { Args: { entity: unknown }; Returns: string };
      send: {
        Args: { event: string; payload: Json; private?: boolean; topic: string };
        Returns: undefined;
      };
      to_regrole: { Args: { role_name: string }; Returns: unknown };
      topic: { Args: never; Returns: string };
    };
    Enums: {
      action: "INSERT" | "UPDATE" | "DELETE" | "TRUNCATE" | "ERROR";
      equality_op: "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "in";
    };
    CompositeTypes: {
      user_defined_filter: {
        column_name: string | null;
        op: Database["realtime"]["Enums"]["equality_op"] | null;
        value: string | null;
      };
      wal_column: {
        name: string | null;
        type_name: string | null;
        type_oid: unknown;
        value: Json | null;
        is_pkey: boolean | null;
        is_selectable: boolean | null;
      };
      wal_rls: {
        wal: Json | null;
        is_rls_enabled: boolean | null;
        subscription_ids: string[] | null;
        errors: string[] | null;
      };
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          owner_id: string | null;
          public: boolean | null;
          type: Database["storage"]["Enums"]["buckettype"];
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          type?: Database["storage"]["Enums"]["buckettype"];
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          type?: Database["storage"]["Enums"]["buckettype"];
          updated_at?: string | null;
        };
        Relationships: [];
      };
      buckets_analytics: {
        Row: {
          created_at: string;
          format: string;
          id: string;
          type: Database["storage"]["Enums"]["buckettype"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          format?: string;
          id: string;
          type?: Database["storage"]["Enums"]["buckettype"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          format?: string;
          id?: string;
          type?: Database["storage"]["Enums"]["buckettype"];
          updated_at?: string;
        };
        Relationships: [];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          level: number | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          owner_id: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          user_metadata: Json | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          level?: number | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          level?: number | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey";
            columns: ["bucket_id"];
            isOneToOne: false;
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          },
        ];
      };
      prefixes: {
        Row: {
          bucket_id: string;
          created_at: string | null;
          level: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          bucket_id: string;
          created_at?: string | null;
          level?: number;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          bucket_id?: string;
          created_at?: string | null;
          level?: number;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey";
            columns: ["bucket_id"];
            isOneToOne: false;
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          },
        ];
      };
      s3_multipart_uploads: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          in_progress_size: number;
          key: string;
          owner_id: string | null;
          upload_signature: string;
          user_metadata: Json | null;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id: string;
          in_progress_size?: number;
          key: string;
          owner_id?: string | null;
          upload_signature: string;
          user_metadata?: Json | null;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          in_progress_size?: number;
          key?: string;
          owner_id?: string | null;
          upload_signature?: string;
          user_metadata?: Json | null;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey";
            columns: ["bucket_id"];
            isOneToOne: false;
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          },
        ];
      };
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string;
          created_at: string;
          etag: string;
          id: string;
          key: string;
          owner_id: string | null;
          part_number: number;
          size: number;
          upload_id: string;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          etag: string;
          id?: string;
          key: string;
          owner_id?: string | null;
          part_number: number;
          size?: number;
          upload_id: string;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          etag?: string;
          id?: string;
          key?: string;
          owner_id?: string | null;
          part_number?: number;
          size?: number;
          upload_id?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey";
            columns: ["bucket_id"];
            isOneToOne: false;
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey";
            columns: ["upload_id"];
            isOneToOne: false;
            referencedRelation: "s3_multipart_uploads";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string };
        Returns: undefined;
      };
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string };
        Returns: undefined;
      };
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] };
        Returns: undefined;
      };
      delete_prefix: {
        Args: { _bucket_id: string; _name: string };
        Returns: boolean;
      };
      extension: { Args: { name: string }; Returns: string };
      filename: { Args: { name: string }; Returns: string };
      foldername: { Args: { name: string }; Returns: string[] };
      get_level: { Args: { name: string }; Returns: number };
      get_prefix: { Args: { name: string }; Returns: string };
      get_prefixes: { Args: { name: string }; Returns: string[] };
      get_size_by_bucket: {
        Args: never;
        Returns: {
          bucket_id: string;
          size: number;
        }[];
      };
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string;
          delimiter_param: string;
          max_keys?: number;
          next_key_token?: string;
          next_upload_token?: string;
          prefix_param: string;
        };
        Returns: {
          created_at: string;
          id: string;
          key: string;
        }[];
      };
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string;
          delimiter_param: string;
          max_keys?: number;
          next_token?: string;
          prefix_param: string;
          start_after?: string;
        };
        Returns: {
          id: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] };
        Returns: undefined;
      };
      operation: { Args: never; Returns: string };
      search: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_legacy_v1: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_v1_optimised: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_v2: {
        Args: {
          bucket_name: string;
          levels?: number;
          limits?: number;
          prefix: string;
          sort_column?: string;
          sort_column_after?: string;
          sort_order?: string;
          start_after?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          key: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  supabase_migrations: {
    Tables: {
      schema_migrations: {
        Row: {
          created_by: string | null;
          idempotency_key: string | null;
          name: string | null;
          rollback: string[] | null;
          statements: string[] | null;
          version: string;
        };
        Insert: {
          created_by?: string | null;
          idempotency_key?: string | null;
          name?: string | null;
          rollback?: string[] | null;
          statements?: string[] | null;
          version: string;
        };
        Update: {
          created_by?: string | null;
          idempotency_key?: string | null;
          name?: string | null;
          rollback?: string[] | null;
          statements?: string[] | null;
          version?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  vault: {
    Tables: {
      secrets: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          key_id: string | null;
          name: string | null;
          nonce: string | null;
          secret: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          id?: string;
          key_id?: string | null;
          name?: string | null;
          nonce?: string | null;
          secret: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          key_id?: string | null;
          name?: string | null;
          nonce?: string | null;
          secret?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      decrypted_secrets: {
        Row: {
          created_at: string | null;
          decrypted_secret: string | null;
          description: string | null;
          id: string | null;
          key_id: string | null;
          name: string | null;
          nonce: string | null;
          secret: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          decrypted_secret?: never;
          description?: string | null;
          id?: string | null;
          key_id?: string | null;
          name?: string | null;
          nonce?: string | null;
          secret?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          decrypted_secret?: never;
          description?: string | null;
          id?: string | null;
          key_id?: string | null;
          name?: string | null;
          nonce?: string | null;
          secret?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      _crypto_aead_det_decrypt: {
        Args: {
          additional: string;
          context?: string;
          key_id: number;
          message: string;
          nonce?: string;
        };
        Returns: string;
      };
      _crypto_aead_det_encrypt: {
        Args: {
          additional: string;
          context?: string;
          key_id: number;
          message: string;
          nonce?: string;
        };
        Returns: string;
      };
      _crypto_aead_det_noncegen: { Args: never; Returns: string };
      create_secret: {
        Args: {
          new_description?: string;
          new_key_id?: string;
          new_name?: string;
          new_secret: string;
        };
        Returns: string;
      };
      update_secret: {
        Args: {
          new_description?: string;
          new_key_id?: string;
          new_name?: string;
          new_secret?: string;
          secret_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  auth: {
    Enums: {
      aal_level: ["aal1", "aal2", "aal3"],
      code_challenge_method: ["s256", "plain"],
      factor_status: ["unverified", "verified"],
      factor_type: ["totp", "webauthn", "phone"],
      oauth_authorization_status: ["pending", "approved", "denied", "expired"],
      oauth_client_type: ["public", "confidential"],
      oauth_registration_type: ["dynamic", "manual"],
      oauth_response_type: ["code"],
      one_time_token_type: [
        "confirmation_token",
        "reauthentication_token",
        "recovery_token",
        "email_change_token_new",
        "email_change_token_current",
        "phone_change_token",
      ],
    },
  },
  cron: {
    Enums: {},
  },
  extensions: {
    Enums: {},
  },
  graphql: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  net: {
    Enums: {
      request_status: ["PENDING", "SUCCESS", "ERROR"],
    },
  },
  pgbouncer: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "moderator", "user"],
    },
  },
  realtime: {
    Enums: {
      action: ["INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR"],
      equality_op: ["eq", "neq", "lt", "lte", "gt", "gte", "in"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS"],
    },
  },
  supabase_migrations: {
    Enums: {},
  },
  vault: {
    Enums: {},
  },
} as const;
