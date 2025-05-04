import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { z } from "zod"
import { validate } from "@/lib/middleware/validator"
import { createLogger } from "@/lib/logger"

const logger = createLogger("AuthAPI")

// Registration validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const POST = asyncHandler(async (req: NextRequest) => {
  await dbConnect()

  // Validate request body
  const validationResult = await validate(registerSchema)(req)
  if (validationResult instanceof NextResponse) {
    return validationResult
  }

  const { name, email, password } = validationResult.data

  // Check if user already exists
  const userExists = await User.findOne({ email })

  if (userExists) {
    logger.warn(`Registration attempt with existing email: ${email}`)
    return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 })
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
  })

  logger.info(`New user registered: ${email}`, { userId: user._id })

  return NextResponse.json(
    {
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    { status: 201 },
  )
})
