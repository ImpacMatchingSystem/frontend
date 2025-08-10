import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/config/db'
import { authOptions } from '@/lib/config/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'COMPANY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { startTime, endTime } = await req.json()

    // 사용자의 회사 정보 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const timeSlot = await prisma.timeSlot.create({
      data: {
        companyId: user.companyId,
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      }
    })

    return NextResponse.json(timeSlot)
  } catch (error) {
    console.error('TimeSlot creation error:', error)
    return NextResponse.json(
      { error: '시간대 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}