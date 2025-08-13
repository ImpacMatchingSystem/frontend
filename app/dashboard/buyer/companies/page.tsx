'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

import { Search, Grid, List, ExternalLink, Clock } from 'lucide-react'

import { BuyerHeader } from '@/components/layout/buyer-header'
import { Footer } from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'

interface Company {
  id: string
  name: string
  email: string
  role: 'COMPANY'
  description?: string
  website?: string
  createdAt: string
  timeSlots: {
    id: string
    startTime: string
    endTime: string
    isBooked: boolean
  }[]
  _count: {
    companyMeetings: number
  }
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { toast } = useToast()

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    filterCompanies()
  }, [companies, searchTerm])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')

      if (!response.ok) {
        throw new Error('기업 목록 조회 실패')
      }

      const companiesData = await response.json()

      // 배열 데이터 검증
      const validCompanies = Array.isArray(companiesData) ? companiesData : []

      setCompanies(validCompanies)
      setFilteredCompanies(validCompanies)
    } catch (error) {
      console.error('Companies fetch error:', error)
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
          (company.description &&
            company.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredCompanies(filtered)
  }

  const formatWebsiteUrl = (url?: string) => {
    if (!url) return null
    return url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `https://${url}`
  }

  const getAvailableTimeSlotsCount = (timeSlots: Company['timeSlots']) => {
    return timeSlots.filter(
      slot => !slot.isBooked && new Date(slot.startTime) > new Date()
    ).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BuyerHeader />
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
      <BuyerHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">참가기업</h1>
          <p className="text-gray-600">
            {filteredCompanies.length}개의 기업이 미팅을 기다리고 있습니다
          </p>
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
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
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
            <p className="text-gray-500 text-lg">
              {companies.length === 0
                ? '등록된 기업이 없습니다.'
                : '검색 조건에 맞는 기업이 없습니다.'}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredCompanies.map(company => {
              const availableSlots = getAvailableTimeSlotsCount(
                company.timeSlots
              )
              const websiteUrl = formatWebsiteUrl(company.website)

              return (
                <Card
                  key={company.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-600">
                            {company.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {company.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              기업
                            </Badge>
                            {availableSlots > 0 ? (
                              <Badge
                                variant="outline"
                                className="text-xs text-green-600 border-green-600"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                {availableSlots}개 시간대 가능
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs text-red-600 border-red-600"
                              >
                                예약 불가
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <CardDescription className="mb-4 line-clamp-3">
                      {company.description || '기업 소개가 없습니다.'}
                    </CardDescription>

                    <div className="text-xs text-gray-500 mb-4">
                      <p>총 미팅: {company._count.companyMeetings}회</p>
                      <p>이메일: {company.email}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      {availableSlots > 0 ? (
                        <Button asChild className="flex-1">
                          <Link
                            href={`/dashboard/buyer/companies/${company.id}/meeting`}
                          >
                            미팅 신청하기
                          </Link>
                        </Button>
                      ) : (
                        <Button disabled className="flex-1">
                          예약 불가
                        </Button>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/dashboard/buyer/companies/${company.id}`}
                          >
                            상세보기
                          </Link>
                        </Button>
                        {websiteUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="웹사이트 방문"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* 페이지 하단 정보 */}
        {filteredCompanies.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-2">미팅 신청 안내</h3>
              <p className="text-gray-600 mb-4">
                관심있는 기업을 선택하여 비즈니스 미팅을 신청해보세요.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                <div>
                  <strong className="text-gray-700">1단계:</strong> 기업 선택 및
                  상세 정보 확인
                </div>
                <div>
                  <strong className="text-gray-700">2단계:</strong> 가능한
                  시간대에서 미팅 신청
                </div>
                <div>
                  <strong className="text-gray-700">3단계:</strong> 기업 승인 후
                  미팅 확정
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
