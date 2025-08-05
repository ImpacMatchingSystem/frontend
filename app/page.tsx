"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Calendar, Users, Zap, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { mockApi, type Event } from "@/lib/supabase/mock-api"

export default function HomePage() {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActiveEvent()
  }, [])

  const fetchActiveEvent = async () => {
    try {
      const activeEvent = await mockApi.events.getActive()
      setEvent(activeEvent)
    } catch (error) {
      console.error("Failed to fetch active event:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">행사 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        {event?.header_image_url && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${event.header_image_url})` }}
          />
        )}
        <div className="container mx-auto text-center relative z-10">
          <div className="mb-6">
            {event && (
              <div className="flex justify-center items-center gap-4 mb-4">
                <Badge variant="outline" className="text-primary border-primary">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(event.start_date).toLocaleDateString("ko-KR")} -{" "}
                  {new Date(event.end_date).toLocaleDateString("ko-KR")}
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Clock className="mr-1 h-3 w-3" />
                  {event.meeting_duration}분 미팅
                </Badge>
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {event?.title || "ImpacMatching"}
            <br />
            <span className="text-primary">비즈니스 매칭 플랫폼</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {event?.description ||
              "기업과 바이어를 효율적으로 연결하여 새로운 비즈니스 기회를 창출하세요. 간편한 예약 시스템으로 원하는 시간에 미팅을 잡을 수 있습니다."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard/buyer/companies">
                미팅 신청하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {event && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {new Date(event.start_date).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
                </div>
                <div className="text-sm text-gray-600">행사 시작일</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{event.meeting_duration}분</div>
                <div className="text-sm text-gray-600">미팅 시간</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {event.business_hours.start} - {event.business_hours.end}
                </div>
                <div className="text-sm text-gray-600">운영 시간</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {event ? `${event.title}의 특별함` : "왜 ImpacMatching을 선택해야 할까요?"}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              효율적이고 신뢰할 수 있는 미팅 매칭 서비스로 비즈니스 성공을 도와드립니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>효율적인 매칭</CardTitle>
                <CardDescription>스마트한 매칭 시스템으로 최적의 비즈니스 파트너를 찾아드립니다.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>간편한 예약</CardTitle>
                <CardDescription>직관적인 인터페이스로 원하는 시간에 쉽게 미팅을 예약하세요.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>실시간 관리</CardTitle>
                <CardDescription>실시간 알림과 관리 시스템으로 원활한 커뮤니케이션을 지원합니다.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
