"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Building2, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BuyerHeader } from "@/components/layout/buyer-header"
import { mockApi, type Meeting, type Company } from "@/lib/mock-api"
import { useAuthStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface MeetingWithCompany extends Meeting {
  company: Company
}

export default function BuyerDashboard() {
  const [meetings, setMeetings] = useState<MeetingWithCompany[]>([])
  const [loading, setLoading] = useState(true)

  const { user } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "buyer") {
      toast({
        title: "접근 권한 없음",
        description: "바이어만 접근할 수 있는 페이지입니다.",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    fetchMyMeetings()
  }, [user, router])

  const fetchMyMeetings = async () => {
    if (!user) return

    try {
      const [allMeetings, companies] = await Promise.all([mockApi.meetings.getAll(), mockApi.companies.getAll()])

      // 현재 바이어의 미팅만 필터링
      const myMeetings = allMeetings.filter((meeting) => meeting.buyer_id === user.id)

      const meetingsWithCompanies: MeetingWithCompany[] = myMeetings
        .map((meeting) => {
          const company = companies.find((c) => c.id === meeting.company_id)
          return { ...meeting, company: company! }
        })
        .filter((m) => m.company)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setMeetings(meetingsWithCompanies)
    } catch (error) {
      toast({
        title: "데이터 로딩 오류",
        description: "미팅 내역을 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
      case "completed":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            완료됨
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const stats = {
    total: meetings.length,
    pending: meetings.filter((m) => m.status === "pending").length,
    confirmed: meetings.filter((m) => m.status === "confirmed").length,
    upcoming: meetings.filter((m) => m.status === "confirmed" && new Date(m.meeting_time) > new Date()).length,
  }

  if (!user || user.role !== "buyer") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">바이어 로그인이 필요합니다.</p>
          <Button asChild>
            <Link href="/login">로그인하기</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BuyerHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">미팅 내역을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BuyerHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">내 대시보드</h1>
          <p className="text-gray-600">안녕하세요, {user.name}님! 미팅 신청 현황을 확인해보세요.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 신청</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">전체 미팅 신청</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기중</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">승인 대기중</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인됨</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <p className="text-xs text-muted-foreground">승인된 미팅</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">예정된 미팅</CardTitle>
              <User className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
              <p className="text-xs text-muted-foreground">다가오는 미팅</p>
            </CardContent>
          </Card>
        </div>

        {/* 미팅 신청 내역 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              미팅 신청 내역
            </CardTitle>
            <CardDescription>신청한 미팅들의 현황을 확인하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            {meetings.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg mb-4">아직 신청한 미팅이 없습니다.</p>
                <Button asChild>
                  <Link href="/companies">기업 둘러보기</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {meeting.company.logo_url ? (
                            <img
                              src={meeting.company.logo_url || "/placeholder.svg"}
                              alt={`${meeting.company.name} 로고`}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <span className="text-lg font-bold text-gray-600">{meeting.company.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{meeting.company.name}</h3>
                          <p className="text-sm text-gray-600">{meeting.company.industry}</p>
                        </div>
                      </div>
                      {getStatusBadge(meeting.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(meeting.meeting_time).toLocaleDateString("ko-KR")}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(meeting.meeting_time).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(meeting.end_time).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          신청일: {new Date(meeting.created_at).toLocaleDateString("ko-KR")}
                        </p>
                        {meeting.company.location && (
                          <p className="text-sm text-gray-600">위치: {meeting.company.location}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        {meeting.company.website_url && (
                          <a
                            href={meeting.company.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            웹사이트 방문
                          </a>
                        )}
                      </div>
                    </div>

                    {meeting.buyer_message && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">내 메시지:</p>
                        <p className="text-sm bg-blue-50 p-2 rounded">"{meeting.buyer_message}"</p>
                      </div>
                    )}

                    {meeting.company_response && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">기업 응답:</p>
                        <p className="text-sm bg-green-50 p-2 rounded">"{meeting.company_response}"</p>
                      </div>
                    )}

                    {meeting.rejection_reason && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">거절 사유:</p>
                        <p className="text-sm bg-red-50 p-2 rounded">"{meeting.rejection_reason}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                  <Link href="/companies">
                    <Building2 className="mr-2 h-4 w-4" />
                    기업 둘러보기
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/companies">
                    <Calendar className="mr-2 h-4 w-4" />새 미팅 신청
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
