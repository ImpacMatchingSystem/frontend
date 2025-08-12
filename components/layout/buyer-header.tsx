'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useAuthStore } from '@/store/auth-store'
import { User, LogOut, Calendar, Building2, CalendarCheck } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut, useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'

export function BuyerHeader() {
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

  const user = session?.user

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">ImpacMatching</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/dashboard/buyer"
            className="text-sm font-medium hover:text-primary"
          >
            신청내역
          </Link>
          <Link
            href="/dashboard/buyer/companies"
            className="text-sm font-medium hover:text-primary"
          >
            참가기업
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
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/buyer">
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    신청내역
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/buyer/companies">
                    <Calendar className="mr-2 h-4 w-4" />
                    기업 둘러보기
                  </Link>
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
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/buyer/companies">기업 둘러보기</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
