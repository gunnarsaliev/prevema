import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to protect /dash routes
 * Checks for PayloadCMS session cookie before allowing access
 * Provides an early redirect for unauthenticated users
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the request is for /dash routes
  if (pathname.startsWith('/dash')) {
    // Check for PayloadCMS session cookie
    const payloadToken = request.cookies.get('payload-token')

    // If no session token, redirect to admin login
    if (!payloadToken) {
      const loginUrl = new URL('/admin/login', request.url)
      // Store the original URL to redirect back after login
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

/**
 * Configure which routes the middleware runs on
 * Matches all /dash routes
 */
export const config = {
  matcher: ['/dash/:path*'],
}
