# Next.js 코딩 컨벤션 가이드 📝

## 🎯 기본 원칙

- **간단함**: 복잡한 규칙보다는 실용적인 규칙
- **일관성**: 팀 전체가 동일한 스타일로 코딩
- **가독성**: 코드를 읽기 쉽게 작성
- **유연함**: 상황에 따라 적절히 조정 가능

---

## 📁 폴더 및 파일 네이밍

### 폴더명

```bash
# kebab-case 사용
✅ meeting-list/
✅ company-card/
✅ user-profile/

❌ meetingList/
❌ CompanyCard/
❌ user_profile/
```

### 파일명 규칙

#### 컴포넌트 파일

```bash
# PascalCase + .tsx
✅ MeetingCard.tsx
✅ UserProfile.tsx
✅ AdminDashboard.tsx

# 또는 kebab-case (선택사항)
✅ meeting-card.tsx
✅ user-profile.tsx
```

#### 유틸리티/훅/라이브러리 파일

```bash
# kebab-case 사용
✅ use-auth.ts
✅ date-utils.ts
✅ supabase-client.ts
✅ validation-schemas.ts
```

#### 페이지 파일 (App Router)

```bash
# Next.js 규칙에 따라
✅ page.tsx          # 페이지
✅ layout.tsx        # 레이아웃
✅ loading.tsx       # 로딩
✅ error.tsx         # 에러
✅ not-found.tsx     # 404
✅ route.ts          # API 라우트
```

---

## 🧩 컴포넌트 작성 규칙

### 기본 구조

```tsx
'use client'

// 필요한 경우에만
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import type { Meeting } from '@/types/meeting'

// 타입 정의
interface MeetingCardProps {
  meeting: Meeting
  onApprove?: (id: string) => void
  className?: string
}

// 메인 컴포넌트
export function MeetingCard({
  meeting,
  onApprove,
  className,
}: MeetingCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = async () => {
    setIsLoading(true)
    await onApprove?.(meeting.id)
    setIsLoading(false)
  }

  return (
    <Card className={className}>
      <h3>{meeting.title}</h3>
      <Button onClick={handleApprove} disabled={isLoading}>
        승인하기
      </Button>
    </Card>
  )
}

// 기본 export
export default MeetingCard
```

### 컴포넌트 네이밍

```tsx
// 함수형 컴포넌트 - PascalCase
✅ export function MeetingCard() { }
✅ export function AdminUserTable() { }

// 컴포넌트 파일의 기본 export
✅ export default MeetingCard

// 여러 컴포넌트를 하나 파일에서 export
✅ export { MeetingCard, MeetingList, MeetingForm }
```

---

## 📦 Import/Export 순서

```tsx
// 1. React 및 Next.js 관련
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

// 2. 외부 라이브러리
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { AdminHeader } from '@/components/layout/admin-header'
// 3. 내부 컴포넌트 (@/components)
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 4. 내부 훅/유틸/라이브러리 (@/hooks, @/lib)
import { useAuth } from '@/hooks/use-auth'

import { formatDate } from '@/lib/utils/date-utils'

// 5. 타입 import (맨 마지막, type 키워드 사용)
import type { Meeting } from '@/types/meeting'
import type { User } from '@/types/user'
```

---

## 🎨 스타일링 규칙

### Tailwind CSS

```tsx
// 클래스명은 논리적 순서로 작성
✅ className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm"

// 조건부 스타일링 - clsx 활용
import { cn } from '@/lib/utils/cn'

className={cn(
  "base-classes here",
  isActive && "bg-blue-500",
  isDisabled && "opacity-50 cursor-not-allowed",
  className // props로 받은 className은 마지막에
)}
```

### 스타일 카테고리 순서

1. **레이아웃**: `flex`, `grid`, `block`, `inline`
2. **포지셔닝**: `relative`, `absolute`, `top`, `left`
3. **크기**: `w-`, `h-`, `min-`, `max-`
4. **여백**: `m-`, `p-`, `space-`
5. **배경/테두리**: `bg-`, `border-`, `rounded-`
6. **텍스트**: `text-`, `font-`, `leading-`
7. **기타**: `shadow-`, `opacity-`, `transform-`

---

## 🔄 상태 관리 규칙

### useState

```tsx
// 명확한 초기값과 타입 지정
const [meetings, setMeetings] = useState<Meeting[]>([])
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

// boolean 상태는 is/has/can/should 접두사 사용
const [isOpen, setIsOpen] = useState(false)
const [hasError, setHasError] = useState(false)
const [canSubmit, setCanSubmit] = useState(false)
```

### Zustand (전역 상태)

```tsx
// store 파일 - kebab-case
// src/store/auth-store.ts
import { create } from 'zustand'

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    // 로그인 로직...
    set({ isLoading: false })
  },

  logout: () => {
    set({ user: null })
  },
}))
```

---

## 🪝 Custom Hook 규칙

```tsx
// 파일명: use-meetings.ts
import { useState, useEffect } from 'react'

import type { Meeting } from '@/types/meeting'

interface UseMeetingsReturn {
  meetings: Meeting[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useMeetings(userId?: string): UseMeetingsReturn {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMeetings = async () => {
    // fetch 로직...
  }

  useEffect(() => {
    fetchMeetings()
  }, [userId])

  return {
    meetings,
    isLoading,
    error,
    refetch: fetchMeetings,
  }
}
```

---

## 🔧 유틸리티 함수 규칙

```tsx
// 파일명: date-utils.ts
import { format, parseISO } from 'date-fns'

// 함수는 동사로 시작
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'yyyy-MM-dd')
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'yyyy-MM-dd HH:mm')
}

// 상수는 UPPER_SNAKE_CASE
export const DATE_FORMAT = 'yyyy-MM-dd'
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm'

// 객체 형태의 상수
export const MEETING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const
```

---

## 📝 타입 정의 규칙

```tsx
// 파일명: meeting.ts
// 기본 타입 - PascalCase
export interface Meeting {
  id: string
  title: string
  date: string
  status: 'pending' | 'approved' | 'rejected'
  participants: User[]
}

// API 관련 타입
export interface CreateMeetingRequest {
  title: string
  date: string
  participantIds: string[]
}

export interface MeetingResponse {
  success: boolean
  data: Meeting
  error?: string
}

// 컴포넌트 Props 타입
export interface MeetingCardProps {
  meeting: Meeting
  onUpdate?: (meeting: Meeting) => void
  className?: string
}

// 유니온 타입
export type MeetingStatus = 'pending' | 'approved' | 'rejected'
export type UserRole = 'admin' | 'buyer' | 'company'
```

---

## 🛠 API 라우트 규칙

```tsx
// 파일명: route.ts (API 라우트)
import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

// 요청 스키마 정의
const createMeetingSchema = z.object({
  title: z.string().min(1),
  date: z.string(),
  participantIds: z.array(z.string()),
})

// GET 핸들러
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // 데이터 조회 로직...
    const meetings = await fetchMeetings(userId)

    return NextResponse.json({
      success: true,
      data: meetings,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meetings' },
      { status: 500 }
    )
  }
}

// POST 핸들러
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createMeetingSchema.parse(body)

    // 생성 로직...
    const meeting = await createMeeting(validatedData)

    return NextResponse.json(
      {
        success: true,
        data: meeting,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create meeting' },
      { status: 500 }
    )
  }
}
```

---

## 📱 반응형 및 접근성

### 반응형 디자인

```tsx
// 모바일 퍼스트 접근
;<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card className="p-4 md:p-6" />
</div>

// 조건부 렌더링
{
  isMobile ? <MobileMeetingCard /> : <DesktopMeetingCard />
}
```

### 접근성

```tsx
// 적절한 HTML 시맨틱 사용
<main>
  <h1>미팅 관리</h1>
  <section>
    <h2>예정된 미팅</h2>
    <ul>
      {meetings.map(meeting => (
        <li key={meeting.id}>
          <MeetingCard meeting={meeting} />
        </li>
      ))}
    </ul>
  </section>
</main>

// aria 속성 적절히 활용
<button
  aria-label="미팅 승인"
  aria-describedby="meeting-description"
  disabled={isLoading}
>
  {isLoading ? '처리 중...' : '승인'}
</button>
```

---

## 🚦 에러 처리 규칙

```tsx
// try-catch 적극 활용
const handleSubmit = async () => {
  try {
    setIsLoading(true)
    setError(null)

    await submitMeeting(formData)

    // 성공 처리
    toast.success('미팅이 생성되었습니다')
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'

    setError(message)
    toast.error(message)
  } finally {
    setIsLoading(false)
  }
}

// 에러 바운더리 활용
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryComponent
      fallback={<div>문제가 발생했습니다. 다시 시도해주세요.</div>}
    >
      {children}
    </ErrorBoundaryComponent>
  )
}
```

---

## ✨ 기타 규칙

### 주석

```tsx
// 복잡한 로직에만 주석 추가
// TODO: 성능 최적화 필요
// FIXME: 타입 에러 수정 필요
// NOTE: 이 부분은 API 변경 시 함께 수정해야 함

/**
 * 미팅을 승인하는 함수
 * @param meetingId 미팅 ID
 * @param adminId 승인하는 관리자 ID
 * @returns Promise<boolean> 승인 성공 여부
 */
export async function approveMeeting(
  meetingId: string,
  adminId: string
): Promise<boolean> {
  // 구현...
}
```

### 성능 최적화

```tsx
// React.memo 적절히 사용
export const MeetingCard = memo(function MeetingCard({
  meeting,
}: MeetingCardProps) {
  // 컴포넌트 내용...
})

// useMemo, useCallback 필요한 경우에만
const expensiveValue = useMemo(() => {
  return calculateComplexValue(data)
}, [data])

const handleClick = useCallback(() => {
  onMeetingSelect(meeting.id)
}, [meeting.id, onMeetingSelect])
```

### 상수 관리

```tsx
// constants.ts
export const APP_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['pdf', 'doc', 'docx'],
  MEETING_DURATION: 30, // minutes
} as const

export const API_ENDPOINTS = {
  MEETINGS: '/api/meetings',
  COMPANIES: '/api/companies',
  USERS: '/api/users',
} as const
```
