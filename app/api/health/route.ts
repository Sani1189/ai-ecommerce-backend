import { NextResponse } from "next/server"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import mongoose from "mongoose"
import { createLogger } from "@/lib/logger"
import { testRedisConnection } from "@/lib/redis"

const logger = createLogger("HealthAPI")

export const GET = asyncHandler(async () => {
  // Test Redis connection
  const redisConnected = await testRedisConnection()

  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    database: {
      status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    },
    redis: {
      status: redisConnected ? "connected" : "disconnected",
    },
    environment: process.env.NODE_ENV,
  }

  logger.info("Health check performed", healthcheck)

  return NextResponse.json(healthcheck)
})
