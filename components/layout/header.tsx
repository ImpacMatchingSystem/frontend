"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, Menu, X, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, clearUser } = useAuthStore()
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = () => {
    clearUser()
    router.push("/")
    toast({
      title: "로그아웃 완료",
      description: "성공적으로 로그아웃되었습니다.",
    })
  }

  const getDashboardLink = () => {
    if (!user) return "/"

    switch (user.role) {
      case "company":
        return "/company/dashboard"
      case "buyer":
        return "/buyer/dashboard"
      case "admin":
        return "/admin/dashboard"
      default:
        return "/"
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-900">ImpacMatching</span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/companies" className="text-gray-600 hover:text-gray-900 transition-colors">
              기업 목록
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white w-48">
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      대시보드
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">로그인</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                href="/companies"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                기업 목록
              </Link>
              {user ? (
                <>
                  <Link
                    href={getDashboardLink()}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    대시보드
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleSignOut()
                      setIsMenuOpen(false)
                    }}
                    className="justify-start text-red-600"
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      로그인
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
