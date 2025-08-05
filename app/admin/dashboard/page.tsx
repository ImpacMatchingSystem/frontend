"use client"

import { useState, useEffect } from "react"
import { Building2, Calendar, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminHeader } from "@/components/layout/admin-header"
import { AdminGuard } from "@/components/admin/admin-guard"
import { supabase } from "@/lib/supabase/supabase"
import { useToast } from "@/hooks/use-toast"

interface AdminStats {
  totalCompanies: number
  totalMeetings: number
  pendingMeetings: number
  confirmedMeetings: number
  rejectedMeetings: number
  todayMeetings: number
}

interface RecentMeeting {
  id: string
  meeting_time: string
  status: string
  companies: {
    name: string
  }
  buyers: {
    name: string
    email: string
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalCompanies: 0,
    totalMeetings: 0,
    pendingMeetings: 0,
    confirmedMeetings: 0,
    rejectedMeetings: 0,
    todayMeetings: 0,
  })
  const [recentMeetings, setRecentMeetings] = useState<RecentMeeting[]>([])
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 기업 수 조회
      const { count: companiesCount } = await supabase
        .from("companies")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)

      // 미팅 통계 조회
      const { data: meetings } = await supabase
        .from("meetings")
        .select(`
          *,
          companies (name),
          buyers (name, email)
        `)
        .order("created_at", { ascending: false })

      if (meetings) {
        const today = new Date().toDateString()

        const stats = {
          totalCompanies: companiesCount || 0,
          totalMeetings: meetings.length,
          pendingMeetings: meetings.filter((m: any) => m.status === "pending").length,
          confirmedMeetings: meetings.filter((m: any) => m.status === "confirmed").length,
          rejectedMeetings: meetings.filter((m: any) => m.status === "rejected").length,
          todayMeetings: meetings.filter((m: any) => new Date(m.meeting_time).toDateString() === today).length,
        }

        setStats(stats)
        setRecentMeetings(meetings.slice(0, 10))
      }
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
      <AdminGuard>
        <div className="min-h-screen bg-gray-50">
          <AdminHeader />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">대시보드를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
            <p className="text-gray-600">ImpacMatching 플랫폼의 전체 현황을 모니터링하세요.</p>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 참가기업</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCompanies}</div>
                <p className="text-xs text-muted-foreground">활성 기업 수</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 미팅 신청</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMeetings}</div>
                <p className="text-xs text-muted-foreground">전체 미팅 신청</p>
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
                <CardTitle className="text-sm font-medium">오늘의 미팅</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayMeetings}</div>
                <p className="text-xs text-muted-foreground">오늘 예정된 미팅</p>
              </CardContent>
            </Card>
          </div>

          {/* 상세 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">승인된 미팅</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.confirmedMeetings}</div>
                <p className="text-xs text-muted-foreground">
                  승인률:{" "}
                  {stats.totalMeetings > 0 ? Math.round((stats.confirmedMeetings / stats.totalMeetings) * 100) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">거절된 미팅</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.rejectedMeetings}</div>
                <p className="text-xs text-muted-foreground">
                  거절률:{" "}
                  {stats.totalMeetings > 0 ? Math.round((stats.rejectedMeetings / stats.totalMeetings) * 100) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">성공률</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {stats.totalMeetings > 0 ? Math.round((stats.confirmedMeetings / stats.totalMeetings) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">미팅 성사율</p>
              </CardContent>
            </Card>
          </div>

          {/* 최근 미팅 현황 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                최근 미팅 현황
              </CardTitle>
              <CardDescription>최근에 신청된 미팅들의 현황입니다</CardDescription>
            </CardHeader>
            <CardContent>
              {recentMeetings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">최근 미팅 신청이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {recentMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium">{meeting.companies.name}</p>
                          <span className="text-gray-400">×</span>
                          <p className="text-gray-600">{meeting.buyers.name}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{meeting.buyers.email}</span>
                          <span>
                            {new Date(meeting.meeting_time).toLocaleDateString("ko-KR")}{" "}
                            {new Date(meeting.meeting_time).toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">{getStatusBadge(meeting.status)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  )
}
