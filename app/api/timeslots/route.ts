// src/app/api/timeslots/route.ts
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/config/auth'
import { prisma } from '@/lib/config/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'COMPANY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { startTime, endTime } = await req.json()

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: '시작 시간과 종료 시간이 필요합니다' },
        { status: 400 }
      )
    }

    const startDateTime = new Date(startTime)
    const endDateTime = new Date(endTime)

    // 유효성 검사
    if (startDateTime >= endDateTime) {
      return NextResponse.json(
        { error: '종료 시간은 시작 시간보다 늦어야 합니다' },
        { status: 400 }
      )
    }

    if (startDateTime < new Date()) {
      return NextResponse.json(
        { error: '과거 시간은 등록할 수 없습니다' },
        { status: 400 }
      )
    }

    // 중복 시간대 확인
    const existingSlot = await prisma.timeSlot.findFirst({
      where: {
        userId: session.user.id,
        OR: [
          {
            AND: [
              { startTime: { lte: startDateTime } },
              { endTime: { gt: startDateTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endDateTime } },
              { endTime: { gte: endDateTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startDateTime } },
              { endTime: { lte: endDateTime } }
            ]
          }
        ]
      }
    })

    if (existingSlot) {
      return NextResponse.json(
        { error: '중복되는 시간대가 이미 존재합니다' },
        { status: 400 }
      )
    }

    const timeSlot = await prisma.timeSlot.create({
      data: {
        userId: session.user.id,
        startTime: startDateTime,
        endTime: endDateTime,
      },
    })

    return NextResponse.json(timeSlot, { status: 201 })
  } catch (error) {
    console.error('TimeSlot creation error:', error)
    return NextResponse.json(
      { error: '시간대 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const companyId = url.searchParams.get('companyId')
    const available = url.searchParams.get('available') === 'true'

    let whereClause: any = {}

    // 기업 사용자인 경우 자신의 시간대만 조회
    if (session.user.role === 'COMPANY') {
      whereClause.userId = session.user.id
    } 
    // 바이어인 경우 특정 기업의 시간대 조회
    else if (companyId) {
      whereClause.userId = companyId
    } else {
      return NextResponse.json(
        { error: '회사 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // 예약 가능한 시간대만 필터링 (바이어용)
    if (available) {
      whereClause.isBooked = false
      whereClause.startTime = { gt: new Date() } // 미래 시간만
      whereClause.OR = [
        { meeting: null }, // 미팅이 없거나
        { 
          meeting: { 
            status: { 
              in: ['REJECTED', 'CANCELLED'] // 거절되거나 취소된 미팅
            } 
          } 
        }
      ]
    }

    const timeSlots = await prisma.timeSlot.findMany({
      where: whereClause,
      orderBy: {
        startTime: 'asc'
      },
      include: {
        meeting: {
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(timeSlots)
  } catch (error) {
    console.error('TimeSlots fetch error:', error)
    return NextResponse.json(
      { error: '시간대 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}