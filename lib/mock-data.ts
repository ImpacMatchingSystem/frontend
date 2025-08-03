export interface Company {
  id: string
  name: string
  email: string
  password: string
  description: string | null
  website_url: string | null
  industry: string | null
  location: string | null
  logo_url: string | null
  available_times: any
  settings: any
  is_active: boolean
  created_at: string
}

export interface Buyer {
  id: string
  name: string
  email: string
  password: string
  phone: string | null
  company_name: string | null
  position: string | null
  created_at: string
}

export interface Meeting {
  id: string
  company_id: string
  buyer_id: string
  meeting_time: string
  end_time: string
  status: "pending" | "confirmed" | "rejected" | "completed"
  buyer_message: string | null
  company_response: string | null
  rejection_reason: string | null
  created_at: string
}

export interface Admin {
  id: string
  email: string
  password: string
  name: string
  role: string
}

export interface Event {
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
}

// 행사 데이터 추가
export const mockEvents: Event[] = [
  {
    id: "event1",
    title: "2024 글로벌 비즈니스 매칭 데이",
    description:
      "국내외 기업과 바이어가 만나는 최대 규모의 비즈니스 매칭 행사입니다. 새로운 비즈니스 기회를 발견하고 글로벌 파트너십을 구축하세요.",
    header_image_url: "/placeholder.svg?height=400&width=1200&text=2024+글로벌+비즈니스+매칭+데이",
    start_date: "2024-12-01",
    end_date: "2024-12-03",
    meeting_duration: 30,
    business_hours: {
      start: "09:00",
      end: "18:00",
      lunch_start: "12:00",
      lunch_end: "13:00",
    },
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
]

// 초기 모킹 데이터
export const mockCompanies: Company[] = [
  {
    id: "1",
    name: "삼성전자",
    email: "samsung@company.com",
    password: "password",
    description: "글로벌 전자기업으로 반도체, 스마트폰 등을 제조합니다.",
    website_url: "https://samsung.com",
    industry: "전자/IT",
    location: "서울",
    logo_url: "/placeholder.svg?height=64&width=64&text=삼성",
    available_times: {},
    settings: { email_notifications: true },
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "LG화학",
    email: "lg@company.com",
    password: "password",
    description: "화학, 배터리, 소재 분야의 글로벌 리더입니다.",
    website_url: "https://lgchem.com",
    industry: "화학/소재",
    location: "서울",
    logo_url: "/placeholder.svg?height=64&width=64&text=LG",
    available_times: {},
    settings: { email_notifications: true },
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "현대자동차",
    email: "hyundai@company.com",
    password: "password",
    description: "글로벌 자동차 제조업체로 친환경 모빌리티를 선도합니다.",
    website_url: "https://hyundai.com",
    industry: "자동차",
    location: "울산",
    logo_url: "/placeholder.svg?height=64&width=64&text=현대",
    available_times: {},
    settings: { email_notifications: true },
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "네이버",
    email: "naver@company.com",
    password: "password",
    description: "국내 최대 포털 서비스와 글로벌 IT 서비스를 제공합니다.",
    website_url: "https://naver.com",
    industry: "IT/인터넷",
    location: "경기",
    logo_url: "/placeholder.svg?height=64&width=64&text=네이버",
    available_times: {},
    settings: { email_notifications: true },
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    name: "카카오",
    email: "kakao@company.com",
    password: "password",
    description: "모바일 플랫폼과 디지털 콘텐츠 서비스를 제공합니다.",
    website_url: "https://kakao.com",
    industry: "IT/인터넷",
    location: "경기",
    logo_url: "/placeholder.svg?height=64&width=64&text=카카오",
    available_times: {},
    settings: { email_notifications: true },
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
]

export const mockAdmins: Admin[] = [
  {
    id: "admin1",
    email: "admin@impacmatching.com",
    password: "password",
    name: "시스템 관리자",
    role: "super_admin",
  },
]

export const mockBuyers: Buyer[] = [
  {
    id: "buyer1",
    name: "김철수",
    email: "kim@buyer.com",
    password: "password",
    phone: "010-1234-5678",
    company_name: "ABC 코퍼레이션",
    position: "구매 담당자",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "buyer2",
    name: "이영희",
    email: "lee@buyer.com",
    password: "password",
    phone: "010-2345-6789",
    company_name: "XYZ 인터내셔널",
    position: "사업개발팀장",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "buyer3",
    name: "박민수",
    email: "park@buyer.com",
    password: "password",
    phone: "010-3456-7890",
    company_name: "글로벌 트레이딩",
    position: "해외영업팀장",
    created_at: "2024-01-01T00:00:00Z",
  },
]

export const mockMeetings: Meeting[] = [
  {
    id: "meeting1",
    company_id: "1",
    buyer_id: "buyer1",
    meeting_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 내일
    end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    status: "pending",
    buyer_message: "반도체 관련 협력 방안에 대해 논의하고 싶습니다.",
    company_response: null,
    rejection_reason: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "meeting2",
    company_id: "2",
    buyer_id: "buyer2",
    meeting_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 모레
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    status: "confirmed",
    buyer_message: "배터리 기술에 대한 미팅을 요청드립니다.",
    company_response: "미팅 승인되었습니다. 기대하겠습니다.",
    rejection_reason: null,
    created_at: new Date().toISOString(),
  },
]
