-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 행사 테이블
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  header_image_url TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  meeting_duration INTEGER DEFAULT 30, -- 미팅 시간(분)
  business_hours JSONB DEFAULT '{"start": "09:00", "end": "18:00", "lunch_start": "12:00", "lunch_end": "13:00"}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 참가기업 테이블
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  industry TEXT,
  location TEXT,
  available_times JSONB DEFAULT '{}', -- 상담 가능 시간대
  settings JSONB DEFAULT '{"email_notifications": true}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 바이어 테이블
CREATE TABLE buyers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  position TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 미팅 테이블
CREATE TABLE meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES buyers(id) ON DELETE CASCADE,
  meeting_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, rejected, cancelled, completed
  buyer_message TEXT,
  company_response TEXT,
  rejection_reason TEXT,
  meeting_location TEXT DEFAULT '온라인',
  notes JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(company_id, meeting_time) -- 같은 시간 중복 방지
);

-- 알림 테이블
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  type TEXT NOT NULL, -- meeting_request, meeting_confirmed, meeting_cancelled
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  meeting_id UUID REFERENCES meetings(id),
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- 관리자 테이블
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  event_id UUID REFERENCES events(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 기본 정책들
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (is_active = true);
CREATE POLICY "Companies are viewable by everyone" ON companies FOR SELECT USING (is_active = true);
CREATE POLICY "Companies can update their own data" ON companies FOR UPDATE USING (auth.jwt() ->> 'email' = email);
CREATE POLICY "Meetings are viewable by related parties" ON meetings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM companies WHERE companies.id = meetings.company_id AND companies.email = auth.jwt() ->> 'email'
  ) OR
  EXISTS (
    SELECT 1 FROM buyers WHERE buyers.id = meetings.buyer_id AND buyers.email = auth.jwt() ->> 'email'
  )
);
