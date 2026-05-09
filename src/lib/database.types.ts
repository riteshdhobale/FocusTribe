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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bans: {
        Row: {
          ban_type: Database["public"]["Enums"]["ban_type"]
          banned_by: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          ip_address: unknown
          is_active: boolean | null
          reason: string
          report_id: string | null
          user_id: string
        }
        Insert: {
          ban_type: Database["public"]["Enums"]["ban_type"]
          banned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          reason: string
          report_id?: string | null
          user_id: string
        }
        Update: {
          ban_type?: Database["public"]["Enums"]["ban_type"]
          banned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          reason?: string
          report_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bans_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_unlocks: {
        Row: {
          id: string
          level: number
          match_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          level: number
          match_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          level?: number
          match_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_unlocks_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          profile_a: string
          profile_b: string
          status: string
          unread_a: number
          unread_b: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          profile_a: string
          profile_b: string
          status?: string
          unread_a?: number
          unread_b?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          profile_a?: string
          profile_b?: string
          status?: string
          unread_a?: number
          unread_b?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_profile_a_fkey"
            columns: ["profile_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_profile_b_fkey"
            columns: ["profile_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          id: string
          is_filtered: boolean
          match_id: string
          sender_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_filtered?: boolean
          match_id: string
          sender_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          is_filtered?: boolean
          match_id?: string
          sender_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          payment_provider: string
          plan: string
          provider_order_id: string | null
          provider_payment_id: string | null
          status: string
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_provider: string
          plan: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_provider?: string
          plan?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number
          availability: string
          avatar_color: string
          avatar_emoji: string
          bio: string
          career_goal: string
          city: string
          college: string
          created_at: string
          exam_focus: string[]
          gender: string
          gender_pref: string
          group_pref: string
          hours_studied: number
          id: string
          intent: string
          interests: string[]
          is_online: boolean
          is_pro: boolean
          is_verified: boolean
          last_seen: string
          looking_for_prompt: string
          name: string
          photo_urls: string[]
          streak: number
          student_email: string | null
          study_formats: string[]
          study_style: string
          updated_at: string
          year: string
        }
        Insert: {
          age?: number
          availability?: string
          avatar_color?: string
          avatar_emoji?: string
          bio?: string
          career_goal?: string
          city?: string
          college?: string
          created_at?: string
          exam_focus?: string[]
          gender?: string
          gender_pref?: string
          group_pref?: string
          hours_studied?: number
          id: string
          intent?: string
          interests?: string[]
          is_online?: boolean
          is_pro?: boolean
          is_verified?: boolean
          last_seen?: string
          looking_for_prompt?: string
          name?: string
          photo_urls?: string[]
          streak?: number
          student_email?: string | null
          study_formats?: string[]
          study_style?: string
          updated_at?: string
          year?: string
        }
        Update: {
          age?: number
          availability?: string
          avatar_color?: string
          avatar_emoji?: string
          bio?: string
          career_goal?: string
          city?: string
          college?: string
          created_at?: string
          exam_focus?: string[]
          gender?: string
          gender_pref?: string
          group_pref?: string
          hours_studied?: number
          id?: string
          intent?: string
          interests?: string[]
          is_online?: boolean
          is_pro?: boolean
          is_verified?: boolean
          last_seen?: string
          looking_for_prompt?: string
          name?: string
          photo_urls?: string[]
          streak?: number
          student_email?: string | null
          study_formats?: string[]
          study_style?: string
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          context: string | null
          created_at: string | null
          description: string
          evidence_url: string | null
          id: string
          report_type: Database["public"]["Enums"]["report_type"]
          reported_user_id: string
          reporter_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status"] | null
        }
        Insert: {
          admin_notes?: string | null
          context?: string | null
          created_at?: string | null
          description: string
          evidence_url?: string | null
          id?: string
          report_type: Database["public"]["Enums"]["report_type"]
          reported_user_id: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Update: {
          admin_notes?: string | null
          context?: string | null
          created_at?: string | null
          description?: string
          evidence_url?: string | null
          id?: string
          report_type?: Database["public"]["Enums"]["report_type"]
          reported_user_id?: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          created_at: string
          duration_minutes: number
          ended_at: string | null
          id: string
          match_id: string
          pomodoros_completed: number
          started_by: string
          tasks_completed: number
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          match_id: string
          pomodoros_completed?: number
          started_by: string
          tasks_completed?: number
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          match_id?: string
          pomodoros_completed?: number
          started_by?: string
          tasks_completed?: number
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_sessions_started_by_fkey"
            columns: ["started_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          payment_provider: string | null
          payment_subscription_id: string | null
          plan: string
          status: string
          trial_end: string
          trial_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_provider?: string | null
          payment_subscription_id?: string | null
          plan?: string
          status?: string
          trial_end?: string
          trial_start?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_provider?: string | null
          payment_subscription_id?: string | null
          plan?: string
          status?: string
          trial_end?: string
          trial_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      swipe_history: {
        Row: {
          action: string
          created_at: string
          id: string
          swiped_id: string
          swiper_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          swiped_id: string
          swiper_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          swiped_id?: string
          swiper_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipe_history_swiped_id_fkey"
            columns: ["swiped_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipe_history_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_report_summary: {
        Row: {
          actioned_reports: number | null
          last_reported_at: string | null
          pending_reports: number | null
          reported_user_id: string | null
          total_reports: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_filtered_deck: {
        Args: {
          p_age_max?: number
          p_age_min?: number
          p_city_filter?: string[]
          p_college_filter?: string[]
          p_exam_filter?: string[]
          p_gender_filter?: string
          p_user_id: string
        }
        Returns: {
          age: number
          availability: string
          avatar_color: string
          avatar_emoji: string
          bio: string
          career_goal: string
          city: string
          college: string
          created_at: string
          exam_focus: string[]
          gender: string
          gender_pref: string
          group_pref: string
          hours_studied: number
          id: string
          intent: string
          interests: string[]
          is_online: boolean
          is_pro: boolean
          is_verified: boolean
          last_seen: string
          looking_for_prompt: string
          name: string
          photo_urls: string[]
          streak: number
          student_email: string | null
          study_formats: string[]
          study_style: string
          updated_at: string
          year: string
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      is_user_banned: {
        Args: { check_user_id: string }
        Returns: {
          ban_reason: string
          ban_type: Database["public"]["Enums"]["ban_type"]
          expires_at: string
          is_banned: boolean
        }[]
      }
      is_user_in_trial: { Args: { p_user_id: string }; Returns: boolean }
      is_user_pro: { Args: { p_user_id: string }; Returns: boolean }
    }
    Enums: {
      ban_type: "warning" | "temporary" | "permanent" | "ip_ban"
      report_status: "pending" | "reviewing" | "action_taken" | "dismissed"
      report_type:
        | "harassment"
        | "fake_profile"
        | "spam"
        | "inappropriate_content"
        | "underage"
        | "threats"
        | "hate_speech"
        | "other"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      ban_type: ["warning", "temporary", "permanent", "ip_ban"],
      report_status: ["pending", "reviewing", "action_taken", "dismissed"],
      report_type: [
        "harassment",
        "fake_profile",
        "spam",
        "inappropriate_content",
        "underage",
        "threats",
        "hate_speech",
        "other",
      ],
    },
  },
} as const
