"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { signInAdmin } from "@/lib/auth"
import { useAuthStore } from "@/lib/store"

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const router = useRouter()
  const { toast } = useToast()
  const { user, setUser } = useAuthStore()

  // 이미 로그인된 관리자는 대시보드로 리다이렉트
  useEffect(() => {
    if (user && user.role === "admin") {
      router.push("/admin/dashboard")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const adminUser = await signInAdmin(formData.email, formData.password)

      if (adminUser) {
        setUser(adminUser)
        toast({
          title: "로그인 성공",
          description: `${adminUser.name}님, 관리자 페이지에 오신 것을 환영합니다!`,
        })
        router.push("/admin/dashboard")
      } else {
        toast({
          title: "로그인 실패",
          description: "이메일 또는 비밀번호가 올바르지 않습니다.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "로그인 오류",
        description: "로그인 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 text-white">
            <Shield className="h-10 w-10" />
            <span className="text-3xl font-bold">Admin Portal</span>
          </div>
          <p className="text-slate-300 mt-2">ImpacMatching 관리자 로그인</p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center">관리자 로그인</CardTitle>
            <CardDescription className="text-center">관리자 계정으로 로그인하여 시스템을 관리하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "로그인 중..." : "관리자 로그인"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">테스트 계정:</p>
              <p className="text-sm text-blue-700">
                이메일: admin@impacmatching.com
                <br />
                비밀번호: password
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" asChild className="text-slate-300 hover:text-white">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              메인 사이트로 돌아가기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
