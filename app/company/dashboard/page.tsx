"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { mockApi, type Meeting, type Buyer } from "@/lib/mock-api"
import { useAuthStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface DashboardStats {
  totalMeetings: number
  pendingMeetings: number
  confirmedMeetings: number
  todayMeetings: number
}

interface MeetingWithBuyer extends Meeting {
  buyer: Buyer
}

export default function CompanyDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMeetings: 0,
    pendingMeetings: 0,
    confirmedMeetings: 0,
    todayMeetings: 0,
  })
  const [recentMeetings, setRecentMeetings] = useState<MeetingWithBuyer[]>([])
  const [todayMeetings, setTodayMeetings] = useState<MeetingWithBuyer[]>([])
  const [loading, setLoading] = useState(true)

  const { user } = useAuthStore()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // 기업 정보 조회
      const company = await mockApi.companies.getByEmail(user.email)
      if (!company) return

      // 미팅 목록 조회
      const meetings = await mockApi.meetings.getByCompanyId(company.id)
      const buyers = await mockApi.buyers.getAll()

      // 미팅과 바이어 정보 결합
      const meetingsWithBuyers: MeetingWithBuyer[] = meetings
        .map((meeting) => {
          const buyer = buyers.find((b) => b.id === meeting.buyer_id)
          return { ...meeting, buyer: buyer! }
        })
        .filter((m) => m.buyer)

      const today = new Date().toDateString()

      const stats = {
        totalMeetings: meetingsWithBuyers.length,
        pendingMeetings: meetingsWithBuyers.filter((m) => m.status === "pending").length,
        confirmedMeetings: meetingsWithBuyers.filter((m) => m.status === "confirmed").length,
        todayMeetings: meetingsWithBuyers.filter((m) => new Date(m.meeting_time).toDateString() === today).length,
      }

      setStats(stats)
      setRecentMeetings(meetingsWithBuyers.slice(0, 5))
      setTodayMeetings(meetingsWithBuyers.filter((m) => new Date(m.meeting_time).toDateString() === today))
    } catch (error) {
      toast({
        title: "데이터 로딩 오류",
        description: "대시보드 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMeetingAction = async (meetingId: string, action: "confirmed" | "rejected") => {
    try {
      await mockApi.meetings.update(meetingId, {
        status: action,
      })

      toast({
        title: action === "confirmed" ? "미팅 승인" : "미팅 거절",
        description: `미팅이 ${action === "confirmed" ? "승인" : "거절"}되었습니다.`,
      })

      fetchDashboardData()
    } catch (error) {
      toast({
        title: "오류",
        description: "미팅 상태 변경에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            대기중
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            승인됨
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            거절됨
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">대시보드를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
          <p className="text-gray-600">안녕하세요, {user?.name}님! 오늘의 미팅 현황을 확인해보세요.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 미팅 신청</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMeetings}</div>
              <p className="text-xs text-muted-foreground">전체 미팅 신청 수</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기중인 신청</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingMeetings}</div>
              <p className="text-xs text-muted-foreground">승인 대기중</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">확정된 미팅</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.confirmedMeetings}</div>
              <p className="text-xs text-muted-foreground">승인된 미팅</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘의 미팅</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayMeetings}</div>
              <p className="text-xs text-muted-foreground">오늘 예정된 미팅</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 오늘의 미팅 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                오늘의 미팅
              </CardTitle>
              <CardDescription>오늘 예정된 미팅 일정입니다</CardDescription>
            </CardHeader>
            <CardContent>
              {todayMeetings.length === 0 ? (
                <p className="text-gray-500 text-center py-4">오늘 예정된 미팅이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {todayMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{meeting.buyer.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(meeting.meeting_time).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {getStatusBadge(meeting.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 최근 미팅 신청 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                최근 미팅 신청
              </CardTitle>
              <CardDescription>최근에 받은 미팅 신청 목록입니다</CardDescription>
            </CardHeader>
            <CardContent>
              {recentMeetings.length === 0 ? (
                <p className="text-gray-500 text-center py-4">최근 미팅 신청이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {recentMeetings.map((meeting) => (
                    <div key={meeting.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{meeting.buyer.name}</p>
                          <p className="text-sm text-gray-600">{meeting.buyer.company_name || meeting.buyer.email}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(meeting.meeting_time).toLocaleDateString("ko-KR")}{" "}
                            {new Date(meeting.meeting_time).toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {getStatusBadge(meeting.status)}
                      </div>

                      {meeting.buyer_message && <p className="text-sm text-gray-600 mb-2">"{meeting.buyer_message}"</p>}

                      {meeting.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleMeetingAction(meeting.id, "confirmed")}>
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMeetingAction(meeting.id, "rejected")}
                          >
                            거절
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 빠른 액션 */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>빠른 액션</CardTitle>
              <CardDescription>자주 사용하는 기능들에 빠르게 접근하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <Link href="/company/meetings">
                    <Users className="mr-2 h-4 w-4" />
                    미팅 관리
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/company/schedule">
                    <Calendar className="mr-2 h-4 w-4" />
                    시간 설정
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
