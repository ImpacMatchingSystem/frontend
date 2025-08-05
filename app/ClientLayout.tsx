"use client"

import type React from "react"

import { useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import { mockApi } from "@/lib/supabase/mock-api"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  useEffect(() => {
    // 앱 시작 시 모킹 데이터 초기화
    mockApi.init()
  }, [])

  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
