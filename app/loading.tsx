import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold text-foreground">로딩 중...</h2>
          <p className="text-sm text-muted-foreground">
            잠시만 기다려 주세요
          </p>
        </div>
      </div>
    </div>
  )
}