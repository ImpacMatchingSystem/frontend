import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import type { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { authOptions } from '@/lib/config/auth'
import { prisma } from '@/lib/config/db'

export async function GET(req: NextRequest) {
  try {
    // 관리자 세션 확인
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 쿼리 파라미터 추출
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') as 'COMPANY' | 'BUYER' | null
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Prisma 쿼리 조건 생성
    const whereClause: Prisma.UserWhereInput = {}

    if (role) {
      whereClause.role = role
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // 데이터베이스에서 사용자 목록 조회
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              companyMeetings: true,
              buyerMeetings: true,
              timeSlots: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ])

    // API 응답 반환
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json(
      { error: '사용자 목록을 가져오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

/* 사용자 생성을 위한 유효성 검사 스키마 */
const userCreateSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다.'),
  email: z.string().email('유효하지 않은 이메일입니다.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.'),
  role: z.enum(['COMPANY', 'BUYER']),
  description: z.string().optional(),
  website: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // 관리자 세션 확인
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    // 요청 데이터 유효성 검사
    const validatedData = userCreateSchema.parse(body)

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 409 }
      )
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // 데이터베이스에 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
    })

    // 성공 응답 반환
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '유효하지 않은 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: '사용자 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
