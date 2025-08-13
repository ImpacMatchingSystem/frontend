'use client'

import { signIn, getSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useState, useEffect } from 'react'

import { Building2, Eye, EyeOff, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const router = useRouter()
  const { toast } = useToast()

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    const session = await getSession()
    if (session?.user) {
      redirectToDashboard((session.user as any).role)
    }
  }

  const redirectToDashboard = (role: string) => {
    switch (role) {
      case 'COMPANY':
        router.push('/dashboard/company')
        break
      case 'BUYER':
        router.push('/dashboard/buyer')
        break
      case 'ADMIN':
        router.push('/admin/dashboard')
        break
      default:
        router.push('/')
    }
  }

  // 테스트 데이터 초기화 (관리자 기능)
  const handleResetData = async () => {
    setIsResetting(true)

    try {
      const response = await fetch('/api/admin/reset-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast({
          title: '데이터 초기화 완료',
          description: '모든 테스트 데이터가 초기화되었습니다.',
        })
      } else {
        throw new Error('초기화 실패')
      }
    } catch (error) {
      toast({
        title: '초기화 실패',
        description: '데이터 초기화 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsResetting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast({
        title: '입력 오류',
        description: '이메일과 비밀번호를 모두 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      // NextAuth signIn 사용
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false, // 수동으로 리다이렉트 처리
      })

      if (result?.error) {
        toast({
          title: '로그인 실패',
          description: '이메일 또는 비밀번호가 올바르지 않습니다.',
          variant: 'destructive',
        })
      } else if (result?.ok) {
        // 로그인 성공 후 세션 정보 가져오기
        const session = await getSession()

        if (session?.user) {
          toast({
            title: '로그인 성공',
            description: `${session.user.name}님, 환영합니다!`,
          })

          // role에 따라 적절한 대시보드로 리다이렉트
          redirectToDashboard((session.user as any).role)
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: '로그인 오류',
        description: '로그인 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">ImpacMatching</span>
          </Link>
          <p className="text-gray-600 mt-2">계정에 로그인하세요</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>로그인</CardTitle>
            <CardDescription>
              이메일과 비밀번호를 입력하여 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@example.com"
                  value={formData.email}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>

              <div className="space-y-3 text-sm text-gray-600 bg-blue-50 p-4 rounded-md">
                <div>
                  <strong>테스트 계정 (시드 데이터):</strong>
                </div>
                <div>
                  <strong>기업 계정:</strong>
                  <br />
                  이메일: contact@aistartup.com
                  <br />
                  비밀번호: company123!
                </div>
                <div>
                  <strong>바이어 계정:</strong>
                  <br />
                  이메일: investor1@example.com
                  <br />
                  비밀번호: buyer123!
                </div>
                <div>
                  <strong>관리자 계정:</strong>
                  <br />
                  이메일: admin@impac.co.kr
                  <br />
                  비밀번호: admin123
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  * 이 계정들은 데이터베이스 시드로 생성됩니다
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleResetData}
                className="w-full bg-transparent"
                disabled={isResetting}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isResetting ? 'animate-spin' : ''}`}
                />
                {isResetting ? '초기화 중...' : '테스트 데이터 초기화'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-primary">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
