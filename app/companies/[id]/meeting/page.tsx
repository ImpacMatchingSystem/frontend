"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, Clock, ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/store"
import { mockApi } from "@/lib/mock-api"
import type { Company } from "@/lib/mock-data"

export default function MeetingRequestPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const [company, setCompany] = useState<Company | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // 바이어만 접근 가능
  useEffect(() => {
    if (!user || user.role !== "buyer") {
      router.push("/login")
      return
    }
  }, [user, router])

  // 기업 정보 로드
  useEffect(() => {
    const loadCompany = async () => {
      try {
        const companyData = await mockApi.companies.getById(params.id as string)
        if (!companyData) {
          toast({
            title: "오류",
            description: "기업 정보를 찾을 수 없습니다.",
            variant: "destructive",
          })
          router.push("/companies")
          return
        }
        setCompany(companyData)
      } catch (error) {
        console.error("Failed to load company:", error)
        toast({
          title: "오류",
          description: "기업 정보를 불러오는데 실패했습니다.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadCompany()
    }
  }, [params.id, router, toast])

  // 날짜 생성 (오늘부터 14일)
  const generateDates = () => {
    const dates = []
    const today = new Date()

    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split("T")[0])
    }

    return dates
  }

  // 시간 슬롯 생성
  const generateTimeSlots = (duration = 30) => {
    const slots = []
    const startHour = 9
    const endHour = 18

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        slots.push(time)
      }
    }

    return slots
  }

  // 해당 날짜에 사용 가능한 시간인지 확인
  const isTimeAvailable = (date: string, time: string) => {
    if (!company?.available_times || !company.available_times[date]) {
      return false
    }
    return company.available_times[date].includes(time)
  }

  // 미팅 요청 제출
  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "입력 오류",
        description: "날짜와 시간을 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "인증 오류",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const meetingTime = new Date(`${selectedDate}T${selectedTime}:00`)
      const endTime = new Date(meetingTime.getTime() + 30 * 60 * 1000) // 30분 후

      await mockApi.meetings.create({
        company_id: params.id as string,
        buyer_id: user.id,
        meeting_time: meetingTime.toISOString(),
        end_time: endTime.toISOString(),
        status: "pending",
        buyer_message: message || null,
        company_response: null,
        rejection_reason: null,
      })

      toast({
        title: "미팅 요청 완료",
        description: "미팅 요청이 성공적으로 전송되었습니다.",
      })

      router.push("/buyer/dashboard")
    } catch (error) {
      console.error("Failed to create meeting:", error)
      toast({
        title: "오류",
        description: "미팅 요청 중 오류가 발생했습니다.",
        variant: "destructive",
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
          <p className="mt-4 text-gray-600">로딩 중...</p>
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

  const dates = generateDates()
  const timeSlots = generateTimeSlots(30) // 30분 간격

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로 가기
          </Button>

          <div className="flex items-center space-x-4">
            <img
              src={company.logo_url || "/placeholder.svg?height=64&width=64&text=Logo"}
              alt={company.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-gray-600 mt-1">
                {company.industry} • {company.location}
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
                <div>
                  <h4 className="font-medium text-gray-900">회사 소개</h4>
                  <p className="text-sm text-gray-600 mt-1">{company.description}</p>
                </div>

                {company.website_url && (
                  <div>
                    <h4 className="font-medium text-gray-900">웹사이트</h4>
                    <a
                      href={company.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-1 block"
                    >
                      {company.website_url}
                    </a>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900">업종</h4>
                  <Badge variant="secondary" className="mt-1">
                    {company.industry}
                  </Badge>
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
                <CardDescription>원하는 날짜와 시간을 선택하여 미팅을 요청하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 날짜 선택 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">날짜 선택</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {dates.map((date) => {
                      const dateObj = new Date(date)
                      const hasAvailableSlots =
                        company.available_times &&
                        company.available_times[date] &&
                        company.available_times[date].length > 0

                      return (
                        <Button
                          key={date}
                          variant={selectedDate === date ? "default" : "outline"}
                          className={`p-3 h-auto flex flex-col ${
                            !hasAvailableSlots ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          onClick={() => {
                            if (hasAvailableSlots) {
                              setSelectedDate(date)
                              setSelectedTime("") // 날짜 변경 시 시간 초기화
                            }
                          }}
                          disabled={!hasAvailableSlots}
                        >
                          <span className="text-xs">{dateObj.toLocaleDateString("ko-KR", { weekday: "short" })}</span>
                          <span className="text-sm font-medium">{dateObj.getDate()}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* 시간 선택 */}
                {selectedDate && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      시간 선택
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {timeSlots.map((time) => {
                        const isAvailable = isTimeAvailable(selectedDate, time)

                        return (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            className={`${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => {
                              if (isAvailable) {
                                setSelectedTime(time)
                              }
                            }}
                            disabled={!isAvailable}
                          >
                            {time}
                          </Button>
                        )
                      })}
                    </div>

                    {/* 범례 */}
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-primary rounded mr-2"></div>
                        <span>선택됨</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 border border-gray-300 rounded mr-2"></div>
                        <span>선택 가능</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
                        <span>선택 불가</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 메시지 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">미팅 요청사항 (선택사항)</h4>
                  <Textarea
                    placeholder="미팅에서 논의하고 싶은 내용이나 특별한 요청사항을 입력해주세요."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* 선택된 정보 요약 */}
                {selectedDate && selectedTime && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">선택된 미팅 정보</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>• 기업: {company.name}</p>
                      <p>
                        • 날짜:{" "}
                        {new Date(selectedDate).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "long",
                        })}
                      </p>
                      <p>• 시간: {selectedTime} (30분)</p>
                    </div>
                  </div>
                )}

                {/* 제출 버튼 */}
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedDate || !selectedTime || submitting}
                  className="w-full"
                  size="lg"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? "요청 중..." : "미팅 요청하기"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
