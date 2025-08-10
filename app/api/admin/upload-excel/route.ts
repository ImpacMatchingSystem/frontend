import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import bcrypt from 'bcryptjs'
import * as XLSX from 'xlsx'

import { authOptions } from '@/lib/config/auth'
import { prisma } from '@/lib/config/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('excel-file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다' }, { status: 400 })
    }

    if (!['COMPANY', 'BUYER'].includes(type)) {
      return NextResponse.json(
        { error: '유효하지 않은 타입입니다' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const workbook = XLSX.read(bytes)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    if (jsonData.length === 0) {
      return NextResponse.json({ error: '데이터가 없습니다' }, { status: 400 })
    }

    const results = []
    const errors = []

    for (let i = 0; i < jsonData.length; i++) {
      const rowIndex = i + 2
      const row = jsonData[i] as any

      try {
        let userData: any = {}

        if (type === 'COMPANY') {
          const requiredFields = [
            '기업이름',
            '기업이메일',
            '기업소개',
            '기업홈페이지',
            '비밀번호',
          ]
          for (const field of requiredFields) {
            if (!row[field]) {
              throw new Error(`${field}이(가) 필요합니다`)
            }
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(row['기업이메일'])) {
            throw new Error('이메일 형식이 올바르지 않습니다')
          }

          let website = row['기업홈페이지'].trim()
          const urlRegex = /^https?:\/\/.+/
          if (!urlRegex.test(website)) {
            website = 'https://' + website
          }

          userData = {
            name: row['기업이름'].trim(),
            email: row['기업이메일'].trim().toLowerCase(),
            description: row['기업소개'].trim(),
            website: website,
            password: await bcrypt.hash(row['비밀번호'].toString(), 12),
            role: 'COMPANY',
          }
        } else {
          const requiredFields = [
            '바이어이름',
            '바이어이메일',
            '바이어소개',
            '바이어홈페이지',
            '비밀번호',
          ]
          for (const field of requiredFields) {
            if (!row[field]) {
              throw new Error(`${field}이(가) 필요합니다`)
            }
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(row['바이어이메일'])) {
            throw new Error('이메일 형식이 올바르지 않습니다')
          }

          let website = row['바이어홈페이지'].trim()
          const urlRegex = /^https?:\/\/.+/
          if (!urlRegex.test(website)) {
            website = 'https://' + website
          }

          userData = {
            name: row['바이어이름'].trim(),
            email: row['바이어이메일'].trim().toLowerCase(),
            description: row['바이어소개'].trim(),
            website: website,
            password: await bcrypt.hash(row['비밀번호'].toString(), 12),
            role: 'BUYER',
          }
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email },
        })

        if (existingUser) {
          throw new Error('이미 등록된 이메일입니다')
        }

        const user = await prisma.user.create({
          data: userData,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        })

        results.push({
          row: rowIndex,
          success: true,
          user,
        })
      } catch (error) {
        errors.push({
          row: rowIndex,
          error: error,
          data: row,
        })
      }
    }

    return NextResponse.json({
      message: `${results.length}명 성공, ${errors.length}명 실패`,
      results,
      errors,
      summary: {
        total: jsonData.length,
        success: results.length,
        failed: errors.length,
      },
    })
  } catch (error) {
    console.error('Excel upload error:', error)
    return NextResponse.json(
      { error: '엑셀 업로드에 실패했습니다' },
      { status: 500 }
    )
  }
}
