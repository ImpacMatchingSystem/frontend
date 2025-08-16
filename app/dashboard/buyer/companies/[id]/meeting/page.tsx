'use client'

import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import {
  Calendar,
  Clock,
  ArrowLeft,
  Send,
  Globe,
  Building2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { useToast } from '@/hooks/use-toast'
import { BuyerHeader } from '@/components/layout/buyer-header'

interface Company {
  id: string
  name: string
  email: string
  description?: string | null
  website?: string | null
  timeSlots: Array<{
    id: string
    startTime: string
    endTime: string
    isBooked: boolean
  }>
}

interface EventInfo {
  meetingDuration: number
  operationStartTime: string
  operationEndTime: string
  lunchStartTime: string
  lunchEndTime: string
  startDate: string
  endDate: string
}

interface SelectedSlotInfo {
  slotId: string
  date: Date
  timeString: string
  startTime: string
  endTime: string
}

export default function MeetingRequestPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const [company, setCompany] = useState<Company | null>(null)
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // 다이얼로그 관련 상태
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlotInfo | null>(null)
  const [message, setMessage] = useState('')

  // 바이어만 접근 가능
  useEffect(() => {
    if (!session?.user || (session.user as any).role !== 'BUYER') {
      router.push('/login')
      return
    }
  }, [session, router])

  // 기업 정보 및 이벤트 정보 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 기업 정보 로드
        const companyResponse = await fetch(`/api/companies/${params.id}`)
        if (!companyResponse.ok) {
          if (companyResponse.status === 404) {
            toast({
              title: '오류',
              description: '기업 정보를 찾을 수 없습니다.',
              variant: 'destructive',
            })
          } else {
            throw new Error(`HTTP ${companyResponse.status}`)
          }
          router.push('/dashboard/buyer/companies')
          return
        }
        const companyData = await companyResponse.json()
        setCompany(companyData)

        // 이벤트 정보 로드
        const eventResponse = await fetch('/api/event')
        if (eventResponse.ok) {
          const eventData = await eventResponse.json()
          setEventInfo(eventData)
        }
      } catch (error) {
        console.error('Failed to load data:', error)
        toast({
          title: '오류',
          description: '데이터를 불러오는데 실패했습니다.',
          variant: 'destructive',
        })
        router.push('/dashboard/buyer/companies')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadData()
    }
  }, [params.id, router, toast])

  // 이벤트 날짜 범위 생성
  const getEventDates = () => {
    if (!eventInfo) return []
    
    const dates = []
    const start = new Date(eventInfo.startDate)
    const end = new Date(eventInfo.endDate)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d))
    }
    
    return dates
  }

  // 시간대 목록 생성
  const generateTimeSlots = () => {
    if (!eventInfo) return []
    
    const slots = []
    const [startHour, startMin] = eventInfo.operationStartTime.split(':').map(Number)
    const [endHour, endMin] = eventInfo.operationEndTime.split(':').map(Number)
    const [lunchStartHour, lunchStartMin] = eventInfo.lunchStartTime.split(':').map(Number)
    const [lunchEndHour, lunchEndMin] = eventInfo.lunchEndTime.split(':').map(Number)
    
    const duration = eventInfo.meetingDuration
    
    let currentTime = startHour * 60 + startMin // 분으로 변환
    const endTime = endHour * 60 + endMin
    const lunchStart = lunchStartHour * 60 + lunchStartMin
    const lunchEnd = lunchEndHour * 60 + lunchEndMin
    
    while (currentTime + duration <= endTime) {
      // 점심시간과 겹치는지 확인
      if (!(currentTime < lunchEnd && currentTime + duration > lunchStart)) {
        const hour = Math.floor(currentTime / 60)
        const min = currentTime % 60
        slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
      }
      currentTime += duration
    }
    
    return slots
  }

  // 특정 날짜와 시간의 슬롯 정보 가져오기
  const getSlotInfo = (date: Date, timeString: string) => {
    if (!company || !eventInfo) return { bgColor: 'bg-gray-100', content: null, clickable: false, slotData: null }
    
    const [hour, minute] = timeString.split(':').map(Number)
    const slotStartTime = new Date(date)
    slotStartTime.setHours(hour, minute, 0, 0)
    
    // 과거 시간인지 확인
    const now = new Date()
    if (slotStartTime <= now) {
      return {
        bgColor: 'bg-gray-100',
        content: (
          <span className="text-xs text-gray-400">지난 시간</span>
        ),
        clickable: false,
        slotData: null
      }
    }
    
    // 해당 시간의 슬롯 찾기
    const matchingSlot = company.timeSlots.find(slot => {
      const slotTime = new Date(slot.startTime)
      return (
        slotTime.getFullYear() === slotStartTime.getFullYear() &&
        slotTime.getMonth() === slotStartTime.getMonth() &&
        slotTime.getDate() === slotStartTime.getDate() &&
        slotTime.getHours() === slotStartTime.getHours() &&
        slotTime.getMinutes() === slotStartTime.getMinutes()
      )
    })
    
    if (!matchingSlot) {
      return {
        bgColor: 'bg-gray-100',
        content: (
          <span className="text-xs text-gray-400">미등록</span>
        ),
        clickable: false,
        slotData: null
      }
    }
    
    if (matchingSlot.isBooked) {
      return {
        bgColor: 'bg-red-100 border-2 border-red-300',
        content: (
          <span className="text-xs text-red-600 font-medium">예약됨</span>
        ),
        clickable: false,
        slotData: null
      }
    }
    
    return {
      bgColor: 'bg-green-100 border-2 border-green-300 hover:bg-green-200',
      content: (
        <div className="text-center">
          <div className="w-4 h-4 mx-auto text-green-600">✓</div>
          <div className="text-xs text-green-700 font-medium mt-1">
            예약가능
          </div>
        </div>
      ),
      clickable: true,
      slotData: {
        slotId: matchingSlot.id,
        date,
        timeString,
        startTime: matchingSlot.startTime,
        endTime: matchingSlot.endTime,
      }
    }
  }

  // 시간대 클릭 핸들러
  const handleSlotClick = (slotData: SelectedSlotInfo) => {
    setSelectedSlot(slotData)
    setMessage('')
    setDialogOpen(true)
  }

  // 다이얼로그 닫기
  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedSlot(null)
    setMessage('')
  }

  // 미팅 요청 제출
  const handleSubmit = async () => {
    if (!selectedSlot) return

    if (!session?.user) {
      toast({
        title: '인증 오류',
        description: '로그인이 필요합니다.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeSlotId: selectedSlot.slotId,
          message: message || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '미팅 요청에 실패했습니다')
      }

      toast({
        title: '미팅 요청 완료',
        description: '미팅 요청이 성공적으로 전송되었습니다.',
      })

      handleDialogClose()
      router.push('/dashboard/buyer')
    } catch (error) {
      console.error('Failed to create meeting:', error)
      toast({
        title: '오류',
        description:
          error instanceof Error
            ? error.message
            : '미팅 요청 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">기업 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  const eventDates = getEventDates()
  const timeSlotsList = generateTimeSlots()
  const weekDayNames = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BuyerHeader />
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로 가기
          </Button>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {company.name}
              </h1>
              <p className="text-gray-600 mt-1">
                미팅을 요청하여 비즈니스 기회를 만들어보세요
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* 기업 정보 */}
          <div className="xl:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>기업 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.description && (
                  <div>
                    <h4 className="font-medium text-gray-900">회사 소개</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {company.description}
                    </p>
                  </div>
                )}

                {company.website && (
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      웹사이트
                    </h4>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-1 block"
                    >
                      {company.website}
                    </a>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900">이메일</h4>
                  <p className="text-sm text-gray-600 mt-1">{company.email}</p>
                </div>

                {eventInfo && (
                  <div>
                    <h4 className="font-medium text-gray-900">미팅 정보</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      미팅 시간: {eventInfo.meetingDuration}분
                    </p>
                    <p className="text-sm text-gray-600">
                      운영시간: {eventInfo.operationStartTime} - {eventInfo.operationEndTime}
                    </p>
                    <p className="text-sm text-gray-600">
                      점심시간: {eventInfo.lunchStartTime} - {eventInfo.lunchEndTime}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 타임테이블 */}
          <div className="xl:col-span-3">
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
                        day: 'numeric',
                      })}{' '}
                      ~{' '}
                      {new Date(eventInfo.endDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
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
                          <th
                            key={index}
                            className="p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-700 border bg-gray-50 min-w-[80px] sm:min-w-[140px]"
                          >
                            <div className="text-sm sm:text-base font-bold text-gray-800">
                              {date.toLocaleDateString('ko-KR', {
                                month: 'numeric',
                                day: 'numeric',
                              })}
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
                      {timeSlotsList.map(timeString => (
                        <tr key={timeString}>
                          <td className="p-1 sm:p-3 text-xs sm:text-sm text-gray-700 border text-center font-semibold bg-gray-50">
                            <div className="text-xs sm:text-base">
                              {timeString.substring(0, 2)}:
                              {timeString.substring(3, 5)}
                            </div>
                          </td>
                          {eventDates.map((date, dateIndex) => {
                            const slotInfo = getSlotInfo(date, timeString)
                            return (
                              <td
                                key={dateIndex}
                                className={`border h-12 sm:h-20 ${slotInfo.bgColor} ${
                                  slotInfo.clickable
                                    ? 'cursor-pointer hover:opacity-80'
                                    : ''
                                } transition-all duration-200`}
                                onClick={() => {
                                  if (slotInfo.clickable && slotInfo.slotData) {
                                    handleSlotClick(slotInfo.slotData)
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
                    <div className="w-3 h-3 sm:w-5 sm:h-5 bg-gray-100 border-2 border-gray-300 rounded"></div>
                    <span className="font-medium">지난 시간/미등록</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 미팅 요청 다이얼로그 */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                미팅 요청
              </DialogTitle>
              <DialogDescription>
                선택한 시간대에 미팅을 요청하시겠습니까?
              </DialogDescription>
            </DialogHeader>

            {selectedSlot && (
              <div className="space-y-4">
                {/* 선택된 미팅 정보 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">선택된 미팅 정보</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>• 기업: {company?.name}</p>
                    <p>
                      • 날짜:{' '}
                      {selectedSlot.date.toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long',
                      })}
                    </p>
                    <p>
                      • 시간:{' '}
                      {new Date(selectedSlot.startTime).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(selectedSlot.endTime).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p>• 미팅 시간: {eventInfo?.meetingDuration}분</p>
                  </div>
                </div>

                {/* 미팅 요청사항 */}
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">
                    미팅 요청사항 (선택사항)
                  </label>
                  <Textarea
                    placeholder="미팅에서 논의하고 싶은 내용이나 특별한 요청사항을 입력해주세요.&#10;예: 투자 유치에 관해 상담받고 싶습니다. 사업 계획서를 준비해 가겠습니다."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDialogClose}
                disabled={submitting}
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="min-w-[100px]"
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    요청 중...
                  </div>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    미팅 요청
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}