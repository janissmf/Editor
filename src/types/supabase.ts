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
      nodes: {
        Row: {
          id: string
          created_at: string
          label: string
          description: string | null
          parent_id: string | null
          is_expanded: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          label: string
          description?: string | null
          parent_id?: string | null
          is_expanded?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          label?: string
          description?: string | null
          parent_id?: string | null
          is_expanded?: boolean
        }
      }
    }
  }
}