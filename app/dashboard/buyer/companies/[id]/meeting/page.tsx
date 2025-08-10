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

import { useToast } from '@/hooks/use-toast'

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

export default function MeetingRequestPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const [company, setCompany] = useState<Company | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // 바이어만 접근 가능
  useEffect(() => {
    if (!session?.user || (session.user as any).role !== 'BUYER') {
      router.push('/login')
      return
    }
  }, [session, router])

  // 기업 정보 및 시간대 로드
  useEffect(() => {
    const loadCompany = async () => {
      try {
        const response = await fetch(`/api/companies/${params.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            toast({
              title: '오류',
              description: '기업 정보를 찾을 수 없습니다.',
              variant: 'destructive',
            })
          } else {
            throw new Error(`HTTP ${response.status}`)
          }
          router.push('/dashboard/buyer/companies')
          return
        }

        const companyData = await response.json()
        setCompany(companyData)
      } catch (error) {
        console.error('Failed to load company:', error)
        toast({
          title: '오류',
          description: '기업 정보를 불러오는데 실패했습니다.',
          variant: 'destructive',
        })
        router.push('/dashboard/buyer/companies')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadCompany()
    }
  }, [params.id, router, toast])

  // 날짜별로 시간대 그룹화
  const groupTimeSlotsByDate = () => {
    if (!company?.timeSlots) return {}

    const groups: { [date: string]: typeof company.timeSlots } = {}

    company.timeSlots
      .filter(slot => !slot.isBooked && new Date(slot.startTime) > new Date())
      .forEach(slot => {
        const date = new Date(slot.startTime).toDateString()
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(slot)
      })

    // 각 날짜의 시간대를 시간순으로 정렬
    Object.keys(groups).forEach(date => {
      groups[date].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
    })

    return groups
  }

  // 미팅 요청 제출
  const handleSubmit = async () => {
    if (!selectedTimeSlot) {
      toast({
        title: '입력 오류',
        description: '시간대를 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

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
          timeSlotId: selectedTimeSlot,
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
          <p className="mt-4 text-gray-600">기업 정보를 불러오는 중...</p>
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

  const timeSlotGroups = groupTimeSlotsByDate()
  const selectedSlot = company.timeSlots.find(
    slot => slot.id === selectedTimeSlot
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 기업 정보 */}
          <div className="lg:col-span-1">
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

                <div>
                  <h4 className="font-medium text-gray-900">
                    사용 가능한 시간대
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {company.timeSlots.filter(slot => !slot.isBooked).length}개
                    시간대 예약 가능
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 미팅 예약 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  미팅 예약
                </CardTitle>
                <CardDescription>
                  원하는 날짜와 시간을 선택하여 미팅을 요청하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 사용 가능한 시간대 */}
                {Object.keys(timeSlotGroups).length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      현재 예약 가능한 시간대가 없습니다.
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      나중에 다시 확인해주세요.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      시간대 선택
                    </h4>

                    {Object.entries(timeSlotGroups)
                      .sort(
                        ([a], [b]) =>
                          new Date(a).getTime() - new Date(b).getTime()
                      )
                      .map(([date, slots]) => (
                        <div key={date} className="space-y-2">
                          <h5 className="font-medium text-gray-800">
                            {new Date(date).toLocaleDateString('ko-KR', {
                              month: 'long',
                              day: 'numeric',
                              weekday: 'long',
                            })}
                          </h5>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {slots.map(slot => (
                              <Button
                                key={slot.id}
                                variant={
                                  selectedTimeSlot === slot.id
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                className="h-auto p-2 flex flex-col"
                                onClick={() => setSelectedTimeSlot(slot.id)}
                              >
                                <span className="text-xs">
                                  {new Date(slot.startTime).toLocaleTimeString(
                                    'ko-KR',
                                    {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }
                                  )}
                                </span>
                                <span className="text-xs text-gray-500">
                                  30분
                                </span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* 메시지 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    미팅 요청사항 (선택사항)
                  </h4>
                  <Textarea
                    placeholder="미팅에서 논의하고 싶은 내용이나 특별한 요청사항을 입력해주세요."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* 선택된 정보 요약 */}
                {selectedSlot && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      선택된 미팅 정보
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>• 기업: {company.name}</p>
                      <p>
                        • 날짜:{' '}
                        {new Date(selectedSlot.startTime).toLocaleDateString(
                          'ko-KR',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'long',
                          }
                        )}
                      </p>
                      <p>
                        • 시간:{' '}
                        {new Date(selectedSlot.startTime).toLocaleTimeString(
                          'ko-KR',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}{' '}
                        -{' '}
                        {new Date(selectedSlot.endTime).toLocaleTimeString(
                          'ko-KR',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* 제출 버튼 */}
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !selectedTimeSlot ||
                    submitting ||
                    Object.keys(timeSlotGroups).length === 0
                  }
                  className="w-full"
                  size="lg"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? '요청 중...' : '미팅 요청하기'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
