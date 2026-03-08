export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          ingredients: string[]
          instructions: string
          cooking_time: number
          difficulty: 'easy' | 'medium' | 'hard'
          category: string | null
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          ingredients?: string[]
          instructions: string
          cooking_time?: number
          difficulty: 'easy' | 'medium' | 'hard'
          category?: string | null
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          ingredients?: string[]
          instructions?: string
          cooking_time?: number
          difficulty?: 'easy' | 'medium' | 'hard'
          category?: string | null
          image_url?: string | null
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
      }
      saved_recipes: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Recipe = Database['public']['Tables']['recipes']['Row']
export type RecipeInsert = Database['public']['Tables']['recipes']['Insert']
export type RecipeUpdate = Database['public']['Tables']['recipes']['Update']
export type Like = Database['public']['Tables']['likes']['Row']
export type SavedRecipe = Database['public']['Tables']['saved_recipes']['Row']
