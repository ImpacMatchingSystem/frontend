// app/api/upload/header/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // 파일 확장자 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 5MB allowed.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // uploads/headers 디렉토리 생성
    const uploadDir = path.join(process.cwd(), 'public/uploads/headers')
    
    // 기존 헤더 이미지 파일들 삭제
    const headerImages = ['header.jpg', 'header.jpeg', 'header.png', 'header.gif', 'header.webp']
    for (const imageName of headerImages) {
      const existingPath = path.join(uploadDir, imageName)
      if (existsSync(existingPath)) {
        try {
          await unlink(existingPath)
        } catch (error) {
          console.error('Error deleting existing file:', error)
        }
      }
    }

    // 새 파일 저장 (확장자 유지)
    const extension = path.extname(file.name)
    const filename = `header${extension}`
    const filepath = path.join(uploadDir, filename)
    
    await writeFile(filepath, buffer)

    const fileUrl = `/uploads/headers/${filename}`

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      filename: filename
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 })
    }

    const filepath = path.join(process.cwd(), 'public/uploads/headers', filename)
    
    if (existsSync(filepath)) {
      await unlink(filepath)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('File deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}