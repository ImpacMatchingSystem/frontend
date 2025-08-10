# ImpacMatching API 문서

## 📋 목차

- [인증 API](#인증-api)
- [미팅 관리 API](#미팅-관리-api)
- [시간대 관리 API](#시간대-관리-api)
- [회사 목록 API](#회사-목록-api)
- [알림 관리 API](#알림-관리-api)
- [행사 관리 API](#행사-관리-api)
- [관리자 API](#관리자-api)
- [에러 코드](#에러-코드)

---

## 🔐 인증 API

### 로그인

```http
POST /api/auth/signin
```

**요청 본문:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답:**

```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "사용자명",
    "role": "BUYER"
  },
  "expires": "2024-12-31T23:59:59.999Z"
}
```

### 로그아웃

```http
POST /api/auth/signout
```

---

## 🤝 미팅 관리 API

### 미팅 예약 (바이어 전용)

```http
POST /api/meetings
```

**권한:** BUYER

**요청 본문:**

```json
{
  "timeSlotId": "clm1234567890",
  "message": "안녕하세요. 투자 상담을 위해 미팅을 신청합니다."
}
```

**응답:**

```json
{
  "id": "meeting_id",
  "companyId": "company_id",
  "buyerId": "buyer_id",
  "timeSlotId": "timeslot_id",
  "status": "PENDING",
  "message": "안녕하세요. 투자 상담을 위해 미팅을 신청합니다.",
  "createdAt": "2024-01-15T10:00:00Z",
  "company": {
    "id": "company_id",
    "name": "AI 스타트업",
    "email": "contact@aistartup.com"
  },
  "buyer": {
    "id": "buyer_id",
    "name": "김투자",
    "email": "investor1@example.com"
  },
  "timeSlot": {
    "id": "timeslot_id",
    "startTime": "2024-01-20T14:00:00Z",
    "endTime": "2024-01-20T15:00:00Z"
  }
}
```

### 미팅 목록 조회

```http
GET /api/meetings?status=PENDING&page=1&limit=10
```

**권한:** BUYER, COMPANY

**쿼리 파라미터:**

- `status` (선택): PENDING, CONFIRMED, REJECTED, CANCELLED
- `page` (선택): 페이지 번호 (기본값: 1)
- `limit` (선택): 페이지 크기 (기본값: 10)

**응답:**

```json
[
  {
    "id": "meeting_id",
    "companyId": "company_id",
    "buyerId": "buyer_id",
    "status": "PENDING",
    "message": "미팅 신청 메시지",
    "createdAt": "2024-01-15T10:00:00Z",
    "company": {
      "id": "company_id",
      "name": "AI 스타트업",
      "description": "인공지능 기반 솔루션 개발"
    },
    "buyer": {
      "id": "buyer_id",
      "name": "김투자",
      "description": "시드 투자 전문"
    },
    "timeSlot": {
      "startTime": "2024-01-20T14:00:00Z",
      "endTime": "2024-01-20T15:00:00Z"
    }
  }
]
```

### 미팅 승인/거절 (회사 전용)

```http
PATCH /api/meetings/{meeting_id}
```

**권한:** COMPANY

**요청 본문:**

```json
{
  "status": "CONFIRMED" // 또는 "REJECTED"
}
```

**응답:**

```json
{
  "id": "meeting_id",
  "status": "CONFIRMED",
  "updatedAt": "2024-01-15T11:00:00Z",
  "company": {
    "name": "AI 스타트업"
  },
  "buyer": {
    "name": "김투자"
  },
  "timeSlot": {
    "startTime": "2024-01-20T14:00:00Z",
    "endTime": "2024-01-20T15:00:00Z"
  }
}
```

---

## ⏰ 시간대 관리 API

### 시간대 생성 (회사 전용)

```http
POST /api/timeslots
```

**권한:** COMPANY

**요청 본문:**

```json
{
  "startTime": "2024-01-20T14:00:00Z",
  "endTime": "2024-01-20T15:00:00Z"
}
```

**응답:**

```json
{
  "id": "timeslot_id",
  "userId": "company_id",
  "startTime": "2024-01-20T14:00:00Z",
  "endTime": "2024-01-20T15:00:00Z",
  "isBooked": false,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### 시간대 목록 조회 (회사별)

```http
GET /api/timeslots?companyId={company_id}&available=true
```

**쿼리 파라미터:**

- `companyId` (필수): 회사 ID
- `available` (선택): true - 예약 가능한 시간대만

**응답:**

```json
[
  {
    "id": "timeslot_id",
    "startTime": "2024-01-20T14:00:00Z",
    "endTime": "2024-01-20T15:00:00Z",
    "isBooked": false
  }
]
```

---

## 🏢 회사 목록 API

### 회사 목록 조회

```http
GET /api/companies?search=AI&page=1&limit=10
```

**쿼리 파라미터:**

- `search` (선택): 회사명 또는 설명 검색
- `page` (선택): 페이지 번호 (기본값: 1)
- `limit` (선택): 페이지 크기 (기본값: 10)

**응답:**

```json
[
  {
    "id": "company_id",
    "name": "AI 스타트업",
    "email": "contact@aistartup.com",
    "description": "인공지능 기반 솔루션 개발",
    "website": "https://aistartup.com",
    "createdAt": "2024-01-01T00:00:00Z",
    "timeSlots": [
      {
        "id": "timeslot_id",
        "startTime": "2024-01-20T14:00:00Z",
        "endTime": "2024-01-20T15:00:00Z",
        "isBooked": false
      }
    ],
    "_count": {
      "companyMeetings": 5
    }
  }
]
```

---

## 🔔 알림 관리 API

### 알림 목록 조회

```http
GET /api/notifications?unread=true&page=1&limit=20
```

**권한:** 로그인된 사용자

**쿼리 파라미터:**

- `unread` (선택): true - 읽지 않은 알림만
- `page` (선택): 페이지 번호 (기본값: 1)
- `limit` (선택): 페이지 크기 (기본값: 20)

**응답:**

```json
[
  {
    "id": "notification_id",
    "type": "MEETING_REQUEST",
    "title": "새로운 미팅 신청",
    "message": "김투자님이 2024-01-20 14:00 시간대에 미팅을 신청했습니다.",
    "relatedId": "meeting_id",
    "isRead": false,
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### 알림 읽음 처리

```http
PATCH /api/notifications
```

**권한:** 로그인된 사용자

**요청 본문 (특정 알림들 읽음 처리):**

```json
{
  "notificationIds": ["notification_id1", "notification_id2"]
}
```

**요청 본문 (모든 알림 읽음 처리):**

```json
{
  "markAllAsRead": true
}
```

**응답:**

```json
{
  "message": "알림이 읽음 처리되었습니다"
}
```

---

## 🎪 행사 관리 API

### 행사 정보 조회

```http
GET /api/event
```

**응답:**

```json
{
  "id": "event_id",
  "name": "2025 Tech Innovation Fair",
  "description": "혁신 기술 기업과 투자자를 연결하는 대규모 매칭 행사",
  "startDate": "2025-09-15T09:00:00Z",
  "endDate": "2025-09-17T18:00:00Z",
  "venue": "코엑스 컨벤션센터",
  "headerImage": "https://example.com/header-image.jpg",
  "headerText": "혁신의 미래를 만나보세요",
  "meetingDuration": 30,
  "operationStartTime": "09:00",
  "operationEndTime": "18:00",
  "lunchStartTime": "12:00",
  "lunchEndTime": "13:00",
  "status": "ACTIVE"
}
```

### 행사 정보 수정 (관리자 전용)

```http
PATCH /api/event
```

**권한:** ADMIN

**요청 본문:**

```json
{
  "name": "2025 Tech Innovation Fair",
  "description": "혁신 기술 기업과 투자자를 연결하는 행사",
  "startDate": "2025-09-15T09:00:00Z",
  "endDate": "2025-09-17T18:00:00Z",
  "venue": "코엑스 컨벤션센터",
  "headerImage": "https://example.com/header-image.jpg",
  "headerText": "혁신의 미래를 만나보세요",
  "meetingDuration": 30,
  "operationStartTime": "09:00",
  "operationEndTime": "18:00",
  "lunchStartTime": "12:00",
  "lunchEndTime": "13:00",
  "status": "ACTIVE"
}
```

---

## 👨‍💼 관리자 API

### 사용자 목록 조회

```http
GET /api/admin/users?role=COMPANY&search=AI&page=1&limit=50
```

**권한:** ADMIN

**쿼리 파라미터:**

- `role` (선택): COMPANY, BUYER
- `search` (선택): 이름, 이메일, 설명 검색
- `page` (선택): 페이지 번호 (기본값: 1)
- `limit` (선택): 페이지 크기 (기본값: 50)

**응답:**

```json
{
  "users": [
    {
      "id": "user_id",
      "name": "AI 스타트업",
      "email": "contact@aistartup.com",
      "role": "COMPANY",
      "description": "인공지능 기반 솔루션 개발",
      "website": "https://aistartup.com",
      "createdAt": "2024-01-01T00:00:00Z",
      "_count": {
        "companyMeetings": 5,
        "buyerMeetings": 0,
        "timeSlots": 10
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "totalPages": 1
  }
}
```

### 사용자 생성

```http
POST /api/admin/users
```

**권한:** ADMIN

**요청 본문:**

```json
{
  "name": "새로운 회사",
  "email": "new@company.com",
  "password": "password123",
  "role": "COMPANY",
  "description": "회사 소개",
  "website": "https://newcompany.com"
}
```

**응답:**

```json
{
  "message": "사용자가 성공적으로 생성되었습니다",
  "user": {
    "id": "new_user_id",
    "name": "새로운 회사",
    "email": "new@company.com",
    "role": "COMPANY",
    "description": "회사 소개",
    "website": "https://newcompany.com",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 개별 사용자 조회

```http
GET /api/admin/users/{user_id}
```

**권한:** ADMIN

**응답:**

```json
{
  "id": "user_id",
  "name": "AI 스타트업",
  "email": "contact@aistartup.com",
  "role": "COMPANY",
  "description": "인공지능 기반 솔루션 개발",
  "website": "https://aistartup.com",
  "createdAt": "2024-01-01T00:00:00Z",
  "_count": {
    "buyerMeetings": 0,
    "companyMeetings": 5,
    "timeSlots": 10,
    "notifications": 3
  }
}
```

### 개별 사용자 수정

```http
PATCH /api/admin/users/{user_id}
```

**권한:** ADMIN

**요청 본문:**

```json
{
  "name": "수정된 회사명",
  "email": "updated@company.com",
  "description": "수정된 회사 소개",
  "website": "https://updatedcompany.com",
  "password": "newpassword123" // 선택사항
}
```

### 개별 사용자 삭제

```http
DELETE /api/admin/users/{user_id}
```

**권한:** ADMIN

**응답:**

```json
{
  "message": "사용자가 성공적으로 삭제되었습니다",
  "success": true
}
```

**참고:** 관리자 계정(ADMIN)은 삭제할 수 없습니다.

### 엑셀 일괄 업로드

```http
POST /api/admin/upload-excel
```

**권한:** ADMIN

**요청:** multipart/form-data

- `excel-file`: 엑셀 파일
- `type`: "COMPANY" 또는 "BUYER"

**엑셀 파일 형식 (회사):**
| 기업이름 | 기업이메일 | 기업소개 | 기업홈페이지 | 비밀번호 |
|---------|-----------|---------|-------------|----------|
| AI 스타트업 | contact@ai.com | AI 솔루션 개발 | ai.com | company123 |

**엑셀 파일 형식 (바이어):**
| 바이어이름 | 바이어이메일 | 바이어소개 | 바이어홈페이지 | 비밀번호 |
|----------|------------|----------|--------------|----------|
| 김투자 | investor@vc.com | 시드 투자 전문 | vc.com | buyer123 |

**응답:**

```json
{
  "message": "15명 성공, 2명 실패",
  "results": [
    {
      "row": 2,
      "success": true,
      "user": {
        "id": "new_user_id",
        "name": "AI 스타트업",
        "email": "contact@ai.com",
        "role": "COMPANY"
      }
    }
  ],
  "errors": [
    {
      "row": 5,
      "error": "이미 등록된 이메일입니다",
      "data": {
        "기업이름": "중복 회사",
        "기업이메일": "duplicate@company.com"
      }
    }
  ],
  "summary": {
    "total": 17,
    "success": 15,
    "failed": 2
  }
}
```

### 테스트 데이터 초기화

```http
POST /api/admin/reset-data
```

**권한:** ADMIN

**응답:**

```json
{
  "message": "테스트 데이터가 초기화되었습니다",
  "success": true
}
```

**주의:** 이 API는 관리자 계정을 제외한 모든 데이터를 삭제하고 시드 데이터를 재생성합니다.

---

## ❌ 에러 코드

### HTTP 상태 코드

| 코드 | 설명        |
| ---- | ----------- |
| 200  | 성공        |
| 201  | 생성 성공   |
| 400  | 잘못된 요청 |
| 401  | 인증 필요   |
| 403  | 권한 없음   |
| 404  | 리소스 없음 |
| 500  | 서버 오류   |

### 에러 응답 형식

```json
{
  "error": "에러 메시지",
  "details": "상세 설명 (선택사항)"
}
```

### 일반적인 에러 메시지

#### 인증/권한 관련

```json
{
  "error": "Unauthorized"
}
```

#### 유효성 검사 실패

```json
{
  "error": "필수 정보가 누락되었습니다 (이름, 이메일, 비밀번호, 역할)"
}
```

#### 중복 데이터

```json
{
  "error": "이미 등록된 이메일입니다"
}
```

#### 리소스 없음

```json
{
  "error": "사용자를 찾을 수 없습니다"
}
```

#### 비즈니스 로직 오류

```json
{
  "error": "이미 예약된 시간대입니다"
}
```

---

## 📝 요청/응답 헤더

### 인증 헤더

모든 인증이 필요한 API는 NextAuth 세션 쿠키를 사용합니다.

### Content-Type 헤더

- JSON 요청: `Content-Type: application/json`
- 파일 업로드: `Content-Type: multipart/form-data`

### 응답 헤더

- `Content-Type: application/json`

---

## 🔄 API 사용 예시

### 미팅 예약 전체 플로우

1. **바이어: 회사 목록 조회**

```javascript
const response = await fetch('/api/companies?search=AI')
const companies = await response.json()
```

2. **바이어: 특정 회사의 가능한 시간대 확인**

```javascript
// companies 응답에 timeSlots가 포함됨
const availableSlots = companies[0].timeSlots
```

3. **바이어: 미팅 신청**

```javascript
const meetingResponse = await fetch('/api/meetings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    timeSlotId: 'selected_timeslot_id',
    message: '투자 상담을 위해 미팅을 신청합니다.',
  }),
})
```

4. **회사: 미팅 승인**

```javascript
const approveResponse = await fetch('/api/meetings/meeting_id', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'CONFIRMED' }),
})
```

---

이 API 문서는 ImpacMatching 시스템의 모든 엔드포인트를 상세히 설명하며, 개발자가 시스템을 통합하고 사용하는데 필요한 모든 정보를 제공합니다.
