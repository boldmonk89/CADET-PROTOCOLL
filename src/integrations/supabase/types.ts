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
      assessment_results: {
        Row: {
          created_at: string
          examiner_signed_by: string | null
          id: string
          measured_value: string | null
          notes: string | null
          parameter: string
          status: string
          threshold: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          examiner_signed_by?: string | null
          id?: string
          measured_value?: string | null
          notes?: string | null
          parameter: string
          status: string
          threshold?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          examiner_signed_by?: string | null
          id?: string
          measured_value?: string | null
          notes?: string | null
          parameter?: string
          status?: string
          threshold?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          log_id: string
          payload: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          log_id?: string
          payload?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          log_id?: string
          payload?: Json | null
        }
        Relationships: []
      }
      candidate_profiles: {
        Row: {
          blood_group: string | null
          candidate_code: string | null
          chest_cm: number | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          date_of_birth: string | null
          entry_scheme: string | null
          family_history: Json | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          intake_completed_at: string | null
          intake_step: number
          medical_history: Json | null
          state: string | null
          target_service: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          blood_group?: string | null
          candidate_code?: string | null
          chest_cm?: number | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          date_of_birth?: string | null
          entry_scheme?: string | null
          family_history?: Json | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          intake_completed_at?: string | null
          intake_step?: number
          medical_history?: Json | null
          state?: string | null
          target_service?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          blood_group?: string | null
          candidate_code?: string | null
          chest_cm?: number | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          date_of_birth?: string | null
          entry_scheme?: string | null
          family_history?: Json | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          intake_completed_at?: string | null
          intake_step?: number
          medical_history?: Json | null
          state?: string | null
          target_service?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      examiners: {
        Row: {
          afms_registration_number: string | null
          created_at: string | null
          examiner_id: string
          institution_id: string | null
          last_active: string | null
          mfa_enabled: boolean | null
          name: string
          role: Database["public"]["Enums"]["examiner_role"]
        }
        Insert: {
          afms_registration_number?: string | null
          created_at?: string | null
          examiner_id?: string
          institution_id?: string | null
          last_active?: string | null
          mfa_enabled?: boolean | null
          name: string
          role: Database["public"]["Enums"]["examiner_role"]
        }
        Update: {
          afms_registration_number?: string | null
          created_at?: string | null
          examiner_id?: string
          institution_id?: string | null
          last_active?: string | null
          mfa_enabled?: boolean | null
          name?: string
          role?: Database["public"]["Enums"]["examiner_role"]
        }
        Relationships: [
          {
            foreignKeyName: "examiners_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["institution_id"]
          },
        ]
      }
      institutions: {
        Row: {
          created_at: string | null
          institution_id: string
          max_candidates: number | null
          name: string
          region_code: string | null
          subscription_expiry: string | null
          tier: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          institution_id?: string
          max_candidates?: number | null
          name: string
          region_code?: string | null
          subscription_expiry?: string | null
          tier?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          institution_id?: string
          max_candidates?: number | null
          name?: string
          region_code?: string | null
          subscription_expiry?: string | null
          tier?: string | null
          type?: string | null
        }
        Relationships: []
      }
      medical_scans: {
        Row: {
          ai_result: Json | null
          candidate_id: string
          confidence_score: number | null
          created_at: string | null
          examiner_id: string
          override_by: string | null
          override_reason: string | null
          raw_measurement: Json | null
          scan_id: string
          scan_type: string
          status: string | null
          video_reference_url: string | null
        }
        Insert: {
          ai_result?: Json | null
          candidate_id: string
          confidence_score?: number | null
          created_at?: string | null
          examiner_id: string
          override_by?: string | null
          override_reason?: string | null
          raw_measurement?: Json | null
          scan_id?: string
          scan_type: string
          status?: string | null
          video_reference_url?: string | null
        }
        Update: {
          ai_result?: Json | null
          candidate_id?: string
          confidence_score?: number | null
          created_at?: string | null
          examiner_id?: string
          override_by?: string | null
          override_reason?: string | null
          raw_measurement?: Json | null
          scan_id?: string
          scan_type?: string
          status?: string | null
          video_reference_url?: string | null
        }
        Relationships: []
      }
      psych_sessions: {
        Row: {
          ai_analysis: Json | null
          assessor_notes: string | null
          candidate_id: string
          created_at: string | null
          olq_scores: Json | null
          responses: Json | null
          session_id: string
          session_type: string
        }
        Insert: {
          ai_analysis?: Json | null
          assessor_notes?: string | null
          candidate_id: string
          created_at?: string | null
          olq_scores?: Json | null
          responses?: Json | null
          session_id?: string
          session_type: string
        }
        Update: {
          ai_analysis?: Json | null
          assessor_notes?: string | null
          candidate_id?: string
          created_at?: string | null
          olq_scores?: Json | null
          responses?: Json | null
          session_id?: string
          session_type?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "candidate" | "examiner" | "admin"
      examiner_role: "MEDICAL_OFFICER" | "PSYCHOLOGIST" | "ADMIN" | "AI_ONLY"
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
      app_role: ["candidate", "examiner", "admin"],
      examiner_role: ["MEDICAL_OFFICER", "PSYCHOLOGIST", "ADMIN", "AI_ONLY"],
    },
  },
} as const
