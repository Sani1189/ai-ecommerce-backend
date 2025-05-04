import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { z } from "zod"
import { validate } from "@/lib/middleware/validator"
import { createLogger } from "@/lib/logger"
import mongoose from "mongoose"

const logger = createLogger("NewsletterAPI")

// Get Newsletter model
const Newsletter = mongoose.models.Newsletter

// Unsubscribe validation schema
const unsubscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
})

// POST unsubscribe from newsletter
export const POST = asyncHandler(async (req: NextRequest) => {
  await dbConnect()

  // Validate request body
  const validationResult = await validate(unsubscribeSchema)(req)
  if (validationResult instanceof NextResponse) {
    return validationResult
  }

  const { email } = validationResult.data

  // Find subscriber
  const subscriber = await Newsletter.findOne({ email })

  if (!subscriber) {
    return NextResponse.json(
      {
        success: false,
        message: "Email not found in our newsletter list",
      },
      { status: 404 },
    )
  }

  // Update subscriber status
  subscriber.isActive = false
  subscriber.unsubscribedAt = new Date()
  await subscriber.save()

  logger.info(`Unsubscribed from newsletter: ${email}`)

  return NextResponse.json({
    success: true,
    message: "Successfully unsubscribed from the newsletter",
  })
})
