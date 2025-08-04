"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Grid, List, ExternalLink, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { mockApi, type Company } from "@/lib/mock-api"
import { useToast } from "@/hooks/use-toast"

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const { toast } = useToast()

  useEffect(() => {
    fetchCompanies()
  }, [])


  const fetchCompanies = async () => {
    try {
      const data = await mockApi.companies.getAll()
      setCompanies(data)
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
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">참가기업</h1>
          <p className="text-gray-600">{filteredCompanies.length}개의 기업이 미팅을 기다리고 있습니다</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="기업명 또는 설명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Companies Grid/List */}
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">검색 조건에 맞는 기업이 없습니다.</p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
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
                      <div>
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {company.industry && (
                            <Badge variant="secondary" className="text-xs">
                              {company.industry}
                            </Badge>
                          )}
                          {company.location && (
                            <Badge variant="outline" className="text-xs">
                              {company.location}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription className="mb-4 line-clamp-2">
                    {company.description || "기업 소개가 없습니다."}
                  </CardDescription>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/companies/${company.id}/meeting`}>미팅 신청하기</Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/companies/${company.id}`}>상세보기</Link>
                      </Button>
                      {company.website_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
