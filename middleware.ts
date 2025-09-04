import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting store (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  auth: { limit: 20, windowMs: 15 * 60 * 1000 }, // 20 requests per 15 minutes for auth (increased for dev)
  api: { limit: 200, windowMs: 15 * 60 * 1000 }, // 200 requests per 15 minutes for API (increased for dev)
  default: { limit: 100, windowMs: 15 * 60 * 1000 } // 100 requests per 15 minutes default (increased for dev)
}

function getRateLimitConfig(pathname: string) {
  if (pathname.startsWith('/api/auth/')) {
    return RATE_LIMIT_CONFIG.auth
  }
  if (pathname.startsWith('/api/')) {
    return RATE_LIMIT_CONFIG.api
  }
  return RATE_LIMIT_CONFIG.default
}

function checkRateLimit(ip: string, pathname: string): boolean {
  const config = getRateLimitConfig(pathname)
  const key = `${ip}:${pathname}`
  
  const now = Date.now()
  const record = rateLimitMap.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + config.windowMs })
    return true
  }
  
  if (record.count >= config.limit) {
    return false
  }
  
  record.count++
  return true
}

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1'
  const pathname = request.nextUrl.pathname
  
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    // Continue to security headers
  } else {
    // Check rate limit in production
    if (!checkRateLimit(ip, pathname)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }
  
  // Security headers
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.plaid.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co https://*.plaid.com",
    "frame-src 'self' https://*.plaid.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
