'use client'

import type React from 'react'
import { SessionProvider } from 'next-auth/react'

import { Toaster } from '@/components/ui/toaster'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
    </SessionProvider>
  )
}