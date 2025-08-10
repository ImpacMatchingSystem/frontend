'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

import { Calendar, Clock, Users, TrendingUp, Filter, Eye } from 'lucide-react'

import { AdminHeader } from '@/components/layout/admin-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'

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
    description?: string
    website?: string
  }
  buyer: {
    id: string
    name: string
    email: string
    description?: string
    website?: string
  }
  timeSlot: {
    id: string
    startTime: string
    endTime: string
  }
}

export default function AdminMeetingsPage() {
  const { data: session } = useSession()
  const [meetings, setMeetings] = useState<MeetingWithDetails[]>([])
  const [filteredMeetings, setFilteredMeetings] = useState<
    MeetingWithDetails[]
  >([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMeeting, setSelectedMeeting] =
    useState<MeetingWithDetails | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    if (session?.user) {
      fetchMeetings()
    }
  }, [session])

  useEffect(() => {
    filterMeetings()
  }, [meetings, statusFilter, dateFilter, searchTerm])

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/meetings')

      if (!response.ok) {
        throw new Error('미팅 목록 조회 실패')
      }

      const meetingsData = await response.json()

      // 데이터가 배열인지 확인하고 최신순으로 정렬
      const sortedMeetings = Array.isArray(meetingsData)
        ? meetingsData.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        : []

      setMeetings(sortedMeetings)
    } catch (error) {
      console.error('Meetings fetch error:', error)
      toast({
        title: '데이터 로딩 오류',
        description: '미팅 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filterMeetings = () => {
    let filtered = meetings

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(meeting => meeting.status === statusFilter)
    }

    // 날짜 필터
    if (dateFilter !== 'all') {
      const today = new Date()
      const todayStr = today.toDateString()

      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(
            meeting =>
              new Date(meeting.timeSlot.startTime).toDateString() === todayStr
          )
          break
        case 'week':
          const weekFromNow = new Date(
            today.getTime() + 7 * 24 * 60 * 60 * 1000
          )
          filtered = filtered.filter(meeting => {
            const meetingDate = new Date(meeting.timeSlot.startTime)
            return meetingDate >= today && meetingDate <= weekFromNow
          })
          break
        case 'past':
          filtered = filtered.filter(
            meeting => new Date(meeting.timeSlot.startTime) < today
          )
          break
      }
    }

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(
        meeting =>
          meeting.company.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          meeting.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meeting.buyer.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredMeetings(filtered)
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

  // 통계 계산
  const stats = {
    total: meetings.length,
    pending: meetings.filter(m => m.status === 'PENDING').length,
    confirmed: meetings.filter(m => m.status === 'CONFIRMED').length,
    rejected: meetings.filter(m => m.status === 'REJECTED').length,
    cancelled: meetings.filter(m => m.status === 'CANCELLED').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">미팅 현황을 불러오는 중...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">미팅 현황</h1>
          <p className="text-gray-600">
            전체 미팅 신청 현황을 모니터링하고 관리하세요.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 미팅</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기중</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인됨</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.confirmed}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">거절됨</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">취소됨</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {stats.cancelled}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 필터 및 검색 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              필터 및 검색
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="기업명, 바이어명 또는 이메일로 검색..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 상태</SelectItem>
                    <SelectItem value="PENDING">대기중</SelectItem>
                    <SelectItem value="CONFIRMED">승인됨</SelectItem>
                    <SelectItem value="REJECTED">거절됨</SelectItem>
                    <SelectItem value="CANCELLED">취소됨</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="기간" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 기간</SelectItem>
                    <SelectItem value="today">오늘</SelectItem>
                    <SelectItem value="week">이번 주</SelectItem>
                    <SelectItem value="past">지난 미팅</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 미팅 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>미팅 목록</CardTitle>
            <CardDescription>
              총 {filteredMeetings.length}개의 미팅이 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMeetings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {meetings.length === 0
                    ? '등록된 미팅이 없습니다.'
                    : '검색 조건에 맞는 미팅이 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMeetings.map(meeting => {
                  const startDateTime = formatDateTime(
                    meeting.timeSlot.startTime
                  )
                  const endDateTime = formatDateTime(meeting.timeSlot.endTime)
                  const createdDateTime = formatDateTime(meeting.createdAt)

                  return (
                    <div
                      key={meeting.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {meeting.company.name}
                          </h3>
                          <span className="text-gray-400">×</span>
                          <span className="text-gray-700">
                            {meeting.buyer.name}
                          </span>
                          {getStatusBadge(meeting.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <p>바이어: {meeting.buyer.email}</p>
                            {meeting.buyer.description && (
                              <p className="truncate">
                                소개: {meeting.buyer.description}
                              </p>
                            )}
                          </div>
                          <div>
                            <p>미팅 일시: {startDateTime.date}</p>
                            <p>
                              시간: {startDateTime.time} - {endDateTime.time}
                            </p>
                          </div>
                          <div>
                            <p>신청일: {createdDateTime.date}</p>
                            {meeting.message && (
                              <p className="truncate">
                                메시지: {meeting.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedMeeting(meeting)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              상세보기
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>미팅 상세 정보</DialogTitle>
                              <DialogDescription>
                                미팅의 상세 정보를 확인할 수 있습니다.
                              </DialogDescription>
                            </DialogHeader>

                            {selectedMeeting && (
                              <div className="space-y-6">
                                {/* 기본 정보 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <h4 className="font-medium">기업 정보</h4>
                                    <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                                      <p className="font-medium">
                                        {selectedMeeting.company.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {selectedMeeting.company.email}
                                      </p>
                                      {selectedMeeting.company.description && (
                                        <p className="text-sm text-gray-600">
                                          {selectedMeeting.company.description}
                                        </p>
                                      )}
                                      {selectedMeeting.company.website && (
                                        <p className="text-sm text-blue-600">
                                          <a
                                            href={
                                              selectedMeeting.company.website
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            {selectedMeeting.company.website}
                                          </a>
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <h4 className="font-medium">바이어 정보</h4>
                                    <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                                      <p className="font-medium">
                                        {selectedMeeting.buyer.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {selectedMeeting.buyer.email}
                                      </p>
                                      {selectedMeeting.buyer.description && (
                                        <p className="text-sm text-gray-600">
                                          {selectedMeeting.buyer.description}
                                        </p>
                                      )}
                                      {selectedMeeting.buyer.website && (
                                        <p className="text-sm text-blue-600">
                                          <a
                                            href={selectedMeeting.buyer.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            {selectedMeeting.buyer.website}
                                          </a>
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* 미팅 정보 */}
                                <div className="space-y-2">
                                  <h4 className="font-medium">미팅 정보</h4>
                                  <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span>상태:</span>
                                      {getStatusBadge(selectedMeeting.status)}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span>일시:</span>
                                      <span>
                                        {
                                          formatDateTime(
                                            selectedMeeting.timeSlot.startTime
                                          ).date
                                        }{' '}
                                        {
                                          formatDateTime(
                                            selectedMeeting.timeSlot.startTime
                                          ).time
                                        }
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span>종료:</span>
                                      <span>
                                        {
                                          formatDateTime(
                                            selectedMeeting.timeSlot.endTime
                                          ).time
                                        }
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span>신청일:</span>
                                      <span>
                                        {
                                          formatDateTime(
                                            selectedMeeting.createdAt
                                          ).date
                                        }
                                      </span>
                                    </div>
                                    {selectedMeeting.updatedAt !==
                                      selectedMeeting.createdAt && (
                                      <div className="flex items-center justify-between">
                                        <span>수정일:</span>
                                        <span>
                                          {
                                            formatDateTime(
                                              selectedMeeting.updatedAt
                                            ).date
                                          }
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* 메시지 */}
                                {selectedMeeting.message && (
                                  <div className="space-y-2">
                                    <h4 className="font-medium">신청 메시지</h4>
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                      <p className="text-sm">
                                        {selectedMeeting.message}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
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
