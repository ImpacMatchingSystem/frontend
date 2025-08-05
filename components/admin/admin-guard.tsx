"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"

interface AdminGuardProps {
  children: React.ReactNode
}

/** 관리자 인증 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/admin/login")
    }
  }, [user, router])

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
