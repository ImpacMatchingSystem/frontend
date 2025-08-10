import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

import { notifyMeetingRequest } from '@/lib/application/notification'
import { authOptions } from '@/lib/config/auth'
import { prisma } from '@/lib/config/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { timeSlotId, message } = await req.json()

    const meeting = await prisma.$transaction(async (tx: any) => {
      const timeSlot = await tx.timeSlot.findUnique({
        where: { id: timeSlotId },
        include: {
          user: true,
          meeting: true,
        },
      })

      if (!timeSlot) {
        throw new Error('시간대를 찾을 수 없습니다')
      }

      if (timeSlot.isBooked || timeSlot.meeting) {
        throw new Error('이미 예약된 시간대입니다')
      }

      const newMeeting = await tx.meeting.create({
        data: {
          companyId: timeSlot.userId,
          buyerId: (session.user as any).id,
          timeSlotId: timeSlotId,
          message: message || '',
          status: 'PENDING',
        },
        include: {
          company: true,
          buyer: true,
          timeSlot: true,
        },
      })

      await tx.timeSlot.update({
        where: { id: timeSlotId },
        data: { isBooked: true },
      })

      return newMeeting
    })

    await notifyMeetingRequest(meeting)

    return NextResponse.json(meeting)
  } catch (error) {
    console.error('Meeting creation error:', error)
    return NextResponse.json(
      { error: '미팅 예약에 실패했습니다' },
      { status: 400 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    let whereClause: any = {}

    if ((session.user as any).role === 'BUYER') {
      whereClause.buyerId = (session.user as any).id
    } else if ((session.user as any).role === 'COMPANY') {
      whereClause.companyId = (session.user as any).id
    }

    if (status) {
      whereClause.status = status
    }

    const meetings = await prisma.meeting.findMany({
      where: whereClause,
      include: {
        company: true,
        buyer: true,
        timeSlot: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(meetings)
  } catch (error) {
    console.error('Meetings fetch error:', error)
    return NextResponse.json(
      { error: '미팅 목록을 가져오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
