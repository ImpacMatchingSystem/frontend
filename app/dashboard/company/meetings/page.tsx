'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import {
  Calendar,
  Clock,
  User,
  Mail,
  MessageSquare,
  Check,
  X,
  Filter,
  Eye,
  Ban,
  AlertTriangle,
} from 'lucide-react'

import { CompanyHeader } from '@/components/layout/company-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

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

export default function CompanyMeetingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [meetings, setMeetings] = useState<MeetingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMeeting, setSelectedMeeting] =
    useState<MeetingWithDetails | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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

    fetchMeetings()
  }, [session, status, router])

  const fetchMeetings = async () => {
    if (!session?.user) return

    try {
      const response = await fetch('/api/meetings')

      if (!response.ok) {
        throw new Error('미팅 목록 조회 실패')
      }

      const meetingsData = await response.json()
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

  const handleMeetingAction = async (
    meetingId: string,
    action: 'CONFIRMED' | 'REJECTED' | 'CANCELLED'
  ) => {
    setActionLoading(meetingId)
    
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

      const actionTexts = {
        CONFIRMED: '승인',
        REJECTED: '거절',
        CANCELLED: '취소'
      }

      toast({
        title: `미팅 ${actionTexts[action]}`,
        description: `미팅이 ${actionTexts[action]}되었습니다.`,
      })

      setSelectedMeeting(null)
      fetchMeetings()
    } catch (error) {
      console.error('Meeting action error:', error)
      toast({
        title: '오류',
        description: '미팅 상태 변경에 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
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

  // 미팅 취소 가능 여부 확인 (미팅 시작 1시간 전까지만 취소 가능)
  const canCancelMeeting = (meeting: MeetingWithDetails) => {
    if (meeting.status !== 'CONFIRMED') return false
    
    const meetingStartTime = new Date(meeting.timeSlot.startTime)
    const now = new Date()
    const oneHourBefore = new Date(meetingStartTime.getTime() - 60 * 60 * 1000)
    
    return now < oneHourBefore
  }

  const filteredMeetings = meetings.filter(meeting => {
    if (statusFilter === 'all') return true
    return meeting.status === statusFilter
  })

  const groupedMeetings = {
    pending: filteredMeetings.filter(m => m.status === 'PENDING'),
    confirmed: filteredMeetings.filter(m => m.status === 'CONFIRMED'),
    rejected: filteredMeetings.filter(m => m.status === 'REJECTED'),
    cancelled: filteredMeetings.filter(m => m.status === 'CANCELLED'),
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CompanyHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">미팅 목록을 불러오는 중...</p>
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
      <CompanyHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">미팅 관리</h1>
          <p className="text-gray-600">
            받은 미팅 신청을 관리하고 일정을 확인하세요.
          </p>
        </div>

        {/* 필터 */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="PENDING">대기중</SelectItem>
                <SelectItem value="CONFIRMED">승인됨</SelectItem>
                <SelectItem value="REJECTED">거절됨</SelectItem>
                <SelectItem value="CANCELLED">취소됨</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              전체 ({filteredMeetings.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              대기중 ({groupedMeetings.pending.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              승인됨 ({groupedMeetings.confirmed.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              거절됨 ({groupedMeetings.rejected.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              취소됨 ({groupedMeetings.cancelled.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <MeetingList
              meetings={filteredMeetings}
              onMeetingSelect={setSelectedMeeting}
              onMeetingAction={handleMeetingAction}
              actionLoading={actionLoading}
              canCancelMeeting={canCancelMeeting}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <MeetingList
              meetings={groupedMeetings.pending}
              onMeetingSelect={setSelectedMeeting}
              onMeetingAction={handleMeetingAction}
              actionLoading={actionLoading}
              canCancelMeeting={canCancelMeeting}
            />
          </TabsContent>

          <TabsContent value="confirmed" className="mt-6">
            <MeetingList
              meetings={groupedMeetings.confirmed}
              onMeetingSelect={setSelectedMeeting}
              onMeetingAction={handleMeetingAction}
              actionLoading={actionLoading}
              canCancelMeeting={canCancelMeeting}
            />
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <MeetingList
              meetings={groupedMeetings.rejected}
              onMeetingSelect={setSelectedMeeting}
              onMeetingAction={handleMeetingAction}
              actionLoading={actionLoading}
              canCancelMeeting={canCancelMeeting}
            />
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            <MeetingList
              meetings={groupedMeetings.cancelled}
              onMeetingSelect={setSelectedMeeting}
              onMeetingAction={handleMeetingAction}
              actionLoading={actionLoading}
              canCancelMeeting={canCancelMeeting}
            />
          </TabsContent>
        </Tabs>

        {/* 미팅 상세 다이얼로그 */}
        <Dialog
          open={!!selectedMeeting}
          onOpenChange={() => setSelectedMeeting(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>미팅 상세 정보</DialogTitle>
              <DialogDescription>
                미팅 신청 내용을 확인하고 승인, 거절, 또는 취소하세요.
              </DialogDescription>
            </DialogHeader>

            {selectedMeeting && (
              <div className="space-y-6">
                {/* 바이어 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      바이어 정보
                    </Label>
                    <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                      <p className="font-medium">
                        {selectedMeeting.buyer.name}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
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
                            href={
                              selectedMeeting.buyer.website.startsWith('http')
                                ? selectedMeeting.buyer.website
                                : `https://${selectedMeeting.buyer.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {selectedMeeting.buyer.website}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      미팅 일정
                    </Label>
                    <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                      <p className="font-medium">
                        {
                          formatDateTime(selectedMeeting.timeSlot.startTime)
                            .date
                        }
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {
                          formatDateTime(selectedMeeting.timeSlot.startTime)
                            .time
                        }{' '}
                        -{formatDateTime(selectedMeeting.timeSlot.endTime).time}
                      </p>
                      <div className="pt-2">
                        {getStatusBadge(selectedMeeting.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 바이어 메시지 */}
                {selectedMeeting.message && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      바이어 메시지
                    </Label>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">{selectedMeeting.message}</p>
                    </div>
                  </div>
                )}

                {/* 취소 가능 여부 안내 */}
                {selectedMeeting.status === 'CONFIRMED' && !canCancelMeeting(selectedMeeting) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        미팅 시작 1시간 전까지만 취소 가능합니다.
                      </span>
                    </div>
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  {selectedMeeting.status === 'PENDING' && (
                    <>
                      <Button
                        onClick={() =>
                          handleMeetingAction(selectedMeeting.id, 'CONFIRMED')
                        }
                        disabled={actionLoading === selectedMeeting.id}
                        className="flex-1"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        {actionLoading === selectedMeeting.id ? '처리중...' : '승인'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleMeetingAction(selectedMeeting.id, 'REJECTED')
                        }
                        disabled={actionLoading === selectedMeeting.id}
                        className="flex-1"
                      >
                        <X className="mr-2 h-4 w-4" />
                        거절
                      </Button>
                    </>
                  )}

                  {selectedMeeting.status === 'CONFIRMED' && canCancelMeeting(selectedMeeting) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          className="flex-1"
                          disabled={actionLoading === selectedMeeting.id}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          미팅 취소
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>미팅을 취소하시겠습니까?</AlertDialogTitle>
                          <AlertDialogDescription>
                            이 작업은 되돌릴 수 없습니다. 미팅이 취소되면 바이어에게 알림이 전송됩니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleMeetingAction(selectedMeeting.id, 'CANCELLED')
                            }
                            className="bg-red-600 hover:bg-red-700"
                          >
                            미팅 취소
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function MeetingList({
  meetings,
  onMeetingSelect,
  onMeetingAction,
  actionLoading,
  canCancelMeeting,
}: {
  meetings: MeetingWithDetails[]
  onMeetingSelect: (meeting: MeetingWithDetails) => void
  onMeetingAction: (meetingId: string, action: 'CONFIRMED' | 'REJECTED' | 'CANCELLED') => void
  actionLoading: string | null
  canCancelMeeting: (meeting: MeetingWithDetails) => boolean
}) {
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

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">해당하는 미팅이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {meetings.map(meeting => {
        const startDateTime = formatDateTime(meeting.timeSlot.startTime)
        const endDateTime = formatDateTime(meeting.timeSlot.endTime)
        const isLoading = actionLoading === meeting.id

        return (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {meeting.buyer.name}
                    </h3>
                    {getStatusBadge(meeting.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {meeting.buyer.email}
                      </p>
                      {meeting.buyer.description && (
                        <p className="text-sm text-gray-600">
                          소개: {meeting.buyer.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {startDateTime.date}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {startDateTime.time} - {endDateTime.time}
                      </p>
                    </div>
                  </div>

                  {meeting.message && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">메시지:</p>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        "{meeting.message}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMeetingSelect(meeting)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    상세보기
                  </Button>

                  {meeting.status === 'PENDING' && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => onMeetingAction(meeting.id, 'CONFIRMED')}
                        disabled={isLoading}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMeetingAction(meeting.id, 'REJECTED')}
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {meeting.status === 'CONFIRMED' && canCancelMeeting(meeting) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isLoading}
                        >
                          <Ban className="mr-1 h-3 w-3" />
                          취소
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>미팅을 취소하시겠습니까?</AlertDialogTitle>
                          <AlertDialogDescription>
                            이 작업은 되돌릴 수 없습니다. 미팅이 취소되면 바이어에게 알림이 전송됩니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onMeetingAction(meeting.id, 'CANCELLED')}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            미팅 취소
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {isLoading && (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}