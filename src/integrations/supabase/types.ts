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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id: string
          name: string
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      shared_collections: {
        Row: {
          created_at: string
          creator_id: string
          creator_name: string | null
          description: string | null
          id: string
          is_public: boolean
          item_ids: string[]
          item_order: string[]
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          creator_name?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          item_ids: string[]
          item_order: string[]
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          creator_name?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          item_ids?: string[]
          item_order?: string[]
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      squad_requests: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          activity_type: string | null
          budget_range: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          destination: string | null
          id: string
          image_url: string | null
          item_type: string
          link: string | null
          notes: string | null
          squad_members: string[] | null
          tags: string[] | null
          target_date: string | null
          target_month: string | null
          target_week: string | null
          target_year: string | null
          timeframe_type: string | null
          title: string
          travel_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          budget_range?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          destination?: string | null
          id?: string
          image_url?: string | null
          item_type: string
          link?: string | null
          notes?: string | null
          squad_members?: string[] | null
          tags?: string[] | null
          target_date?: string | null
          target_month?: string | null
          target_week?: string | null
          target_year?: string | null
          timeframe_type?: string | null
          title: string
          travel_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string | null
          budget_range?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          destination?: string | null
          id?: string
          image_url?: string | null
          item_type?: string
          link?: string | null
          notes?: string | null
          squad_members?: string[] | null
          tags?: string[] | null
          target_date?: string | null
          target_month?: string | null
          target_week?: string | null
          target_year?: string | null
          timeframe_type?: string | null
          title?: string
          travel_type?: string | null
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
