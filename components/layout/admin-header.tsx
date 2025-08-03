"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield, LogOut, BarChart3, Users, Calendar } from "lucide-react"
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

export function AdminHeader() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">ImpacMatching Admin</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary">
            대시보드
          </Link>
          <Link href="/admin/events" className="text-sm font-medium hover:text-primary">
            행사 관리
          </Link>
          <Link href="/admin/companies" className="text-sm font-medium hover:text-primary">
            기업 관리
          </Link>
          <Link href="/admin/buyers" className="text-sm font-medium hover:text-primary">
            바이어 관리
          </Link>
          <Link href="/admin/meetings" className="text-sm font-medium hover:text-primary">
            미팅 현황
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {user && user.role === "admin" ? (
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
                  <Link href="/admin/dashboard">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    대시보드
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/companies">
                    <Users className="mr-2 h-4 w-4" />
                    기업 관리
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/buyers">
                    <Users className="mr-2 h-4 w-4" />
                    바이어 관리
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/meetings">
                    <Calendar className="mr-2 h-4 w-4" />
                    미팅 현황
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
            <Button asChild>
              <Link href="/admin/login">로그인</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
