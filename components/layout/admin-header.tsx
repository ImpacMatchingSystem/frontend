'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useAuthStore } from '@/store/auth-store'
import { Shield, LogOut, BarChart3, Users, Calendar, User } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useToast } from '@/hooks/use-toast'

export function AdminHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/')
      toast({
        title: '로그아웃 완료',
        description: '성공적으로 로그아웃되었습니다.',
      })
    } catch (error) {
      toast({
        title: '로그아웃 오류',
        description: '로그아웃 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const getDashboardLink = () => {
    if (!session?.user) return '/'

    const userRole = (session.user as any).role

    switch (userRole) {
      case 'COMPANY':
        return '/dashboard/company'
      case 'BUYER':
        return '/dashboard/buyer'
      case 'ADMIN':
        return '/admin/dashboard'
      default:
        return '/'
    }
  }

  const user = session?.user

  return (
    <header className="border-b bg-white">
      <div className="container bg-white mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">ImpacMatching Admin</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 bg-white">
          <Link
            href="/admin/dashboard"
            className="text-sm font-medium hover:text-primary"
          >
            대시보드
          </Link>
          <Link
            href="/admin/events"
            className="text-sm font-medium hover:text-primary"
          >
            행사 관리
          </Link>
          <Link
            href="/admin/companies"
            className="text-sm font-medium hover:text-primary"
          >
            기업 관리
          </Link>
          <Link
            href="/admin/buyers"
            className="text-sm font-medium hover:text-primary"
          >
            바이어 관리
          </Link>
          <Link
            href="/admin/meetings"
            className="text-sm font-medium hover:text-primary"
          >
            미팅 현황
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {status === 'loading' ? (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : user ? (
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
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600"
                >
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
        </div>
      </div>
    </header>
  )
}
