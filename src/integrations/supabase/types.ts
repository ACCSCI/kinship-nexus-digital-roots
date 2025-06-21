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
      event: {
        Row: {
          created_at: string | null
          date: string
          description: string
          id: number
          title: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description: string
          id?: number
          title: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string
          id?: number
          title?: string
        }
        Relationships: []
      }
      familybranch: {
        Row: {
          ancestral_hall: string | null
          created_at: string | null
          id: number
          name: string
          origin_location: string | null
        }
        Insert: {
          ancestral_hall?: string | null
          created_at?: string | null
          id?: number
          name: string
          origin_location?: string | null
        }
        Update: {
          ancestral_hall?: string | null
          created_at?: string | null
          id?: number
          name?: string
          origin_location?: string | null
        }
        Relationships: []
      }
      familyevent: {
        Row: {
          event_id: number
          family_id: number
        }
        Insert: {
          event_id: number
          family_id: number
        }
        Update: {
          event_id?: number
          family_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "familyevent_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "familyevent_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "familybranch"
            referencedColumns: ["id"]
          },
        ]
      }
      individual: {
        Row: {
          biography: string | null
          birth_date: string
          birth_place: string
          created_at: string | null
          death_date: string | null
          full_name: string
          gender: string
          id: number
          photo_path: string | null
          residence: string | null
        }
        Insert: {
          biography?: string | null
          birth_date: string
          birth_place: string
          created_at?: string | null
          death_date?: string | null
          full_name: string
          gender: string
          id?: number
          photo_path?: string | null
          residence?: string | null
        }
        Update: {
          biography?: string | null
          birth_date?: string
          birth_place?: string
          created_at?: string | null
          death_date?: string | null
          full_name?: string
          gender?: string
          id?: number
          photo_path?: string | null
          residence?: string | null
        }
        Relationships: []
      }
      Individual: {
        Row: {
          biography: string | null
          birth_date: string
          birth_place: string
          created_at: string
          death_date: string | null
          full_name: string
          gender: string
          id: number
          photo_path: string | null
          residence: string | null
        }
        Insert: {
          biography?: string | null
          birth_date: string
          birth_place: string
          created_at?: string
          death_date?: string | null
          full_name: string
          gender: string
          id?: number
          photo_path?: string | null
          residence?: string | null
        }
        Update: {
          biography?: string | null
          birth_date?: string
          birth_place?: string
          created_at?: string
          death_date?: string | null
          full_name?: string
          gender?: string
          id?: number
          photo_path?: string | null
          residence?: string | null
        }
        Relationships: []
      }
      individualevent: {
        Row: {
          event_id: number
          individual_id: number
        }
        Insert: {
          event_id: number
          individual_id: number
        }
        Update: {
          event_id?: number
          individual_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "individualevent_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individualevent_individual_id_fkey"
            columns: ["individual_id"]
            isOneToOne: false
            referencedRelation: "individual"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship: {
        Row: {
          created_at: string | null
          id: number
          person1_id: number
          person2_id: number
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          person1_id: number
          person2_id: number
          type: string
        }
        Update: {
          created_at?: string | null
          id?: number
          person1_id?: number
          person2_id?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_person1_id_fkey"
            columns: ["person1_id"]
            isOneToOne: false
            referencedRelation: "individual"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_person2_id_fkey"
            columns: ["person2_id"]
            isOneToOne: false
            referencedRelation: "individual"
            referencedColumns: ["id"]
          },
        ]
      }
      Relationship: {
        Row: {
          created_at: string
          id: number
          person1_id: number
          person2_id: number
          type: string
        }
        Insert: {
          created_at?: string
          id?: number
          person1_id: number
          person2_id: number
          type: string
        }
        Update: {
          created_at?: string
          id?: number
          person1_id?: number
          person2_id?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "Relationship_person1_id_fkey"
            columns: ["person1_id"]
            isOneToOne: false
            referencedRelation: "Individual"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Relationship_person2_id_fkey"
            columns: ["person2_id"]
            isOneToOne: false
            referencedRelation: "Individual"
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
