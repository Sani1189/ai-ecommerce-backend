import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import Order from "@/models/Order"
import { isAuthenticated } from "@/lib/auth"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import { cacheWrapper } from "@/lib/redis"

const logger = createLogger("RecommendationsAPI")

// GET personalized recommendations
export const GET = asyncHandler(async (req: NextRequest) => {
  // Check if user is authenticated (optional)
  const authResult = await isAuthenticated(req)
  const isLoggedIn = authResult.success

  await dbConnect()

  const url = new URL(req.url)
  const type = url.searchParams.get("type") || "recommended"
  const limit = Number.parseInt(url.searchParams.get("limit") || "8")
  const productId = url.searchParams.get("productId") // For "frequently bought together"
  const recentlyViewed = url.searchParams.get("recentlyViewed")?.split(",") || []

  let recommendations: any[] = []
  let cacheKey = ""

  switch (type) {
    case "recommended":
      // If user is logged in, get personalized recommendations
      if (isLoggedIn) {
        const userId = authResult.user._id.toString()
        cacheKey = `recommendations:user:${userId}:${limit}`

        recommendations = await cacheWrapper(
          cacheKey,
          async () => {
            // Get user's purchase history
            const userOrders = await Order.find({ user: userId })

            // Extract product IDs from orders
            const purchasedProductIds = userOrders.flatMap((order) =>
              order.items.map((item) => item.product.toString()),
            )

            // If user has purchase history
            if (purchasedProductIds.length > 0) {
              // Find products in the same categories as purchased products
              const purchasedProducts = await Product.find({
                _id: { $in: purchasedProductIds },
              })

              const categories = [...new Set(purchasedProducts.map((p) => p.category))]

              // Get recommendations based on categories
              return await Product.find({
                category: { $in: categories },
                _id: { $nin: purchasedProductIds }, // Exclude already purchased
                isPublished: true,
                stock: { $gt: 0 },
              })
                .sort({ rating: -1 })
                .limit(limit)
            }

            // Fallback to featured products if no purchase history
            return await Product.find({
              isFeatured: true,
              isPublished: true,
              stock: { $gt: 0 },
            })
              .sort({ rating: -1 })
              .limit(limit)
          },
          60 * 30, // Cache for 30 minutes
        )
      } else {
        // For non-logged in users, return featured products
        cacheKey = `recommendations:featured:${limit}`

        recommendations = await cacheWrapper(
          cacheKey,
          async () => {
            return await Product.find({
              isFeatured: true,
              isPublished: true,
              stock: { $gt: 0 },
            })
              .sort({ rating: -1 })
              .limit(limit)
          },
          60 * 60, // Cache for 1 hour
        )
      }
      break

    case "recently-viewed":
      if (recentlyViewed.length > 0) {
        cacheKey = `recommendations:recently-viewed:${recentlyViewed.join(",")}:${limit}`

        recommendations = await cacheWrapper(
          cacheKey,
          async () => {
            return await Product.find({
              _id: { $in: recentlyViewed },
              isPublished: true,
            }).limit(limit)
          },
          60 * 15, // Cache for 15 minutes
        )
      }
      break

    case "frequently-bought-together":
      if (productId) {
        cacheKey = `recommendations:frequently-bought:${productId}:${limit}`

        recommendations = await cacheWrapper(
          cacheKey,
          async () => {
            // Find orders containing this product
            const orders = await Order.find({
              "items.product": productId,
            })

            // Extract all other products from these orders
            const otherProductIds = orders.flatMap((order) =>
              order.items
                .filter((item) => item.product.toString() !== productId)
                .map((item) => item.product.toString()),
            )

            // Count occurrences of each product
            const productCounts = otherProductIds.reduce(
              (acc, id) => {
                acc[id] = (acc[id] || 0) + 1
                return acc
              },
              {} as Record<string, number>,
            )

            // Sort by frequency
            const sortedProductIds = Object.entries(productCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([id]) => id)
              .slice(0, limit)

            if (sortedProductIds.length > 0) {
              return await Product.find({
                _id: { $in: sortedProductIds },
                isPublished: true,
                stock: { $gt: 0 },
              })
            }

            // Fallback to products in the same category
            const currentProduct = await Product.findById(productId)
            if (currentProduct) {
              return await Product.find({
                _id: { $ne: productId },
                category: currentProduct.category,
                isPublished: true,
                stock: { $gt: 0 },
              })
                .sort({ rating: -1 })
                .limit(limit)
            }

            return []
          },
          60 * 60, // Cache for 1 hour
        )
      }
      break

    default:
      return NextResponse.json({ success: false, message: "Invalid recommendation type" }, { status: 400 })
  }

  logger.info(`Retrieved ${recommendations.length} ${type} recommendations`)

  return NextResponse.json({
    success: true,
    recommendations,
  })
})
