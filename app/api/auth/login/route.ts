import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import { generateToken } from "@/lib/auth"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { z } from "zod"
import { validate } from "@/lib/middleware/validator"
import { createLogger } from "@/lib/logger"

const logger = createLogger("AuthAPI")

// Login validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const POST = asyncHandler(async (req: NextRequest) => {
  await dbConnect()

  // Validate request body
  const validationResult = await validate(loginSchema)(req)
  if (validationResult instanceof NextResponse) {
    return validationResult
  }

  const { email, password } = validationResult.data

  // Find user
  const user = await User.findOne({ email }).select("+password")

  if (!user) {
    logger.warn(`Login attempt with non-existent email: ${email}`)
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
  }

  // Check password
  const isMatch = await user.comparePassword(password)

  if (!isMatch) {
    logger.warn(`Failed login attempt for user: ${email}`)
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
  }

  // Generate token
  const token = generateToken(user._id.toString())

  logger.info(`User logged in: ${email}`, { userId: user._id })

  // Set cookie
  const response = NextResponse.json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/",
  })

  return response
})
