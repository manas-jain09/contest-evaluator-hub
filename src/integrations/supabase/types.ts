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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
