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
      anonymous_chat_connections: {
        Row: {
          connection_count: number | null
          created_at: string
          id: string
          is_favorite: boolean | null
          last_connected: string
          room_id: string
          user1_device_id: string
          user2_device_id: string
        }
        Insert: {
          connection_count?: number | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          last_connected?: string
          room_id: string
          user1_device_id: string
          user2_device_id: string
        }
        Update: {
          connection_count?: number | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          last_connected?: string
          room_id?: string
          user1_device_id?: string
          user2_device_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_chat_connections_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "anonymous_chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_chat_messages: {
        Row: {
          created_at: string
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          message: string
          message_type: string | null
          participant_id: string
          room_id: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          message: string
          message_type?: string | null
          participant_id: string
          room_id: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          message?: string
          message_type?: string | null
          participant_id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "anonymous_chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_chat_participants: {
        Row: {
          device_id: string | null
          id: string
          is_online: boolean | null
          joined_at: string
          last_seen: string
          participant_id: string
          room_id: string
          session_id: string
        }
        Insert: {
          device_id?: string | null
          id?: string
          is_online?: boolean | null
          joined_at?: string
          last_seen?: string
          participant_id: string
          room_id: string
          session_id: string
        }
        Update: {
          device_id?: string | null
          id?: string
          is_online?: boolean | null
          joined_at?: string
          last_seen?: string
          participant_id?: string
          room_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_chat_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "anonymous_chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_chat_rooms: {
        Row: {
          created_at: string
          id: string
          participant_count: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      anonymous_user_preferences: {
        Row: {
          avatar_color: string | null
          created_at: string
          device_id: string
          display_name: string | null
          id: string
          last_active: string
        }
        Insert: {
          avatar_color?: string | null
          created_at?: string
          device_id: string
          display_name?: string | null
          id?: string
          last_active?: string
        }
        Update: {
          avatar_color?: string | null
          created_at?: string
          device_id?: string
          display_name?: string | null
          id?: string
          last_active?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_user: boolean
          session_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_user?: boolean
          session_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_user?: boolean
          session_id?: string | null
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
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          id: string
          mood_value: number
          note: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mood_value: number
          note?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mood_value?: number
          note?: string | null
          updated_at?: string
          user_id?: string | null
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
