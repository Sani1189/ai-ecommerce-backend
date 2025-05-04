import { NextResponse } from "next/server"
import { clearCacheByPattern } from "@/lib/redis"
import { isAdmin } from "@/lib/auth"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"

const logger = createLogger("CacheAPI")

export const GET = asyncHandler(async (req) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  const url = new URL(req.url)
  const pattern = url.searchParams.get("pattern") || "*"

  try {
    const clearedCount = await clearCacheByPattern(pattern)
    logger.info(`Cache cleared with pattern: ${pattern}, ${clearedCount} keys removed`)

    return NextResponse.json({
      success: true,
      message: `Cache cleared with pattern: ${pattern}`,
      clearedCount,
    })
  } catch (error) {
    logger.error("Failed to clear cache", { error })
    return NextResponse.json(
      {
        success: false,
        message: "Failed to clear cache",
        error: error.message,
      },
      { status: 500 },
    )
  }
})
