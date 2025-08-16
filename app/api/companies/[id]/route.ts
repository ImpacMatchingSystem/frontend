import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/config/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: '회사 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // 특정 회사 정보와 예약 가능한 시간대를 가져옴
    const company = await prisma.user.findFirst({
      where: {
        id: id,
        role: 'COMPANY',
      },
      select: {
        id: true,
        name: true,
        email: true,
        description: true,
        website: true,
        timeSlots: {
          where: {
            startTime: {
              gte: new Date(), // 현재 시간 이후만
            },
          },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            isBooked: true,
          },
          orderBy: {
            startTime: 'asc',
          },
        },
        _count: {
          select: {
            companyMeetings: {
              where: {
                status: 'CONFIRMED',
              },
            },
          },
        },
      },
    })

    if (!company) {
      return NextResponse.json(
        { error: '회사를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Company fetch error:', error)
    return NextResponse.json(
      { error: '회사 정보를 가져오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
