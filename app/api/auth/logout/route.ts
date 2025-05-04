import { NextResponse } from "next/server"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"

const logger = createLogger("AuthAPI")

export const POST = asyncHandler(async () => {
  logger.info("User logged out")

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  })

  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  })

  return response
})
