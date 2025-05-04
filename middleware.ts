import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Logging middleware
export function middleware(request: NextRequest) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  // Log request details
  console.log(`[${requestId}] ${new Date().toISOString()} | ${request.method} ${request.nextUrl.pathname}`)

  // Handle OPTIONS preflight requests
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 })

    // Add CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
    response.headers.set("Access-Control-Max-Age", "86400") // 24 hours

    return response
  }

  // Continue to the endpoint
  const response = NextResponse.next()

  // Add custom headers
  response.headers.set("X-Request-ID", requestId)

  // Add CORS headers to all responses
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

  // Calculate response time
  const endTime = Date.now()
  const responseTime = endTime - startTime

  // Log response details
  console.log(`[${requestId}] Response Time: ${responseTime}ms | Status: ${response.status}`)

  return response
}

// Only run middleware on API routes
export const config = {
  matcher: ["/api/:path*"],
}
