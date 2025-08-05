"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Building2, Search, MoreHorizontal, Edit, Trash2, Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AdminHeader } from "@/components/layout/admin-header"
import { AdminGuard } from "@/components/admin/admin-guard"
import { CompanyCreateForm } from "./_components/company-create-form"
import { CompanyEditForm } from "./_components/company-edit-form"
import { ExcelUpload } from "@/components/admin/excel-upload"
import { mockApi, type Company } from "@/lib/supabase/mock-api"
import { useToast } from "@/hooks/use-toast"

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
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
      const data = await mockApi.companies.getAllIncludeInactive()
      setCompanies(data)
      setFilteredCompanies(data)
    } catch (error) {
      toast({
        title: "데이터 로딩 오류",
        description: "기업 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterCompanies = () => {
    let filtered = companies

    if (searchTerm) {
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredCompanies(filtered)
  }

  const handleStatusToggle = async (company: Company) => {
    try {
      await mockApi.companies.update(company.id, {
        is_active: !company.is_active,
      })

      toast({
        title: company.is_active ? "기업 비활성화" : "기업 활성화",
        description: `${company.name}이 ${company.is_active ? "비활성화" : "활성화"}되었습니다.`,
      })

      fetchCompanies()
    } catch (error) {
      toast({
        title: "상태 변경 실패",
        description: "기업 상태 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleEditCompany = async (updatedData: Partial<Company>) => {
    if (!selectedCompany) return

    try {
      await mockApi.companies.update(selectedCompany.id, updatedData)

      toast({
        title: "기업 정보 수정",
        description: "기업 정보가 성공적으로 수정되었습니다.",
      })

      setIsEditDialogOpen(false)
      setSelectedCompany(null)
      fetchCompanies()
    } catch (error) {
      toast({
        title: "수정 실패",
        description: "기업 정보 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleCreateCompany = async (companyData: Omit<Company, "id" | "created_at">) => {
    try {
      await mockApi.companies.create(companyData)
      toast({
        title: "기업 생성",
        description: "새로운 기업이 성공적으로 생성되었습니다.",
      })
      setIsCreateDialogOpen(false)
      fetchCompanies()
    } catch (error) {
      toast({
        title: "생성 실패",
        description: "기업 생성 중 오류가 발생했습니다.",
        variant: "destructive",
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
              <p className="mt-4 text-gray-600">기업 목록을 불러오는 중...</p>
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
          {/* 헤더 섹션 */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">기업 관리</h1>
              <p className="text-gray-600">참가 기업들을 관리하고 현황을 확인하세요.</p>
            </div>

            <div className="flex gap-2">
              {/* 새 기업 추가 다이얼로그 */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />새 기업 추가
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>새 기업 추가</DialogTitle>
                    <DialogDescription>새로운 기업을 시스템에 추가합니다.</DialogDescription>
                  </DialogHeader>
                  <CompanyCreateForm 
                    onSave={handleCreateCompany} 
                    onCancel={() => setIsCreateDialogOpen(false)} 
                  />
                </DialogContent>
              </Dialog>

              {/* Excel 업로드 다이얼로그 */}
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Excel 업로드
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>기업 Excel 업로드</DialogTitle>
                    <DialogDescription>Excel 파일을 사용하여 기업 데이터를 일괄 업로드합니다.</DialogDescription>
                  </DialogHeader>
                  <ExcelUpload
                    type="companies"
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
                  placeholder="기업명 또는 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <div className="text-2xl font-bold text-green-600">{companies.filter((c) => c.is_active).length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">검색 결과</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredCompanies.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* 기업 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>기업 목록</CardTitle>
              <CardDescription>등록된 기업들의 상세 정보를 확인하고 관리하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {searchTerm ? "검색 조건에 맞는 기업이 없습니다." : "등록된 기업이 없습니다."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {company.logo_url ? (
                            <img
                              src={company.logo_url || "/placeholder.svg"}
                              alt={`${company.name} 로고`}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <span className="text-lg font-bold text-gray-600">{company.name.charAt(0)}</span>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg">{company.name}</h3>
                            <Badge variant={company.is_active ? "default" : "secondary"}>
                              {company.is_active ? "활성" : "비활성"}
                            </Badge>
                            {company.industry && (
                              <Badge variant="outline" className="text-xs">
                                {company.industry}
                              </Badge>
                            )}
                            {company.location && (
                              <Badge variant="outline" className="text-xs">
                                {company.location}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{company.email}</p>
                          {company.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{company.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={company.is_active ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleStatusToggle(company)}
                        >
                          {company.is_active ? "비활성화" : "활성화"}
                        </Button>

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
                              onClick={() => handleStatusToggle(company)}
                              className={company.is_active ? "text-red-600" : "text-green-600"}
                            >
                              {company.is_active ? (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  비활성화
                                </>
                              ) : (
                                <>
                                  <Plus className="mr-2 h-4 w-4" />
                                  활성화
                                </>
                              )}
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
                <DialogDescription>기업의 상세 정보를 수정할 수 있습니다.</DialogDescription>
              </DialogHeader>

              {selectedCompany && (
                <CompanyEditForm
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
    </AdminGuard>
  )
}