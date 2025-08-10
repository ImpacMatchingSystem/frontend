import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/config/db";
import { authOptions } from "@/lib/config/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    let whereClause: any = {
      userId: (session.user as any).id
    }

    if (unreadOnly) {
      whereClause.isRead = false
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { error: '알림을 가져오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationIds, markAllAsRead } = await req.json()

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: {
          userId: (session.user as any).id,
          isRead: false
        },
        data: {
          isRead: true
        }
      })
    } else if (notificationIds && Array.isArray(notificationIds)) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: (session.user as any).id
        },
        data: {
          isRead: true
        }
      })
    }

    return NextResponse.json({ message: '알림이 읽음 처리되었습니다' })
  } catch (error) {
    console.error('Notification update error:', error)
    return NextResponse.json(
      { error: '알림 업데이트에 실패했습니다' },
      { status: 500 }
    )
  }
}