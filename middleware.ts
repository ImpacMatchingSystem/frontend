import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // /admin 경로 접근 시 로그인 페이지로 리다이렉트 (단, /admin/login은 제외)
  if (request.nextUrl.pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
