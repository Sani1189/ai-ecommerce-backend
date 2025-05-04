import { NextResponse } from "next/server"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"

const logger = createLogger("API")

export const GET = asyncHandler(async () => {
  logger.info("API root endpoint accessed")

  return NextResponse.json({
    name: "E-commerce API",
    version: "1.0.0",
    status: "running",
    environment: process.env.NODE_ENV,
    server: {
      port: 5000,
    },
    endpoints: {
      products: "/api/products",
      users: "/api/users",
      auth: "/api/auth",
      orders: "/api/orders",
      reviews: "/api/reviews",
      coupons: "/api/coupons",
      health: "/api/health",
    },
    documentation: "/api-docs",
  })
})
