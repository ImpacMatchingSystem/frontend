"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, LogOut, Calendar, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuthStore } from "@/lib/store"

export function BuyerHeader() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/buyer/dashboard" className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">ImpacMatching</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/companies" className="text-sm font-medium hover:text-primary">
            참가기업
          </Link>
          <Link href="/buyer/dashboard" className="text-sm font-medium hover:text-primary">
            내 신청내역
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {user && user.role === "buyer" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/buyer/dashboard">
                    <User className="mr-2 h-4 w-4" />
                    대시보드
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/companies">
                    <Calendar className="mr-2 h-4 w-4" />
                    기업 둘러보기
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/buyer/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/companies">기업 둘러보기</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
