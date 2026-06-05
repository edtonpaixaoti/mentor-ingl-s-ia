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
  public: {
    Tables: {
      achievements: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          title: string
          unlocked_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          title: string
          unlocked_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          unlocked_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string | null
          type: Database["public"]["Enums"]["tx_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason?: string | null
          type: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string | null
          type?: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          last_reset_at: string
          monthly_grant: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          last_reset_at?: string
          monthly_grant?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          last_reset_at?: string
          monthly_grant?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercise_attempts: {
        Row: {
          answers: Json
          created_at: string
          exercise_id: string
          id: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          exercise_id: string
          id?: string
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          exercise_id?: string
          id?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_attempts_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          id: string
          level: Database["public"]["Enums"]["english_level"] | null
          payload: Json
          topic: string | null
          type: Database["public"]["Enums"]["exercise_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["english_level"] | null
          payload: Json
          topic?: string | null
          type: Database["public"]["Enums"]["exercise_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["english_level"] | null
          payload?: Json
          topic?: string | null
          type?: Database["public"]["Enums"]["exercise_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          daily_minutes: number | null
          email: string | null
          english_level: Database["public"]["Enums"]["english_level"] | null
          full_name: string | null
          id: string
          last_active_date: string | null
          learning_goal: Database["public"]["Enums"]["learning_goal"] | null
          level: number
          onboarding_completed: boolean
          profession: string | null
          streak_days: number
          theme: Database["public"]["Enums"]["theme_pref"] | null
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          daily_minutes?: number | null
          email?: string | null
          english_level?: Database["public"]["Enums"]["english_level"] | null
          full_name?: string | null
          id?: string
          last_active_date?: string | null
          learning_goal?: Database["public"]["Enums"]["learning_goal"] | null
          level?: number
          onboarding_completed?: boolean
          profession?: string | null
          streak_days?: number
          theme?: Database["public"]["Enums"]["theme_pref"] | null
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          daily_minutes?: number | null
          email?: string | null
          english_level?: Database["public"]["Enums"]["english_level"] | null
          full_name?: string | null
          id?: string
          last_active_date?: string | null
          learning_goal?: Database["public"]["Enums"]["learning_goal"] | null
          level?: number
          onboarding_completed?: boolean
          profession?: string | null
          streak_days?: number
          theme?: Database["public"]["Enums"]["theme_pref"] | null
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      pronunciation_scores: {
        Row: {
          clarity: number | null
          created_at: string
          feedback: string | null
          fluency: number | null
          id: string
          overall: number | null
          pronunciation: number | null
          target_text: string
          tips: string | null
          transcript: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          clarity?: number | null
          created_at?: string
          feedback?: string | null
          fluency?: number | null
          id?: string
          overall?: number | null
          pronunciation?: number | null
          target_text: string
          tips?: string | null
          transcript?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          clarity?: number | null
          created_at?: string
          feedback?: string | null
          fluency?: number | null
          id?: string
          overall?: number | null
          pronunciation?: number | null
          target_text?: string
          tips?: string | null
          transcript?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_plans: {
        Row: {
          active: boolean
          created_at: string
          daily_tasks: Json
          description: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
          weekly_goals: Json
        }
        Insert: {
          active?: boolean
          created_at?: string
          daily_tasks?: Json
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
          weekly_goals?: Json
        }
        Update: {
          active?: boolean
          created_at?: string
          daily_tasks?: Json
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
          weekly_goals?: Json
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          in_app_notifications: boolean | null
          speaking_speed: number | null
          updated_at: string
          user_id: string
          voice_gender: Database["public"]["Enums"]["voice_gender"] | null
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          in_app_notifications?: boolean | null
          speaking_speed?: number | null
          updated_at?: string
          user_id: string
          voice_gender?: Database["public"]["Enums"]["voice_gender"] | null
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          in_app_notifications?: boolean | null
          speaking_speed?: number | null
          updated_at?: string
          user_id?: string
          voice_gender?: Database["public"]["Enums"]["voice_gender"] | null
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
      vocabulary: {
        Row: {
          created_at: string
          example: string | null
          id: string
          is_difficult: boolean
          is_favorite: boolean
          meaning: string | null
          pronunciation: string | null
          translation: string | null
          updated_at: string
          user_id: string
          word: string
        }
        Insert: {
          created_at?: string
          example?: string | null
          id?: string
          is_difficult?: boolean
          is_favorite?: boolean
          meaning?: string | null
          pronunciation?: string | null
          translation?: string | null
          updated_at?: string
          user_id: string
          word: string
        }
        Update: {
          created_at?: string
          example?: string | null
          id?: string
          is_difficult?: boolean
          is_favorite?: boolean
          meaning?: string | null
          pronunciation?: string | null
          translation?: string | null
          updated_at?: string
          user_id?: string
          word?: string
        }
        Relationships: []
      }
      vocabulary_reviews: {
        Row: {
          created_at: string
          id: string
          outcome: string
          reviewed_at: string
          updated_at: string
          user_id: string
          vocabulary_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          outcome: string
          reviewed_at?: string
          updated_at?: string
          user_id: string
          vocabulary_id: string
        }
        Update: {
          created_at?: string
          id?: string
          outcome?: string
          reviewed_at?: string
          updated_at?: string
          user_id?: string
          vocabulary_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_reviews_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabulary"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_logs: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_credits: {
        Args: { _amount: number; _reason: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      english_level:
        | "iniciante"
        | "basico"
        | "intermediario"
        | "avancado"
        | "fluente"
      exercise_type:
        | "multiple_choice"
        | "fill_blanks"
        | "translation"
        | "reading"
        | "listening"
      learning_goal: "viagem" | "trabalho" | "ti" | "negocios" | "fluencia"
      notification_type: "reminder" | "goal" | "achievement" | "system"
      theme_pref: "light" | "dark" | "system"
      tx_type: "grant" | "consume" | "refund" | "reset"
      voice_gender: "male" | "female"
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
      app_role: ["admin", "moderator", "user"],
      english_level: [
        "iniciante",
        "basico",
        "intermediario",
        "avancado",
        "fluente",
      ],
      exercise_type: [
        "multiple_choice",
        "fill_blanks",
        "translation",
        "reading",
        "listening",
      ],
      learning_goal: ["viagem", "trabalho", "ti", "negocios", "fluencia"],
      notification_type: ["reminder", "goal", "achievement", "system"],
      theme_pref: ["light", "dark", "system"],
      tx_type: ["grant", "consume", "refund", "reset"],
      voice_gender: ["male", "female"],
    },
  },
} as const
