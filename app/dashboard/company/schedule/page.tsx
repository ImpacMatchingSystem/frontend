'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import {
  Calendar,
  Clock,
  RotateCcw,
  Settings,
  Plus,
  Trash2,
} from 'lucide-react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { CompanyHeader } from '@/components/layout/company-header'

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  isBooked: boolean
}

export default function CompanySchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 새 시간대 추가를 위한 상태
  const [newSlotDate, setNewSlotDate] = useState('')
  const [newSlotStartTime, setNewSlotStartTime] = useState('')
  const [newSlotEndTime, setNewSlotEndTime] = useState('')
  const [meetingDuration, setMeetingDuration] = useState<number>(30)

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/login')
      return
    }

    if ((session.user as any).role !== 'COMPANY') {
      toast({
        title: '접근 권한 없음',
        description: '기업만 접근할 수 있는 페이지입니다.',
        variant: 'destructive',
      })
      router.push('/')
      return
    }

    fetchTimeSlots()
  }, [session, status, router])

  const fetchTimeSlots = async () => {
    if (!session?.user) return

    try {
      // 현재 사용자(기업)의 시간대 목록 조회
      const response = await fetch('/api/timeslots')

      if (!response.ok) {
        throw new Error('시간대 목록 조회 실패')
      }

      const slotsData = await response.json()
      const validSlots = Array.isArray(slotsData) ? slotsData : []

      setTimeSlots(validSlots)
    } catch (error) {
      console.error('Time slots fetch error:', error)
      toast({
        title: '오류',
        description: '시간대 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // 새 시간대 추가
  const addTimeSlot = async () => {
    if (!newSlotDate || !newSlotStartTime || !newSlotEndTime) {
      toast({
        title: '입력 오류',
        description: '날짜와 시간을 모두 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    try {
      const startDateTime = new Date(`${newSlotDate}T${newSlotStartTime}:00`)
      const endDateTime = new Date(`${newSlotDate}T${newSlotEndTime}:00`)

      if (startDateTime >= endDateTime) {
        toast({
          title: '입력 오류',
          description: '종료 시간은 시작 시간보다 늦어야 합니다.',
          variant: 'destructive',
        })
        return
      }

      const response = await fetch('/api/timeslots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '시간대 생성 실패')
      }

      toast({
        title: '시간대 추가 완료',
        description: '새로운 시간대가 추가되었습니다.',
      })

      // 폼 초기화
      setNewSlotDate('')
      setNewSlotStartTime('')
      setNewSlotEndTime('')

      // 목록 새로고침
      fetchTimeSlots()
    } catch (error) {
      console.error('Add time slot error:', error)
      toast({
        title: '추가 실패',
        description: '시간대 추가 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  // 시간대 삭제
  const deleteTimeSlot = async (slotId: string) => {
    try {
      const response = await fetch(`/api/timeslots/${slotId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('시간대 삭제 실패')
      }

      toast({
        title: '시간대 삭제 완료',
        description: '시간대가 삭제되었습니다.',
      })

      fetchTimeSlots()
    } catch (error) {
      console.error('Delete time slot error:', error)
      toast({
        title: '삭제 실패',
        description: '시간대 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  // 기본 스케줄 생성 (평일 9-18시)
  const createDefaultSchedule = async () => {
    const slots = []
    const today = new Date()

    // 앞으로 14일간 평일에 대해 시간대 생성
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // 평일만 (월-금)
      if (date.getDay() >= 1 && date.getDay() <= 5) {
        for (let hour = 9; hour < 18; hour += 2) {
          // 2시간 간격
          const startTime = new Date(date)
          startTime.setHours(hour, 0, 0, 0)

          const endTime = new Date(startTime)
          endTime.setHours(hour + 1, 0, 0, 0) // 1시간 미팅

          slots.push({
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          })
        }
      }
    }

    try {
      setSaving(true)

      // 각 시간대를 개별로 생성
      for (const slot of slots) {
        await fetch('/api/timeslots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(slot),
        })
      }

      toast({
        title: '기본 스케줄 생성 완료',
        description: `평일 9시-18시로 ${slots.length}개 시간대가 생성되었습니다.`,
      })

      fetchTimeSlots()
    } catch (error) {
      console.error('Create default schedule error:', error)
      toast({
        title: '생성 실패',
        description: '기본 스케줄 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // 모든 시간대 삭제
  const clearAllSlots = async () => {
    if (
      !confirm('모든 시간대를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')
    ) {
      return
    }

    try {
      setSaving(true)

      // 각 시간대를 개별로 삭제
      for (const slot of timeSlots) {
        if (!slot.isBooked) {
          // 예약되지 않은 시간대만 삭제
          await fetch(`/api/timeslots/${slot.id}`, {
            method: 'DELETE',
          })
        }
      }

      toast({
        title: '초기화 완료',
        description: '예약되지 않은 모든 시간대가 삭제되었습니다.',
      })

      fetchTimeSlots()
    } catch (error) {
      console.error('Clear all slots error:', error)
      toast({
        title: '초기화 실패',
        description: '시간대 초기화 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('ko-KR'),
      time: date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
  }

  // 날짜별로 시간대 그룹화
  const groupedSlots = timeSlots.reduce(
    (acc, slot) => {
      const date = new Date(slot.startTime).toDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(slot)
      return acc
    },
    {} as Record<string, TimeSlot[]>
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session?.user || (session.user as any).role !== 'COMPANY') {
    return null
  }

  const availableSlots = timeSlots.filter(
    slot => !slot.isBooked && new Date(slot.startTime) > new Date()
  )
  const bookedSlots = timeSlots.filter(slot => slot.isBooked)

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <CompanyHeader />
      <div className="max-w-6xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">미팅 시간대 관리</h1>
          <p className="text-gray-600 mt-2">
            바이어들이 미팅을 신청할 수 있는 시간대를 설정하세요.
          </p>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 시간대</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timeSlots.length}</div>
              <p className="text-xs text-muted-foreground">등록된 시간대</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">예약 가능</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {availableSlots.length}
              </div>
              <p className="text-xs text-muted-foreground">
                예약 가능한 시간대
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">예약됨</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {bookedSlots.length}
              </div>
              <p className="text-xs text-muted-foreground">예약된 시간대</p>
            </CardContent>
          </Card>
        </div>

        {/* 시간대 추가 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />새 시간대 추가
            </CardTitle>
            <CardDescription>
              새로운 미팅 가능 시간대를 추가하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="date">날짜</Label>
                <Input
                  id="date"
                  type="date"
                  value={newSlotDate}
                  onChange={e => setNewSlotDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">시작 시간</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newSlotStartTime}
                  onChange={e => setNewSlotStartTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">종료 시간</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newSlotEndTime}
                  onChange={e => setNewSlotEndTime(e.target.value)}
                />
              </div>

              <Button onClick={addTimeSlot} className="h-10">
                <Plus className="mr-2 h-4 w-4" />
                추가
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 빠른 액션 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              빠른 설정
            </CardTitle>
            <CardDescription>
              자주 사용하는 설정을 빠르게 적용하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={createDefaultSchedule}
                disabled={saving}
                className="flex items-center"
              >
                <Calendar className="mr-2 h-4 w-4" />
                기본 스케줄 생성
              </Button>
              <Button
                variant="outline"
                onClick={clearAllSlots}
                disabled={saving}
                className="flex items-center"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                전체 초기화
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 시간대 목록 */}
        <div className="space-y-6">
          {Object.keys(groupedSlots).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg mb-4">
                  등록된 시간대가 없습니다.
                </p>
                <Button onClick={createDefaultSchedule} disabled={saving}>
                  기본 스케줄 생성하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedSlots)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([dateKey, slots]) => {
                const date = new Date(dateKey)
                const dayOfWeek = date.toLocaleDateString('ko-KR', {
                  weekday: 'long',
                })

                return (
                  <Card key={dateKey}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {date.toLocaleDateString('ko-KR', {
                          month: 'long',
                          day: 'numeric',
                        })}{' '}
                        ({dayOfWeek})
                      </CardTitle>
                      <CardDescription>
                        {slots.length}개 시간대 • 예약 가능:{' '}
                        {
                          slots.filter(
                            s =>
                              !s.isBooked && new Date(s.startTime) > new Date()
                          ).length
                        }
                        개
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {slots
                          .sort(
                            (a, b) =>
                              new Date(a.startTime).getTime() -
                              new Date(b.startTime).getTime()
                          )
                          .map(slot => {
                            const startTime = formatDateTime(slot.startTime)
                            const endTime = formatDateTime(slot.endTime)
                            const isPast = new Date(slot.startTime) < new Date()

                            return (
                              <div
                                key={slot.id}
                                className={`p-3 rounded-lg border flex items-center justify-between ${
                                  slot.isBooked
                                    ? 'bg-red-50 border-red-200'
                                    : isPast
                                      ? 'bg-gray-50 border-gray-200'
                                      : 'bg-green-50 border-green-200'
                                }`}
                              >
                                <div>
                                  <p className="font-medium">
                                    {startTime.time} - {endTime.time}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {slot.isBooked
                                      ? '예약됨'
                                      : isPast
                                        ? '지난 시간'
                                        : '예약 가능'}
                                  </p>
                                </div>

                                {!slot.isBooked && !isPast && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteTimeSlot(slot.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
          )}
        </div>
      </div>
    </div>
  )
}
