"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BuyerLoginPage() {
  const router = useRouter()

  useEffect(() => {
    // 통합 로그인 페이지로 리다이렉트
    router.replace("/login")
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">로그인 페이지로 이동 중...</p>
      </div>
    </div>
  )
}
