export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      highlight_slides: {
        Row: {
          id:           string
          highlight_id: string
          emoji:        string | null
          text:         string | null
          image_url:    string | null
          media_id:     string | null
          slide_order:  number
          created_at:   string
        }
        Insert: {
          id?:          string
          highlight_id: string
          emoji?:       string | null
          text?:        string | null
          image_url?:   string | null
          media_id?:    string | null
          slide_order?: number
          created_at?:  string
        }
        Update: {
          id?:          string
          highlight_id?: string
          emoji?:       string | null
          text?:        string | null
          image_url?:   string | null
          media_id?:    string | null
          slide_order?: number
          created_at?:  string
        }
        Relationships: [
          {
            foreignKeyName: "highlight_slides_highlight_id_fkey"
            columns: ["highlight_id"]
            isOneToOne: false
            referencedRelation: "highlights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "highlight_slides_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      highlights: {
        Row: {
          id:         string
          label:      string
          color:      string
          cover_url:  string | null
          created_at: string
        }
        Insert: {
          id?:        string
          label:      string
          color?:     string
          cover_url?: string | null
          created_at?: string
        }
        Update: {
          id?:        string
          label?:     string
          color?:     string
          cover_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          away_score:   number | null
          away_team_id: string | null
          created_at:   string
          home_score:   number | null
          home_team_id: string | null
          id:           string
          match_date:   string
          sport_id:     string | null
          status:       string | null
          venue_id:     string | null
        }
        Insert: {
          away_score?:   number | null
          away_team_id?: string | null
          created_at?:   string
          home_score?:   number | null
          home_team_id?: string | null
          id?:           string
          match_date:    string
          sport_id?:     string | null
          status?:       string | null
          venue_id?:     string | null
        }
        Update: {
          away_score?:   number | null
          away_team_id?: string | null
          created_at?:   string
          home_score?:   number | null
          home_team_id?: string | null
          id?:           string
          match_date?:   string
          sport_id?:     string | null
          status?:       string | null
          venue_id?:     string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          id:         string
          title:      string
          type:       string
          url:        string
          file_name:  string
          sport_id:   string | null
          match_id:   string | null
          tag:        string | null
          size:       string | null
          created_at: string
        }
        Insert: {
          id?:        string
          title:      string
          type:       string
          url:        string
          file_name:  string
          sport_id?:  string | null
          match_id?:  string | null
          tag?:       string | null
          size?:      string | null
          created_at?: string
        }
        Update: {
          id?:        string
          title?:     string
          type?:      string
          url?:       string
          file_name?: string
          sport_id?:  string | null
          match_id?:  string | null
          tag?:       string | null
          size?:      string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at:    string
          id:            string
          is_active:     boolean | null
          jersey_number: number | null
          name:          string
          photo_url:     string | null
          position:      string | null
          team_id:       string | null
        }
        Insert: {
          created_at?:    string
          id?:            string
          is_active?:     boolean | null
          jersey_number?: number | null
          name:           string
          photo_url?:     string | null
          position?:      string | null
          team_id?:       string | null
        }
        Update: {
          created_at?:    string
          id?:            string
          is_active?:     boolean | null
          jersey_number?: number | null
          name?:          string
          photo_url?:     string | null
          position?:      string | null
          team_id?:       string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url:          string | null
          college_affiliation: string | null
          created_at:          string | null
          email:               string
          full_name:           string
          id:                  string
          last_login:          string | null
          permissions:         Json | null
          role:                Database["public"]["Enums"]["admin_role"]
          updated_at:          string | null
        }
        Insert: {
          avatar_url?:          string | null
          college_affiliation?: string | null
          created_at?:          string | null
          email:                string
          full_name:            string
          id:                   string
          last_login?:          string | null
          permissions?:         Json | null
          role?:                Database["public"]["Enums"]["admin_role"]
          updated_at?:          string | null
        }
        Update: {
          avatar_url?:          string | null
          college_affiliation?: string | null
          created_at?:          string | null
          email?:               string
          full_name?:           string
          id?:                  string
          last_login?:          string | null
          permissions?:         Json | null
          role?:                Database["public"]["Enums"]["admin_role"]
          updated_at?:          string | null
        }
        Relationships: []
      }
      sports: {
        Row: {
          created_at:  string
          description: string | null
          id:          string
          name:        string
        }
        Insert: {
          created_at?:  string
          description?: string | null
          id?:          string
          name:         string
        }
        Update: {
          created_at?:  string
          description?: string | null
          id?:          string
          name?:        string
        }
        Relationships: []
      }
      teams: {
        Row: {
          college:    string
          created_at: string
          id:         string
          name:       string
          sport_id:   string | null
        }
        Insert: {
          college:     string
          created_at?: string
          id?:         string
          name:        string
          sport_id?:   string | null
        }
        Update: {
          college?:    string
          created_at?: string
          id?:         string
          name?:       string
          sport_id?:   string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          capacity:   number | null
          created_at: string
          id:         string
          location:   string | null
          name:       string
        }
        Insert: {
          capacity?:   number | null
          created_at?: string
          id?:         string
          location?:   string | null
          name:        string
        }
        Update: {
          capacity?:   number | null
          created_at?: string
          id?:         string
          location?:   string | null
          name?:       string
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
      admin_role: "super_admin" | "moderator" | "college_admin"
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
      admin_role: ["super_admin", "moderator", "college_admin"],
    },
  },
} as const