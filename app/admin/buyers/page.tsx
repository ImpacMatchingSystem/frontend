'use client'

import type React from 'react'
import { useState, useEffect } from 'react'

import {
  User,
  Search,
  Filter,
  Upload,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react'

import { ExcelUpload } from '@/components/admin/excel-upload'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useToast } from '@/hooks/use-toast'

// 새로운 타입 정의 (Prisma 스키마 기반)
interface Buyer {
  id: string
  name: string
  email: string
  role: 'BUYER'
  website?: string | null
  description?: string | null
  createdAt: string
  _count?: {
    buyerMeetings: number
    companyMeetings: number
    timeSlots: number
  }
}

export default function AdminBuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [filteredBuyers, setFilteredBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchBuyers()
  }, [])

  useEffect(() => {
    filterBuyers()
  }, [buyers, searchTerm])

  const fetchBuyers = async () => {
    try {
      const response = await fetch('/api/admin/users?role=BUYER', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setBuyers(data.users || [])
    } catch (error) {
      console.error('Failed to fetch buyers:', error)
      toast({
        title: '데이터 로딩 오류',
        description: '바이어 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filterBuyers = () => {
    let filtered = buyers

    if (searchTerm) {
      filtered = filtered.filter(
        buyer =>
          buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          buyer.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredBuyers(filtered)
  }

  const handleCreateBuyer = async (buyerData: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...buyerData,
          role: 'BUYER'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '바이어 생성에 실패했습니다')
      }

      toast({
        title: '바이어 생성',
        description: '새로운 바이어가 성공적으로 생성되었습니다.',
      })
      setIsCreateDialogOpen(false)
      fetchBuyers()
    } catch (error) {
      toast({
        title: '생성 실패',
        description: error instanceof Error ? error.message : '바이어 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateBuyer = async (buyerData: Partial<Buyer>) => {
    if (!selectedBuyer) return

    try {
      const response = await fetch(`/api/admin/users/${selectedBuyer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(buyerData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '바이어 정보 수정에 실패했습니다')
      }

      toast({
        title: '바이어 정보 수정',
        description: '바이어 정보가 성공적으로 수정되었습니다.',
      })
      setIsEditDialogOpen(false)
      setSelectedBuyer(null)
      fetchBuyers()
    } catch (error) {
      toast({
        title: '수정 실패',
        description: error instanceof Error ? error.message : '바이어 정보 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteBuyer = async (buyer: Buyer) => {
    if (!confirm(`${buyer.name} 바이어를 삭제하시겠습니까?`)) return

    try {
      const response = await fetch(`/api/admin/users/${buyer.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '바이어 삭제에 실패했습니다')
      }

      toast({
        title: '바이어 삭제',
        description: `${buyer.name} 바이어가 삭제되었습니다.`,
      })
      fetchBuyers()
    } catch (error) {
      toast({
        title: '삭제 실패',
        description: error instanceof Error ? error.message : '바이어 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50">
          <AdminHeader />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">바이어 목록을 불러오는 중...</p>
            </div>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                바이어 관리
              </h1>
              <p className="text-gray-600">
                바이어들을 관리하고 현황을 확인하세요.
              </p>
            </div>

            <div className="flex gap-2">
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />새 바이어 추가
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>새 바이어 추가</DialogTitle>
                    <DialogDescription>
                      새로운 바이어를 시스템에 추가합니다.
                    </DialogDescription>
                  </DialogHeader>
                  <BuyerForm
                    onSave={handleCreateBuyer}
                    onCancel={() => setIsCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog
                open={isUploadDialogOpen}
                onOpenChange={setIsUploadDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Excel 업로드
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>바이어 Excel 업로드</DialogTitle>
                    <DialogDescription>
                      Excel 파일을 사용하여 바이어 데이터를 일괄 업로드합니다.
                    </DialogDescription>
                  </DialogHeader>
                  <ExcelUpload
                    type="BUYER"
                    onUploadComplete={() => {
                      setIsUploadDialogOpen(false)
                      fetchBuyers()
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* 필터 및 검색 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                검색
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="바이어명, 이메일 또는 소개로 검색..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  총 바이어 수
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{buyers.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">활성 바이어</CardTitle>
                <User className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {buyers.filter(b => b._count && b._count.buyerMeetings > 0).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">검색 결과</CardTitle>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredBuyers.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 바이어 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>바이어 목록</CardTitle>
              <CardDescription>
                등록된 바이어들의 상세 정보를 확인하고 관리하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBuyers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {searchTerm ? '검색 조건에 맞는 바이어가 없습니다.' : '등록된 바이어가 없습니다.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBuyers.map(buyer => (
                    <div
                      key={buyer.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg">
                              {buyer.name}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              바이어
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{buyer.email}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            {buyer.website && (
                              <span>🌐 <a href={buyer.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">{buyer.website}</a></span>
                            )}
                            {buyer._count && (
                              <span>📅 미팅 {buyer._count.buyerMeetings}건</span>
                            )}
                          </div>
                          {buyer.description && (
                            <p className="text-sm text-gray-600 mt-1">{buyer.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBuyer(buyer)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteBuyer(buyer)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 바이어 수정 다이얼로그 */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>바이어 정보 수정</DialogTitle>
                <DialogDescription>
                  바이어의 상세 정보를 수정할 수 있습니다.
                </DialogDescription>
              </DialogHeader>

              {selectedBuyer && (
                <BuyerForm
                  buyer={selectedBuyer}
                  onSave={handleUpdateBuyer}
                  onCancel={() => {
                    setIsEditDialogOpen(false)
                    setSelectedBuyer(null)
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
  )
}

function BuyerForm({
  buyer,
  onSave,
  onCancel,
}: {
  buyer?: Buyer
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: buyer?.name || '',
    email: buyer?.email || '',
    password: '', // 수정 시에는 비밀번호 변경할 때만 입력
    website: buyer?.website || '',
    description: buyer?.description || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 비밀번호가 비어있으면 제외 (수정 시)
    const submitData = buyer && !formData.password 
      ? { ...formData, password: undefined }
      : formData
      
    onSave(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">이름 *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e =>
              setFormData(prev => ({ ...prev, name: e.target.value }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">이메일 *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={e =>
              setFormData(prev => ({ ...prev, email: e.target.value }))
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          비밀번호 {buyer ? '(변경할 때만 입력)' : '*'}
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={e =>
            setFormData(prev => ({ ...prev, password: e.target.value }))
          }
          required={!buyer}
          placeholder={buyer ? '변경하려면 새 비밀번호 입력' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">웹사이트</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={e =>
            setFormData(prev => ({ ...prev, website: e.target.value }))
          }
          placeholder="https://example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">소개</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={e =>
            setFormData(prev => ({ ...prev, description: e.target.value }))
          }
          placeholder="바이어 소개를 입력하세요"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">저장</Button>
      </div>
    </form>
  )
}