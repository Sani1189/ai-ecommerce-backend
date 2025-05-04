import { type NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import dbConnect from "@/lib/db"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import mongoose from "mongoose"

const logger = createLogger("ChatbotAnalyticsAPI")

// Get ChatQuery model
const ChatQuery = mongoose.models.ChatQuery

// GET chatbot analytics (admin only)
export const GET = asyncHandler(async (req: NextRequest) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  const url = new URL(req.url)
  const period = url.searchParams.get("period") || "week"

  // Calculate date range
  const now = new Date()
  const startDate = new Date()

  switch (period) {
    case "day":
      startDate.setDate(now.getDate() - 1)
      break
    case "week":
      startDate.setDate(now.getDate() - 7)
      break
    case "month":
      startDate.setMonth(now.getMonth() - 1)
      break
    case "year":
      startDate.setFullYear(now.getFullYear() - 1)
      break
    default:
      startDate.setDate(now.getDate() - 7) // Default to week
  }

  // Get total queries count
  const totalQueries = await ChatQuery.countDocuments({
    createdAt: { $gte: startDate },
  })

  // Get intent distribution
  const intentDistribution = await ChatQuery.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: "$intent", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])

  // Get response type distribution
  const responseTypeDistribution = await ChatQuery.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: "$responseType", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])

  // Get most common queries
  const commonQueries = await ChatQuery.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: "$query", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ])

  // Get most matched products
  const topProducts = await ChatQuery.aggregate([
    { $match: { createdAt: { $gte: startDate }, matchedProducts: { $exists: true, $ne: [] } } },
    { $unwind: "$matchedProducts" },
    { $group: { _id: "$matchedProducts", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 1,
        count: 1,
        name: "$product.name",
        category: "$product.category",
      },
    },
  ])

  // Get queries by time
  const queriesByTime = await ChatQuery.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
          hour: { $hour: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } },
  ])

  logger.info(`Retrieved chatbot analytics for period: ${period}`)

  return NextResponse.json({
    success: true,
    analytics: {
      totalQueries,
      intentDistribution,
      responseTypeDistribution,
      commonQueries,
      topProducts,
      queriesByTime,
      period,
    },
  })
})
