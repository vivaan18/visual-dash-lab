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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      community_templates: {
        Row: {
          average_rating: number | null
          category: string | null
          components: Json
          created_at: string | null
          creator_id: string | null
          dashboard_id: string | null
          description: string | null
          downloads_count: number | null
          id: string
          is_active: boolean | null
          name: string
          preview_image: string | null
          tags: string[] | null
          thumbnail_url: string | null
          total_ratings: number | null
          updated_at: string | null
          version: number | null
          visibility: string | null
        }
        Insert: {
          average_rating?: number | null
          category?: string | null
          components: Json
          created_at?: string | null
          creator_id?: string | null
          dashboard_id?: string | null
          description?: string | null
          downloads_count?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          preview_image?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          version?: number | null
          visibility?: string | null
        }
        Update: {
          average_rating?: number | null
          category?: string | null
          components?: Json
          created_at?: string | null
          creator_id?: string | null
          dashboard_id?: string | null
          description?: string | null
          downloads_count?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          preview_image?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          version?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_templates_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_comments: {
        Row: {
          component_id: string | null
          content: string
          created_at: string
          dashboard_id: string
          id: string
          updated_at: string
          user_email: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          component_id?: string | null
          content: string
          created_at?: string
          dashboard_id: string
          id?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          component_id?: string | null
          content?: string
          created_at?: string
          dashboard_id?: string
          id?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_comments_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_shares: {
        Row: {
          created_at: string
          created_by: string
          dashboard_id: string
          expires_at: string | null
          id: string
          is_active: boolean
          permission: Database["public"]["Enums"]["share_permission"]
          share_token: string
        }
        Insert: {
          created_at?: string
          created_by: string
          dashboard_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          permission?: Database["public"]["Enums"]["share_permission"]
          share_token?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          dashboard_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          permission?: Database["public"]["Enums"]["share_permission"]
          share_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_shares_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboards: {
        Row: {
          canvas_background_color: string | null
          canvas_gradient_direction: string | null
          canvas_gradient_enabled: boolean | null
          canvas_gradient_end: string | null
          canvas_gradient_start: string | null
          components: Json
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          canvas_background_color?: string | null
          canvas_gradient_direction?: string | null
          canvas_gradient_enabled?: boolean | null
          canvas_gradient_end?: string | null
          canvas_gradient_start?: string | null
          components?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          canvas_background_color?: string | null
          canvas_gradient_direction?: string | null
          canvas_gradient_enabled?: boolean | null
          canvas_gradient_end?: string | null
          canvas_gradient_start?: string | null
          components?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          gemini_api_key: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          gemini_api_key?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          gemini_api_key?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      template_access_requests: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          requester_id: string | null
          status: string | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          requester_id?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          requester_id?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_access_requests_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "community_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_copies: {
        Row: {
          created_at: string | null
          dashboard_id: string | null
          id: string
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dashboard_id?: string | null
          id?: string
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dashboard_id?: string | null
          id?: string
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_copies_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_copies_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "community_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          template_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          template_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          template_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_notifications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "community_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_ratings: {
        Row: {
          created_at: string | null
          id: string
          rating: number
          review: string | null
          template_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          rating: number
          review?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          rating?: number
          review?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_ratings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "community_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_chart_defaults: {
        Row: {
          chart_type: string
          created_at: string | null
          default_properties: Json
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chart_type: string
          created_at?: string | null
          default_properties: Json
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chart_type?: string
          created_at?: string | null
          default_properties?: Json
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_update_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: undefined
      }
      dashboard_has_active_share: {
        Args: { dashboard_id: string }
        Returns: boolean
      }
      get_community_templates: {
        Args: { p_category?: string; p_search?: string }
        Returns: {
          average_rating: number | null
          category: string | null
          components: Json
          created_at: string | null
          creator_id: string | null
          dashboard_id: string | null
          description: string | null
          downloads_count: number | null
          id: string
          is_active: boolean | null
          name: string
          preview_image: string | null
          tags: string[] | null
          thumbnail_url: string | null
          total_ratings: number | null
          updated_at: string | null
          version: number | null
          visibility: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "community_templates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_dashboard_edit_permission: {
        Args: { dashboard_id: string }
        Returns: boolean
      }
      increment_template_downloads: {
        Args: { template_id_param: string }
        Returns: undefined
      }
      is_admin:
        | { Args: never; Returns: boolean }
        | { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      share_permission: "view" | "comment" | "edit"
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
      app_role: ["admin", "user"],
      share_permission: ["view", "comment", "edit"],
    },
  },
} as const
