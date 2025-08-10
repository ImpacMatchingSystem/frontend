import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/config/db'
import { authOptions } from '@/lib/config/auth'
import { notifyMeetingApproved, notifyMeetingRejected } from '@/lib/application/notification'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'COMPANY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await req.json()
    const meetingId = params.id

    if (!['CONFIRMED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const meeting = await prisma.$transaction(async (tx:any) => {
      const updatedMeeting = await tx.meeting.update({
        where: { id: meetingId },
        data: { status },
        include: {
          company: true,
          buyer: true,
          timeSlot: true
        }
      })

      if (status === 'REJECTED') {
        await tx.timeSlot.update({
          where: { id: updatedMeeting.timeSlotId },
          data: { isBooked: false }
        })
      }

      return updatedMeeting
    })

    if (status === 'CONFIRMED') {
      await notifyMeetingApproved(meeting)
    } else {
      await notifyMeetingRejected(meeting)
    }

    return NextResponse.json(meeting)
  } catch (error) {
    console.error('Meeting update error:', error)
    return NextResponse.json(
      { error: '미팅 상태 업데이트에 실패했습니다' },
      { status: 500 }
    )
  }
}