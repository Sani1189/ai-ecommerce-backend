import { NextResponse } from "next/server"
import { seedDatabase } from "@/lib/seed"
import { clearCacheByPattern } from "@/lib/redis"
import { createLogger } from "@/lib/logger"

const logger = createLogger("SeedAPI")

export const GET = async () => {
  try {
    logger.info("Starting database seeding process")
    const result = await seedDatabase()

    if (result.success) {
      // Clear all caches after successful seeding
      const clearedCount = await clearCacheByPattern("*")
      logger.info(`All caches cleared after seeding, ${clearedCount} keys removed`)
    }

    return NextResponse.json(result)
  } catch (error) {
    logger.error("Error in seed endpoint", { error })
    return NextResponse.json(
      { success: false, message: "Error seeding database", error: error.message },
      { status: 500 },
    )
  }
}
