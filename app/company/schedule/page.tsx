"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Save, RotateCcw, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/store"
import { mockApi } from "@/lib/mock-api"

export default function CompanySchedulePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const [meetingDuration, setMeetingDuration] = useState<number>(30)
  const [availableTimes, setAvailableTimes] = useState<{ [date: string]: string[] }>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 기업만 접근 가능
  useEffect(() => {
    if (!user || user.role !== "company") {
      router.push("/login")
      return
    }
  }, [user, router])

  // 기업 스케줄 정보 로드
  useEffect(() => {
    const loadSchedule = async () => {
      if (!user) return

      try {
        const company = await mockApi.companies.getById(user.id)
        if (company) {
          setAvailableTimes(company.available_times || {})
        }
      } catch (error) {
        console.error("Failed to load schedule:", error)
        toast({
          title: "오류",
          description: "스케줄 정보를 불러오는데 실패했습니다.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadSchedule()
  }, [user, toast])

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
  const generateTimeSlots = (duration: number) => {
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

  // 시간 슬롯 토글
  const toggleTimeSlot = (date: string, time: string) => {
    setAvailableTimes((prev) => {
      const dateSlots = prev[date] || []
      const isSelected = dateSlots.includes(time)

      if (isSelected) {
        // 선택 해제
        return {
          ...prev,
          [date]: dateSlots.filter((t) => t !== time),
        }
      } else {
        // 선택
        return {
          ...prev,
          [date]: [...dateSlots, time].sort(),
        }
      }
    })
  }

  // 전체 날짜 토글
  const toggleAllSlotsForDate = (date: string) => {
    const timeSlots = generateTimeSlots(meetingDuration)
    const currentSlots = availableTimes[date] || []
    const allSelected = timeSlots.every((time) => currentSlots.includes(time))

    if (allSelected) {
      // 모두 선택 해제
      setAvailableTimes((prev) => ({
        ...prev,
        [date]: [],
      }))
    } else {
      // 모두 선택
      setAvailableTimes((prev) => ({
        ...prev,
        [date]: timeSlots,
      }))
    }
  }

  // 전체 초기화
  const resetAllSchedules = () => {
    setAvailableTimes({})
    toast({
      title: "초기화 완료",
      description: "모든 스케줄이 초기화되었습니다.",
    })
  }

  // 기본 스케줄 설정 (평일 9-18시)
  const setDefaultSchedule = () => {
    const dates = generateDates()
    const timeSlots = generateTimeSlots(meetingDuration)
    const newSchedule: { [date: string]: string[] } = {}

    dates.forEach((date) => {
      const dateObj = new Date(date)
      const dayOfWeek = dateObj.getDay()

      // 평일(월-금)만 설정
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        newSchedule[date] = timeSlots
      }
    })

    setAvailableTimes(newSchedule)
    toast({
      title: "기본 스케줄 설정 완료",
      description: "평일 9시-18시로 스케줄이 설정되었습니다.",
    })
  }

  // 스케줄 저장
  const saveSchedule = async () => {
    if (!user) return

    setSaving(true)
    try {
      await mockApi.companies.update(user.id, {
        available_times: availableTimes,
      })

      toast({
        title: "저장 완료",
        description: "스케줄이 성공적으로 저장되었습니다.",
      })
    } catch (error) {
      console.error("Failed to save schedule:", error)
      toast({
        title: "저장 실패",
        description: "스케줄 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // 미팅 시간 변경 시 기존 스케줄 조정
  const handleDurationChange = (newDuration: number) => {
    setMeetingDuration(newDuration)

    // 기존 스케줄을 새로운 시간 간격에 맞게 조정
    const newTimeSlots = generateTimeSlots(newDuration)
    const adjustedSchedule: { [date: string]: string[] } = {}

    Object.keys(availableTimes).forEach((date) => {
      const currentSlots = availableTimes[date] || []
      // 기존 선택된 시간 중 새로운 시간 간격에 맞는 것들만 유지
      adjustedSchedule[date] = currentSlots.filter((time) => newTimeSlots.includes(time))
    })

    setAvailableTimes(adjustedSchedule)
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

  const dates = generateDates()
  const timeSlots = generateTimeSlots(meetingDuration)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">미팅 스케줄 관리</h1>
          <p className="text-gray-600 mt-2">바이어들이 미팅을 요청할 수 있는 시간을 설정하세요.</p>
        </div>

        {/* 설정 패널 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              미팅 설정
            </CardTitle>
            <CardDescription>미팅 시간과 스케줄을 설정하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">미팅 시간</label>
                <Select
                  value={meetingDuration.toString()}
                  onValueChange={(value) => handleDurationChange(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15분</SelectItem>
                    <SelectItem value="30">30분</SelectItem>
                    <SelectItem value="60">60분</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={setDefaultSchedule} className="flex items-center bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  기본 스케줄
                </Button>
                <Button variant="outline" onClick={resetAllSchedules} className="flex items-center bg-transparent">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  전체 초기화
                </Button>
                <Button onClick={saveSchedule} disabled={saving} className="flex items-center">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "저장 중..." : "저장"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 스케줄 그리드 */}
        <div className="space-y-6">
          {dates.map((date) => {
            const dateObj = new Date(date)
            const dayOfWeek = dateObj.toLocaleDateString("ko-KR", { weekday: "long" })
            const dateSlots = availableTimes[date] || []
            const allSelected = timeSlots.every((time) => dateSlots.includes(time))
            const someSelected = timeSlots.some((time) => dateSlots.includes(time))

            return (
              <Card key={date}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {dateObj.toLocaleDateString("ko-KR", {
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        ({dayOfWeek})
                      </CardTitle>
                      <CardDescription>{dateSlots.length}개 시간대 선택됨</CardDescription>
                    </div>
                    <Button
                      variant={allSelected ? "default" : someSelected ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => toggleAllSlotsForDate(date)}
                    >
                      {allSelected ? "전체 해제" : "전체 선택"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {timeSlots.map((time) => {
                      const isSelected = dateSlots.includes(time)

                      return (
                        <Button
                          key={time}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTimeSlot(date, time)}
                          className="text-xs"
                        >
                          {time}
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 요약 정보 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              스케줄 요약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(availableTimes).filter((date) => availableTimes[date].length > 0).length}
                </div>
                <div className="text-sm text-gray-600">활성 날짜</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(availableTimes).reduce((total, slots) => total + slots.length, 0)}
                </div>
                <div className="text-sm text-gray-600">총 시간대</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{meetingDuration}분</div>
                <div className="text-sm text-gray-600">미팅 시간</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
