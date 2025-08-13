import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import * as XLSX from 'xlsx'

import { authOptions } from '@/lib/config/auth'
import { prisma } from '@/lib/config/db'

// Excel 데이터 한 줄에 대한 유효성 검사 스키마
const excelRowSchema = z.object({
  이름: z.string().min(1, '이름은 필수입니다.'),
  이메일: z.string().email('유효하지 않은 이메일 형식입니다.'),
  비밀번호: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.'),
  소개: z.string().optional(),
  홈페이지: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // 관리자 권한 확인
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 파일 및 타입 수신
    const formData = await req.formData()
    const file = formData.get('excel-file') as File
    const type = formData.get('type') as 'COMPANY' | 'BUYER'

    if (!file || !type || !['COMPANY', 'BUYER'].includes(type)) {
      return NextResponse.json({ error: '파일 또는 타입이 올바르지 않습니다.' }, { status: 400 })
    }

    // 파일 읽기 및 JSON으로 변환
    const bytes = await file.arrayBuffer()
    const workbook = XLSX.read(bytes)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
      header: ['이름', '이메일', '소개', '홈페이지', '비밀번호'],
      range: 1, // 첫 번째 행(헤더)은 건너뛰기
    })

    if (jsonData.length === 0) {
      return NextResponse.json({ error: 'Excel 파일에 데이터가 없습니다.' }, { status: 400 })
    }

    const errors: { row: number; error: string; data: any }[] = []
    const validUsers: any[] = []

    // 데이터 유효성 검사
    jsonData.forEach((row, index) => {
      const result = excelRowSchema.safeParse(row)
      if (result.success) {
        validUsers.push({ ...result.data, rowIndex: index + 2 })
      } else {
        errors.push({
          row: index + 2,
          error: result.error.errors.map(e => e.message).join(', '),
          data: row,
        })
      }
    })

    if (validUsers.length === 0) {
      return NextResponse.json({ message: '모든 데이터가 유효하지 않습니다.', errors, summary: { total: jsonData.length, success: 0, failed: errors.length }})
    }

    // 이메일 중복 확인
    const emails = validUsers.map(u => u.이메일.trim().toLowerCase())
    const existingUsers = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true },
    })
    const existingEmails = new Set(existingUsers.map(u => u.email))

    const usersToCreate: any[] = []
    validUsers.forEach(user => {
      const userEmail = user.이메일.trim().toLowerCase()
      if (existingEmails.has(userEmail)) {
        errors.push({ row: user.rowIndex, error: '이미 등록된 이메일입니다.', data: { '이메일': user.이메일 } })
      } else {
        existingEmails.add(userEmail)
        usersToCreate.push(user)
      }
    })

    // 비밀번호 해싱 및 대량 생성
    if (usersToCreate.length > 0) {
      const preparedData = await Promise.all(
          usersToCreate.map(async (user) => ({
            name: user.이름,
            email: user.이메일.trim().toLowerCase(),
            password: await bcrypt.hash(String(user.비밀번호), 12),
            description: user.소개,
            website: user.홈페이지,
            role: type,
          }))
      )

      await prisma.user.createMany({
        data: preparedData,
        skipDuplicates: true,
      })
    }

    // 결과 반환
    return NextResponse.json({
      message: `${usersToCreate.length}명 성공, ${errors.length}명 실패`,
      errors,
      summary: {
        total: jsonData.length,
        success: usersToCreate.length,
        failed: errors.length,
      },
    })

  } catch (error) {
    console.error('Excel upload error:', error)
    return NextResponse.json({ error: '엑셀 업로드에 실패했습니다.' }, { status: 500 })
  }
}