import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// Rate limit configuration
const RATE_LIMIT_REQUESTS = 100 // Number of requests
const RATE_LIMIT_WINDOW = 60 * 60 // Time window in seconds (1 hour)

export const rateLimiter = async (req: NextRequest) => {
  try {
    // Skip rate limiting if Redis is not configured
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn("Rate limiting disabled: Redis not configured")
      return null
    }

    // Get client IP
    const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown"

    // Create a unique key for this IP
    const key = `rate-limit:${ip}`

    // Get current count
    const currentCount = (await redis.get(key)) as number | null

    if (currentCount === null) {
      // First request, set count to 1 with expiry
      await redis.set(key, 1, { ex: RATE_LIMIT_WINDOW })
      return null
    }

    if (currentCount >= RATE_LIMIT_REQUESTS) {
      // Rate limit exceeded
      return NextResponse.json(
        { success: false, message: "Rate limit exceeded. Please try again later." },
        { status: 429 },
      )
    }

    // Increment count
    await redis.incr(key)
    return null
  } catch (error) {
    console.error("Rate limiter error:", error)
    return null // Continue on error
  }
}
