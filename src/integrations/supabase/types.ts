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
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
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
          password_hash: string
          session_expires_at: string | null
          session_token: string | null
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
          password_hash: string
          session_expires_at?: string | null
          session_token?: string | null
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
          password_hash?: string
          session_expires_at?: string | null
          session_token?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blogs: {
        Row: {
          content: string
          created_at: string
          excerpt: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          published: boolean | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
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
      [_ in never]: never
    }
    Functions: {
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
      citext: {
        Args: { "": boolean } | { "": string } | { "": unknown }
        Returns: string
      }
      citext_hash: {
        Args: { "": string }
        Returns: number
      }
      citextin: {
        Args: { "": unknown }
        Returns: string
      }
      citextout: {
        Args: { "": string }
        Returns: unknown
      }
      citextrecv: {
        Args: { "": unknown }
        Returns: string
      }
      citextsend: {
        Args: { "": string }
        Returns: string
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
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
      is_authenticated_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_bcrypt: {
        Args: { p: string }
        Returns: boolean
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
      simple_admin_login: {
        Args: { p_email: string; p_password: string }
        Returns: {
          admin_id: string
          full_name: string
          is_super_admin: boolean
        }[]
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
