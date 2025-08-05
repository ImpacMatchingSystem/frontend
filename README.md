# ImpacMatching

행사 참가기업과 바이어 간 효율적인 1:1 미팅 매칭 서비스

## 📋 프로젝트 개요

ImpacMatching은 행사에서 참가기업과 바이어가 손쉽게 미팅을 예약하고 관리할 수 있는 웹 서비스입니다.

### 🎯 핵심 기능
- **미팅 예약**: 참가기업의 가능한 시간대에 바이어가 미팅 신청
- **실시간 관리**: 미팅 승인/거절 및 일정 확인
- **자동 알림**: 이메일을 통한 예약 상태 알림
- **관리자 대시보드**: 전체 미팅 현황 모니터링

## 🛠 기술 스택

### Frontend
- Next.js 14
- TypeScript
- shadcn/ui
- Tailwind CSS
- React Hook Form

### Backend
- Supabase (Backend as a Service)
- PostgreSQL (Supabase DB)
- Supabase Auth
- Supabase Edge Functions

### Infrastructure
- Vercel (Frontend)
- Supabase (Backend & Database)

## 🚀 시작하기

### 필수 요구사항
- Node.js 18+
- Supabase 계정
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/your-username/impacmatching.git
cd impacmatching
```

2. **의존성 설치**
```bash
npm install
```
3. **개발 서버 실행**
```bash
npm run dev
```

## 👥 사용자 역할

### 참가기업 (Company)
- 상담 가능 시간대 설정
- 미팅 신청 승인/거절
- 확정된 미팅 일정 관리

### 바이어 (Buyer)
- 참가기업 목록 조회
- 미팅 신청 및 현황 확인
- 확정된 미팅 일정 확인

### 관리자 (Admin)
- 사용자 및 행사 관리
- 전체 미팅 현황 모니터링
- 통계 및 리포트 생성

## 🔧 개발 가이드

### 커밋 메시지 규칙

커밋 메시지는 다음 형식을 따라주세요:

| 종류 | 예시 |
|------|------|
| 🎁새기능 | 🎁새기능: 미팅 예약 기능 추가 (#1) |
| 🛠개선 | 🛠개선: 시간대 선택 UI 개선 (#2) |
| 🐛오류 | 🐛오류: 중복 예약 방지 로직 수정 (#3) |
| 🎨리팩토링 | 🎨리팩토링: API 응답 구조 개선 (#4) |
| 📝문서 | 📝문서: API 문서 업데이트 |
| 🚀배포 | 🚀배포: v1.0.0 프로덕션 배포 |

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

## 📦 배포

### 프로덕션 배포

#### Vercel 배포 (Frontend)
```bash
# 자동 배포 (GitHub 연동)
git push origin main

# 수동 배포
npm run build
vercel --prod
```

#### Supabase 설정
1. **Production 환경 설정**
	 - Supabase 대시보드에서 프로덕션 프로젝트 생성
	 - 환경변수 업데이트

2. **데이터베이스 마이그레이션**
```bash
supabase db push --linked
```

3. **Edge Functions 배포**
```bash
supabase functions deploy
```

### 환경별 설정
- **개발**: Local Supabase + Vercel Preview
- **스테이징**: Supabase Staging + Vercel Preview
- **프로덕션**: Supabase Production + Vercel Production
