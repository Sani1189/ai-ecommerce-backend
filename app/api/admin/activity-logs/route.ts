import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import { isAdmin } from "@/lib/auth"
import mongoose from "mongoose"

const logger = createLogger("ActivityLogsAPI")

// Activity Log schema
const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["create", "update", "delete", "login", "logout", "other"],
    },
    resourceType: {
      type: String,
      required: true,
      enum: ["product", "user", "order", "review", "coupon", "other"],
    },
    resourceId: {
      type: String,
    },
    details: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  { timestamps: true },
)

const ActivityLog = mongoose.models.ActivityLog || mongoose.model("ActivityLog", activityLogSchema)

// GET all activity logs (admin only)
export const GET = asyncHandler(async (req: NextRequest) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  const url = new URL(req.url)

  // Pagination
  const page = Number.parseInt(url.searchParams.get("page") || "1")
  const limit = Number.parseInt(url.searchParams.get("limit") || "50")
  const skip = (page - 1) * limit

  // Filtering
  const action = url.searchParams.get("action")
  const resourceType = url.searchParams.get("resourceType")
  const userId = url.searchParams.get("userId")
  const startDate = url.searchParams.get("startDate")
  const endDate = url.searchParams.get("endDate")

  // Build filter object
  const filter: any = {}

  if (action) filter.action = action
  if (resourceType) filter.resourceType = resourceType
  if (userId) filter.user = userId

  if (startDate || endDate) {
    filter.createdAt = {}
    if (startDate) filter.createdAt.$gte = new Date(startDate)
    if (endDate) filter.createdAt.$lte = new Date(endDate)
  }

  // Execute query
  const logs = await ActivityLog.find(filter)
    .populate("user", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  // Get total count for pagination
  const total = await ActivityLog.countDocuments(filter)

  logger.info(`Retrieved ${logs.length} activity logs`)

  return NextResponse.json({
    success: true,
    logs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  })
})

// POST create activity log
export const POST = asyncHandler(async (req: NextRequest) => {
  // Check if user is authenticated
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  const { action, resourceType, resourceId, details } = await req.json()

  // Create activity log
  const log = await ActivityLog.create({
    user: authResult.user._id,
    action,
    resourceType,
    resourceId,
    details,
    ipAddress: req.ip || req.headers.get("x-forwarded-for") || "unknown",
    userAgent: req.headers.get("user-agent") || "unknown",
  })

  logger.info(`Activity log created: ${action} ${resourceType}`, {
    userId: authResult.user._id,
    resourceId,
  })

  return NextResponse.json(
    {
      success: true,
      log,
    },
    { status: 201 },
  )
})
