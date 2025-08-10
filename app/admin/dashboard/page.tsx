'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

import {
  Building2,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
} from 'lucide-react'

import { AdminHeader } from '@/components/layout/admin-header'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { useToast } from '@/hooks/use-toast'

interface AdminStats {
  totalCompanies: number
  totalBuyers: number
  totalMeetings: number
  pendingMeetings: number
  confirmedMeetings: number
  rejectedMeetings: number
  todayMeetings: number
}

interface RecentMeeting {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED'
  message?: string
  createdAt: string
  company: {
    id: string
    name: string
    email: string
  }
  buyer: {
    id: string
    name: string
    email: string
  }
  timeSlot: {
    startTime: string
    endTime: string
  }
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<AdminStats>({
    totalCompanies: 0,
    totalBuyers: 0,
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
    if (session?.user) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      // 통계 데이터 동시 조회
      const [usersResponse, meetingsResponse] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/meetings'),
      ])

      if (!usersResponse.ok || !meetingsResponse.ok) {
        throw new Error('데이터 조회 실패')
      }

      const usersData = await usersResponse.json()
      const meetingsData = await meetingsResponse.json()

      // 사용자 통계 계산
      const companies =
        usersData.users?.filter((user: any) => user.role === 'COMPANY') || []
      const buyers =
        usersData.users?.filter((user: any) => user.role === 'BUYER') || []

      // 미팅 통계 계산
      const meetings = Array.isArray(meetingsData) ? meetingsData : []
      const today = new Date().toDateString()

      const statsData = {
        totalCompanies: companies.length,
        totalBuyers: buyers.length,
        totalMeetings: meetings.length,
        pendingMeetings: meetings.filter((m: any) => m.status === 'PENDING')
          .length,
        confirmedMeetings: meetings.filter((m: any) => m.status === 'CONFIRMED')
          .length,
        rejectedMeetings: meetings.filter((m: any) => m.status === 'REJECTED')
          .length,
        todayMeetings: meetings.filter((m: any) => {
          const meetingDate = new Date(m.timeSlot?.startTime).toDateString()
          return meetingDate === today
        }).length,
      }

      setStats(statsData)
      // 최근 미팅 10개 (최신순)
      setRecentMeetings(meetings.slice(0, 10))
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      toast({
        title: '데이터 로딩 오류',
        description: '대시보드 데이터를 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            대기중
          </Badge>
        )
      case 'CONFIRMED':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            승인됨
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            거절됨
          </Badge>
        )
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-600">
            취소됨
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
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
      <AdminHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            관리자 대시보드
          </h1>
          <p className="text-gray-600">
            ImpacMatching 플랫폼의 전체 현황을 모니터링하세요.
          </p>
        </div>

        {/* 사용자 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 참가기업</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">등록된 기업 수</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 바이어</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBuyers}</div>
              <p className="text-xs text-muted-foreground">등록된 바이어 수</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                총 미팅 신청
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMeetings}</div>
              <p className="text-xs text-muted-foreground">전체 미팅 신청</p>
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

        {/* 미팅 상태별 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                대기중인 신청
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingMeetings}
              </div>
              <p className="text-xs text-muted-foreground">승인 대기중</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인된 미팅</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.confirmedMeetings}
              </div>
              <p className="text-xs text-muted-foreground">
                승인률:{' '}
                {stats.totalMeetings > 0
                  ? Math.round(
                      (stats.confirmedMeetings / stats.totalMeetings) * 100
                    )
                  : 0}
                %
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">거절된 미팅</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.rejectedMeetings}
              </div>
              <p className="text-xs text-muted-foreground">
                거절률:{' '}
                {stats.totalMeetings > 0
                  ? Math.round(
                      (stats.rejectedMeetings / stats.totalMeetings) * 100
                    )
                  : 0}
                %
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">미팅 성사율</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.totalMeetings > 0
                  ? Math.round(
                      (stats.confirmedMeetings / stats.totalMeetings) * 100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">전체 성사율</p>
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
              <p className="text-gray-500 text-center py-8">
                최근 미팅 신청이 없습니다.
              </p>
            ) : (
              <div className="space-y-4">
                {recentMeetings.map(meeting => {
                  const dateTime = formatDateTime(meeting.timeSlot.startTime)
                  return (
                    <div
                      key={meeting.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium">{meeting.company.name}</p>
                          <span className="text-gray-400">×</span>
                          <p className="text-gray-600">{meeting.buyer.name}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{meeting.buyer.email}</span>
                          <span>
                            {dateTime.date} {dateTime.time}
                          </span>
                          {meeting.message && (
                            <span className="truncate max-w-xs">
                              "{meeting.message}"
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(meeting.status)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
