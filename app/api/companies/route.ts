import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/config/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    let whereClause: any = {
      role: 'COMPANY',
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const companies = await prisma.user.findMany({
      where: whereClause,
      include: {
        timeSlots: {
          where: {
            isBooked: false,
            startTime: {
              gte: new Date(),
            },
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
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error('Companies fetch error:', error)
    return NextResponse.json(
      { error: '회사 목록을 가져오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
