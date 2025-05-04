import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { z } from "zod"
import { validate } from "@/lib/middleware/validator"
import { createLogger } from "@/lib/logger"
import { isAdmin } from "@/lib/auth"
import mongoose from "mongoose"

const logger = createLogger("ContactAPI")

// Contact schema
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema)

// Contact form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

// GET all contact submissions (admin only)
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
  const limit = Number.parseInt(url.searchParams.get("limit") || "20")
  const skip = (page - 1) * limit

  // Filtering
  const isRead = url.searchParams.get("isRead")

  // Build filter object
  const filter: any = {}

  if (isRead) filter.isRead = isRead === "true"

  // Execute query
  const contacts = await Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)

  // Get total count for pagination
  const total = await Contact.countDocuments(filter)

  logger.info(`Retrieved ${contacts.length} contact submissions`)

  return NextResponse.json({
    success: true,
    contacts,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  })
})

// POST submit contact form
export const POST = asyncHandler(async (req: NextRequest) => {
  await dbConnect()

  // Validate request body
  const validationResult = await validate(contactFormSchema)(req)
  if (validationResult instanceof NextResponse) {
    return validationResult
  }

  const { name, email, subject, message } = validationResult.data

  // Create contact submission
  const contact = await Contact.create({
    name,
    email,
    subject,
    message,
  })

  logger.info(`New contact form submission from: ${email}`)

  return NextResponse.json(
    {
      success: true,
      message: "Your message has been sent successfully",
    },
    { status: 201 },
  )
})
