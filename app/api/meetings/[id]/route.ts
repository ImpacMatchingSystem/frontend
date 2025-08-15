// src/app/api/meetings/[id]/route.ts
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/config/auth'
import { prisma } from '@/lib/config/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'COMPANY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const meetingId = params.id
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
        companyId: session.user.id
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        timeSlot: true
      }
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

    // 미팅 상태 업데이트
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: status as any },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        timeSlot: true
      }
    })

    // 알림 생성
    let notificationType: 'MEETING_APPROVED' | 'MEETING_REJECTED' | 'MEETING_CANCELLED'
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
        notificationMessage = `${meeting.company.name}에서 미팅을 취소했습니다.`
        break
    }

    return NextResponse.json({
      id: updatedMeeting.id,
      status: updatedMeeting.status,
      updatedAt: updatedMeeting.updatedAt,
      company: updatedMeeting.company,
      buyer: updatedMeeting.buyer,
      timeSlot: updatedMeeting.timeSlot,
      message: `미팅이 ${status === 'CONFIRMED' ? '승인' : status === 'REJECTED' ? '거절' : '취소'}되었습니다`
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
        OR: [
          { companyId: session.user.id },
          { buyerId: session.user.id }
        ]
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            description: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            description: true,
            website: true
          }
        },
        timeSlot: true
      }
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