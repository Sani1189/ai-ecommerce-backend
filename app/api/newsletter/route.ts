import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { z } from "zod"
import { validate } from "@/lib/middleware/validator"
import { createLogger } from "@/lib/logger"
import { isAdmin } from "@/lib/auth"
import mongoose from "mongoose"

const logger = createLogger("NewsletterAPI")

// Newsletter schema
const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    name: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

const Newsletter = mongoose.models.Newsletter || mongoose.model("Newsletter", newsletterSchema)

// Subscribe validation schema
const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
})

// GET all subscribers (admin only)
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
  const limit = Number.parseInt(url.searchParams.get("limit") || "100")
  const skip = (page - 1) * limit

  // Filtering
  const isActive = url.searchParams.get("isActive")

  // Build filter object
  const filter: any = {}

  if (isActive) filter.isActive = isActive === "true"

  // Execute query
  const subscribers = await Newsletter.find(filter).sort({ subscribedAt: -1 }).skip(skip).limit(limit)

  // Get total count for pagination
  const total = await Newsletter.countDocuments(filter)

  logger.info(`Retrieved ${subscribers.length} newsletter subscribers`)

  return NextResponse.json({
    success: true,
    subscribers,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  })
})

// POST subscribe to newsletter
export const POST = asyncHandler(async (req: NextRequest) => {
  await dbConnect()

  // Validate request body
  const validationResult = await validate(subscribeSchema)(req)
  if (validationResult instanceof NextResponse) {
    return validationResult
  }

  const { email, name } = validationResult.data

  // Check if already subscribed
  const existingSubscriber = await Newsletter.findOne({ email })

  if (existingSubscriber) {
    // If unsubscribed before, reactivate
    if (!existingSubscriber.isActive) {
      existingSubscriber.isActive = true
      existingSubscriber.unsubscribedAt = undefined
      await existingSubscriber.save()

      logger.info(`Reactivated newsletter subscription: ${email}`)

      return NextResponse.json({
        success: true,
        message: "Your subscription has been reactivated",
      })
    }

    // Already subscribed and active
    return NextResponse.json({
      success: true,
      message: "You are already subscribed to our newsletter",
    })
  }

  // Create new subscriber
  await Newsletter.create({
    email,
    name,
  })

  logger.info(`New newsletter subscription: ${email}`)

  return NextResponse.json(
    {
      success: true,
      message: "Successfully subscribed to the newsletter",
    },
    { status: 201 },
  )
})
