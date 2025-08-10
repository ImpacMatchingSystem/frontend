# Supabase → ImpacMatching 마이그레이션 가이드

## 📋 개요

기존 Supabase 기반 시스템에서 ImpacMatching (Next.js + Prisma + PostgreSQL) 시스템으로 마이그레이션하는 가이드입니다.

---

## 🔄 주요 변경사항

### 1. 데이터 구조 변경

#### 기존 (Supabase)

```typescript
interface Company {
  id: string
  name: string
  email: string
  password_hash: string
  description?: string
  website_url?: string
  industry?: string
  location?: string
  logo_url?: string
  is_active: boolean
  available_times: object
  settings: object
  created_at: string
}
```

#### 변경 후 (ImpacMatching)

```typescript
interface User {
  id: string
  email: string
  password: string // 해시된 비밀번호
  name: string
  role: 'COMPANY' | 'BUYER' | 'ADMIN'
  website?: string // website_url → website
  description?: string
  createdAt: Date
  updatedAt: Date
}
```

### 2. API 엔드포인트 변경

#### 기존 API

```javascript
// Supabase API 호출
const { data, error } = await supabase.from('companies').insert([companyData])
```

#### 변경 후 API

```javascript
// ImpacMatching API 호출
const response = await fetch('/api/admin/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Company Name',
    email: 'contact@company.com',
    password: 'password123',
    role: 'COMPANY',
    description: 'Company description',
    website: 'https://company.com',
  }),
})
```

---

## 🛠 컴포넌트 마이그레이션

### CompanyCreateForm 변경사항

#### 1. 필드 매핑

| 기존 필드         | 새 필드       | 변경사항                               |
| ----------------- | ------------- | -------------------------------------- |
| `name`            | `name`        | 동일                                   |
| `email`           | `email`       | 동일                                   |
| `password`        | `password`    | 필드명 변경 (password_hash → password) |
| `description`     | `description` | 동일                                   |
| `website_url`     | `website`     | 필드명 변경                            |
| `industry`        | ❌ 제거       | ImpacMatching에서 미사용               |
| `location`        | ❌ 제거       | ImpacMatching에서 미사용               |
| `is_active`       | ❌ 제거       | 자동으로 활성 상태로 생성              |
| `logo_url`        | ❌ 제거       | 현재 버전에서 미지원                   |
| `available_times` | ❌ 제거       | TimeSlot 모델로 분리                   |
| `settings`        | ❌ 제거       | 현재 버전에서 미지원                   |
| ➕ 신규           | `role`        | 'COMPANY' 고정값                       |

#### 2. 폼 데이터 구조 변경

**기존:**

```typescript
const formData = {
  name: '',
  email: '',
  password: '',
  description: '',
  website_url: '',
  industry: '',
  location: '',
  is_active: true,
}
```

**변경 후:**

```typescript
const formData = {
  name: '',
  email: '',
  password: '',
  description: '',
  website: '', // website_url → website
}
```

#### 3. 제출 데이터 변환

**기존:**

```typescript
const cleanedData = {
  ...formData,
  password_hash: formData.password,
  logo_url: null,
  available_times: {},
  settings: { email_notifications: true },
}
```

**변경 후:**

```typescript
const apiData = {
  name: formData.name.trim(),
  email: formData.email.trim().toLowerCase(),
  password: formData.password,
  role: 'COMPANY',
  description: formData.description.trim() || undefined,
  website: formData.website.trim() || undefined,
}
```

---

## 🔧 마이그레이션 체크리스트

### 1. 환경 설정

- [ ] `.env.local` 파일에 ImpacMatching 환경변수 설정
- [ ] Prisma 클라이언트 설치 및 설정
- [ ] NextAuth 설정

### 2. 데이터베이스

- [ ] Prisma 스키마 적용 (`npx prisma db push`)
- [ ] 기존 Supabase 데이터 백업
- [ ] 데이터 마이그레이션 스크립트 실행 (필요시)

### 3. 컴포넌트 업데이트

- [ ] 폼 필드 구조 변경
- [ ] API 호출 방식 변경
- [ ] 타입 정의 업데이트
- [ ] 에러 처리 로직 업데이트

### 4. API 통합

- [ ] 기존 Supabase API 호출을 ImpacMatching API로 변경
- [ ] 인증 방식 변경 (Supabase Auth → NextAuth)
- [ ] 권한 검사 로직 업데이트

---

## 📝 단계별 마이그레이션 가이드

### Step 1: 환경 설정

1. **패키지 설치**

```bash
npm install @prisma/client prisma next-auth bcryptjs
npm uninstall @supabase/supabase-js  # 기존 Supabase 패키지 제거
```

2. **환경변수 설정**

```env
# .env.local
DATABASE_URL="postgresql://user:pass@host/impacmatching"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### Step 2: 데이터베이스 설정

1. **Prisma 초기화**

```bash
npx prisma generate
npx prisma db push
npm run db:seed  # 초기 데이터 생성
```

### Step 3: 컴포넌트 마이그레이션

1. **CompanyCreateForm 업데이트**
   - 위에 제공된 마이그레이션된 코드 적용
   - 불필요한 필드 제거
   - API 호출 방식 변경

2. **타입 정의 업데이트**

```typescript
// types/company.ts
export interface CompanyCreateData {
  name: string
  email: string
  password: string
  role: 'COMPANY'
  description?: string
  website?: string
}
```

### Step 4: API 통합

1. **API 호출 함수 생성**

```typescript
// lib/api/companies.ts
export async function createCompany(data: CompanyCreateData) {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '기업 생성에 실패했습니다')
  }

  return response.json()
}
```

### Step 5: 테스트 및 검증

1. **기능 테스트**
   - 회사 생성 폼 동작 확인
   - API 응답 검증
   - 에러 처리 확인

2. **데이터 검증**
   - 생성된 데이터가 올바른 형식인지 확인
   - 필수 필드가 모두 저장되는지 확인

---

## ⚠️ 주의사항

### 1. 필드 제거로 인한 영향

- `industry`, `location` 필드가 제거되어 관련 기능 수정 필요
- `is_active` 필드 제거로 활성/비활성 관리 방식 변경
- `logo_url` 제거로 로고 이미지 기능 일시 사용 불가

### 2. 데이터 타입 변경

- `website_url` → `website`: URL 처리 로직 확인 필요
- `password_hash` → `password`: 해시 처리가 API 레벨에서 수행됨

### 3. API 응답 형식 변경

- Supabase의 배열 응답에서 단일 객체 응답으로 변경
- 에러 처리 방식이 HTTP 상태 코드 기반으로 변경

### 4. 권한 시스템 변경

- Supabase RLS에서 NextAuth 세션 기반으로 변경
- 관리자 권한 체크 로직 업데이트 필요

---

## 🔍 트러블슈팅

### 1. 일반적인 문제

#### 문제: API 호출 시 401 Unauthorized

**해결:** NextAuth 세션 확인 및 ADMIN 권한 확인

#### 문제: 이메일 중복 오류

**해결:** 이메일 유니크 제약 조건으로 중복 방지됨

#### 문제: 웹사이트 URL 형식 오류

**해결:** API에서 자동으로 https:// 접두사 추가

### 2. 마이그레이션 중 데이터 손실 방지

```typescript
// 기존 데이터 백업
const backupData = await supabase.from('companies').select('*')

// JSON 파일로 저장
fs.writeFileSync('backup-companies.json', JSON.stringify(backupData))
```

---

## 📚 참고 자료

- [ImpacMatching API 문서](링크)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [NextAuth.js 문서](https://next-auth.js.org)
- [Next.js 14 API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

이 가이드를 따라 단계적으로 마이그레이션하면 기존 Supabase 시스템을 ImpacMatching 시스템으로 안전하게 전환할 수 있습니다.
