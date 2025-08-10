import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 시드 데이터 생성 시작...')

  // 1. 행사 정보 생성 (단일 행사)
  const event = await prisma.event.upsert({
    where: { id: 'default-event' },
    update: {},
    create: {
      id: 'default-event',
      name: '2025 Tech Innovation Fair',
      description: '혁신 기술 기업과 투자자를 연결하는 대규모 매칭 행사',
      startDate: new Date('2025-09-15T09:00:00Z'),
      endDate: new Date('2025-09-17T18:00:00Z'),
      venue: '코엑스 컨벤션센터',
      headerImage: 'https://example.com/header-image.jpg',
      headerText: '혁신의 미래를 만나보세요',
      meetingDuration: 30,
      operationStartTime: '09:00',
      operationEndTime: '18:00',
      lunchStartTime: '12:00',
      lunchEndTime: '13:00',
      status: 'ACTIVE'
    }
  })

  // 2. 관리자 계정 생성
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin' },
    update: {},
    create: {
      email: 'admin',
      password: adminPassword,
      name: '시스템 관리자',
      role: 'ADMIN'
    }
  })

  // 3. 샘플 회사들 생성
  const companies = [
    {
      name: 'AI 스타트업',
      email: 'contact@aistartup.com',
      description: '인공지능 기반 솔루션 개발',
      website: 'https://aistartup.com',
      password: 'company123!'
    },
    {
      name: 'Green Tech',
      email: 'info@greentech.com',
      description: '친환경 에너지 솔루션',
      website: 'https://greentech.com',
      password: 'company123!'
    },
    {
      name: 'FinTech Innovation',
      email: 'hello@fintech.com',
      description: '금융 기술 혁신 서비스',
      website: 'https://fintech.com',
      password: 'company123!'
    }
  ]

  for (const companyData of companies) {
    const companyPassword = await bcrypt.hash(companyData.password, 12)
    
    const company = await prisma.user.create({
      data: {
        name: companyData.name,
        email: companyData.email,
        description: companyData.description,
        website: companyData.website,
        password: companyPassword,
        role: 'COMPANY'
      }
    })

    // 각 회사마다 샘플 시간대 생성 (행사 첫날)
    const baseDate = new Date('2025-09-15')
    for (let hour = 10; hour <= 16; hour += 2) {
      await prisma.timeSlot.create({
        data: {
          userId: company.id,
          startTime: new Date(baseDate.getTime() + hour * 60 * 60 * 1000),
          endTime: new Date(baseDate.getTime() + (hour + 1) * 60 * 60 * 1000),
          isBooked: false
        }
      })
    }
  }

  // 4. 샘플 바이어 계정들 생성
  const buyers = [
    { 
      name: '김투자', 
      email: 'investor1@example.com',
      description: '시드 투자 전문',
      website: 'https://vcfund.com'
    },
    { 
      name: '박벤처', 
      email: 'investor2@example.com',
      description: '스타트업 엑셀러레이터',
      website: 'https://accelerator.com'
    },
    { 
      name: '이펀드', 
      email: 'investor3@example.com',
      description: '후기 단계 투자',
      website: 'https://growthfund.com'
    }
  ]

  for (const buyerData of buyers) {
    const buyerPassword = await bcrypt.hash('buyer123!', 12)
    
    await prisma.user.create({
      data: {
        name: buyerData.name,
        email: buyerData.email,
        description: buyerData.description,
        website: buyerData.website,
        password: buyerPassword,
        role: 'BUYER'
      }
    })
  }

  console.log('✅ 시드 데이터 생성 완료!')
  console.log(`📅 행사: ${event.name}`)
  console.log(`👥 관리자: admin (비밀번호: admin123)`)
  console.log(`🏢 회사 수: ${companies.length}개`)
  console.log(`💼 바이어 수: ${buyers.length}명`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })