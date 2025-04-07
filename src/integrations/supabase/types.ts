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
      constraints: {
        Row: {
          created_at: string
          description: string
          id: number
          question_id: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: number
          question_id: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: number
          question_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "constraints_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      contests: {
        Row: {
          contest_code: string
          created_at: string
          duration_mins: number
          end_date: string
          id: string
          name: string
          start_date: string
        }
        Insert: {
          contest_code: string
          created_at?: string
          duration_mins: number
          end_date: string
          id?: string
          name: string
          start_date: string
        }
        Update: {
          contest_code?: string
          created_at?: string
          duration_mins?: number
          end_date?: string
          id?: string
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      examples: {
        Row: {
          created_at: string
          explanation: string | null
          id: number
          input: string
          output: string
          question_id: number
        }
        Insert: {
          created_at?: string
          explanation?: string | null
          id?: number
          input: string
          output: string
          question_id: number
        }
        Update: {
          created_at?: string
          explanation?: string | null
          id?: number
          input?: string
          output?: string
          question_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "examples_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      language_templates: {
        Row: {
          created_at: string
          id: number
          name: string
          question_id: number | null
          template: string
        }
        Insert: {
          created_at?: string
          id: number
          name: string
          question_id?: number | null
          template: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          question_id?: number | null
          template?: string
        }
        Relationships: [
          {
            foreignKeyName: "language_templates_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          contest_id: string | null
          created_at: string
          description: string
          id: number
          title: string
        }
        Insert: {
          contest_id?: string | null
          created_at?: string
          description: string
          id?: number
          title: string
        }
        Update: {
          contest_id?: string | null
          created_at?: string
          description?: string
          id?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          batch: string | null
          cheating_detected: boolean | null
          contest_id: string
          created_at: string
          email: string
          id: string
          name: string
          prn: string
          score: number
          year: string | null
        }
        Insert: {
          batch?: string | null
          cheating_detected?: boolean | null
          contest_id: string
          created_at?: string
          email: string
          id?: string
          name: string
          prn: string
          score?: number
          year?: string | null
        }
        Update: {
          batch?: string | null
          cheating_detected?: boolean | null
          contest_id?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          prn?: string
          score?: number
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
          code: string
          id: string
          language_id: number
          question_id: number
          result_id: string
          score: number
          submitted_at: string
        }
        Insert: {
          code: string
          id?: string
          language_id: number
          question_id: number
          result_id: string
          score?: number
          submitted_at?: string
        }
        Update: {
          code?: string
          id?: string
          language_id?: number
          question_id?: number
          result_id?: string
          score?: number
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
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
          created_at: string
          expected: string
          id: number
          input: string
          points: number
          question_id: number
          visible: boolean
        }
        Insert: {
          created_at?: string
          expected: string
          id?: number
          input: string
          points?: number
          question_id: number
          visible?: boolean
        }
        Update: {
          created_at?: string
          expected?: string
          id?: number
          input?: string
          points?: number
          question_id?: number
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "test_cases_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
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
