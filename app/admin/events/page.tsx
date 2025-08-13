'use client'

import { useSession } from 'next-auth/react'
import React, { useState, useEffect } from 'react'

import { Calendar, Save, Settings } from 'lucide-react'

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
    meetingDuration: 30,
    operationStartTime: '09:00',
    operationEndTime: '18:00',
    lunchStartTime: '12:00',
    lunchEndTime: '13:00',
    status: 'ACTIVE',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
          meetingDuration: data.meetingDuration || 30,
          operationStartTime: data.operationStartTime || '09:00',
          operationEndTime: data.operationEndTime || '18:00',
          lunchStartTime: data.lunchStartTime || '12:00',
          lunchEndTime: data.lunchEndTime || '13:00',
          status: data.status || 'ACTIVE',
        })
      } else if (response.status === 404) {
        // 행사가 없는 경우 - 기본값 유지
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

      // 업데이트된 데이터로 상태 갱신
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
              <CardTitle>헤더 설정</CardTitle>
              <CardDescription>
                행사 페이지 상단에 표시될 이미지와 텍스트를 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Label htmlFor="headerImage">헤더 이미지 URL</Label>
                <Input
                  id="headerImage"
                  type="url"
                  value={eventData.headerImage}
                  onChange={e =>
                    handleInputChange('headerImage', e.target.value)
                  }
                  placeholder="https://example.com/header-image.jpg"
                />
              </div>

              {eventData.headerImage && (
                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-600">
                    미리보기
                  </Label>
                  <div className="mt-2 aspect-video max-w-md bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={eventData.headerImage}
                      alt="헤더 이미지 미리보기"
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
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

          {/* 행사 상태
          <Card>
            <CardHeader>
              <CardTitle>행사 상태</CardTitle>
              <CardDescription>현재 행사의 상태를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="status">상태</Label>
                <select
                  id="status"
                  value={eventData.status}
                  onChange={e => handleInputChange('status', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="UPCOMING">준비중</option>
                  <option value="ACTIVE">진행중</option>
                  <option value="ENDED">종료됨</option>
                </select>
              </div>
            </CardContent>
          </Card>
          */}

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
