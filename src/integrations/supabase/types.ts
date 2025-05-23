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
      contest_questions: {
        Row: {
          contest_id: string | null
          created_at: string | null
          description: string | null
          id: string
          title: string | null
        }
        Insert: {
          contest_id?: string | null
          created_at?: string | null
          description?: string | null
          id: string
          title?: string | null
        }
        Update: {
          contest_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contest_questions_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contests: {
        Row: {
          contest_code: string | null
          created_at: string | null
          duration_mins: number | null
          end_date: string | null
          id: string
          name: string | null
          public_access: boolean | null
          start_date: string | null
          type: string | null
        }
        Insert: {
          contest_code?: string | null
          created_at?: string | null
          duration_mins?: number | null
          end_date?: string | null
          id: string
          name?: string | null
          public_access?: boolean | null
          start_date?: string | null
          type?: string | null
        }
        Update: {
          contest_code?: string | null
          created_at?: string | null
          duration_mins?: number | null
          end_date?: string | null
          id?: string
          name?: string | null
          public_access?: boolean | null
          start_date?: string | null
          type?: string | null
        }
        Relationships: []
      }
      examples: {
        Row: {
          created_at: string | null
          explanation: string | null
          id: string
          input: string | null
          output: string | null
          question_id: string | null
        }
        Insert: {
          created_at?: string | null
          explanation?: string | null
          id: string
          input?: string | null
          output?: string | null
          question_id?: string | null
        }
        Update: {
          created_at?: string | null
          explanation?: string | null
          id?: string
          input?: string | null
          output?: string | null
          question_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "examples_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "contest_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      language_templates: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          question_id: string | null
          template: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          question_id?: string | null
          template?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          question_id?: string | null
          template?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "language_templates_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "contest_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string
          description: string
          difficulty: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          difficulty: string
          id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          difficulty?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      practice_contest_results: {
        Row: {
          contest_id: string
          created_at: string
          id: string
          is_completed: boolean
          prn: string
          updated_at: string
        }
        Insert: {
          contest_id: string
          created_at?: string
          id?: string
          is_completed?: boolean
          prn: string
          updated_at?: string
        }
        Update: {
          contest_id?: string
          created_at?: string
          id?: string
          is_completed?: boolean
          prn?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_contest"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_progress: {
        Row: {
          contest_id: string | null
          created_at: string | null
          id: string
          language_id: string | null
          last_updated: string | null
          prn: string | null
          user_code: string | null
        }
        Insert: {
          contest_id?: string | null
          created_at?: string | null
          id: string
          language_id?: string | null
          last_updated?: string | null
          prn?: string | null
          user_code?: string | null
        }
        Update: {
          contest_id?: string | null
          created_at?: string | null
          id?: string
          language_id?: string | null
          last_updated?: string | null
          prn?: string | null
          user_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_progress_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          difficulty: string
          id: string
          solution_link: string
          title: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          difficulty: string
          id: string
          solution_link: string
          title: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          difficulty?: string
          id?: string
          solution_link?: string
          title?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          batch: string | null
          cheating_detected: boolean | null
          contest_id: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          prn: string | null
          score: number | null
          year: string | null
        }
        Insert: {
          batch?: string | null
          cheating_detected?: boolean | null
          contest_id?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          prn?: string | null
          score?: number | null
          year?: string | null
        }
        Update: {
          batch?: string | null
          cheating_detected?: boolean | null
          contest_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          prn?: string | null
          score?: number | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "results_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          code: string | null
          id: string
          language_id: string | null
          question_id: string | null
          result_id: string | null
          score: number | null
          submitted_at: string | null
        }
        Insert: {
          code?: string | null
          id: string
          language_id?: string | null
          question_id?: string | null
          result_id?: string | null
          score?: number | null
          submitted_at?: string | null
        }
        Update: {
          code?: string | null
          id?: string
          language_id?: string | null
          question_id?: string | null
          result_id?: string | null
          score?: number | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "contest_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "results"
            referencedColumns: ["id"]
          },
        ]
      }
      test_cases: {
        Row: {
          created_at: string | null
          expected: string | null
          id: string
          input: string | null
          points: number | null
          question_id: string | null
          visible: boolean | null
        }
        Insert: {
          created_at?: string | null
          expected?: string | null
          id: string
          input?: string | null
          points?: number | null
          question_id?: string | null
          visible?: boolean | null
        }
        Update: {
          created_at?: string | null
          expected?: string | null
          id?: string
          input?: string | null
          points?: number | null
          question_id?: string | null
          visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "test_cases_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "contest_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string
          id: string
          learning_path_id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          learning_path_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          learning_path_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean | null
          is_marked_for_revision: boolean | null
          question_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          is_marked_for_revision?: boolean | null
          question_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          is_marked_for_revision?: boolean | null
          question_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          password: string
          prn: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          password: string
          prn: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          password?: string
          prn?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
