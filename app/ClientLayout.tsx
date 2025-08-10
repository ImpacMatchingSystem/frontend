'use client'

import { SessionProvider } from 'next-auth/react'
import type React from 'react'

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
