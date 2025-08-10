'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { Calendar, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react'

import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { useToast } from '@/hooks/use-toast'

interface DashboardStats {
  totalMeetings: number
  pendingMeetings: number
  confirmedMeetings: number
  todayMeetings: number
}

interface MeetingWithDetails {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED'
  message?: string
  createdAt: string
  updatedAt: string
  company: {
    id: string
    name: string
    email: string
  }
  buyer: {
    id: string
    name: string
    email: string
    description?: string
  }
  timeSlot: {
    id: string
    startTime: string
    endTime: string
  }
}

export default function CompanyDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalMeetings: 0,
    pendingMeetings: 0,
    confirmedMeetings: 0,
    todayMeetings: 0,
  })
  const [recentMeetings, setRecentMeetings] = useState<MeetingWithDetails[]>([])
  const [todayMeetings, setTodayMeetings] = useState<MeetingWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()

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

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    if (!session?.user) return

    try {
      const response = await fetch('/api/meetings')
      
      if (!response.ok) {
        throw new Error('미팅 목록 조회 실패')
      }

      const meetingsData = await response.json()
      const meetings = Array.isArray(meetingsData) ? meetingsData : []

      const today = new Date().toDateString()

      const stats = {
        totalMeetings: meetings.length,
        pendingMeetings: meetings.filter(m => m.status === 'PENDING').length,
        confirmedMeetings: meetings.filter(m => m.status === 'CONFIRMED').length,
        todayMeetings: meetings.filter(m => 
          new Date(m.timeSlot.startTime).toDateString() === today
        ).length,
      }

      const sortedMeetings = meetings.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      const todayMeetingsList = meetings.filter(m => 
        new Date(m.timeSlot.startTime).toDateString() === today
      )

      setStats(stats)
      setRecentMeetings(sortedMeetings.slice(0, 5))
      setTodayMeetings(todayMeetingsList)
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

  const handleMeetingAction = async (
    meetingId: string,
    action: 'CONFIRMED' | 'REJECTED'
  ) => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action }),
      })

      if (!response.ok) {
        throw new Error('미팅 상태 변경 실패')
      }

      toast({
        title: action === 'CONFIRMED' ? '미팅 승인' : '미팅 거절',
        description: `미팅이 ${action === 'CONFIRMED' ? '승인' : '거절'}되었습니다.`,
      })

      fetchDashboardData()
    } catch (error) {
      console.error('Meeting action error:', error)
      toast({
        title: '오류',
        description: '미팅 상태 변경에 실패했습니다.',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (status === 'loading' || loading) {
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

  if (!session?.user || (session.user as any).role !== 'COMPANY') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">기업 대시보드</h1>
          <p className="text-gray-600">
            안녕하세요, {session.user.name}님! 오늘의 미팅 현황을 확인해보세요.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                총 미팅 신청
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMeetings}</div>
              <p className="text-xs text-muted-foreground">전체 미팅 신청 수</p>
            </CardContent>
          </Card>

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
              <CardTitle className="text-sm font-medium">확정된 미팅</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.confirmedMeetings}
              </div>
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
                <p className="text-gray-500 text-center py-4">
                  오늘 예정된 미팅이 없습니다.
                </p>
              ) : (
                <div className="space-y-4">
                  {todayMeetings.map(meeting => (
                    <div
                      key={meeting.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{meeting.buyer.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatTime(meeting.timeSlot.startTime)} - {formatTime(meeting.timeSlot.endTime)}
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
              <CardDescription>
                최근에 받은 미팅 신청 목록입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentMeetings.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  최근 미팅 신청이 없습니다.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentMeetings.map(meeting => (
                    <div
                      key={meeting.id}
                      className="border-b pb-4 last:border-b-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{meeting.buyer.name}</p>
                          <p className="text-sm text-gray-600">
                            {meeting.buyer.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(meeting.timeSlot.startTime).toLocaleDateString('ko-KR')}{' '}
                            {formatTime(meeting.timeSlot.startTime)}
                          </p>
                        </div>
                        {getStatusBadge(meeting.status)}
                      </div>

                      {meeting.message && (
                        <p className="text-sm text-gray-600 mb-2">
                          "{meeting.message}"
                        </p>
                      )}

                      {meeting.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleMeetingAction(meeting.id, 'CONFIRMED')
                            }
                          >
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleMeetingAction(meeting.id, 'REJECTED')
                            }
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
              <CardDescription>
                자주 사용하는 기능들에 빠르게 접근하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <Link href="/dashboard/company/meetings">
                    <Users className="mr-2 h-4 w-4" />
                    미팅 관리
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/company/schedule">
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