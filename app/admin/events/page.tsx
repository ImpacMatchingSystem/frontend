'use client'

import type React from 'react'
import { useState, useEffect } from 'react'

import { Calendar, Edit, Plus, Save, X } from 'lucide-react'

import { AdminGuard } from '@/components/admin/admin-guard'
import { AdminHeader } from '@/components/layout/admin-header'
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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import { useToast } from '@/hooks/use-toast'

import { mockApi, type Event } from '@/lib/supabase/mock-api'

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const data = await mockApi.events.getAll()
      setEvents(data)
    } catch (error) {
      toast({
        title: '데이터 로딩 오류',
        description: '행사 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (
    eventData: Omit<Event, 'id' | 'created_at'>
  ) => {
    try {
      await mockApi.events.create(eventData)
      toast({
        title: '행사 생성',
        description: '새로운 행사가 성공적으로 생성되었습니다.',
      })
      setIsCreateDialogOpen(false)
      fetchEvents()
    } catch (error) {
      toast({
        title: '생성 실패',
        description: '행사 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateEvent = async (eventData: Partial<Event>) => {
    if (!selectedEvent) return

    try {
      await mockApi.events.update(selectedEvent.id, eventData)
      toast({
        title: '행사 수정',
        description: '행사 정보가 성공적으로 수정되었습니다.',
      })
      setIsEditDialogOpen(false)
      setSelectedEvent(null)
      fetchEvents()
    } catch (error) {
      toast({
        title: '수정 실패',
        description: '행사 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleToggleActive = async (event: Event) => {
    try {
      // 다른 행사들을 비활성화하고 선택한 행사만 활성화
      if (!event.is_active) {
        await Promise.all(
          events.map(e =>
            mockApi.events.update(e.id, {
              is_active: e.id === event.id,
            })
          )
        )
      } else {
        await mockApi.events.update(event.id, {
          is_active: false,
        })
      }

      toast({
        title: event.is_active ? '행사 비활성화' : '행사 활성화',
        description: `${event.title}이 ${event.is_active ? '비활성화' : '활성화'}되었습니다.`,
      })

      fetchEvents()
    } catch (error) {
      toast({
        title: '상태 변경 실패',
        description: '행사 상태 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
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
              <p className="mt-4 text-gray-600">행사 목록을 불러오는 중...</p>
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                행사 관리
              </h1>
              <p className="text-gray-600">
                비즈니스 매칭 행사를 생성하고 관리하세요.
              </p>
            </div>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />새 행사 생성
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>새 행사 생성</DialogTitle>
                  <DialogDescription>
                    새로운 비즈니스 매칭 행사를 생성합니다.
                  </DialogDescription>
                </DialogHeader>
                <EventForm
                  onSave={handleCreateEvent}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* 행사 목록 */}
          <div className="space-y-6">
            {events.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg mb-4">
                    등록된 행사가 없습니다.
                  </p>
                  <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />첫 번째 행사 생성하기
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              events.map(event => (
                <Card
                  key={event.id}
                  className={event.is_active ? 'ring-2 ring-primary' : ''}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">
                            {event.title}
                          </CardTitle>
                          {event.is_active && (
                            <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                              활성 행사
                            </span>
                          )}
                        </div>
                        <CardDescription className="text-base">
                          {event.description}
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={event.is_active ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => handleToggleActive(event)}
                        >
                          {event.is_active ? '비활성화' : '활성화'}
                        </Button>

                        <Dialog
                          open={isEditDialogOpen}
                          onOpenChange={setIsEditDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedEvent(event)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              수정
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>행사 정보 수정</DialogTitle>
                              <DialogDescription>
                                행사의 상세 정보를 수정할 수 있습니다.
                              </DialogDescription>
                            </DialogHeader>
                            {selectedEvent && (
                              <EventForm
                                event={selectedEvent}
                                onSave={handleUpdateEvent}
                                onCancel={() => {
                                  setIsEditDialogOpen(false)
                                  setSelectedEvent(null)
                                }}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* 행사 이미지 */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          행사 이미지
                        </Label>
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          {event.header_image_url ? (
                            <img
                              src={event.header_image_url || '/placeholder.svg'}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Calendar className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 행사 정보 */}
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">
                            행사 기간
                          </Label>
                          <p className="text-sm">
                            {new Date(event.start_date).toLocaleDateString(
                              'ko-KR'
                            )}{' '}
                            -{' '}
                            {new Date(event.end_date).toLocaleDateString(
                              'ko-KR'
                            )}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-600">
                            미팅 시간
                          </Label>
                          <p className="text-sm">{event.meeting_duration}분</p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-600">
                            생성일
                          </Label>
                          <p className="text-sm">
                            {new Date(event.created_at).toLocaleDateString(
                              'ko-KR'
                            )}
                          </p>
                        </div>
                      </div>

                      {/* 운영 시간 */}
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">
                            운영 시간
                          </Label>
                          <p className="text-sm">
                            {event.business_hours.start} -{' '}
                            {event.business_hours.end}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-600">
                            점심시간
                          </Label>
                          <p className="text-sm">
                            {event.business_hours.lunch_start} -{' '}
                            {event.business_hours.lunch_end}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-600">
                            상태
                          </Label>
                          <p
                            className={`text-sm ${event.is_active ? 'text-green-600' : 'text-gray-600'}`}
                          >
                            {event.is_active ? '활성' : '비활성'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}

function EventForm({
  event,
  onSave,
  onCancel,
}: {
  event?: Event
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    header_image_url: event?.header_image_url || '',
    start_date: event?.start_date || '',
    end_date: event?.end_date || '',
    meeting_duration: event?.meeting_duration || 30,
    business_hours: event?.business_hours || {
      start: '09:00',
      end: '18:00',
      lunch_start: '12:00',
      lunch_end: '13:00',
    },
    is_active: event?.is_active || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">행사명 *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={e =>
            setFormData(prev => ({ ...prev, title: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">행사 설명</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={e =>
            setFormData(prev => ({ ...prev, description: e.target.value }))
          }
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="header_image_url">헤더 이미지 URL</Label>
        <Input
          id="header_image_url"
          type="url"
          value={formData.header_image_url}
          onChange={e =>
            setFormData(prev => ({ ...prev, header_image_url: e.target.value }))
          }
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">시작일 *</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={e =>
              setFormData(prev => ({ ...prev, start_date: e.target.value }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">종료일 *</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={e =>
              setFormData(prev => ({ ...prev, end_date: e.target.value }))
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="meeting_duration">미팅 시간 (분)</Label>
        <select
          id="meeting_duration"
          value={formData.meeting_duration}
          onChange={e =>
            setFormData(prev => ({
              ...prev,
              meeting_duration: Number.parseInt(e.target.value),
            }))
          }
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value={15}>15분</option>
          <option value={30}>30분</option>
          <option value={60}>60분</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="business_start">운영 시작 시간</Label>
          <Input
            id="business_start"
            type="time"
            value={formData.business_hours.start}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                business_hours: {
                  ...prev.business_hours,
                  start: e.target.value,
                },
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_end">운영 종료 시간</Label>
          <Input
            id="business_end"
            type="time"
            value={formData.business_hours.end}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                business_hours: { ...prev.business_hours, end: e.target.value },
              }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lunch_start">점심시간 시작</Label>
          <Input
            id="lunch_start"
            type="time"
            value={formData.business_hours.lunch_start}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                business_hours: {
                  ...prev.business_hours,
                  lunch_start: e.target.value,
                },
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lunch_end">점심시간 종료</Label>
          <Input
            id="lunch_end"
            type="time"
            value={formData.business_hours.lunch_end}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                business_hours: {
                  ...prev.business_hours,
                  lunch_end: e.target.value,
                },
              }))
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={checked =>
              setFormData(prev => ({ ...prev, is_active: checked }))
            }
          />
          <Label htmlFor="is_active">활성 상태</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          취소
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          저장
        </Button>
      </div>
    </form>
  )
}
