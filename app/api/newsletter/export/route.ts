import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import { isAdmin } from "@/lib/auth"
import mongoose from "mongoose"
import { Parser } from "json2csv"

const logger = createLogger("NewsletterAPI")

// Get Newsletter model
const Newsletter = mongoose.models.Newsletter

// GET export subscribers as CSV (admin only)
export const GET = asyncHandler(async (req: NextRequest) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  const url = new URL(req.url)
  const isActive = url.searchParams.get("isActive")

  // Build filter object
  const filter: any = {}

  if (isActive) filter.isActive = isActive === "true"

  // Get all subscribers
  const subscribers = await Newsletter.find(filter).sort({ subscribedAt: -1 })

  // Convert to CSV
  const fields = ["email", "name", "isActive", "subscribedAt", "unsubscribedAt", "createdAt", "updatedAt"]
  const json2csvParser = new Parser({ fields })
  const csv = json2csvParser.parse(subscribers)

  logger.info(`Exported ${subscribers.length} newsletter subscribers to CSV`)

  // Set headers for file download
  const response = new NextResponse(csv)
  response.headers.set("Content-Type", "text/csv")
  response.headers.set("Content-Disposition", `attachment; filename="newsletter_subscribers_${Date.now()}.csv"`)

  return response
})
