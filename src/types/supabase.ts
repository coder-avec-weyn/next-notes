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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      note_templates: {
        Row: {
          category: string | null
          color: string | null
          content: string | null
          created_at: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          color?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      note_versions: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          note_id: string
          title: string
          user_id: string
          version: number
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          note_id: string
          title: string
          user_id: string
          version: number
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          note_id?: string
          title?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "note_versions_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          category: string | null
          collaborators: string[] | null
          color: string | null
          content: string | null
          created_at: string | null
          id: string
          is_archived: boolean | null
          is_favorite: boolean | null
          is_pinned: boolean | null
          is_public: boolean | null
          location: string | null
          mood: string | null
          priority: string | null
          reading_time: number | null
          reminder_date: string | null
          status: string | null
          tags: string[] | null
          template_id: string | null
          title: string
          updated_at: string | null
          user_id: string
          version: number | null
          weather: string | null
          word_count: number | null
        }
        Insert: {
          category?: string | null
          collaborators?: string[] | null
          color?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_favorite?: boolean | null
          is_pinned?: boolean | null
          is_public?: boolean | null
          location?: string | null
          mood?: string | null
          priority?: string | null
          reading_time?: number | null
          reminder_date?: string | null
          status?: string | null
          tags?: string[] | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
          user_id: string
          version?: number | null
          weather?: string | null
          word_count?: number | null
        }
        Update: {
          category?: string | null
          collaborators?: string[] | null
          color?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_favorite?: boolean | null
          is_pinned?: boolean | null
          is_public?: boolean | null
          location?: string | null
          mood?: string | null
          priority?: string | null
          reading_time?: number | null
          reminder_date?: string | null
          status?: string | null
          tags?: string[] | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          version?: number | null
          weather?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          category: string | null
          color: string | null
          content: string | null
          created_at: string
          id: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          content?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          color?: string | null
          content?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          activity_description: string | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_description?: string | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_description?: string | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          category: string
          created_at: string | null
          id: string
          preference_key: string
          preference_value: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          preference_key: string
          preference_value: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          preference_key?: string
          preference_value?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_accessed_at: string | null
          location: string | null
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_accessed_at?: string | null
          location?: string | null
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_accessed_at?: string | null
          location?: string | null
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          account_status: string | null
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          id: string
          image: string | null
          job_title: string | null
          language: string | null
          last_login_at: string | null
          location: string | null
          login_count: number | null
          name: string | null
          notification_preferences: Json | null
          phone: string | null
          privacy_settings: Json | null
          profile_completion_percentage: number | null
          public_profile: boolean | null
          social_links: Json | null
          theme_preference: string | null
          timezone: string | null
          token_identifier: string
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          account_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          image?: string | null
          job_title?: string | null
          language?: string | null
          last_login_at?: string | null
          location?: string | null
          login_count?: number | null
          name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          privacy_settings?: Json | null
          profile_completion_percentage?: number | null
          public_profile?: boolean | null
          social_links?: Json | null
          theme_preference?: string | null
          timezone?: string | null
          token_identifier: string
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          account_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          image?: string | null
          job_title?: string | null
          language?: string | null
          last_login_at?: string | null
          location?: string | null
          login_count?: number | null
          name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          privacy_settings?: Json | null
          profile_completion_percentage?: number | null
          public_profile?: boolean | null
          social_links?: Json | null
          theme_preference?: string | null
          timezone?: string | null
          token_identifier?: string
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_profile_completion: {
        Args: { user_row: Database["public"]["Tables"]["users"]["Row"] }
        Returns: number
      }
      log_user_activity: {
        Args: {
          p_user_id: string
          p_activity_type: string
          p_activity_description?: string
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: undefined
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
