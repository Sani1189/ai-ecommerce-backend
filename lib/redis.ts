import { Redis } from "@upstash/redis"
import { createLogger } from "./logger"

const logger = createLogger("Redis")

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// Cache wrapper function
export async function cacheWrapper<T>(key: string, fetchFn: () => Promise<T>, ttl = 3600): Promise<T> {
  try {
    // Try to get data from cache
    const cachedData = await redis.get(key)

    if (cachedData) {
      logger.info(`Cache hit for key: ${key}`)
      return cachedData as T
    }

    // If not in cache, fetch data
    logger.info(`Cache miss for key: ${key}`)
    const data = await fetchFn()

    // Store in cache
    await redis.set(key, data, { ex: ttl })
    logger.info(`Cached data for key: ${key} with TTL: ${ttl}s`)

    return data
  } catch (error) {
    logger.error(`Cache error for key: ${key}`, { error })
    // If cache fails, just fetch the data
    return await fetchFn()
  }
}

// Clear cache by pattern
export async function clearCacheByPattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern)

    if (keys.length === 0) {
      logger.info(`No keys found matching pattern: ${pattern}`)
      return 0
    }

    // Delete all keys matching the pattern
    const pipeline = redis.pipeline()
    keys.forEach((key) => {
      pipeline.del(key)
    })

    await pipeline.exec()
    logger.info(`Cleared ${keys.length} keys matching pattern: ${pattern}`)
    return keys.length
  } catch (error) {
    logger.error(`Failed to clear cache with pattern: ${pattern}`, { error })
    throw error
  }
}

// Increment a counter
export async function incrementCounter(key: string, ttl = 86400): Promise<number> {
  try {
    const count = await redis.incr(key)
    // Set expiry if this is a new key
    if (count === 1) {
      await redis.expire(key, ttl)
    }
    return count
  } catch (error) {
    logger.error(`Failed to increment counter: ${key}`, { error })
    return 0
  }
}

// Add to sorted set
export async function addToSortedSet(key: string, member: string, score: number, ttl = 86400): Promise<void> {
  try {
    await redis.zadd(key, { score, member })
    // Set expiry if this is a new key
    const exists = await redis.exists(key)
    if (exists === 0) {
      await redis.expire(key, ttl)
    }
  } catch (error) {
    logger.error(`Failed to add to sorted set: ${key}`, { error })
  }
}

// Get top members from sorted set
export async function getTopFromSortedSet(key: string, count = 10): Promise<string[]> {
  try {
    return await redis.zrange(key, 0, count - 1, { rev: true })
  } catch (error) {
    logger.error(`Failed to get top from sorted set: ${key}`, { error })
    return []
  }
}

// Test Redis connection
export async function testRedisConnection(): Promise<boolean> {
  try {
    await redis.ping()
    logger.info("Redis connection successful")
    return true
  } catch (error) {
    logger.error("Redis connection failed", { error })
    return false
  }
}
