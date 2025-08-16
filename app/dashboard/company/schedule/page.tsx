'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import {
  Calendar,
  Clock,
  Settings,
  Plus,
  Ban,
  CheckCircle,
  XCircle,
  Users,
  AlertCircle,
  Check,
  X,
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
import { useToast } from '@/hooks/use-toast'
import { CompanyHeader } from '@/components/layout/company-header'

interface Meeting {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED'
  message?: string
  buyer: {
    id: string
    name: string
    email: string
  }
}

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  isBooked: boolean
  meeting?: Meeting
}

interface EventInfo {
  id: string
  name: string
  startDate: string
  endDate: string
  meetingDuration: number
  operationStartTime: string
  operationEndTime: string
  lunchStartTime: string
  lunchEndTime: string
}

export default function CompanySchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 새 시간대 추가를 위한 상태
  const [newSlotDate, setNewSlotDate] = useState('')
  const [newSlotStartTime, setNewSlotStartTime] = useState('')
  const [newSlotEndTime, setNewSlotEndTime] = useState('')

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

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    if (!session?.user) return

    try {
      const [eventResponse, slotsResponse] = await Promise.all([
        fetch('/api/event'),
        fetch('/api/timeslots')
      ])

      if (!eventResponse.ok || !slotsResponse.ok) {
        throw new Error('데이터 조회 실패')
      }

      const eventData = await eventResponse.json()
      const slotsData = await slotsResponse.json()

      setEventInfo(eventData)
      setTimeSlots(Array.isArray(slotsData) ? slotsData : [])
    } catch (error) {
      console.error('Data fetch error:', error)
      toast({
        title: '오류',
        description: '데이터를 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // 시간대 슬롯 생성/토글
  const toggleTimeSlot = async (date: Date, timeString: string) => {
    if (!eventInfo) return

    const [hour, minute] = timeString.split(':').map(Number)
    const startTime = new Date(date)
    startTime.setHours(hour, minute, 0, 0)
    
    const endTime = new Date(startTime)
    endTime.setMinutes(startTime.getMinutes() + eventInfo.meetingDuration)

    // 기존 시간대 찾기
    const existingSlot = timeSlots.find(slot => {
      const slotStart = new Date(slot.startTime)
      return slotStart.getTime() === startTime.getTime()
    })

    try {
      if (existingSlot) {
        // 기존 시간대가 있으면 상태 토글
        if (existingSlot.meeting?.status === 'CONFIRMED') {
          toast({
            title: '변경 불가',
            description: '확정된 미팅이 있는 시간대는 변경할 수 없습니다.',
            variant: 'destructive',
          })
          return
        }

        const method = existingSlot.isBooked ? 'PUT' : 'DELETE'
        const response = await fetch(`/api/timeslots/${existingSlot.id}`, {
          method: method,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '상태 변경 실패')
        }
      } else {
        // 새 시간대 생성
        const response = await fetch('/api/timeslots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '시간대 생성 실패')
        }
      }

      fetchData()
    } catch (error) {
      console.error('Toggle time slot error:', error)
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '시간대 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  // 미팅 승인/거절
  const handleMeeting = async (meetingId: string, action: 'CONFIRMED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '미팅 처리 실패')
      }

      toast({
        title: '미팅 처리 완료',
        description: action === 'CONFIRMED' ? '미팅이 승인되었습니다.' : '미팅이 거절되었습니다.',
      })

      fetchData()
    } catch (error) {
      console.error('Handle meeting error:', error)
      toast({
        title: '처리 실패',
        description: error instanceof Error ? error.message : '미팅 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  // 기본 스케줄 생성
  const createDefaultSchedule = async () => {
    if (!eventInfo) {
      toast({
        title: '오류',
        description: '이벤트 정보를 불러오지 못했습니다.',
        variant: 'destructive',
      })
      return
    }

    const slots = []
    const startDate = new Date(eventInfo.startDate)
    const endDate = new Date(eventInfo.endDate)
    const duration = eventInfo.meetingDuration

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      // 평일만 (월-금)
      if (date.getDay() >= 1 && date.getDay() <= 5) {
        const [startHour, startMinute] = eventInfo.operationStartTime.split(':').map(Number)
        const [endHour, endMinute] = eventInfo.operationEndTime.split(':').map(Number)
        const [lunchStartHour, lunchStartMinute] = eventInfo.lunchStartTime.split(':').map(Number)
        const [lunchEndHour, lunchEndMinute] = eventInfo.lunchEndTime.split(':').map(Number)

        const dayStart = new Date(date)
        dayStart.setHours(startHour, startMinute, 0, 0)

        const dayEnd = new Date(date)
        dayEnd.setHours(endHour, endMinute, 0, 0)

        const lunchStart = new Date(date)
        lunchStart.setHours(lunchStartHour, lunchStartMinute, 0, 0)

        const lunchEnd = new Date(date)
        lunchEnd.setHours(lunchEndHour, lunchEndMinute, 0, 0)

        for (let current = new Date(dayStart); current < dayEnd; current.setMinutes(current.getMinutes() + duration)) {
          const slotEnd = new Date(current)
          slotEnd.setMinutes(current.getMinutes() + duration)

          if (slotEnd > dayEnd) break

          // 점심시간 제외
          if (current >= lunchStart && current < lunchEnd) continue
          if (slotEnd > lunchStart && slotEnd <= lunchEnd) continue

          slots.push({
            startTime: new Date(current).toISOString(),
            endTime: new Date(slotEnd).toISOString(),
          })
        }
      }
    }

    try {
      setSaving(true)

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
        description: `${duration}분 단위로 ${slots.length}개 시간대가 생성되었습니다.`,
      })

      fetchData()
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

  // 시간대 정보 가져오기
  const getSlotInfo = (date: Date, timeString: string) => {
    const [hour, minute] = timeString.split(':').map(Number)
    const startTime = new Date(date)
    startTime.setHours(hour, minute, 0, 0)

    const slot = timeSlots.find(s => {
      const slotStart = new Date(s.startTime)
      return slotStart.getTime() === startTime.getTime()
    })

    const isPast = startTime < new Date()
    
    if (!slot) {
      return {
        exists: false,
        isPast,
        bgColor: isPast ? 'bg-gray-100' : 'bg-white hover:bg-gray-50',
        content: null,
        clickable: !isPast
      }
    }

    if (isPast) {
      return {
        exists: true,
        isPast: true,
        bgColor: 'bg-gray-100',
        content: <Clock className="h-3 w-3 text-gray-400" />,
        clickable: false
      }
    }

    if (slot.meeting) {
      switch (slot.meeting.status) {
        case 'PENDING':
          return {
            exists: true,
            bgColor: 'bg-yellow-100 border-yellow-300',
            content: (
              <div className="text-center p-1 w-full">
                <AlertCircle className="h-3 w-3 text-yellow-600 mx-auto mb-1" />
                <div className="text-xs text-yellow-800 font-medium truncate">
                  {slot.meeting.buyer.name}
                </div>
                <div className="flex gap-1 mt-1 justify-center">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMeeting(slot.meeting!.id, 'CONFIRMED')
                    }}
                    className="h-4 w-6 sm:h-5 sm:w-8 text-xs bg-green-600 hover:bg-green-700 p-0"
                  >
                    ✓
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMeeting(slot.meeting!.id, 'REJECTED')
                    }}
                    className="h-4 w-6 sm:h-5 sm:w-8 text-xs p-0"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ),
            clickable: false
          }
        case 'CONFIRMED':
          return {
            exists: true,
            bgColor: 'bg-blue-100 border-blue-300',
            content: (
              <div className="text-center p-1 w-full">
                <CheckCircle className="h-3 w-3 text-blue-600 mx-auto mb-1" />
                <div className="text-xs text-blue-800 font-medium truncate">
                  {slot.meeting.buyer.name}
                </div>
              </div>
            ),
            clickable: false
          }
        case 'REJECTED':
        case 'CANCELLED':
          return {
            exists: true,
            bgColor: slot.isBooked ? 'bg-red-100 border-red-300' : 'bg-green-100 border-green-300',
            content: (
              <div className="text-center p-1">
                {slot.isBooked ? (
                  <Ban className="h-3 w-3 text-red-600 mx-auto" />
                ) : (
                  <CheckCircle className="h-3 w-3 text-green-600 mx-auto" />
                )}
              </div>
            ),
            clickable: true
          }
      }
    }

    if (slot.isBooked) {
      return {
        exists: true,
        bgColor: 'bg-red-100 border-red-300',
        content: <Ban className="h-3 w-3 text-red-600 mx-auto" />,
        clickable: true
      }
    }

    return {
      exists: true,
      bgColor: 'bg-green-100 border-green-300',
      content: <CheckCircle className="h-3 w-3 text-green-600 mx-auto" />,
      clickable: true
    }
  }

  // 시간대 목록 생성
  const generateTimeSlots = () => {
    if (!eventInfo) return []

    const slots = []
    const [startHour, startMinute] = eventInfo.operationStartTime.split(':').map(Number)
    const [endHour, endMinute] = eventInfo.operationEndTime.split(':').map(Number)
    const duration = eventInfo.meetingDuration

    const start = new Date()
    start.setHours(startHour, startMinute, 0, 0)
    
    const end = new Date()
    end.setHours(endHour, endMinute, 0, 0)

    for (let current = new Date(start); current < end; current.setMinutes(current.getMinutes() + duration)) {
      const timeString = current.toTimeString().substring(0, 5)
      slots.push(timeString)
    }

    return slots
  }

  // 행사 기간 날짜 목록 생성
  const getEventDates = () => {
    if (!eventInfo) return []
    
    const dates = []
    const startDate = new Date(eventInfo.startDate)
    const endDate = new Date(eventInfo.endDate)
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      dates.push(new Date(date))
    }
    return dates
  }

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
    slot => !slot.isBooked && !slot.meeting && new Date(slot.startTime) > new Date()
  )
  const bookedSlots = timeSlots.filter(slot => slot.meeting?.status === 'CONFIRMED')
  const pendingSlots = timeSlots.filter(slot => slot.meeting?.status === 'PENDING')
  const disabledSlots = timeSlots.filter(slot => slot.isBooked && !slot.meeting)

  const eventDates = getEventDates()
  const timeSlotsList = generateTimeSlots()
  const weekDayNames = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <CompanyHeader />
      <div className="max-w-7xl mx-auto mt-8 px-2 sm:px-4 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">미팅 시간대 관리</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            {eventInfo && (
              <>
                • {eventInfo.name} <br />
                • {new Date(eventInfo.startDate).toLocaleDateString('ko-KR')} ~ {new Date(eventInfo.endDate).toLocaleDateString('ko-KR')} <br />
                • 미팅 시간: {eventInfo.meetingDuration}분
              </>
            )}
          </p>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">사용가능</CardTitle>
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-green-600">
                {availableSlots.length}
              </div>
              <p className="text-xs text-muted-foreground">신청 가능한 시간대</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">승인 대기</CardTitle>
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                {pendingSlots.length}
              </div>
              <p className="text-xs text-muted-foreground">승인 대기 중인 미팅</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">확정됨</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-blue-600">
                {bookedSlots.length}
              </div>
              <p className="text-xs text-muted-foreground">확정된 미팅</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">사용불가능</CardTitle>
              <Ban className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-red-600">
                {disabledSlots.length}
              </div>
              <p className="text-xs text-muted-foreground">비활성화된 시간대</p>
            </CardContent>
          </Card>
        </div>

        {/* 빠른 액션 - 모바일에서는 숨김 */}
        <Card className="mb-6 sm:mb-8 hidden sm:block">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              빠른 설정
            </CardTitle>
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
                {eventInfo && ` (${eventInfo.meetingDuration}분 단위)`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 모바일용 빠른 액션 버튼 */}
        <div className="sm:hidden mb-6">
          <Button
            variant="outline"
            onClick={createDefaultSchedule}
            disabled={saving}
            className="w-full flex items-center justify-center"
          >
            <Calendar className="mr-2 h-4 w-4" />
            기본 스케줄 생성
          </Button>
        </div>

        {/* 타임테이블 */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center mb-2 sm:mb-0">
                <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-lg sm:text-xl">미팅 타임테이블</span>
              </CardTitle>
              {eventInfo && (
                <div className="text-xs sm:text-sm font-medium text-gray-600">
                  {new Date(eventInfo.startDate).toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} ~ {new Date(eventInfo.endDate).toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              )}
            </div>
            <CardDescription className="text-xs sm:text-sm">
              클릭하여 시간대를 활성화/비활성화하거나 미팅 신청을 처리하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    <th className="w-16 sm:w-24 p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-700 border bg-gray-50">
                      시간
                    </th>
                    {eventDates.map((date, index) => (
                      <th key={index} className="p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-700 border bg-gray-50 min-w-[80px] sm:min-w-[140px]">
                        <div className="text-sm sm:text-base font-bold text-gray-800">
                          {date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 hidden sm:block">
                          {weekDayNames[date.getDay()]}요일
                        </div>
                        <div className="text-xs text-gray-600 mt-1 sm:hidden">
                          {weekDayNames[date.getDay()]}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlotsList.map((timeString) => (
                    <tr key={timeString}>
                      <td className="p-1 sm:p-3 text-xs sm:text-sm text-gray-700 border text-center font-semibold bg-gray-50">
                        <div className="text-xs sm:text-base">
                          {timeString.substring(0, 2)}:{timeString.substring(3, 5)}
                        </div>
                      </td>
                      {eventDates.map((date, dateIndex) => {
                        const slotInfo = getSlotInfo(date, timeString)
                        return (
                          <td
                            key={dateIndex}
                            className={`border h-12 sm:h-20 ${slotInfo.bgColor} ${
                              slotInfo.clickable ? 'cursor-pointer hover:opacity-80' : ''
                            } transition-all duration-200`}
                            onClick={() => {
                              if (slotInfo.clickable) {
                                toggleTimeSlot(date, timeString)
                              }
                            }}
                          >
                            <div className="h-full flex items-center justify-center p-1 sm:p-2">
                              {slotInfo.content}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 범례 */}
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-3 h-3 sm:w-5 sm:h-5 bg-green-100 border-2 border-green-300 rounded"></div>
                <span className="font-medium">사용가능</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-3 h-3 sm:w-5 sm:h-5 bg-red-100 border-2 border-red-300 rounded"></div>
                <span className="font-medium">사용불가능</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-3 h-3 sm:w-5 sm:h-5 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                <span className="font-medium">승인 대기</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-3 h-3 sm:w-5 sm:h-5 bg-blue-100 border-2 border-blue-300 rounded"></div>
                <span className="font-medium">확정됨</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-3 h-3 sm:w-5 sm:h-5 bg-gray-100 border-2 border-gray-300 rounded"></div>
                <span className="font-medium">지난 시간/미등록</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}