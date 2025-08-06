import { createClient } from '@supabase/supabase-js'

// 환경변수가 없을 때 기본값 설정 (개발용)
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test-project.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QtcHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MjMwNDAwLCJleHAiOjE5NjA4MDY0MDB9.test-key'

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
})

// 테스트용 목데이터
const mockData = {
  events: [
    {
      id: '1',
      title: '2025 Tech Conference',
      description: 'Annual technology conference for B2B meetings',
      header_image_url: null,
      start_date: '2025-03-15',
      end_date: '2025-03-17',
      meeting_duration: 30,
      business_hours: {
        start: '09:00',
        end: '18:00',
        timezone: 'Asia/Seoul'
      },
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }
  ],
  companies: [
    {
      id: '1',
      event_id: '1',
      name: 'TechCorp Solutions',
      email: 'contact@techcorp.com',
      password_hash: 'hashed_password_123',
      description: 'Leading AI and machine learning solutions provider',
      website_url: 'https://techcorp.com',
      logo_url: null,
      industry: 'Technology',
      location: 'Seoul, South Korea',
      available_times: {
        '2025-03-15': ['09:00', '10:00', '11:00', '14:00', '15:00'],
        '2025-03-16': ['09:00', '10:30', '13:00', '14:30', '16:00'],
        '2025-03-17': ['09:00', '10:00', '11:30', '13:00']
      },
      settings: {
        auto_approve: false,
        meeting_location: 'Booth #123',
        notification_email: true
      },
      is_active: true,
      created_at: '2025-01-15T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z'
    }
  ],
  buyers: [
    {
      id: '1',
      event_id: '1',
      name: '김철수',
      email: 'kim@example.com',
      phone: '010-1234-5678',
      company_name: 'StartupKorea',
      position: 'CTO',
      created_at: '2025-02-01T00:00:00Z'
    }
  ],
  meetings: [
    {
      id: '1',
      company_id: '1',
      buyer_id: '1',
      meeting_time: '2025-03-15T09:00:00Z',
      end_time: '2025-03-15T09:30:00Z',
      status: 'pending',
      buyer_message: '안녕하세요. AI 솔루션에 대해 논의하고 싶습니다.',
      company_response: null,
      rejection_reason: null,
      meeting_location: 'Booth #123',
      notes: {},
      created_at: '2025-02-10T00:00:00Z',
      updated_at: '2025-02-10T00:00:00Z'
    }
  ]
}

// 개발 환경 체크
export const isDevelopment = process.env.NODE_ENV === 'development'
export const useMockData = process.env.USE_MOCK_DATA === 'true'

// 테스트용 헬퍼 함수들
export const getMockData = (table: keyof typeof mockData) => {
  return mockData[table] || []
}

export const addMockData = (table: keyof typeof mockData, data: any) => {
  if (mockData[table]) {
    (mockData[table] as any[]).push(data)
  }
}

// TypeScript 타입 정의
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