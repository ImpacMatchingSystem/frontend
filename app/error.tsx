"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">오류가 발생했습니다</CardTitle>
          <CardDescription>
            예상치 못한 오류가 발생했습니다. 다시 시도해 주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs font-mono text-muted-foreground">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button 
              onClick={reset} 
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 시도
            </Button>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline"
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              홈으로
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
