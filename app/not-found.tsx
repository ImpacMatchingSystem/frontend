"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">페이지를 찾을 수 없습니다</CardTitle>
          <CardDescription>
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                홈으로 이동
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              이전 페이지
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}