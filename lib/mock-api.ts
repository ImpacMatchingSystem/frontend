import {
  mockCompanies,
  mockAdmins,
  mockBuyers,
  mockMeetings,
  mockEvents,
  type Company,
  type Admin,
  type Buyer,
  type Meeting,
  type Event,
} from "./mock-data"

// LocalStorage 키
const STORAGE_KEYS = {
  COMPANIES: "impac_companies",
  ADMINS: "impac_admins",
  BUYERS: "impac_buyers",
  MEETINGS: "impac_meetings",
  EVENTS: "impac_events",
}

// 초기 데이터 로드
function initializeData() {
  if (typeof window === "undefined") return

  // 강제로 초기 데이터 재설정 (개발 중에만)
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(mockCompanies))
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(mockAdmins))
  localStorage.setItem(STORAGE_KEYS.BUYERS, JSON.stringify(mockBuyers))
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(mockMeetings))
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(mockEvents))
}

// 데이터 가져오기
function getData<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

// 데이터 저장하기
function setData<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

// 지연 시뮬레이션
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockApi = {
  // 초기화
  init: initializeData,

  // 행사 관련
  events: {
    getAll: async (): Promise<Event[]> => {
      await delay(300)
      return getData<Event>(STORAGE_KEYS.EVENTS)
    },

    getActive: async (): Promise<Event | null> => {
      await delay(200)
      const events = getData<Event>(STORAGE_KEYS.EVENTS)
      return events.find((e) => e.is_active) || null
    },

    getById: async (id: string): Promise<Event | null> => {
      await delay(200)
      const events = getData<Event>(STORAGE_KEYS.EVENTS)
      return events.find((e) => e.id === id) || null
    },

    update: async (id: string, updates: Partial<Event>): Promise<Event | null> => {
      await delay(300)
      const events = getData<Event>(STORAGE_KEYS.EVENTS)
      const index = events.findIndex((e) => e.id === id)
      if (index === -1) return null

      events[index] = { ...events[index], ...updates }
      setData(STORAGE_KEYS.EVENTS, events)
      return events[index]
    },

    create: async (event: Omit<Event, "id" | "created_at">): Promise<Event> => {
      await delay(300)
      const events = getData<Event>(STORAGE_KEYS.EVENTS)
      const newEvent: Event = {
        ...event,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      }
      events.push(newEvent)
      setData(STORAGE_KEYS.EVENTS, events)
      return newEvent
    },
  },

  // 기업 관련
  companies: {
    getAll: async (): Promise<Company[]> => {
      await delay(300)
      return getData<Company>(STORAGE_KEYS.COMPANIES).filter((c) => c.is_active)
    },

    getAllIncludeInactive: async (): Promise<Company[]> => {
      await delay(300)
      return getData<Company>(STORAGE_KEYS.COMPANIES)
    },

    getById: async (id: string): Promise<Company | null> => {
      await delay(200)
      const companies = getData<Company>(STORAGE_KEYS.COMPANIES)
      return companies.find((c) => c.id === id && c.is_active) || null
    },

    getByEmail: async (email: string): Promise<Company | null> => {
      await delay(200)
      const companies = getData<Company>(STORAGE_KEYS.COMPANIES)
      console.log("Companies in storage:", companies)
      console.log("Looking for email:", email)
      const company = companies.find((c) => c.email === email && c.is_active) || null
      console.log("Found company:", company)
      return company
    },

    update: async (id: string, updates: Partial<Company>): Promise<Company | null> => {
      await delay(300)
      const companies = getData<Company>(STORAGE_KEYS.COMPANIES)
      const index = companies.findIndex((c) => c.id === id)
      if (index === -1) return null

      companies[index] = { ...companies[index], ...updates }
      setData(STORAGE_KEYS.COMPANIES, companies)
      return companies[index]
    },

    create: async (company: Omit<Company, "id" | "created_at">): Promise<Company> => {
      await delay(300)
      const companies = getData<Company>(STORAGE_KEYS.COMPANIES)
      const newCompany: Company = {
        ...company,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      }
      companies.push(newCompany)
      setData(STORAGE_KEYS.COMPANIES, companies)
      return newCompany
    },
  },

  // 관리자 관련
  admins: {
    getByEmail: async (email: string): Promise<Admin | null> => {
      await delay(200)
      const admins = getData<Admin>(STORAGE_KEYS.ADMINS)
      console.log("Admins in storage:", admins)
      console.log("Looking for admin email:", email)
      const admin = admins.find((a) => a.email === email) || null
      console.log("Found admin:", admin)
      return admin
    },
  },

  // 바이어 관련
  buyers: {
    getAll: async (): Promise<Buyer[]> => {
      await delay(300)
      return getData<Buyer>(STORAGE_KEYS.BUYERS)
    },

    getByEmail: async (email: string): Promise<Buyer | null> => {
      await delay(200)
      const buyers = getData<Buyer>(STORAGE_KEYS.BUYERS)
      console.log("Searching for buyer with email:", email)
      console.log("Available buyers:", buyers)
      const buyer = buyers.find((b) => b.email === email) || null
      console.log("Found buyer:", buyer)
      return buyer
    },

    getById: async (id: string): Promise<Buyer | null> => {
      await delay(200)
      const buyers = getData<Buyer>(STORAGE_KEYS.BUYERS)
      return buyers.find((b) => b.id === id) || null
    },

    create: async (buyer: Omit<Buyer, "id" | "created_at">): Promise<Buyer> => {
      await delay(300)
      const buyers = getData<Buyer>(STORAGE_KEYS.BUYERS)
      const newBuyer: Buyer = {
        ...buyer,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      }
      buyers.push(newBuyer)
      setData(STORAGE_KEYS.BUYERS, buyers)
      return newBuyer
    },

    update: async (id: string, updates: Partial<Buyer>): Promise<Buyer | null> => {
      await delay(300)
      const buyers = getData<Buyer>(STORAGE_KEYS.BUYERS)
      const index = buyers.findIndex((b) => b.id === id)
      if (index === -1) return null

      buyers[index] = { ...buyers[index], ...updates }
      setData(STORAGE_KEYS.BUYERS, buyers)
      return buyers[index]
    },

    delete: async (id: string): Promise<boolean> => {
      await delay(300)
      const buyers = getData<Buyer>(STORAGE_KEYS.BUYERS)
      const filteredBuyers = buyers.filter((b) => b.id !== id)
      setData(STORAGE_KEYS.BUYERS, filteredBuyers)
      return true
    },
  },

  // 미팅 관련
  meetings: {
    getAll: async (): Promise<Meeting[]> => {
      await delay(300)
      return getData<Meeting>(STORAGE_KEYS.MEETINGS)
    },

    getByCompanyId: async (companyId: string): Promise<Meeting[]> => {
      await delay(300)
      const meetings = getData<Meeting>(STORAGE_KEYS.MEETINGS)
      return meetings.filter((m) => m.company_id === companyId)
    },

    getByBuyerId: async (buyerId: string): Promise<Meeting[]> => {
      await delay(300)
      const meetings = getData<Meeting>(STORAGE_KEYS.MEETINGS)
      return meetings.filter((m) => m.buyer_id === buyerId)
    },

    create: async (meeting: Omit<Meeting, "id" | "created_at">): Promise<Meeting> => {
      await delay(300)
      const meetings = getData<Meeting>(STORAGE_KEYS.MEETINGS)
      const newMeeting: Meeting = {
        ...meeting,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      }
      meetings.push(newMeeting)
      setData(STORAGE_KEYS.MEETINGS, meetings)
      return newMeeting
    },

    update: async (id: string, updates: Partial<Meeting>): Promise<Meeting | null> => {
      await delay(300)
      const meetings = getData<Meeting>(STORAGE_KEYS.MEETINGS)
      const index = meetings.findIndex((m) => m.id === id)
      if (index === -1) return null

      meetings[index] = { ...meetings[index], ...updates }
      setData(STORAGE_KEYS.MEETINGS, meetings)
      return meetings[index]
    },
  },
}

// 타입 export
export type { Company, Admin, Buyer, Meeting, Event }
