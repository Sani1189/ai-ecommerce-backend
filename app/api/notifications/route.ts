import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import { NotificationService } from "@/lib/notifications"

const logger = createLogger("NotificationsAPI")

// GET user notifications
export const GET = asyncHandler(async (req: NextRequest) => {
  // Check if user is authenticated
  const authResult = await isAuthenticated(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  const url = new URL(req.url)
  const limit = Number.parseInt(url.searchParams.get("limit") || "20")

  // Get user notifications
  const notifications = await NotificationService.getUserNotifications(authResult.user._id.toString(), limit)

  logger.info(`Retrieved ${notifications.length} notifications for user`, {
    userId: authResult.user._id,
  })

  return NextResponse.json({
    success: true,
    notifications,
  })
})
