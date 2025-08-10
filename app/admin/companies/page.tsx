'use client'

import type React from 'react'
import { useState, useEffect } from 'react'

import {
  Building2,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Upload,
  Globe,
  Users,
  Calendar,
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
interface Company {
  id: string
  name: string
  email: string
  role: 'COMPANY'
  website?: string | null
  description?: string | null
  createdAt: string
  _count?: {
    buyerMeetings: number
    companyMeetings: number
    timeSlots: number
  }
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    filterCompanies()
  }, [companies, searchTerm])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/admin/users?role=COMPANY', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setCompanies(data.users || [])
    } catch (error) {
      console.error('Failed to fetch companies:', error)
      toast({
        title: '데이터 로딩 오류',
        description: '기업 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filterCompanies = () => {
    let filtered = companies

    if (searchTerm) {
      filtered = filtered.filter(
        company =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredCompanies(filtered)
  }

  const handleEditCompany = async (updatedData: Partial<Company>) => {
    if (!selectedCompany) return

    try {
      const response = await fetch(`/api/admin/users/${selectedCompany.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '기업 정보 수정에 실패했습니다')
      }

      toast({
        title: '기업 정보 수정',
        description: '기업 정보가 성공적으로 수정되었습니다.',
      })

      setIsEditDialogOpen(false)
      setSelectedCompany(null)
      fetchCompanies()
    } catch (error) {
      toast({
        title: '수정 실패',
        description:
          error instanceof Error
            ? error.message
            : '기업 정보 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleCreateCompany = async (companyData: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...companyData,
          role: 'COMPANY',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '기업 생성에 실패했습니다')
      }

      toast({
        title: '기업 생성',
        description: '새로운 기업이 성공적으로 생성되었습니다.',
      })
      setIsCreateDialogOpen(false)
      fetchCompanies()
    } catch (error) {
      toast({
        title: '생성 실패',
        description:
          error instanceof Error
            ? error.message
            : '기업 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteCompany = async (company: Company) => {
    if (
      !confirm(
        `${company.name} 기업을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
      )
    )
      return

    try {
      const response = await fetch(`/api/admin/users/${company.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '기업 삭제에 실패했습니다')
      }

      toast({
        title: '기업 삭제',
        description: `${company.name} 기업이 삭제되었습니다.`,
      })
      fetchCompanies()
    } catch (error) {
      toast({
        title: '삭제 실패',
        description:
          error instanceof Error
            ? error.message
            : '기업 삭제 중 오류가 발생했습니다.',
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
            <p className="mt-4 text-gray-600">기업 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="container mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">기업 관리</h1>
            <p className="text-gray-600">
              참가 기업들을 관리하고 현황을 확인하세요.
            </p>
          </div>

          <div className="flex gap-2">
            {/* 새 기업 추가 다이얼로그 */}
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />새 기업 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>새 기업 추가</DialogTitle>
                  <DialogDescription>
                    새로운 기업을 시스템에 추가합니다.
                  </DialogDescription>
                </DialogHeader>
                <CompanyForm
                  onSave={handleCreateCompany}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>

            {/* Excel 업로드 다이얼로그 */}
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
                  <DialogTitle>기업 Excel 업로드</DialogTitle>
                  <DialogDescription>
                    Excel 파일을 사용하여 기업 데이터를 일괄 업로드합니다.
                  </DialogDescription>
                </DialogHeader>
                <ExcelUpload
                  type="COMPANY"
                  onUploadComplete={() => {
                    setIsUploadDialogOpen(false)
                    fetchCompanies()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 검색 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              검색
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="기업명, 이메일 또는 소개로 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 기업 수</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 기업</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {
                  companies.filter(c => c._count && c._count.timeSlots > 0)
                    .length
                }
              </div>
              <p className="text-xs text-muted-foreground">시간대 등록 완료</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 미팅</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {companies.reduce(
                  (sum, c) => sum + (c._count?.companyMeetings || 0),
                  0
                )}
              </div>
              <p className="text-xs text-muted-foreground">확정된 미팅</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">검색 결과</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredCompanies.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 기업 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>기업 목록</CardTitle>
            <CardDescription>
              등록된 기업들의 상세 정보를 확인하고 관리하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchTerm
                    ? '검색 조건에 맞는 기업이 없습니다.'
                    : '등록된 기업이 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCompanies.map(company => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-600">
                          {company.name.charAt(0)}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">
                            {company.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            기업
                          </Badge>
                          {company._count && company._count.timeSlots > 0 && (
                            <Badge
                              variant="default"
                              className="text-xs bg-green-100 text-green-800"
                            >
                              활성
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{company.email}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          {company.website && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600"
                              >
                                웹사이트
                              </a>
                            </span>
                          )}
                          {company._count && (
                            <>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                시간대 {company._count.timeSlots}개
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                미팅 {company._count.companyMeetings}건
                              </span>
                            </>
                          )}
                        </div>
                        {company.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {company.description}
                          </p>
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
                              setSelectedCompany(company)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteCompany(company)}
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

        {/* 기업 수정 다이얼로그 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>기업 정보 수정</DialogTitle>
              <DialogDescription>
                기업의 상세 정보를 수정할 수 있습니다.
              </DialogDescription>
            </DialogHeader>

            {selectedCompany && (
              <CompanyForm
                company={selectedCompany}
                onSave={handleEditCompany}
                onCancel={() => {
                  setIsEditDialogOpen(false)
                  setSelectedCompany(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// 기업 폼 컴포넌트
function CompanyForm({
  company,
  onSave,
  onCancel,
}: {
  company?: Company
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    email: company?.email || '',
    password: '', // 수정 시에는 비밀번호 변경할 때만 입력
    website: company?.website || '',
    description: company?.description || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 비밀번호가 비어있으면 제외 (수정 시)
    const submitData =
      company && !formData.password
        ? { ...formData, password: undefined }
        : formData

    onSave(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">기업명 *</Label>
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
          <Label htmlFor="email">기업 이메일 *</Label>
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
          비밀번호 {company ? '(변경할 때만 입력)' : '*'}
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={e =>
            setFormData(prev => ({ ...prev, password: e.target.value }))
          }
          required={!company}
          placeholder={company ? '변경하려면 새 비밀번호 입력' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">기업 홈페이지</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={e =>
            setFormData(prev => ({ ...prev, website: e.target.value }))
          }
          placeholder="https://company.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">기업 소개</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={e =>
            setFormData(prev => ({ ...prev, description: e.target.value }))
          }
          placeholder="기업 소개를 입력하세요"
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
