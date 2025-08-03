import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          header_image_url: string | null
          start_date: string
          end_date: string
          meeting_duration: number
          business_hours: any
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          header_image_url?: string | null
          start_date: string
          end_date: string
          meeting_duration?: number
          business_hours?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          header_image_url?: string | null
          start_date?: string
          end_date?: string
          meeting_duration?: number
          business_hours?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          event_id: string
          name: string
          email: string
          password_hash: string
          description: string | null
          website_url: string | null
          logo_url: string | null
          industry: string | null
          location: string | null
          available_times: any
          settings: any
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          email: string
          password_hash: string
          description?: string | null
          website_url?: string | null
          logo_url?: string | null
          industry?: string | null
          location?: string | null
          available_times?: any
          settings?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          email?: string
          password_hash?: string
          description?: string | null
          website_url?: string | null
          logo_url?: string | null
          industry?: string | null
          location?: string | null
          available_times?: any
          settings?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          company_id: string
          buyer_id: string
          meeting_time: string
          end_time: string
          status: string
          buyer_message: string | null
          company_response: string | null
          rejection_reason: string | null
          meeting_location: string | null
          notes: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          buyer_id: string
          meeting_time: string
          end_time: string
          status?: string
          buyer_message?: string | null
          company_response?: string | null
          rejection_reason?: string | null
          meeting_location?: string | null
          notes?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          buyer_id?: string
          meeting_time?: string
          end_time?: string
          status?: string
          buyer_message?: string | null
          company_response?: string | null
          rejection_reason?: string | null
          meeting_location?: string | null
          notes?: any
          created_at?: string
          updated_at?: string
        }
      }
      buyers: {
        Row: {
          id: string
          event_id: string
          name: string
          email: string
          phone: string | null
          company_name: string | null
          position: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          email: string
          phone?: string | null
          company_name?: string | null
          position?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          email?: string
          phone?: string | null
          company_name?: string | null
          position?: string | null
          created_at?: string
        }
      }
    }
  }
}
