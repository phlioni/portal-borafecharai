export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      business_segments: {
        Row: {
          created_at: string | null
          id: string
          segment_name: string
          segment_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          segment_name: string
          segment_order?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          segment_name?: string
          segment_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      business_types: {
        Row: {
          created_at: string | null
          id: string
          segment_id: string | null
          type_name: string
          type_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          segment_id?: string | null
          type_name: string
          type_order?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          segment_id?: string | null
          type_name?: string
          type_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_types_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "business_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          business_segment: string | null
          business_type: string | null
          business_type_detail: string | null
          city: string | null
          cnpj: string | null
          country_code: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          legal_name: string | null
          logo_url: string | null
          name: string
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          business_segment?: string | null
          business_type?: string | null
          business_type_detail?: string | null
          city?: string | null
          cnpj?: string | null
          country_code?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          business_segment?: string | null
          business_type?: string | null
          business_type_detail?: string | null
          city?: string | null
          cnpj?: string | null
          country_code?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      custom_proposal_templates: {
        Row: {
          created_at: string
          description: string | null
          html_content: string
          id: string
          name: string
          template_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          html_content: string
          id?: string
          name: string
          template_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          html_content?: string
          id?: string
          name?: string
          template_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          email_message_template: string
          email_signature: string
          email_subject_template: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_message_template: string
          email_signature: string
          email_subject_template: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_message_template?: string
          email_signature?: string
          email_subject_template?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      proposal_budget_items: {
        Row: {
          created_at: string
          description: string
          id: string
          proposal_id: string
          quantity: number
          total_price: number | null
          type: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          proposal_id: string
          quantity?: number
          total_price?: number | null
          type: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          proposal_id?: string
          quantity?: number
          total_price?: number | null
          type?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_budget_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_notifications: {
        Row: {
          created_at: string | null
          id: string
          notified: boolean | null
          proposal_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notified?: boolean | null
          proposal_id?: string | null
          status: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notified?: boolean | null
          proposal_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_notifications_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          client_id: string | null
          created_at: string
          delivery_time: string | null
          detailed_description: string | null
          id: string
          last_viewed_at: string | null
          observations: string | null
          public_hash: string | null
          service_description: string | null
          status: string | null
          template_id: string | null
          title: string
          updated_at: string
          user_id: string
          validity_date: string | null
          value: number | null
          views: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          delivery_time?: string | null
          detailed_description?: string | null
          id?: string
          last_viewed_at?: string | null
          observations?: string | null
          public_hash?: string | null
          service_description?: string | null
          status?: string | null
          template_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          validity_date?: string | null
          value?: number | null
          views?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          delivery_time?: string | null
          detailed_description?: string | null
          id?: string
          last_viewed_at?: string | null
          observations?: string | null
          public_hash?: string | null
          service_description?: string | null
          status?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          validity_date?: string | null
          value?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          bonus_granted_at: string | null
          bonus_proposals_current_month: number | null
          cancel_at_period_end: boolean | null
          created_at: string
          email: string
          id: string
          profile_completion_bonus_claimed: boolean | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          trial_end_date: string | null
          trial_proposals_used: number | null
          trial_start_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bonus_granted_at?: string | null
          bonus_proposals_current_month?: number | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          email: string
          id?: string
          profile_completion_bonus_claimed?: boolean | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end_date?: string | null
          trial_proposals_used?: number | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bonus_granted_at?: string | null
          bonus_proposals_current_month?: number | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          email?: string
          id?: string
          profile_completion_bonus_claimed?: boolean | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end_date?: string | null
          trial_proposals_used?: number | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      telegram_bot_settings: {
        Row: {
          bot_token: string | null
          bot_username: string | null
          chat_id: number | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          webhook_configured: boolean | null
        }
        Insert: {
          bot_token?: string | null
          bot_username?: string | null
          chat_id?: number | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          webhook_configured?: boolean | null
        }
        Update: {
          bot_token?: string | null
          bot_username?: string | null
          chat_id?: number | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          webhook_configured?: boolean | null
        }
        Relationships: []
      }
      telegram_sessions: {
        Row: {
          chat_id: number
          client_email: string | null
          created_at: string
          expires_at: string | null
          id: string
          phone: string | null
          session_data: Json | null
          step: string
          telegram_user_id: number
          updated_at: string
          user_id: string | null
          user_profile: Json | null
        }
        Insert: {
          chat_id: number
          client_email?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          phone?: string | null
          session_data?: Json | null
          step?: string
          telegram_user_id: number
          updated_at?: string
          user_id?: string | null
          user_profile?: Json | null
        }
        Update: {
          chat_id?: number
          client_email?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          phone?: string | null
          session_data?: Json | null
          step?: string
          telegram_user_id?: number
          updated_at?: string
          user_id?: string | null
          user_profile?: Json | null
        }
        Relationships: []
      }
      user_companies: {
        Row: {
          address: string | null
          business_segment: string | null
          business_type: string | null
          business_type_detail: string | null
          city: string | null
          cnpj: string | null
          country_code: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          legal_name: string | null
          logo_url: string | null
          name: string
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          business_segment?: string | null
          business_type?: string | null
          business_type_detail?: string | null
          city?: string | null
          cnpj?: string | null
          country_code?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          business_segment?: string | null
          business_type?: string | null
          business_type_detail?: string | null
          city?: string | null
          cnpj?: string | null
          country_code?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_sessions: {
        Row: {
          created_at: string
          id: string
          phone_number: string
          session_data: Json | null
          step: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          phone_number: string
          session_data?: Json | null
          step?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          phone_number?: string
          session_data?: Json | null
          step?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_proposal: {
        Args: { _user_id: string }
        Returns: boolean
      }
      cleanup_expired_telegram_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_business_types_by_segment: {
        Args: { segment_id: string }
        Returns: {
          id: string
          segment_id: string
          type_name: string
          type_order: number
          created_at: string
          updated_at: string
        }[]
      }
      get_monthly_proposal_count: {
        Args: { _user_id: string; _month?: string }
        Returns: number
      }
      grant_profile_completion_bonus: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_profile_complete: {
        Args: { _user_id: string }
        Returns: boolean
      }
      reset_monthly_bonus: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user" | "guest"
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
      app_role: ["admin", "user", "guest"],
    },
  },
} as const
