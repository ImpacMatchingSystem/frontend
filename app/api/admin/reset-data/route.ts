import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from "@/lib/config/db"
import { authOptions } from '@/lib/config/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 모든 데이터 삭제 (관계 순서에 맞게)
    await prisma.notification.deleteMany()
    await prisma.meeting.deleteMany()
    await prisma.timeSlot.deleteMany()
    await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } })
    await prisma.event.deleteMany()

    // 시드 데이터 재생성
    await createSeedData()

    return NextResponse.json({ 
      message: '테스트 데이터가 초기화되었습니다',
      success: true 
    })

  } catch (error) {
    console.error('Reset data error:', error)
    return NextResponse.json(
      { error: '데이터 초기화에 실패했습니다' },
      { status: 500 }
    )
  }
}

async function createSeedData() {
  // 1. 행사 정보 생성
  const event = await prisma.event.create({
    data: {
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

  // 2. 샘플 회사들 생성
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

    // 각 회사마다 샘플 시간대 생성
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

  // 3. 샘플 바이어 계정들 생성
  const buyers = [
    { 
      name: '김투자', 
      email: 'investor1@example.com',
      description: '시드 투자 전문',
      website: 'https://vcfund.com',
      password: 'buyer123!'
    },
    { 
      name: '박벤처', 
      email: 'investor2@example.com',
      description: '스타트업 엑셀러레이터',
      website: 'https://accelerator.com',
      password: 'buyer123!'
    }
  ]

  for (const buyerData of buyers) {
    const buyerPassword = await bcrypt.hash(buyerData.password, 12)
    
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
}