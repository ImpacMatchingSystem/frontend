import { mockApi } from './mock-api'

export type UserRole = 'company' | 'admin' | 'buyer'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}

// 통합 로그인 함수
export async function signIn(
  email: string,
  password: string
): Promise<AuthUser | null> {
  try {
    console.log('Attempting to sign in with:', email, password)

    // 1. 먼저 기업 테이블에서 확인
    const company = await mockApi.companies.getByEmail(email)
    console.log('Company search result:', company)
    if (company && company.password === password) {
      console.log('Company login successful')
      return {
        id: company.id,
        email: company.email,
        name: company.name,
        role: 'company',
      }
    }

    // 2. 바이어 테이블에서 확인
    const buyer = await mockApi.buyers.getByEmail(email)
    console.log('Buyer search result:', buyer)
    if (buyer && buyer.password === password) {
      console.log('Buyer login successful')
      return {
        id: buyer.id,
        email: buyer.email,
        name: buyer.name,
        role: 'buyer',
      }
    }

    // 3. 관리자 테이블에서 확인
    const admin = await mockApi.admins.getByEmail(email)
    console.log('Admin search result:', admin)
    if (admin && admin.password === password) {
      console.log('Admin login successful')
      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: 'admin',
      }
    }

    console.log('No matching user found')
    return null
  } catch (error) {
    console.error('Sign in error:', error)
    return null
  }
}
