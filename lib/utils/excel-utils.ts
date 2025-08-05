import * as XLSX from "xlsx"
import { mockApi } from "@/lib/supabase/mock-api"

export interface ExcelCompanyData {
  name: string
  email: string
  password: string
  description?: string
  website_url?: string
  industry?: string
  location?: string
  is_active?: boolean
}

export interface ExcelBuyerData {
  name: string
  email: string
  password: string
  phone?: string
  company_name?: string
  position?: string
}

// Excel 파일 읽기
export const readExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("파일 읽기 실패"))
    reader.readAsBinaryString(file)
  })
}

// 기업 데이터 검증
export const validateCompanyData = (data: any[]): { valid: ExcelCompanyData[]; errors: string[] } => {
  const valid: ExcelCompanyData[] = []
  const errors: string[] = []

  data.forEach((row, index) => {
    const rowNum = index + 2 // Excel 행 번호 (헤더 제외)

    if (!row.name || !row.email || !row.password) {
      errors.push(`행 ${rowNum}: 필수 필드(name, email, password)가 누락되었습니다.`)
      return
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(row.email)) {
      errors.push(`행 ${rowNum}: 올바르지 않은 이메일 형식입니다.`)
      return
    }

    valid.push({
      name: row.name,
      email: row.email,
      password: row.password,
      description: row.description || "",
      website_url: row.website_url || "",
      industry: row.industry || "",
      location: row.location || "",
      is_active: row.is_active !== false,
    })
  })

  return { valid, errors }
}

// 바이어 데이터 검증
export const validateBuyerData = (data: any[]): { valid: ExcelBuyerData[]; errors: string[] } => {
  const valid: ExcelBuyerData[] = []
  const errors: string[] = []

  data.forEach((row, index) => {
    const rowNum = index + 2 // Excel 행 번호 (헤더 제외)

    if (!row.name || !row.email || !row.password) {
      errors.push(`행 ${rowNum}: 필수 필드(name, email, password)가 누락되었습니다.`)
      return
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(row.email)) {
      errors.push(`행 ${rowNum}: 올바르지 않은 이메일 형식입니다.`)
      return
    }

    valid.push({
      name: row.name,
      email: row.email,
      password: row.password,
      phone: row.phone || "",
      company_name: row.company_name || "",
      position: row.position || "",
    })
  })

  return { valid, errors }
}

// 기업 데이터 일괄 업로드
export const uploadCompanies = async (
  companies: ExcelCompanyData[],
): Promise<{ success: number; errors: string[] }> => {
  let success = 0
  const errors: string[] = []

  for (const companyData of companies) {
    try {
      // 중복 이메일 체크
      const existingCompany = await mockApi.companies.getByEmail(companyData.email)
      if (existingCompany) {
        errors.push(`${companyData.email}: 이미 존재하는 이메일입니다.`)
        continue
      }

    await mockApi.companies.create({
      ...companyData,
      description: companyData.description || null,
      website_url: companyData.website_url || null,
      industry: companyData.industry || null,
      location: companyData.location || null,
      is_active: companyData.is_active ?? true,
      password_hash: companyData.password || null,
      logo_url: null,
      available_times: {},
      settings: { email_notifications: true },
    })

      success++
    } catch (error) {
      errors.push(`${companyData.email}: 업로드 실패`)
    }
  }

  return { success, errors }
}

// 바이어 데이터 일괄 업로드
export const uploadBuyers = async (buyers: ExcelBuyerData[]): Promise<{ success: number; errors: string[] }> => {
  let success = 0
  const errors: string[] = []

  for (const buyerData of buyers) {
    try {
      // 중복 이메일 체크
      const existingBuyer = await mockApi.buyers.getByEmail(buyerData.email)
      if (existingBuyer) {
        errors.push(`${buyerData.email}: 이미 존재하는 이메일입니다.`)
        continue
      }

      await mockApi.buyers.create({
        ...buyerData,
        phone: buyerData.phone || null,
        company_name: buyerData.company_name || null,
        position: buyerData.position || null,
      })
      
      success++
    } catch (error) {
      errors.push(`${buyerData.email}: 업로드 실패`)
    }
  }

  return { success, errors }
}

// Excel 템플릿 다운로드
export const downloadCompanyTemplate = () => {
  const template = [
    {
      name: "삼성전자",
      email: "samsung@example.com",
      password: "password123",
      description: "글로벌 전자기업",
      website_url: "https://samsung.com",
      industry: "전자/IT",
      location: "서울",
      is_active: true,
    },
  ]

  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "기업목록")
  XLSX.writeFile(wb, "기업_업로드_템플릿.xlsx")
}

export const downloadBuyerTemplate = () => {
  const template = [
    {
      name: "김철수",
      email: "kim@example.com",
      password: "password123",
      phone: "010-1234-5678",
      company_name: "ABC 코퍼레이션",
      position: "구매담당자",
    },
  ]

  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "바이어목록")
  XLSX.writeFile(wb, "바이어_업로드_템플릿.xlsx")
}
