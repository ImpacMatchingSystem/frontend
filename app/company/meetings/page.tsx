"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, User, Mail, Phone, Building, MessageSquare, Check, X, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/layout/header"
import { mockApi, type Meeting, type Buyer } from "@/lib/mock-api"
import { useAuthStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface MeetingWithBuyer extends Meeting {
  buyer: Buyer
}

export default function CompanyMeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingWithBuyer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingWithBuyer | null>(null)
  const [responseMessage, setResponseMessage] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { user } = useAuthStore()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchMeetings()
    }
  }, [user])

  const fetchMeetings = async () => {
    if (!user) return

    try {
      const company = await mockApi.companies.getByEmail(user.email)
      if (!company) return

      const meetingList = await mockApi.meetings.getByCompanyId(company.id)
      const buyers = await mockApi.buyers.getAll()

      const meetingsWithBuyers: MeetingWithBuyer[] = meetingList
        .map((meeting) => {
          const buyer = buyers.find((b) => b.id === meeting.buyer_id)
          return { ...meeting, buyer: buyer! }
        })
        .filter((m) => m.buyer)

      setMeetings(meetingsWithBuyers)
    } catch (error) {
      toast({
        title: "데이터 로딩 오류",
        description: "미팅 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMeetingAction = async (meetingId: string, action: "confirmed" | "rejected") => {
    try {
      const updateData: Partial<Meeting> = {
        status: action,
      }

      if (action === "confirmed" && responseMessage) {
        updateData.company_response = responseMessage
      } else if (action === "rejected" && rejectionReason) {
        updateData.rejection_reason = rejectionReason
      }

      await mockApi.meetings.update(meetingId, updateData)

      toast({
        title: action === "confirmed" ? "미팅 승인" : "미팅 거절",
        description: `미팅이 ${action === "confirmed" ? "승인" : "거절"}되었습니다.`,
      })

      setSelectedMeeting(null)
      setResponseMessage("")
      setRejectionReason("")
      fetchMeetings()
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

  const filteredMeetings = meetings.filter((meeting) => {
    if (statusFilter === "all") return true
    return meeting.status === statusFilter
  })

  const groupedMeetings = {
    pending: filteredMeetings.filter((m) => m.status === "pending"),
    confirmed: filteredMeetings.filter((m) => m.status === "confirmed"),
    rejected: filteredMeetings.filter((m) => m.status === "rejected"),
    completed: filteredMeetings.filter((m) => m.status === "completed"),
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">미팅 목록을 불러오는 중...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">미팅 관리</h1>
          <p className="text-gray-600">받은 미팅 신청을 관리하고 일정을 확인하세요.</p>
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
                <SelectItem value="pending">대기중</SelectItem>
                <SelectItem value="confirmed">승인됨</SelectItem>
                <SelectItem value="rejected">거절됨</SelectItem>
                <SelectItem value="completed">완료됨</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">전체 ({filteredMeetings.length})</TabsTrigger>
            <TabsTrigger value="pending">대기중 ({groupedMeetings.pending.length})</TabsTrigger>
            <TabsTrigger value="confirmed">승인됨 ({groupedMeetings.confirmed.length})</TabsTrigger>
            <TabsTrigger value="rejected">거절됨 ({groupedMeetings.rejected.length})</TabsTrigger>
            <TabsTrigger value="completed">완료됨 ({groupedMeetings.completed.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <MeetingList
              meetings={filteredMeetings}
              onMeetingSelect={setSelectedMeeting}
              onMeetingAction={handleMeetingAction}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <MeetingList
              meetings={groupedMeetings.pending}
              onMeetingSelect={setSelectedMeeting}
              onMeetingAction={handleMeetingAction}
            />
          </TabsContent>

          <TabsContent value="confirmed" className="mt-6">
            <MeetingList
              meetings={groupedMeetings.confirmed}
              onMeetingSelect={setSelectedMeeting}
              onMeetingAction={handleMeetingAction}
            />
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <MeetingList
              meetings={groupedMeetings.rejected}
              onMeetingSelect={setSelectedMeeting}
              onMeetingAction={handleMeetingAction}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <MeetingList
              meetings={groupedMeetings.completed}
              onMeetingSelect={setSelectedMeeting}
              onMeetingAction={handleMeetingAction}
            />
          </TabsContent>
        </Tabs>

        {/* 미팅 상세 다이얼로그 */}
        <Dialog open={!!selectedMeeting} onOpenChange={() => setSelectedMeeting(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>미팅 상세 정보</DialogTitle>
              <DialogDescription>미팅 신청 내용을 확인하고 승인 또는 거절하세요.</DialogDescription>
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
                      <p className="font-medium">{selectedMeeting.buyer.name}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {selectedMeeting.buyer.email}
                      </p>
                      {selectedMeeting.buyer.phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {selectedMeeting.buyer.phone}
                        </p>
                      )}
                      {selectedMeeting.buyer.company_name && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {selectedMeeting.buyer.company_name}
                          {selectedMeeting.buyer.position && ` (${selectedMeeting.buyer.position})`}
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
                        {new Date(selectedMeeting.meeting_time).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "long",
                        })}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(selectedMeeting.meeting_time).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(selectedMeeting.end_time).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="pt-2">{getStatusBadge(selectedMeeting.status)}</div>
                    </div>
                  </div>
                </div>

                {/* 바이어 메시지 */}
                {selectedMeeting.buyer_message && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      바이어 메시지
                    </Label>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">{selectedMeeting.buyer_message}</p>
                    </div>
                  </div>
                )}

                {/* 기업 응답 */}
                {selectedMeeting.company_response && (
                  <div className="space-y-2">
                    <Label>기업 응답</Label>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm">{selectedMeeting.company_response}</p>
                    </div>
                  </div>
                )}

                {/* 거절 사유 */}
                {selectedMeeting.rejection_reason && (
                  <div className="space-y-2">
                    <Label>거절 사유</Label>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm">{selectedMeeting.rejection_reason}</p>
                    </div>
                  </div>
                )}

                {/* 액션 버튼 */}
                {selectedMeeting.status === "pending" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="response">승인 메시지 (선택사항)</Label>
                      <Textarea
                        id="response"
                        placeholder="바이어에게 전달할 메시지를 입력하세요..."
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => handleMeetingAction(selectedMeeting.id, "confirmed")} className="flex-1">
                        <Check className="mr-2 h-4 w-4" />
                        승인
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1 bg-transparent">
                            <X className="mr-2 h-4 w-4" />
                            거절
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>미팅 거절</DialogTitle>
                            <DialogDescription>미팅을 거절하는 사유를 입력해주세요.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="rejection">거절 사유</Label>
                              <Textarea
                                id="rejection"
                                placeholder="거절 사유를 입력하세요..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                              />
                            </div>
                            <Button
                              onClick={() => handleMeetingAction(selectedMeeting.id, "rejected")}
                              variant="destructive"
                              className="w-full"
                            >
                              거절하기
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
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
}

function MeetingList({
  meetings,
  onMeetingSelect,
  onMeetingAction,
}: {
  meetings: MeetingWithBuyer[]
  onMeetingSelect: (meeting: MeetingWithBuyer) => void
  onMeetingAction: (meetingId: string, action: "confirmed" | "rejected") => void
}) {
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

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">해당하는 미팅이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <Card key={meeting.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{meeting.buyer.name}</h3>
                  {getStatusBadge(meeting.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {meeting.buyer.email}
                    </p>
                    {meeting.buyer.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {meeting.buyer.phone}
                      </p>
                    )}
                    {meeting.buyer.company_name && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {meeting.buyer.company_name}
                        {meeting.buyer.position && ` (${meeting.buyer.position})`}
                      </p>
                    )}
                  </div>

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
                </div>

                {meeting.buyer_message && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">메시지:</p>
                    <p className="text-sm bg-gray-50 p-2 rounded">"{meeting.buyer_message}"</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Button variant="outline" size="sm" onClick={() => onMeetingSelect(meeting)}>
                  상세보기
                </Button>

                {meeting.status === "pending" && (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => onMeetingAction(meeting.id, "confirmed")}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onMeetingAction(meeting.id, "rejected")}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
