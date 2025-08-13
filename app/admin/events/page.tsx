'use client'

import { useSession } from 'next-auth/react'
import React, { useState, useEffect, useRef } from 'react'

import { Calendar, Save, Settings, Upload, X, Image } from 'lucide-react'

import { AdminHeader } from '@/components/layout/admin-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { useToast } from '@/hooks/use-toast'

interface EventSettings {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  venue?: string
  headerImage?: string
  headerText?: string
  headerBackgroundColor?: string
  meetingDuration: number
  operationStartTime: string
  operationEndTime: string
  lunchStartTime: string
  lunchEndTime: string
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED'
}

export default function EventSettingsPage() {
  const { data: session } = useSession()
  const [eventData, setEventData] = useState<EventSettings>({
    id: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    venue: '',
    headerImage: '',
    headerText: '',
    headerBackgroundColor: '#f3f4f6',
    meetingDuration: 30,
    operationStartTime: '09:00',
    operationEndTime: '18:00',
    lunchStartTime: '12:00',
    lunchEndTime: '13:00',
    status: 'ACTIVE',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()

  useEffect(() => {
    if (session?.user) {
      fetchEventData()
    }
  }, [session])

  const fetchEventData = async () => {
    try {
      const response = await fetch('/api/event')

      if (response.ok) {
        const data = await response.json()
        setEventData({
          id: data.id,
          name: data.name || '',
          description: data.description || '',
          startDate: data.startDate
            ? new Date(data.startDate).toISOString().split('T')[0]
            : '',
          endDate: data.endDate
            ? new Date(data.endDate).toISOString().split('T')[0]
            : '',
          venue: data.venue || '',
          headerImage: data.headerImage || '',
          headerText: data.headerText || '',
          headerBackgroundColor: data.headerBackgroundColor || '#f3f4f6',
          meetingDuration: data.meetingDuration || 30,
          operationStartTime: data.operationStartTime || '09:00',
          operationEndTime: data.operationEndTime || '18:00',
          lunchStartTime: data.lunchStartTime || '12:00',
          lunchEndTime: data.lunchEndTime || '13:00',
          status: data.status || 'ACTIVE',
        })
      } else if (response.status === 404) {
        toast({
          title: '알림',
          description:
            '설정된 행사가 없습니다. 새로운 행사 정보를 입력해주세요.',
        })
      } else {
        throw new Error('행사 정보 조회 실패')
      }
    } catch (error) {
      console.error('Event fetch error:', error)
      toast({
        title: '데이터 로딩 오류',
        description: '행사 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // 파일 업로드 함수 개선
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 파일 크기 검증 (2MB 제한)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: '파일 크기 초과',
        description: '이미지 크기는 2MB 이하로 제한됩니다.',
        variant: 'destructive',
      })
      return
    }

    // 이미지 크기 검증 (HTMLImageElement 명시적 사용)
    const img = new window.Image() // 또는 document.createElement('img')
    img.onload = async () => {
      // 최소 크기 체크
      if (img.width < 1200 || img.height < 400) {
        toast({
          title: '이미지 크기 부족',
          description: '최소 1200x400px 이상의 이미지를 사용해주세요.',
          variant: 'destructive',
        })
        URL.revokeObjectURL(img.src) // 메모리 정리
        return
      }

      // 비율 체크 (너무 세로로 긴 이미지 방지)
      const ratio = img.width / img.height
      if (ratio < 2) {
        toast({
          title: '이미지 비율 권장사항',
          description: '가로:세로 비율이 2:1 이상인 이미지를 권장합니다.',
          variant: 'default',
        })
      }

      // 업로드 진행
      await uploadFile()
      URL.revokeObjectURL(img.src) // 메모리 정리
    }

    img.onerror = () => {
      toast({
        title: '이미지 오류',
        description: '올바른 이미지 파일이 아닙니다.',
        variant: 'destructive',
      })
      URL.revokeObjectURL(img.src) // 메모리 정리
    }

    img.src = URL.createObjectURL(file)

    const uploadFile = async () => {
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload/header', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '파일 업로드 실패')
        }

        const result = await response.json()
        setEventData(prev => ({
          ...prev,
          headerImage: result.url,
        }))

        toast({
          title: '업로드 완료',
          description: `헤더 이미지가 성공적으로 업로드되었습니다. (${img.width}x${img.height}px)`,
        })
      } catch (error) {
        console.error('File upload error:', error)
        toast({
          title: '업로드 실패',
          description: '파일 업로드 중 오류가 발생했습니다.',
          variant: 'destructive',
        })
      } finally {
        setUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
  }

  const handleRemoveImage = async () => {
    if (!eventData.headerImage) return

    try {
      // 파일명 추출
      const filename = eventData.headerImage.split('/').pop()
      if (filename) {
        await fetch(`/api/upload/header?filename=${filename}`, {
          method: 'DELETE',
        })
      }

      setEventData(prev => ({
        ...prev,
        headerImage: '',
      }))
    } catch (error) {
      console.error('File deletion error:', error)
      toast({
        title: '삭제 실패',
        description: '이미지 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleSave = async () => {
    if (!eventData.name || !eventData.startDate || !eventData.endDate) {
      toast({
        title: '입력 오류',
        description: '행사명, 시작일, 종료일은 필수 입력 항목입니다.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const saveData = {
        name: eventData.name,
        description: eventData.description || null,
        startDate: new Date(eventData.startDate + 'T00:00:00Z').toISOString(),
        endDate: new Date(eventData.endDate + 'T23:59:59Z').toISOString(),
        venue: eventData.venue || null,
        headerImage: eventData.headerImage || null,
        headerText: eventData.headerText || null,
        headerBackgroundColor: eventData.headerBackgroundColor || null,
        meetingDuration: eventData.meetingDuration,
        operationStartTime: eventData.operationStartTime,
        operationEndTime: eventData.operationEndTime,
        lunchStartTime: eventData.lunchStartTime,
        lunchEndTime: eventData.lunchEndTime,
        status: eventData.status,
      }

      const response = await fetch('/api/event', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '행사 정보 저장에 실패했습니다')
      }

      const updatedEvent = await response.json()

      setEventData(prev => ({
        ...prev,
        id: updatedEvent.id,
      }))

      toast({
        title: '저장 완료',
        description: '행사 정보가 성공적으로 저장되었습니다.',
      })
    } catch (error) {
      console.error('Event save error:', error)
      toast({
        title: '저장 실패',
        description: '행사 정보 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (
    field: keyof EventSettings,
    value: string | number
  ) => {
    setEventData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">행사 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">행사 설정</h1>
          <p className="text-gray-600">
            현재 운영 중인 행사의 정보를 관리하세요.
          </p>
        </div>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                기본 정보
              </CardTitle>
              <CardDescription>
                행사의 기본적인 정보를 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">행사명 *</Label>
                  <Input
                    id="name"
                    value={eventData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="예: 2025 Tech Innovation Fair"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">행사 장소</Label>
                  <Input
                    id="venue"
                    value={eventData.venue}
                    onChange={e => handleInputChange('venue', e.target.value)}
                    placeholder="예: 코엑스 컨벤션센터"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">행사 설명</Label>
                <Textarea
                  id="description"
                  value={eventData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  rows={3}
                  placeholder="행사에 대한 간단한 설명을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">시작일 *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={eventData.startDate}
                    onChange={e =>
                      handleInputChange('startDate', e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">종료일 *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={eventData.endDate}
                    onChange={e => handleInputChange('endDate', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 헤더 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                헤더 설정
              </CardTitle>
              <CardDescription>
                메인 페이지 상단에 표시될 헤더를 설정합니다. 이미지를 업로드하면
                텍스트는 무시됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 이미지 업로드 섹션 */}
              <div className="space-y-4">
                <Label>헤더 이미지</Label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    📐 이미지 가이드라인
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • <strong>권장 사이즈:</strong> 1920 x 600px (16:5 비율)
                    </li>
                    <li>
                      • <strong>최소 사이즈:</strong> 1200 x 400px
                    </li>
                    <li>
                      • <strong>최대 용량:</strong> 2MB
                    </li>
                    <li>
                      • <strong>지원 형식:</strong> JPG, PNG, WebP, GIF
                    </li>
                    <li>
                      • <strong>팁:</strong> 텍스트 오버레이를 고려해 단순한
                      배경 권장
                    </li>
                  </ul>
                </div>

                {eventData.headerImage ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={eventData.headerImage}
                        alt="헤더 이미지"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      이미지 변경
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      <strong>1920 x 600px</strong> 사이즈의 헤더 이미지를
                      업로드하세요
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      가로:세로 = 16:5 비율 권장
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? '업로드 중...' : '이미지 선택'}
                    </Button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <p className="text-sm text-gray-500">
                  최대 5MB, JPG, PNG, GIF, WebP 형식만 지원됩니다.
                </p>
              </div>

              {/* 텍스트 헤더 섹션 (이미지가 없을 때만 활성화) */}
              {!eventData.headerImage && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium">
                    텍스트 헤더 (이미지가 없을 때 표시됨)
                  </Label>

                  <div className="space-y-2">
                    <Label htmlFor="headerText">헤더 텍스트</Label>
                    <Input
                      id="headerText"
                      value={eventData.headerText}
                      onChange={e =>
                        handleInputChange('headerText', e.target.value)
                      }
                      placeholder="예: 혁신의 미래를 만나보세요"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headerBackgroundColor">배경색</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        id="headerBackgroundColor"
                        type="color"
                        value={eventData.headerBackgroundColor}
                        onChange={e =>
                          handleInputChange(
                            'headerBackgroundColor',
                            e.target.value
                          )
                        }
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={eventData.headerBackgroundColor}
                        onChange={e =>
                          handleInputChange(
                            'headerBackgroundColor',
                            e.target.value
                          )
                        }
                        placeholder="#f3f4f6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* 미리보기 */}
                  {eventData.headerText && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">
                        미리보기
                      </Label>
                      <div
                        className="p-8 rounded-lg text-center"
                        style={{
                          backgroundColor: eventData.headerBackgroundColor,
                        }}
                      >
                        <h2 className="text-2xl font-bold text-gray-900">
                          {eventData.headerText}
                        </h2>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 미팅 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                미팅 설정
              </CardTitle>
              <CardDescription>
                미팅 시간과 운영 시간을 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meetingDuration">미팅 시간 (분)</Label>
                <select
                  id="meetingDuration"
                  value={eventData.meetingDuration}
                  onChange={e =>
                    handleInputChange(
                      'meetingDuration',
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={15}>15분</option>
                  <option value={30}>30분</option>
                  <option value={45}>45분</option>
                  <option value={60}>60분</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="operationStartTime">운영 시작 시간</Label>
                  <Input
                    id="operationStartTime"
                    type="time"
                    value={eventData.operationStartTime}
                    onChange={e =>
                      handleInputChange('operationStartTime', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operationEndTime">운영 종료 시간</Label>
                  <Input
                    id="operationEndTime"
                    type="time"
                    value={eventData.operationEndTime}
                    onChange={e =>
                      handleInputChange('operationEndTime', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lunchStartTime">점심시간 시작</Label>
                  <Input
                    id="lunchStartTime"
                    type="time"
                    value={eventData.lunchStartTime}
                    onChange={e =>
                      handleInputChange('lunchStartTime', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lunchEndTime">점심시간 종료</Label>
                  <Input
                    id="lunchEndTime"
                    type="time"
                    value={eventData.lunchEndTime}
                    onChange={e =>
                      handleInputChange('lunchEndTime', e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              <Save className="mr-2 h-4 w-4" />
              {saving ? '저장 중...' : '설정 저장'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
