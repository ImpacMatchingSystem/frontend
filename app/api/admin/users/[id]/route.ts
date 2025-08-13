import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { authOptions } from '@/lib/config/auth'
import { prisma } from '@/lib/config/db'

// 사용자 수정을 위한 유효성 검사 스키마
const userUpdateSchema = z.object({
    name: z.string().min(1, '이름은 필수입니다.').optional(),
    email: z.string().email('유효하지 않은 이메일입니다.').optional(),
    password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.').optional(),
    description: z.string().optional(),
    website: z.string().optional(),
})

// PATCH 핸들러 (사용자 정보 수정)
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 관리자 세션 확인
        const session = await getServerSession(authOptions)
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = params.id
        const body = await req.json()
        // 요청 데이터 유효성 검사
        const validatedData = userUpdateSchema.parse(body)

        // 비밀번호가 있으면 해싱
        if (validatedData.password) {
            validatedData.password = await bcrypt.hash(validatedData.password, 12)
        }

        // 데이터베이스에서 사용자 정보 업데이트
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: validatedData,
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Zod 에러에서 발생한 첫 번째 메시지를 에러 응답으로 사용
            const errorMessage = error.errors[0]?.message || '유효하지 않은 데이터입니다.';
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }
        console.error(`User update error for ID: ${params.id}`, error);
        return NextResponse.json(
            { error: '사용자 정보 수정에 실패했습니다.' },
            { status: 500 }
        );
    }
}

// DELETE 핸들러 (사용자 삭제)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 관리자 세션 확인
        const session = await getServerSession(authOptions)
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = params.id

        // 데이터베이스에서 사용자 삭제
        await prisma.user.delete({
            where: { id: userId },
        })

        return NextResponse.json({ message: '사용자가 성공적으로 삭제되었습니다.' })
    } catch (error) {
        console.error(`User delete error for ID: ${params.id}`, error)
        return NextResponse.json({ error: '사용자 삭제에 실패했습니다.' }, { status: 500 })
    }
}