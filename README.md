# ImpacMatching - 미팅 매칭 시스템

## 📋 프로젝트 개요

기업과 바이어(투자자)를 연결하는 미팅 매칭 플랫폼입니다. Next.js 14, PostgreSQL(Neon), Prisma, NextAuth를 사용하여 구현되었습니다.

## 🛠 기술 스택

- **프레임워크**: Next.js 14
- **데이터베이스**: PostgreSQL (Neon)
- **ORM**: Prisma
- **인증**: NextAuth.js
- **암호화**: bcryptjs
- **파일 처리**: xlsx (엑셀 업로드)

## 🗄 데이터베이스 스키마

### 주요 모델

#### User (사용자)

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String   // 해시된 비밀번호
  name        String
  role        UserRole @default(BUYER)
  website     String?  // 회사 홈페이지
  description String?  // 기업/바이어 소개
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### Event (행사)

```prisma
model Event {
  id              String    @id @default(cuid())
  name            String
  description     String?
  startDate       DateTime
  endDate         DateTime
  venue           String?
  headerImage     String?
  headerText      String?
  meetingDuration Int       @default(30)  // 미팅 시간(분)
  operationStartTime String @default("09:00")
  operationEndTime   String @default("18:00")
  lunchStartTime  String @default("12:00")
  lunchEndTime    String @default("13:00")
  status          EventStatus @default(ACTIVE)
}
```

#### TimeSlot (시간대)

```prisma
model TimeSlot {
  id        String   @id @default(cuid())
  userId    String   // 회사 사용자 ID
  startTime DateTime
  endTime   DateTime
  isBooked  Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

#### Meeting (미팅)

```prisma
model Meeting {
  id         String        @id @default(cuid())
  companyId  String        // 회사 사용자 ID
  buyerId    String        // 바이어 사용자 ID
  timeSlotId String        @unique
  status     MeetingStatus @default(PENDING)
  message    String?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
}
```

#### Notification (알림)

```prisma
model Notification {
  id        String   @id @default(cuid())
  type      NotificationType
  userId    String
  title     String
  message   String
  relatedId String?   // 관련 미팅 ID
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

### 열거형 (Enums)

```prisma
enum UserRole {
  ADMIN
  COMPANY
  BUYER
}

enum MeetingStatus {
  PENDING
  CONFIRMED
  REJECTED
  CANCELLED
}

enum EventStatus {
  UPCOMING
  ACTIVE
  ENDED
}

enum NotificationType {
  MEETING_REQUEST
  MEETING_APPROVED
  MEETING_REJECTED
  MEETING_CANCELLED
  SYSTEM_NOTICE
}
```

## 🚀 API 엔드포인트

### 인증

- `POST /api/auth/signin` - 로그인
- `POST /api/auth/signout` - 로그아웃

### 미팅 관리

- `POST /api/meetings` - 미팅 예약 (바이어)
- `GET /api/meetings` - 미팅 목록 조회
- `PATCH /api/meetings/[id]` - 미팅 승인/거절 (회사)

### 시간대 관리

- `POST /api/timeslots` - 시간대 생성 (회사)

### 회사 목록

- `GET /api/companies` - 회사 목록 조회 (검색 가능)

### 알림 시스템

- `GET /api/notifications` - 알림 목록 조회
- `PATCH /api/notifications` - 알림 읽음 처리

### 행사 관리

- `GET /api/event` - 행사 정보 조회
- `PATCH /api/event` - 행사 정보 수정 (관리자)

### 관리자 전용

- `POST /api/admin/upload-excel` - 엑셀 일괄 업로드
- `GET /api/admin/users` - 사용자 목록 조회
- `POST /api/admin/users` - 사용자 생성
- `GET /api/admin/users/[id]` - 개별 사용자 조회
- `PATCH /api/admin/users/[id]` - 개별 사용자 수정
- `DELETE /api/admin/users/[id]` - 개별 사용자 삭제
- `POST /api/admin/reset-data` - 테스트 데이터 초기화

## 📊 엑셀 업로드 형식

### 회사용 엑셀 파일 (companies.xlsx)

| 기업이름          | 기업이메일       | 기업소개       | 기업홈페이지   | 비밀번호   |
| ----------------- | ---------------- | -------------- | -------------- | ---------- |
| AI 스타트업       | contact@ai.com   | AI 솔루션 개발 | https://ai.com | company123 |
| 핀테크 이노베이션 | info@fintech.com | 금융 기술 혁신 | fintech.com    | company456 |

### 바이어용 엑셀 파일 (buyers.xlsx)

| 바이어이름 | 바이어이메일       | 바이어소개            | 바이어홈페이지 | 비밀번호 |
| ---------- | ------------------ | --------------------- | -------------- | -------- |
| 김투자     | investor1@vc.com   | 시드 투자 전문        | https://vc.com | buyer123 |
| 박벤처     | investor2@fund.com | 스타트업 액셀러레이터 | fund.com       | buyer456 |

## 🔐 권한 시스템

### 사용자 역할

- **ADMIN**: 시스템 관리자 (모든 권한)
- **COMPANY**: 기업 (시간대 등록, 미팅 승인/거절)
- **BUYER**: 바이어/투자자 (미팅 신청)

### 권한별 기능

#### 관리자 (ADMIN)

- 사용자 관리 (생성, 수정, 삭제)
- 엑셀 일괄 업로드
- 행사 정보 관리
- 시스템 데이터 초기화

#### 회사 (COMPANY)

- 시간대 등록/관리
- 미팅 신청 승인/거절
- 미팅 목록 조회

#### 바이어 (BUYER)

- 회사 목록 조회
- 미팅 신청
- 미팅 현황 조회

## 🔔 알림 시스템

### 알림 타입

- `MEETING_REQUEST`: 새로운 미팅 신청
- `MEETING_APPROVED`: 미팅 승인
- `MEETING_REJECTED`: 미팅 거절
- `MEETING_CANCELLED`: 미팅 취소
- `SYSTEM_NOTICE`: 시스템 공지

### 알림 흐름

1. 바이어가 미팅 신청 → 회사에게 `MEETING_REQUEST` 알림
2. 회사가 미팅 승인 → 바이어에게 `MEETING_APPROVED` 알림
3. 회사가 미팅 거절 → 바이어에게 `MEETING_REJECTED` 알림

## 🏗 초기 설정 명령어

```bash
# 1. 패키지 설치
npm install @prisma/client prisma next-auth xlsx bcryptjs @types/bcryptjs tsx

# 2. 환경변수 설정 (.env.local 생성)

# 3. Prisma 초기화 및 DB 생성
npx prisma db push

# 4. Prisma Client 생성
npx prisma generate

# 5. 시드 데이터 생성
npm run db:seed

# 6. 개발 서버 실행
npm run dev

# 7. Prisma Studio 실행 (선택사항)
npx prisma studio
```

## 📝 기본 계정 정보 (시드 데이터)

### 관리자 계정

- **이메일**: admin@impacmatching.com
- **비밀번호**: admin123!

### 샘플 회사 계정

- **이메일**: contact@aistartup.com
- **비밀번호**: company123!

### 샘플 바이어 계정

- **이메일**: investor1@example.com
- **비밀번호**: buyer123!

## 🔄 데이터 흐름

### 미팅 예약 프로세스

1. **회사**: 가능한 시간대 등록
2. **바이어**: 회사 목록에서 원하는 회사 선택
3. **바이어**: 가능한 시간대 중 선택하여 미팅 신청
4. **회사**: 미팅 신청 승인/거절
5. **시스템**: 알림 발송 및 상태 업데이트

### 트랜잭션 처리

- 미팅 생성 시 시간대 예약 상태 동시 업데이트
- 미팅 거절 시 시간대 예약 해제
- 사용자 삭제 시 관련 데이터 일괄 삭제

## 🎯 주요 특징

1. **안전한 인증**: NextAuth.js + bcrypt 해시 암호화
2. **트랜잭션 처리**: Prisma 트랜잭션으로 데이터 일관성 보장
3. **실시간 알림**: 미팅 상태 변경 시 자동 알림 발송
4. **엑셀 일괄 업로드**: 대량 사용자 등록 지원
5. **권한 기반 접근**: 역할별 API 접근 제어
6. **관리자 도구**: 데이터 관리 및 초기화 기능

## 🔧 개발 가이드

### 커밋 메시지 규칙

커밋 메시지는 다음 형식을 따라주세요:

| 종류       | 예시                                  |
| ---------- | ------------------------------------- |
| 🎁새기능   | 🎁새기능: 미팅 예약 기능 추가 (#1)    |
| 🛠개선     | 🛠개선: 시간대 선택 UI 개선 (#2)      |
| 🐛오류     | 🐛오류: 중복 예약 방지 로직 수정 (#3) |
| 🎨리팩토링 | 🎨리팩토링: API 응답 구조 개선 (#4)   |
| 📝문서     | 📝문서: API 문서 업데이트             |
| 🚀배포     | 🚀배포: v1.0.0 프로덕션 배포          |

### 브랜치 전략

- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/기능명`: 기능 개발 브랜치
- `refactor/리팩토링명`: 리팩토링 브랜치
- `fix/수정내용`: 수정 브랜치
- `hotfix/수정내용`: 긴급 수정 브랜치

### 코드 스타일

- ESLint + Prettier 설정 준수
- 컴포넌트명은 PascalCase
- 함수명은 camelCase
- 상수는 UPPER_SNAKE_CASE
