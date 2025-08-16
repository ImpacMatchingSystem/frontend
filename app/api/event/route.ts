import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/config/auth'
import { prisma } from '@/lib/config/db'

export async function GET() {
  try {
    // 활성화된 행사 조회 (항상 하나만 존재)
    const event = await prisma.event.findFirst({
      where: { status: 'ACTIVE' },
    })

    if (!event) {
      return NextResponse.json(
        { error: '활성화된 행사가 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Event fetch error:', error)
    return NextResponse.json(
      { error: '행사 정보를 가져오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

// 관리자만 행사 정보 업데이트 가능
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      name,
      description,
      startDate,
      endDate,
      venue,
      headerImage,
      headerText,
      meetingDuration,
      operationStartTime,
      operationEndTime,
      lunchStartTime,
      lunchEndTime,
      status,
    } = await req.json()

    const event = await prisma.event.findFirst({
      where: { status: { in: ['UPCOMING', 'ACTIVE'] } },
    })

    if (!event) {
      return NextResponse.json(
        { error: '수정할 행사가 없습니다' },
        { status: 404 }
      )
    }

    // 시간 형식 검증 (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (operationStartTime && !timeRegex.test(operationStartTime)) {
      return NextResponse.json(
        { error: '운영 시작 시간 형식이 잘못되었습니다 (HH:MM)' },
        { status: 400 }
      )
    }
    if (operationEndTime && !timeRegex.test(operationEndTime)) {
      return NextResponse.json(
        { error: '운영 종료 시간 형식이 잘못되었습니다 (HH:MM)' },
        { status: 400 }
      )
    }
    if (lunchStartTime && !timeRegex.test(lunchStartTime)) {
      return NextResponse.json(
        { error: '점심 시작 시간 형식이 잘못되었습니다 (HH:MM)' },
        { status: 400 }
      )
    }
    if (lunchEndTime && !timeRegex.test(lunchEndTime)) {
      return NextResponse.json(
        { error: '점심 종료 시간 형식이 잘못되었습니다 (HH:MM)' },
        { status: 400 }
      )
    }

    // 미팅 시간 검증 (15분 ~ 120분)
    if (meetingDuration && (meetingDuration < 15 || meetingDuration > 120)) {
      return NextResponse.json(
        { error: '미팅 시간은 15분 ~ 120분 사이여야 합니다' },
        { status: 400 }
      )
    }

    // 미팅 시간이 변경되는지 확인
    const isMeetingDurationChanged =
      meetingDuration && meetingDuration !== event.meetingDuration

    let updatedEvent
    let resetMessage = ''

    if (isMeetingDurationChanged) {
      // 트랜잭션으로 처리
      await prisma.$transaction(async tx => {
        // 1. 모든 미팅 삭제 (CASCADE로 인해 TimeSlot의 isBooked도 자동으로 false가 됨)
        const deletedMeetings = await tx.meeting.deleteMany({})

        // 2. 모든 TimeSlot 삭제
        const deletedTimeSlots = await tx.timeSlot.deleteMany({})

        // 3. 미팅 관련 알림 삭제
        await tx.notification.deleteMany({
          where: {
            type: {
              in: [
                'MEETING_REQUEST',
                'MEETING_APPROVED',
                'MEETING_REJECTED',
                'MEETING_CANCELLED',
              ],
            },
          },
        })

        // 4. 행사 정보 업데이트
        updatedEvent = await tx.event.update({
          where: { id: event.id },
          data: {
            name,
            description,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            venue,
            headerImage,
            headerText,
            meetingDuration,
            operationStartTime,
            operationEndTime,
            lunchStartTime,
            lunchEndTime,
            status,
          },
        })

        resetMessage = `미팅 시간 변경으로 인해 ${deletedMeetings.count}개의 미팅과 ${deletedTimeSlots.count}개의 시간대가 초기화되었습니다.`
      })
    } else {
      // 미팅 시간이 변경되지 않은 경우 일반 업데이트
      updatedEvent = await prisma.event.update({
        where: { id: event.id },
        data: {
          name,
          description,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          venue,
          headerImage,
          headerText,
          meetingDuration,
          operationStartTime,
          operationEndTime,
          lunchStartTime,
          lunchEndTime,
          status,
        },
      })
    }

    const response = {
      ...updatedEvent,
      ...(resetMessage && { resetMessage }),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Event update error:', error)
    return NextResponse.json(
      { error: '행사 정보 업데이트에 실패했습니다' },
      { status: 500 }
    )
  }
}
