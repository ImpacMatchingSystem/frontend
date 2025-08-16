// src/app/api/meetings/[id]/route.ts
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/config/auth'
import { prisma } from '@/lib/config/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'COMPANY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: meetingId } = await params
    const { status } = await req.json()

    if (!['CONFIRMED', 'REJECTED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태입니다' },
        { status: 400 }
      )
    }

    // 미팅 존재 여부 및 소유권 확인
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        companyId: session.user.id,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        timeSlot: true,
      },
    })

    if (!meeting) {
      return NextResponse.json(
        { error: '미팅을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 이미 처리된 미팅인지 확인
    if (meeting.status === 'CONFIRMED' && status !== 'CANCELLED') {
      return NextResponse.json(
        { error: '이미 승인된 미팅입니다' },
        { status: 400 }
      )
    }

    // 취소의 경우 시간 제한 확인 (미팅 시작 1시간 전까지만)
    if (status === 'CANCELLED' && meeting.status === 'CONFIRMED') {
      const meetingStartTime = new Date(meeting.timeSlot.startTime)
      const now = new Date()
      const oneHourBefore = new Date(meetingStartTime.getTime() - 60 * 60 * 1000)
      
      if (now >= oneHourBefore) {
        return NextResponse.json(
          { error: '미팅 시작 1시간 전까지만 취소 가능합니다' },
          { status: 400 }
        )
      }
    }

    // 트랜잭션으로 미팅 상태와 시간대 예약 상태를 동시에 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 미팅 상태 업데이트
      const updatedMeeting = await tx.meeting.update({
        where: { id: meetingId },
        data: { status: status as any },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          timeSlot: true,
        },
      })

      // 시간대 예약 상태 업데이트
      let updatedTimeSlot = updatedMeeting.timeSlot
      
      if (status === 'CONFIRMED') {
        // 승인 시: 시간대를 예약됨으로 변경
        updatedTimeSlot = await tx.timeSlot.update({
          where: { id: meeting.timeSlot.id },
          data: { isBooked: true },
        })
      } else if (status === 'REJECTED' || status === 'CANCELLED') {
        // 거절 또는 취소 시: 시간대를 예약 가능으로 변경
        updatedTimeSlot = await tx.timeSlot.update({
          where: { id: meeting.timeSlot.id },
          data: { isBooked: false },
        })
      }

      // 알림 생성
      let notificationType:
        | 'MEETING_APPROVED'
        | 'MEETING_REJECTED'
        | 'MEETING_CANCELLED'
      let notificationTitle: string
      let notificationMessage: string

      switch (status) {
        case 'CONFIRMED':
          notificationType = 'MEETING_APPROVED'
          notificationTitle = '미팅이 승인되었습니다'
          notificationMessage = `${meeting.company.name}에서 미팅을 승인했습니다. 일시: ${new Date(meeting.timeSlot.startTime).toLocaleString('ko-KR')}`
          break
        case 'REJECTED':
          notificationType = 'MEETING_REJECTED'
          notificationTitle = '미팅이 거절되었습니다'
          notificationMessage = `${meeting.company.name}에서 미팅을 거절했습니다. 다른 시간대를 선택해 주세요.`
          break
        case 'CANCELLED':
          notificationType = 'MEETING_CANCELLED'
          notificationTitle = '미팅이 취소되었습니다'
          notificationMessage = `${meeting.company.name}에서 미팅을 취소했습니다. 해당 시간대가 다시 예약 가능합니다.`
          break
      }

      return {
        meeting: updatedMeeting,
        timeSlot: updatedTimeSlot,
      }
    })

    const actionText = 
      status === 'CONFIRMED' ? '승인' : 
      status === 'REJECTED' ? '거절' : 
      '취소'

    return NextResponse.json({
      id: result.meeting.id,
      status: result.meeting.status,
      updatedAt: result.meeting.updatedAt,
      company: result.meeting.company,
      buyer: result.meeting.buyer,
      timeSlot: result.timeSlot,
      message: `미팅이 ${actionText}되었습니다`,
    })
  } catch (error) {
    console.error('Meeting update error:', error)
    return NextResponse.json(
      { error: '미팅 처리에 실패했습니다' },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const meetingId = params.id

    // 미팅 상세 조회 (본인이 관련된 미팅만)
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        OR: [{ companyId: session.user.id }, { buyerId: session.user.id }],
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            description: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            description: true,
            website: true,
          },
        },
        timeSlot: true,
      },
    })

    if (!meeting) {
      return NextResponse.json(
        { error: '미팅을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json(meeting)
  } catch (error) {
    console.error('Meeting fetch error:', error)
    return NextResponse.json(
      { error: '미팅 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
