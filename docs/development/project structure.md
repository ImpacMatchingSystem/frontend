# ImpacMatching 프로젝트 폴더 구조

## 📁 전체 구조 개요

```
impacmatching/
├── src/
│   ├── app/                    # Application Layer (Next.js App Router)
│   ├── api/                    # Service Layer (API Routes)
│   ├── components/             # UI Layer (React Components)
│   ├── hooks/                  # React Layer (Custom Hooks)
│   ├── lib/                    # Non-react Layer (Utilities)
│   └── types/                  # Type Definitions
├── supabase/                   # Backend Configuration
├── public/                     # Static Assets
└── docs/                       # Documentation
```

## 🏗️ 계층별 상세 구조

### 1. Application Layer (`src/app/`)

**역할**: 페이지 라우팅 및 레이아웃 관리

```
src/app/
├── (auth)/                   # 인증 관련 페이지 그룹
│   └── login/
│       └── page.tsx          # 로그인 페이지
├── dashboard/                # 대시보드 페이지
│   ├── buyer/                # 바이어 대시보드
│   │   ├── page.tsx
│   │   ├── companies/        # 기업 목록
│   │   └── meetings/         # 미팅 관리
│   └── company/              # 기업 대시보드
│       ├── page.tsx
│       ├── schedule/         # 시간표 설정
│       └── meetings/         # 미팅 관리
├── admin/                    # 관리자 페이지
│   ├── buyers/								# 바이어 관리
│   ├── companies/						# 참가기업 관리
│   ├── dashboard/						# 관리자 대시보드
│   ├── events/								# 행사 관리
│   ├── login/								# 로그인
│   └── meetings/							# 미팅 관리
├── layout.tsx                 # 루트 레이아웃
├── page.tsx                   # 홈페이지
├── loading.tsx                # 로딩 컴포넌트
├── error.tsx                  # 에러 페이지
└── not-found.tsx              # 404 페이지
```

### 2. Service Layer (`src/api/`)

**역할**: API 라우트 및 서버 사이드 로직

```
src/api/
├── auth/                      # 인증 관련 API
│   ├── login/
│   │   └── route.ts
│   ├── logout/
│   │   └── route.ts
│   └── refresh/
│       └── route.ts
├── meetings/                  # 미팅 관련 API
│   ├── route.ts              # 미팅 목록, 생성
│   ├── [id]/
│   │   └── route.ts          # 미팅 상세, 수정, 삭제
│   └── approve/
│       └── route.ts          # 미팅 승인
├── companies/                 # 기업 관련 API
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       └── timeslots/
│           └── route.ts
├── admin/                     # 관리자 API
│   ├── events/
│   ├── users/
│   └── reports/
└── notifications/             # 알림 API
    └── route.ts
```

### 3. UI Layer (`src/components/`)

**역할**: 재사용 가능한 UI 컴포넌트

```
src/components/
├── ui/                        # shadcn/ui 기본 컴포넌트
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── toast.tsx
│		...
│   └── calendar.tsx
├── layout/                    # 레이아웃 컴포넌트
│   ├── header.tsx
│   ├── footer.tsx
│   ├── admin-header.tsx
│   ├── buyer-header.tsx
│   └── theme-provider.tsx 		(개발 필요)
├── forms/                     # 폼 관련 컴포넌트 (개발 필요)
│   ├── login-form.tsx
│   ├── meeting-form.tsx
│   ├── timeslot-form.tsx
│   └── company-form.tsx
├── admin/                     # 관리자 전용 컴포넌트
│   ├── admin-guard.tsx
│   ├── excel-upload.tsx
│   ├── user-table.tsx				(개발 필요)
│   ├── event-manager.tsx			(개발 필요)
│   └── analytics-dashboard.tsx (개발 필요)
└── features/                  # 기능별 컴포넌트(개발 필요)
	  ├── meetings/
	  │   ├── meeting-card.tsx
	  │   ├── meeting-list.tsx
		│   ├── meeting-calendar.tsx
		│   └── meeting-status.tsx
		├── companies/
		│   ├── company-card.tsx
		│   ├── company-list.tsx
		│   └── company-filter.tsx
		└── timeslots/
		    ├── timeslot-picker.tsx
		    ├── timeslot-grid.tsx
		    └── availability-setter.tsx
```

### 4. React Layer (`src/hooks/` & `src/store/`)

**역할**: React 상태 관리 및 커스텀 훅

```
src/hooks/                     # Custom React Hooks
├── use-auth.ts               # 인증 관련 훅 (개발 필요)
├── use-meetings.ts           # 미팅 데이터 훅 (개발 필요)
├── use-companies.ts          # 기업 데이터 훅 (개발 필요)
├── use-timeslots.ts          # 시간표 관리 훅 (개발 필요)
├── use-notifications.ts      # 알림 관리 훅 (개발 필요)
├── use-mobile.ts             # 모바일 감지 훅
└── use-toast.ts              # 토스트 알림 훅

src/store/                     # 상태 관리 (개발 필요)
├── auth-store.ts             # 인증 상태
├── meeting-store.ts          # 미팅 상태
└── ui-store.ts               # UI 상태
```

### 5. Non-react Layer (`src/lib/`)

**역할**: 유틸리티 함수 및 외부 서비스 연동

```
src/lib/
├── supabase/                  # Supabase 관련
│   ├── client.ts             # Supabase 클라이언트
│   ├── auth.ts               # 인증 헬퍼
│   ├── database.ts           # 데이터베이스 쿼리
│   └── storage.ts            # 파일 업로드
├── utils/                     # 유틸리티 함수
│   ├── date-utils.ts         # 날짜 관련 유틸
│   ├── validation.ts         # 유효성 검사
│   ├── format.ts             # 포맷팅 함수
│   ├── constants.ts          # 상수 정의
│   └── cn.ts                 # 클래스명 유틸 (shadcn)
├── email/                     # 이메일 관련
│   ├── templates.ts          # 이메일 템플릿
│   └── sender.ts             # 이메일 발송
├── validations/               # 유효성 검사 스키마
│   ├── auth.ts
│   ├── meeting.ts
│   └── company.ts
└── config/                    # 설정 파일
    ├── database.ts
    ├── email.ts
    └── app.ts
```

### 6. Type Definitions (`src/types/`)

**역할**: TypeScript 타입 정의

```
src/types/
├── auth.ts                    # 인증 관련 타입
├── meeting.ts                 # 미팅 관련 타입
├── company.ts                 # 기업 관련 타입
├── user.ts                    # 사용자 타입
├── api.ts                     # API 응답 타입
├── database.ts                # 데이터베이스 타입
└── globals.ts                 # 전역 타입
```

## 🔧 외부 설정 폴더

### Supabase 설정

```
supabase/
├── config.toml               # Supabase 설정
├── migrations/               # 데이터베이스 마이그레이션
│   ├── 001_initial_schema.sql
│   ├── 002_add_meetings.sql
│   └── 003_add_notifications.sql
├── functions/                # Edge Functions
│   ├── send-email/
│   │   └── index.ts
│   └── meeting-reminder/
│       └── index.ts
└── seed.sql                  # 초기 데이터
```

### 정적 파일 및 문서

```
public/                       # 정적 파일
├── images/
│   ├── logos/
│   ├── placeholders/
│   └── icons/
├── favicon.ico
└── robots.txt

docs/                         # 프로젝트 문서
├── api/                      # API 문서
├── deployment/               # 배포 가이드
├── development/              # 개발 가이드
└── user-guide/               # 사용자 가이드
```

## 📋 폴더별 역할 요약

| 폴더              | 계층              | 역할                       |
| ----------------- | ----------------- | -------------------------- |
| `src/app/`        | Application Layer | 페이지 라우팅, 레이아웃    |
| `src/api/`        | Service Layer     | API 엔드포인트, 서버 로직  |
| `src/components/` | UI Layer          | React 컴포넌트, UI 요소    |
| `src/hooks/`      | React Layer       | 커스텀 훅, React 상태      |
| `src/lib/`        | Non-react Layer   | 유틸리티, 외부 서비스 연동 |
| `src/types/`      | Type Layer        | TypeScript 타입 정의       |
| `supabase/`       | Backend           | 데이터베이스, 함수 설정    |
| `public/`         | Static            | 정적 파일, 이미지          |
| `docs/`           | Documentation     | 프로젝트 문서              |

## 🎯 설계 원칙

1. **계층 분리**: 각 폴더는 명확한 역할과 책임을 가짐
2. **재사용성**: 컴포넌트와 훅은 재사용 가능하도록 설계
3. **확장성**: 새로운 기능 추가 시 구조를 유지하며 확장 가능
4. **타입 안전성**: 모든 데이터 구조에 대한 타입 정의
5. **관심사 분리**: UI, 로직, 데이터 접근을 분리하여 관리
