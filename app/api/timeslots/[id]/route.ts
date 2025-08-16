// src/app/api/timeslots/[id]/route.ts
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/config/auth'
import { prisma } from '@/lib/config/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'COMPANY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const timeSlotId = params.id

    // 시간대 존재 여부 및 소유권 확인
    const timeSlot = await prisma.timeSlot.findFirst({
      where: {
        id: timeSlotId,
        userId: session.user.id,
      },
      include: {
        meeting: true,
      },
    })

    if (!timeSlot) {
      return NextResponse.json(
        { error: '시간대를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 확정된 미팅이 있는 시간대는 비활성화할 수 없음
    if (timeSlot.meeting?.status === 'CONFIRMED') {
      return NextResponse.json(
        { error: '확정된 미팅이 있는 시간대는 비활성화할 수 없습니다' },
        { status: 400 }
      )
    }

    // 시간대를 사용 불가능 상태로 변경 (isBooked = true)
    const updatedTimeSlot = await prisma.timeSlot.update({
      where: { id: timeSlotId },
      data: { isBooked: true },
    })

    return NextResponse.json(
      {
        message: '시간대가 사용 불가능 상태로 변경되었습니다',
        timeSlot: updatedTimeSlot,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('TimeSlot status change error:', error)
    return NextResponse.json(
      { error: '시간대 상태 변경에 실패했습니다' },
      { status: 500 }
    )
  }
}

// 시간대 다시 활성화 API 추가
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'COMPANY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const timeSlotId = params.id

    // 시간대 존재 여부 및 소유권 확인
    const timeSlot = await prisma.timeSlot.findFirst({
      where: {
        id: timeSlotId,
        userId: session.user.id,
      },
      include: {
        meeting: true,
      },
    })

    if (!timeSlot) {
      return NextResponse.json(
        { error: '시간대를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 확정된 미팅이 있는 시간대는 활성화 상태 변경 불가
    if (timeSlot.meeting?.status === 'CONFIRMED') {
      return NextResponse.json(
        { error: '확정된 미팅이 있는 시간대는 상태를 변경할 수 없습니다' },
        { status: 400 }
      )
    }

    // 과거 시간은 활성화할 수 없음
    if (timeSlot.startTime < new Date()) {
      return NextResponse.json(
        { error: '과거 시간대는 활성화할 수 없습니다' },
        { status: 400 }
      )
    }

    // 시간대를 사용 가능 상태로 변경 (isBooked = false)
    const updatedTimeSlot = await prisma.timeSlot.update({
      where: { id: timeSlotId },
      data: { isBooked: false },
    })

    return NextResponse.json(
      {
        message: '시간대가 사용 가능 상태로 변경되었습니다',
        timeSlot: updatedTimeSlot,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('TimeSlot activation error:', error)
    return NextResponse.json(
      { error: '시간대 활성화에 실패했습니다' },
      { status: 500 }
    )
  }
}
