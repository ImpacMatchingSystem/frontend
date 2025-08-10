import { prisma } from '../config/db'

export interface NotificationData {
  type:
    | 'MEETING_REQUEST'
    | 'MEETING_APPROVED'
    | 'MEETING_REJECTED'
    | 'MEETING_CANCELLED'
  userId: string
  title: string
  message: string
  relatedId?: string
}

export async function createNotification(data: NotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        userId: data.userId,
        title: data.title,
        message: data.message,
        relatedId: data.relatedId,
        isRead: false,
      },
    })

    console.log('✅ 알림 생성 성공:', notification.id)
    return notification
  } catch (error) {
    console.error('❌ 알림 생성 실패:', error)
    throw error
  }
}

export async function notifyMeetingRequest(meeting: any) {
  await createNotification({
    type: 'MEETING_REQUEST',
    userId: meeting.companyId,
    title: '새로운 미팅 신청',
    message: `${meeting.buyer.name}님이 ${new Date(meeting.timeSlot.startTime).toLocaleString('ko-KR')} 시간대에 미팅을 신청했습니다.`,
    relatedId: meeting.id,
  })
}

export async function notifyMeetingApproved(meeting: any) {
  await createNotification({
    type: 'MEETING_APPROVED',
    userId: meeting.buyerId,
    title: '미팅이 승인되었습니다',
    message: `${meeting.company.name}과의 미팅이 승인되었습니다. (${new Date(meeting.timeSlot.startTime).toLocaleString('ko-KR')})`,
    relatedId: meeting.id,
  })
}

export async function notifyMeetingRejected(meeting: any) {
  await createNotification({
    type: 'MEETING_REJECTED',
    userId: meeting.buyerId,
    title: '미팅 신청이 거절되었습니다',
    message: `${meeting.company.name}과의 미팅 신청이 거절되었습니다. 다른 시간대를 확인해보세요.`,
    relatedId: meeting.id,
  })
}
