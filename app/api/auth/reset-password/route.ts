import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { z } from "zod"
import { validate } from "@/lib/middleware/validator"
import { createLogger } from "@/lib/logger"
import crypto from "crypto"

const logger = createLogger("AuthAPI")

// Request password reset validation schema
const requestResetSchema = z.object({
  email: z.string().email("Invalid email address"),
})

// Reset password validation schema
const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

// Request password reset
export const POST = asyncHandler(async (req: NextRequest) => {
  await dbConnect()

  // Validate request body
  const validationResult = await validate(requestResetSchema)(req)
  if (validationResult instanceof NextResponse) {
    return validationResult
  }

  const { email } = validationResult.data

  // Find user
  const user = await User.findOne({ email })

  if (!user) {
    // Don't reveal that the user doesn't exist
    return NextResponse.json({ success: true, message: "If your email is registered, you will receive a reset link" })
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex")
  const resetTokenExpiry = Date.now() + 3600000 // 1 hour

  // Save token to user
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
  user.resetPasswordExpire = new Date(resetTokenExpiry)
  await user.save()

  // Create reset URL
  const resetUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/reset-password/${resetToken}`

  // Log the reset URL instead of sending email
  logger.info(`Password reset requested for: ${email}. Reset URL: ${resetUrl}`)

  return NextResponse.json({
    success: true,
    message: "If your email is registered, you will receive a reset link",
    // In development, return the token for testing
    ...(process.env.NODE_ENV === "development" && { resetToken, resetUrl }),
  })
})

// Reset password with token
export const PUT = asyncHandler(async (req: NextRequest) => {
  await dbConnect()

  // Validate request body
  const validationResult = await validate(resetPasswordSchema)(req)
  if (validationResult instanceof NextResponse) {
    return validationResult
  }

  const { token, password } = validationResult.data

  // Hash token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

  // Find user with token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    logger.warn(`Invalid or expired password reset token used`)
    return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 400 })
  }

  // Update password
  user.password = password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  logger.info(`Password reset successful for user: ${user.email}`)

  return NextResponse.json({
    success: true,
    message: "Password reset successful",
  })
})
