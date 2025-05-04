import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import { NotificationService } from "@/lib/notifications"
import { ApiError } from "@/lib/middleware/errorHandler"

const logger = createLogger("NotificationsAPI")

// PUT mark notification as read
export const PUT = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  // Check if user is authenticated
  const authResult = await isAuthenticated(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  const { id } = params
  const userId = authResult.user._id.toString()

  // Mark notification as read
  const success = await NotificationService.markAsRead(userId, id)

  if (!success) {
    throw new ApiError("Notification not found", 404)
  }

  logger.info(`Marked notification as read: ${id}`, { userId })

  return NextResponse.json({
    success: true,
    message: "Notification marked as read",
  })
})
