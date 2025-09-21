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
      admin_files: {
        Row: {
          created_at: string
          file_category: string
          file_type: string
          file_url: string
          filename: string
          id: string
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_category: string
          file_type: string
          file_url: string
          filename: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_category?: string
          file_type?: string
          file_url?: string
          filename?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          failed_login_attempts: number | null
          full_name: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          locked_until: string | null
          password_changed_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          failed_login_attempts?: number | null
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          locked_until?: string | null
          password_changed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          failed_login_attempts?: number | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          locked_until?: string | null
          password_changed_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string
          credential_id: string | null
          credential_url: string | null
          expiry_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          issue_date: string
          issuer: string
          name: string
          pdf_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          issue_date: string
          issuer: string
          name: string
          pdf_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          issue_date?: string
          issuer?: string
          name?: string
          pdf_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      experiences: {
        Row: {
          achievements: string[] | null
          company: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          location: string | null
          start_date: string
          technologies: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          achievements?: string[] | null
          company: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          start_date: string
          technologies?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          achievements?: string[] | null
          company?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          start_date?: string
          technologies?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      formations: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          institution: string
          is_current: boolean | null
          level: string | null
          skills: string[] | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          institution: string
          is_current?: boolean | null
          level?: string | null
          skills?: string[] | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          institution?: string
          is_current?: boolean | null
          level?: string | null
          skills?: string[] | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          content: string | null
          created_at: string
          demo_url: string | null
          description: string | null
          featured: boolean | null
          github_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          technologies: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          technologies?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          technologies?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limit_contact: {
        Row: {
          attempts: number | null
          created_at: string | null
          id: string
          ip_address: unknown
          is_blocked: boolean | null
          window_start: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          ip_address: unknown
          is_blocked?: boolean | null
          window_start?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          is_blocked?: boolean | null
          window_start?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          action: string | null
          actor_admin: string | null
          actor_user: string | null
          created_at: string | null
          details: Json | null
          detected_at: string | null
          id: string
          ip_address: unknown | null
          kind: Database["public"]["Enums"]["security_event_kind"]
          message: string | null
          record_id: string | null
          severity: string | null
          table_name: string | null
          user_agent: string | null
        }
        Insert: {
          action?: string | null
          actor_admin?: string | null
          actor_user?: string | null
          created_at?: string | null
          details?: Json | null
          detected_at?: string | null
          id?: string
          ip_address?: unknown | null
          kind: Database["public"]["Enums"]["security_event_kind"]
          message?: string | null
          record_id?: string | null
          severity?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string | null
          actor_admin?: string | null
          actor_user?: string | null
          created_at?: string | null
          details?: Json | null
          detected_at?: string | null
          id?: string
          ip_address?: unknown | null
          kind?: Database["public"]["Enums"]["security_event_kind"]
          message?: string | null
          record_id?: string | null
          severity?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_featured: boolean | null
          level: number
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          level: number
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          level?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          category: string
          config: Json | null
          created_at: string
          description: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          config?: Json | null
          created_at?: string
          description: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          config?: Json | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      veille_sources: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          keywords: string[] | null
          last_sync: string | null
          name: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          last_sync?: string | null
          name: string
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          last_sync?: string | null
          name?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      veille_techno: {
        Row: {
          category: string
          content: string | null
          created_at: string
          cve_id: string | null
          excerpt: string | null
          id: string
          imported_at: string
          is_active: boolean | null
          is_featured: boolean | null
          keywords: string[] | null
          published_at: string
          severity: string | null
          source: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          cve_id?: string | null
          excerpt?: string | null
          id?: string
          imported_at?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          keywords?: string[] | null
          published_at: string
          severity?: string | null
          source: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          cve_id?: string | null
          excerpt?: string | null
          id?: string
          imported_at?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          keywords?: string[] | null
          published_at?: string
          severity?: string | null
          source?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_audit_log_v: {
        Row: {
          action: string | null
          admin_id: string | null
          created_at: string | null
          id: string | null
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
        }
        Insert: {
          action?: string | null
          admin_id?: string | null
          created_at?: string | null
          id?: string | null
          ip_address?: unknown | null
          new_values?: never
          old_values?: never
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string | null
          admin_id?: string | null
          created_at?: string | null
          id?: string | null
          ip_address?: unknown | null
          new_values?: never
          old_values?: never
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      anomaly_detections_v: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          ip_address: unknown | null
          is_resolved: boolean | null
          metadata: Json | null
          severity: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          ip_address?: unknown | null
          is_resolved?: never
          metadata?: Json | null
          severity?: never
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          ip_address?: unknown | null
          is_resolved?: never
          metadata?: Json | null
          severity?: never
          user_id?: string | null
        }
        Relationships: []
      }
      security_logs_v: {
        Row: {
          created_at: string | null
          event_type: string | null
          id: string | null
          ip_address: unknown | null
          metadata: Json | null
          severity: string | null
          source: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type?: string | null
          id?: string | null
          ip_address?: unknown | null
          metadata?: Json | null
          severity?: never
          source?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string | null
          id?: string | null
          ip_address?: unknown | null
          metadata?: Json | null
          severity?: never
          source?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      bootstrap_admin_if_none_exists: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      change_admin_password: {
        Args: {
          p_admin_id: string
          p_current_password: string
          p_new_password: string
        }
        Returns: boolean
      }
      change_own_password: {
        Args: { p_current_password: string; p_new_password: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: { p_email?: string; p_ip: unknown }
        Returns: boolean
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_security_data: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      create_admin_auth_user: {
        Args: { p_email: string; p_full_name: string; p_password: string }
        Returns: Json
      }
      create_admin_user: {
        Args: {
          p_email: string
          p_full_name: string
          p_is_super_admin?: boolean
          p_password: string
        }
        Returns: string
      }
      create_first_super_admin: {
        Args: { p_email: string; p_full_name: string; p_password: string }
        Returns: string
      }
      debug_whoami: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { p_uid: string }
        Returns: boolean
      }
      is_admin_authenticated: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_uuid: {
        Args: { p: string }
        Returns: boolean
      }
      is_authenticated_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_bcrypt: {
        Args: { p: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_event_type: string
          p_ip_address?: unknown
          p_metadata?: Json
          p_severity: string
          p_source: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
      rotate_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      secure_admin_login: {
        Args: { p_email: string; p_ip?: unknown; p_password: string }
        Returns: {
          admin_id: string
          full_name: string
          session_token: string
          success: boolean
        }[]
      }
      validate_encryption_key: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
      verify_admin_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      security_event_kind: "audit" | "anomaly" | "security_log"
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
      security_event_kind: ["audit", "anomaly", "security_log"],
    },
  },
} as const
