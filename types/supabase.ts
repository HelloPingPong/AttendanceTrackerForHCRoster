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
      members: {
        Row: {
          id: string
          name: string
          category: 'OM' | 'FT' | 'RN' | 'XT' | 'V'
          sub_categories: {
            gender: 'male' | 'female'
            isBeliever: boolean
            isDisciple: boolean
            inMinistryHouse: boolean
            isPrimaryLeader: boolean
            isSecondaryLeader: boolean
            isMarried: boolean
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: 'OM' | 'FT' | 'RN' | 'XT' | 'V'
          sub_categories?: {
            gender: 'male' | 'female'
            isBeliever: boolean
            isDisciple: boolean
            inMinistryHouse: boolean
            isPrimaryLeader: boolean
            isSecondaryLeader: boolean
            isMarried: boolean
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: 'OM' | 'FT' | 'RN' | 'XT' | 'V'
          sub_categories?: {
            gender: 'male' | 'female'
            isBeliever: boolean
            isDisciple: boolean
            inMinistryHouse: boolean
            isPrimaryLeader: boolean
            isSecondaryLeader: boolean
            isMarried: boolean
          }
          created_at?: string
          updated_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          name: string
          description: string
          date: string
          type: 'homechurch' | 'central_teaching' | 'prayer_group' | 'mens_cell' | 'womens_cell' | 'special'
          special_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          date: string
          type: 'homechurch' | 'central_teaching' | 'prayer_group' | 'mens_cell' | 'womens_cell' | 'special'
          special_note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          date?: string
          type?: 'homechurch' | 'central_teaching' | 'prayer_group' | 'mens_cell' | 'womens_cell' | 'special'
          special_note?: string | null
          created_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          meeting_id: string | null
          member_id: string | null
          is_present: boolean
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id?: string | null
          member_id?: string | null
          is_present?: boolean
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string | null
          member_id?: string | null
          is_present?: boolean
          date?: string
          created_at?: string
        }
      }
    }
    Enums: {
      member_category: 'OM' | 'FT' | 'RN' | 'XT' | 'V'
      meeting_type: 'homechurch' | 'central_teaching' | 'prayer_group' | 'mens_cell' | 'womens_cell' | 'special'
    }
  }
}