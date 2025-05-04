import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import Order from "@/models/Order"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import { cacheWrapper } from "@/lib/redis"

const logger = createLogger("TrendingProductsAPI")

// GET trending products
export const GET = asyncHandler(async (req: NextRequest) => {
  await dbConnect()
  logger.info("Fetching trending products")

  const url = new URL(req.url)
  const limit = Number.parseInt(url.searchParams.get("limit") || "10")
  const category = url.searchParams.get("category")
  const timeframe = url.searchParams.get("timeframe") || "week" // day, week, month

  // Build filter object
  const filter: any = {
    isPublished: true,
    stock: { $gt: 0 },
  }

  if (category) {
    filter.category = category
  }

  // Calculate date range based on timeframe
  const now = new Date()
  const startDate = new Date()

  switch (timeframe) {
    case "day":
      startDate.setDate(now.getDate() - 1)
      break
    case "week":
      startDate.setDate(now.getDate() - 7)
      break
    case "month":
      startDate.setMonth(now.getMonth() - 1)
      break
    default:
      startDate.setDate(now.getDate() - 7) // Default to week
  }

  // Create a cache key based on the query parameters
  const cacheKey = `products:trending:${JSON.stringify({ filter, limit, timeframe })}`

  // Use cache wrapper to get data
  const trendingProducts = await cacheWrapper(
    cacheKey,
    async () => {
      // Find recent orders to identify trending products
      const recentOrders = await Order.find({
        createdAt: { $gte: startDate },
      })

      // Extract product IDs and count occurrences
      const productCounts: Record<string, number> = {}

      recentOrders.forEach((order) => {
        order.items.forEach((item) => {
          const productId = item.product.toString()
          productCounts[productId] = (productCounts[productId] || 0) + item.quantity
        })
      })

      // Sort products by order count
      const sortedProductIds = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id)

      if (sortedProductIds.length > 0) {
        // Create a map for sorting by order frequency
        const productRankMap = new Map()
        sortedProductIds.forEach((id, index) => {
          productRankMap.set(id, index)
        })

        // Find products and sort them by their rank in the trending list
        const products = await Product.find({
          _id: { $in: sortedProductIds },
          ...filter,
        }).limit(limit * 2) // Fetch more than needed to account for filtering

        // Sort by the original trending order
        products.sort((a, b) => {
          const rankA = productRankMap.get(a._id.toString()) || Number.MAX_SAFE_INTEGER
          const rankB = productRankMap.get(b._id.toString()) || Number.MAX_SAFE_INTEGER
          return rankA - rankB
        })

        return products.slice(0, limit)
      }

      // Fallback to sorting by review count and rating if no recent orders
      return await Product.find(filter).sort({ reviewCount: -1, rating: -1 }).limit(limit)
    },
    60 * 15, // Cache for 15 minutes
  )

  logger.info(`Found ${trendingProducts.length} trending products`)

  return NextResponse.json({
    success: true,
    timeframe,
    products: trendingProducts,
  })
})
